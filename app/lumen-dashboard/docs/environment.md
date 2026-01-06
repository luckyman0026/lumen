# Environment Guide

## Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `API_URL` | Base URL for the AI Traffic backend API | `https://backend.example.com/v1` | Yes |
| `API_KEY` | Authentication key for API requests | `sk-xxxxxxxxxxxxx` | Yes |

## Environment File Setup

Create a `.env.local` file in the project root:

```bash
# API Configuration
API_URL="https://backend.example.com/v1"
API_KEY="your-secret-token-here"
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Secrets Management

### Local Development

- Store secrets in `.env.local`
- Copy from `.env.local` file (not provided in repo for security)

### Vercel Deployment

1. Go to Project Settings > Environment Variables
2. Add each variable with appropriate scope:
   - Production: Live site secrets
   - Preview: Staging/PR deployment secrets
   - Development: Local development (synced via `vercel env pull`)

### Other Platforms

| Platform | Method |
|----------|--------|
| Docker | `--env-file` flag or `-e` for individual vars |
| Railway | Environment variables in dashboard |
| Netlify | Environment variables in site settings |
| AWS Amplify | Environment variables in app settings |

## Environment Differences

### Local Development

```bash
# .env.local
API_URL="https://backend.example.com/v1"
API_KEY="dev-api-key"
```

- Next.js dev server: `pnpm dev`
- Hot reload enabled
- Server actions execute locally

### Staging/Preview

```bash
API_URL="https://staging-backend.example.com/v1"
API_KEY="staging-api-key"
```

- Preview deployments on pull requests
- Test against staging backend
- Separate API credentials

### Production

```bash
API_URL="https://backend.example.com/v1"
API_KEY="production-api-key"
```

- Optimized Next.js build
- Production API credentials
- CDN caching for static assets

## Variable Access

Environment variables are accessed server-side only via Next.js server actions:

```typescript
// lib/actions.ts
const API_BASE_URL = process.env.API_URL || "http://localhost:8080/v1";
const API_KEY = process.env.API_KEY || "your-secret-token-here";
```

**Security Note**: These variables are never exposed to the client bundle. All API calls are made server-side.

## Validation

To verify environment variables are set correctly:

1. **Local**: Check that API data loads on `http://localhost:3000`
2. **Production**: Verify in Vercel logs that server actions execute successfully

## Troubleshooting

### "API error: 401"

- `API_KEY` is missing or invalid
- Check that the key hasn't expired
- Verify correct environment scope in deployment platform

### "API error: 500" or Network Errors

- `API_URL` is incorrect or unreachable
- Backend service may be down
- Check for typos in the URL

### Variables Not Loading

- Ensure file is named `.env.local` (not `.env`)
- Restart the dev server after changing env files
- Variables prefixed with `NEXT_PUBLIC_` are exposed to client (not needed here)
