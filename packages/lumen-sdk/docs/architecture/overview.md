# Architecture Overview

Lumen is a plug-and-play traffic analyzer SDK for capturing request-level analytics without blocking user traffic. This document describes the system architecture and design decisions.

## System Overview

Lumen follows a modular, layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
│                   (Next.js, Remix, etc.)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Framework Adapter                         │
│                  (@lumen/lumen-nextjs)                  │
│                                                              │
│  • Request extraction      • Static asset filtering          │
│  • NextFetchEvent.waitUntil() integration                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core SDK                                │
│                  (@lumen/lumen-core)                    │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Event     │  │  Sampler    │  │   Signer    │         │
│  │  Builder    │  │(Deterministic)│ │ (HMAC-256) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │              Transport (Fire-and-Forget)         │       │
│  │  • Strict timeout (3s)     • Silent error handling│      │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Ingest                            │
│                   (Your Service)                             │
│                                                              │
│  POST /v1/events → Verify signature → Enqueue → 202 Accepted│
└─────────────────────────────────────────────────────────────┘
```

## Component Diagram

See `diagrams/` for visual representations:

- `diagrams/.gitkeep` - [TODO: Add component diagram]
- [TODO: Add sequence diagram for request flow]
- [TODO: Add deployment diagram]

## Core Components

### LumenClient

The main orchestrator that coordinates all components. Created via `createLumenClient()` factory function.

**Responsibilities:**
- Initialize and wire up all sub-components
- Provide the main `captureEvent()` API
- Handle configuration and defaults

### EventBuilder

Constructs standardized event payloads from request data.

**Responsibilities:**
- Generate UUID v4 request IDs
- Generate random nonce values
- Create ISO 8601 timestamps
- Build the complete event schema

### Sampler

Implements deterministic sampling based on request ID hashing.

**Responsibilities:**
- Hash request ID using SHA-256
- Compare hash to sample rate threshold
- Ensure consistent decisions across distributed systems

### Signer

Provides HMAC-SHA256 signing for payload verification.

**Responsibilities:**
- Sign payloads with format: `HMAC-SHA256(secret, timestamp + "." + body)`
- Use Web Crypto API for Edge Runtime compatibility
- Base64url encode signatures

### Transport

Handles HTTP delivery with fire-and-forget semantics.

**Responsibilities:**
- Send events via HTTP POST
- Enforce strict timeouts (default 3s)
- Silently handle errors (never throw)
- Use AbortController for timeout management

## Data Flow

1. **Request arrives** at application middleware/proxy
2. **Adapter extracts** request data (method, path, headers, IP)
3. **Sampler decides** whether to capture (deterministic hash)
4. **EventBuilder creates** standardized event payload
5. **Signer generates** HMAC-SHA256 signature
6. **Transport sends** event to backend (fire-and-forget)
7. **Original request** continues unblocked

```
Request → Adapter → Sampler → EventBuilder → Signer → Transport → Backend
                       ↓                                    ↓
                   (skip if               (async, non-blocking)
                    not sampled)
```

## Third-Party Integrations

### Next.js 15+

Uses the `proxy.ts` or `middleware.ts` pattern:
- Integrates with `NextFetchEvent.waitUntil()` for lifecycle management
- Extracts request data from `NextRequest`
- Filters static assets automatically

### Future Adapters

- Remix (loader/action integration)
- SvelteKit (hooks integration)
- Express.js (middleware pattern)

## Key Design Patterns

### Factory Pattern

All components use factory functions for creation:
```typescript
const client = createLumenClient(config);
const builder = createEventBuilder();
const sampler = createSampler(sampleRate);
```

### Fire-and-Forget Pattern

Events are sent asynchronously without waiting for response:
- Uses `void` return type
- Errors are swallowed silently
- Never blocks the main request flow

### Adapter Pattern

Framework-specific adapters translate between:
- Framework request types → Core event data
- Framework async patterns → Transport lifecycle

### Web Crypto API

All cryptographic operations use Web Crypto API:
- `crypto.randomUUID()` for request IDs
- `crypto.subtle.digest()` for SHA-256 hashing
- `crypto.subtle.sign()` for HMAC signing

This ensures Edge Runtime compatibility across all platforms.

## Security Considerations

- **HMAC signing** prevents payload tampering
- **Timestamp validation** prevents replay attacks (backend responsibility)
- **Key rotation** supported via multiple key IDs
- **No sensitive data** stored in SDK (fire-and-forget)

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Default timeout | 3s |
| Memory overhead | Minimal (no batching/queuing) |
| CPU overhead | SHA-256 hash + HMAC per event |
| Network | Single HTTP POST per sampled request |

## Scaling Considerations

- **Stateless design** - No shared state between requests
- **Deterministic sampling** - Consistent across distributed instances
- **Backend pressure** - Control via sample rate adjustment
- **No retry logic** - Prevents thundering herd on backend recovery
