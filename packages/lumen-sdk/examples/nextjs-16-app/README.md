# Lumen Next.js Example

Working example of Lumen integrated with Next.js 16 using `proxy.ts`.

## Setup

```bash
# From repository root
pnpm install
pnpm build

# Configure environment
cd examples/nextjs-16-app
cp .env.local.example .env.local  # Edit with your values

# Run
pnpm dev
```

Open http://localhost:3001

## Environment Variables

```bash
LUMEN_INGEST_URL=https://webhook.site/your-id
LUMEN_KEY_ID=dev-key
LUMEN_HMAC_SECRET=dev-secret
LUMEN_SAMPLE_RATE=1.0
```

Use [webhook.site](https://webhook.site) to test without a backend.

## Project Structure

```
├── proxy.ts          # Lumen integration
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
└── components/
```

## How It Works

`proxy.ts` captures every request:

```typescript
export function proxy(req: NextRequest, event: NextFetchEvent) {
  tracker.capture(req, event);  // Fire-and-forget
  return NextResponse.next();
}
```

Events are sent asynchronously via `event.waitUntil()` — responses are never blocked.

## Verification

With `debug: true`, check console for:

```
[Lumen] Initialized: { ... }
[Lumen] Scheduled: /
[Lumen] Captured: abc-123-...
```
