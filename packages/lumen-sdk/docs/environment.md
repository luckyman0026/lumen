# Environment Configuration

This document describes all environment variables and configuration options for Lumen.

## Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `LUMEN_INGEST_URL` | Backend endpoint URL | `https://ingest.example.com/v1/events` | Yes |
| `LUMEN_KEY_ID` | Key identifier for signing | `prod-key-1` | Yes |
| `LUMEN_HMAC_SECRET` | HMAC secret for signing | `your-32-byte-secret` | Yes |

## Optional Environment Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `LUMEN_SAMPLE_RATE` | Sampling rate (0-1) | `0.1` | `0.1` |
| `LUMEN_TIMEOUT` | Request timeout in ms | `3000` | `3000` |
| `LUMEN_DEBUG` | Enable debug logging | `true` | `false` |

## Secrets Management

### Generation

Generate secure secrets using:

```bash
# Generate 32-byte secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Storage Best Practices

**Never commit secrets to version control.**

Recommended approaches:

1. **Environment files** (development only)
   ```bash
   # .env.local (gitignored)
   LUMEN_HMAC_SECRET=your-secret-here
   ```

2. **Secret managers** (production)
   - AWS Secrets Manager
   - HashiCorp Vault
   - Google Secret Manager
   - Azure Key Vault
   - Doppler

3. **Platform-native secrets**
   - Vercel Environment Variables
   - Netlify Environment Variables
   - Railway Variables
   - Heroku Config Vars

### Key Rotation

Lumen supports multiple key IDs for zero-downtime rotation:

1. Generate new secret
2. Add new key ID to backend
3. Update application to use new key ID
4. Remove old key ID after grace period

## Environment Differences

### Local Development

```bash
# .env.local
LUMEN_INGEST_URL=http://localhost:8080/v1/events
LUMEN_KEY_ID=dev-key
LUMEN_HMAC_SECRET=dev-secret-not-for-production
LUMEN_SAMPLE_RATE=1.0
LUMEN_DEBUG=true
```

Characteristics:
- Use local backend instance
- 100% sample rate for debugging
- Debug logging enabled
- Short timeout acceptable

### Staging

```bash
LUMEN_INGEST_URL=https://staging-ingest.example.com/v1/events
LUMEN_KEY_ID=staging-key-1
LUMEN_HMAC_SECRET=<from-secret-manager>
LUMEN_SAMPLE_RATE=0.5
LUMEN_DEBUG=true
```

Characteristics:
- Dedicated staging backend
- Higher sample rate for testing
- Debug logging for troubleshooting
- Separate keys from production

### Production

```bash
LUMEN_INGEST_URL=https://ingest.example.com/v1/events
LUMEN_KEY_ID=prod-key-1
LUMEN_HMAC_SECRET=<from-secret-manager>
LUMEN_SAMPLE_RATE=0.1
LUMEN_DEBUG=false
```

Characteristics:
- Production backend with high availability
- Lower sample rate to control costs
- Debug logging disabled
- Secrets in secure manager
- Multiple key IDs for rotation

## Next.js Configuration

### App Router (Next.js 13+)

Create `.env.local`:

```bash
LUMEN_INGEST_URL=https://ingest.example.com/v1/events
LUMEN_KEY_ID=prod-key-1
LUMEN_HMAC_SECRET=your-secret
```

Access in `middleware.ts` or `proxy.ts`:

```typescript
const tracker = createLumen({
  ingestUrl: process.env.LUMEN_INGEST_URL!,
  keyId: process.env.LUMEN_KEY_ID!,
  hmacSecret: process.env.LUMEN_HMAC_SECRET!,
});
```

### Vercel Deployment

1. Go to Project Settings > Environment Variables
2. Add variables for each environment (Production, Preview, Development)
3. Mark secrets as "Sensitive" to hide values

### Edge Runtime Compatibility

Lumen uses Web Crypto API and is fully compatible with:
- Vercel Edge Functions
- Cloudflare Workers
- Deno Deploy
- Any Edge Runtime environment

## Validation

### Startup Validation

Lumen validates configuration at initialization:

```typescript
// Throws if required config is missing
const tracker = createLumen({
  ingestUrl: process.env.LUMEN_INGEST_URL!, // Required
  keyId: process.env.LUMEN_KEY_ID!,         // Required
  hmacSecret: process.env.LUMEN_HMAC_SECRET!, // Required
});
```

### Runtime Checks

Add validation to your application startup:

```typescript
function validateConfig() {
  const required = [
    'LUMEN_INGEST_URL',
    'LUMEN_KEY_ID',
    'LUMEN_HMAC_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
```

## Troubleshooting

### "LUMEN_HMAC_SECRET is not defined"

1. Check `.env.local` exists and is not gitignored incorrectly
2. Restart development server after adding env vars
3. Verify variable name matches exactly (case-sensitive)

### "Invalid signature" errors from backend

1. Verify secret matches between SDK and backend
2. Check for encoding issues (use raw string, not base64-encoded)
3. Ensure no whitespace in secret value

### "Timeout" errors

1. Check backend is accessible from your deployment
2. Verify firewall rules allow outbound HTTPS
3. Increase timeout if backend is slow:
   ```typescript
   const tracker = createLumen({
     ...config,
     timeout: 5000, // Increase from default 3s
   });
   ```
