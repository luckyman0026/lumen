# API Reference

This document describes the public APIs exposed by Lumen packages.

## Authentication

Lumen uses HMAC-SHA256 for payload authentication. All events sent to your backend include:

| Header | Description |
|--------|-------------|
| `x-lumen-key-id` | Key identifier for multi-key support |
| `x-lumen-ts` | Unix timestamp in milliseconds |
| `x-lumen-signature` | Base64url-encoded HMAC-SHA256 signature |

**Signature format:**
```
HMAC-SHA256(secret, timestamp + "." + jsonBody)
```

## Base URL

Configure via `ingestUrl` option. Example:
```
https://your-backend.com/v1/events
```

## @lumen/core

### `createLumenClient(config)`

Creates a new Lumen client instance.

```typescript
import { createLumenClient } from '@lumen/core';

const client = createLumenClient({
  ingestUrl: 'https://ingest.example.com/v1/events',
  keyId: 'prod-key-1',
  hmacSecret: 'your-secret',
  sampleRate: 0.1,
  timeout: 3000,
  debug: false,
});
```

**Config Options:**

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `ingestUrl` | `string` | Yes | - | Backend endpoint URL |
| `keyId` | `string` | Yes | - | Key identifier for signing |
| `hmacSecret` | `string` | Yes | - | HMAC secret for signing |
| `sampleRate` | `number` | No | `0.1` | Sample rate (0-1) |
| `timeout` | `number` | No | `3000` | Request timeout in ms |
| `debug` | `boolean` | No | `false` | Enable debug logging |

**Returns:** `LumenClient`

### `LumenClient.captureEvent(eventData)`

Captures and sends an event to the backend.

```typescript
await client.captureEvent({
  method: 'GET',
  pathname: '/api/users',
  search: '?page=1',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  referer: 'https://example.com',
  tags: { environment: 'prod' },
  metrics: { duration: 123 },
});
```

**Event Data Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | `string` | No | HTTP method |
| `pathname` | `string` | No | Request path |
| `search` | `string` | No | Query string |
| `ip` | `string` | No | Client IP address |
| `userAgent` | `string` | No | User agent string |
| `referer` | `string` | No | Referer header |
| `tags` | `Record<string, string>` | No | Custom tags |
| `metrics` | `Record<string, number>` | No | Custom metrics |

**Returns:** `Promise<void>` (fire-and-forget, errors are swallowed)

### `createEventBuilder()`

Creates an event builder instance.

```typescript
import { createEventBuilder } from '@lumen/core';

const builder = createEventBuilder();
const event = builder.build({
  keyId: 'prod-key-1',
  method: 'GET',
  pathname: '/api/users',
});
```

### `createSampler(sampleRate)`

Creates a deterministic sampler.

```typescript
import { createSampler } from '@lumen/core';

const sampler = createSampler(0.1);
const shouldSample = await sampler.shouldSample(requestId);
```

### `createSigner(hmacSecret)`

Creates an HMAC-SHA256 signer.

```typescript
import { createSigner } from '@lumen/core';

const signer = createSigner('your-secret');
const signature = await signer.sign(timestamp, body);
```

### `createTransport(config)`

Creates an HTTP transport.

```typescript
import { createTransport } from '@lumen/core';

const transport = createTransport({
  ingestUrl: 'https://ingest.example.com/v1/events',
  timeout: 3000,
});
```

## @lumen/nextjs

### `createLumen(config)`

Creates an Lumen instance configured for Next.js.

```typescript
import { createLumen } from '@lumen/nextjs';

const tracker = createLumen({
  ingestUrl: process.env.INTELLITRACK_INGEST_URL!,
  keyId: process.env.INTELLITRACK_KEY_ID!,
  hmacSecret: process.env.INTELLITRACK_HMAC_SECRET!,
  sampleRate: 0.1,
  debug: true,
  excludePaths: ['/health', '/ready'],
});
```

**Additional Config Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `excludePaths` | `string[]` | See below | Paths to exclude from tracking |

**Default Excluded Paths:**
- `/_next/static/*`
- `/_next/image/*`
- `/favicon.ico`
- `/robots.txt`
- `/sitemap.xml`
- `/apple-touch-icon*.png`
- `/manifest.json`

### `tracker.capture(request, event)`

Captures request data from Next.js middleware/proxy.

```typescript
import type { NextFetchEvent, NextRequest } from 'next/server';

export function middleware(req: NextRequest, event: NextFetchEvent) {
  tracker.capture(req, event);
  return NextResponse.next();
}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `request` | `NextRequest` | Next.js request object |
| `event` | `NextFetchEvent` | Next.js fetch event (for `waitUntil`) |

**Returns:** `void` (fire-and-forget)

## Event Schema

Events sent to your backend follow this schema:

```typescript
interface LumenEvent {
  version: '1';
  eventType: 'request';
  requestId: string;      // UUID v4
  timestamp: string;      // ISO 8601
  nonce: string;          // Random base64url
  keyId: string;          // Key identifier
  method?: string;        // HTTP method
  pathname?: string;      // Request path
  search?: string;        // Query string
  ip?: string;            // Client IP
  userAgent?: string;     // User agent
  referer?: string;       // Referer header
  tags?: Record<string, string>;
  metrics?: Record<string, number>;
}
```

## Error Codes

Lumen SDK never throws errors (fire-and-forget). Backend implementations should return:

| Code | Status | Description |
|------|--------|-------------|
| 202 | Accepted | Event accepted for processing |
| 400 | Bad Request | Invalid event payload |
| 401 | Unauthorized | Invalid or missing signature |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Backend processing error |

## Rate Limits

Rate limiting is your backend's responsibility. The SDK provides:

- **Sampling:** Reduce event volume at the source
- **Timeouts:** Prevent slow backends from blocking
- **No retries:** Failed events are dropped

Recommended backend rate limits:
- Per key: 10,000 requests/minute
- Per IP: 1,000 requests/minute
- Global: Based on your infrastructure capacity

## TypeScript Types

All types are exported from package entry points:

```typescript
import type {
  LumenConfig,
  LumenEvent,
  EventData,
  LumenClient,
} from '@lumen/core';

import type {
  NextJSConfig,
  LumenNextJS,
} from '@lumen/nextjs';
```
