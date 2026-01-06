# @lumen/core

Framework-agnostic core SDK for fire-and-forget request tracking.

## Installation

```bash
pnpm add @lumen/core
```

## Usage

```typescript
import { createLumenClient } from '@lumen/core';

const tracker = createLumenClient({
  ingestUrl: 'https://ingest.example.com/v1/events',
  keyId: 'prod-key-1',
  hmacSecret: 'your-secret',
  sampleRate: 0.1,
});

tracker.captureEvent({
  method: 'GET',
  pathname: '/api/users',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ingestUrl` | string | — | Backend endpoint URL |
| `keyId` | string | — | Key identifier for signing |
| `hmacSecret` | string | — | HMAC secret |
| `sampleRate` | number | 0.1 | Sample rate (0-1) |
| `timeout` | number | 3000 | Request timeout (ms) |
| `debug` | boolean | false | Enable debug logging |

## Event Data

```typescript
interface EventData {
  method?: string;
  pathname?: string;
  search?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  tags?: Record<string, string>;
  metrics?: Record<string, number>;
}
```

## Components

The SDK is composed of independent components:

```typescript
import {
  createEventBuilder,  // Builds event payloads
  createSampler,       // Deterministic sampling
  createSigner,        // HMAC-SHA256 signing
  createTransport,     // HTTP transport
} from '@lumen/core';
```

## Signature Format

```
HMAC-SHA256(secret, timestamp + "." + body)
```

Headers sent:
- `x-lumen-key-id` — Key identifier
- `x-lumen-ts` — Unix timestamp (ms)
- `x-lumen-signature` — Base64url signature

## License

MIT
