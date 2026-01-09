# @lumen/lumen-nextjs

Next.js adapter for Lumen. Integrates with `proxy.ts` / `middleware.ts` for fire-and-forget event tracking.

## Installation

```bash
pnpm add @lumen/lumen-nextjs
```

## Usage

Create `proxy.ts` in your project root:

```typescript
import { createLumen } from '@lumen/lumen-nextjs';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

const tracker = createLumen({
  ingestUrl: process.env.LUMEN_INGEST_URL!,
  keyId: process.env.LUMEN_KEY_ID!,
  hmacSecret: process.env.LUMEN_HMAC_SECRET!,
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  tracker.capture(req, event);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ingestUrl` | string | — | Backend endpoint URL |
| `keyId` | string | — | Key identifier |
| `hmacSecret` | string | — | HMAC secret |
| `sampleRate` | number | 0.1 | Sample rate (0-1) |
| `timeout` | number | 3000 | Timeout (ms) |
| `debug` | boolean | false | Debug logging |
| `excludePaths` | string[] | [] | Additional paths to exclude |

## Captured Data

Automatically extracted from each request:

- `method` — HTTP method
- `pathname` — Request path
- `search` — Query string
- `ip` — Client IP (from `x-real-ip`, `x-forwarded-for`, or `cf-connecting-ip`)
- `userAgent` — User agent
- `referer` — Referer header

## Default Excluded Paths

- `/_next/static/*`
- `/_next/image/*`
- `/favicon.ico`
- `/robots.txt`
- `/sitemap.xml`
- `/manifest.json`
- `/apple-touch-icon*.png`

## Custom Exclusions

```typescript
const tracker = createLumen({
  // ...
  excludePaths: ['/admin', '/health'],
});
```

## Exports

```typescript
import {
  createLumen,     // Main factory
  extractRequestData,     // Extract data from NextRequest
  extractIpAddress,       // Extract IP from headers
  shouldCapture,          // Check if path should be captured
} from '@lumen/lumen-nextjs';
```

## Compatibility

- Next.js 15+ (`middleware.ts`)
- Next.js 16+ (`proxy.ts`)

## License

MIT
