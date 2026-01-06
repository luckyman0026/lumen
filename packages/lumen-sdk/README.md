# Lumen

Fire-and-forget traffic analytics SDK for Next.js. Captures request-level data without blocking user requests.

## Features

- **Fire-and-forget** — Never blocks responses
- **HMAC-SHA256 signing** — Secure payload verification
- **Deterministic sampling** — Consistent across distributed systems
- **Edge-ready** — Works in Edge Runtime via Web Crypto API

## Quick Start

```bash
pnpm add @lumen/nextjs
```

Create `proxy.ts`:

```typescript
import { createLumen } from '@lumen/nextjs';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

const tracker = createLumen({
  ingestUrl: process.env.INTELLITRACK_INGEST_URL!,
  keyId: process.env.INTELLITRACK_KEY_ID!,
  hmacSecret: process.env.INTELLITRACK_HMAC_SECRET!,
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  tracker.capture(req, event);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

Add environment variables:

```bash
INTELLITRACK_INGEST_URL=https://your-backend.com/v1/events
INTELLITRACK_KEY_ID=prod-key-1
INTELLITRACK_HMAC_SECRET=your-secret  # openssl rand -base64 32
```

## Packages

| Package | Description |
|---------|-------------|
| [@lumen/core](./packages/lumen-core) | Framework-agnostic core SDK |
| [@lumen/nextjs](./packages/lumen-nextjs) | Next.js 15+ adapter |

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ingestUrl` | string | — | Backend endpoint URL |
| `keyId` | string | — | Key identifier for signing |
| `hmacSecret` | string | — | HMAC secret |
| `sampleRate` | number | 0.1 | Sample rate (0-1) |
| `timeout` | number | 3000 | Request timeout (ms) |
| `debug` | boolean | false | Enable debug logging |

## Event Schema

```typescript
{
  version: "1",
  eventType: "request",
  requestId: "uuid-v4",
  timestamp: "ISO-8601",
  nonce: "base64url",
  keyId: "your-key-id",
  method: "GET",
  pathname: "/api/users",
  search: "?page=1",
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  referer: "https://example.com",
  tags: {},
  metrics: {}
}
```

## Backend Integration

Your backend receives signed events:

```
POST /v1/events
x-lumen-key-id: prod-key-1
x-lumen-ts: 1703001234567
x-lumen-signature: base64url-encoded-hmac
```

Verify signature:

```typescript
import { createHmac } from 'crypto';

function verify(body: string, timestamp: string, signature: string, secret: string) {
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('base64url');
  return signature === expected;
}
```

## Development

```bash
pnpm install
pnpm build
pnpm test

# Run example
cd examples/nextjs-16-app && pnpm dev
```

## Documentation

- [Architecture](docs/architecture/overview.md) — System design and components
- [API Reference](docs/api.md) — Full API documentation
- [Environment](docs/environment.md) — Configuration guide
- [Testing](docs/testing.md) — Test conventions
- [Contributing](CONTRIBUTING.md) — How to contribute

## License

MIT
