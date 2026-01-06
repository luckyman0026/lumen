# Testing Guide

This document describes how to run and write tests for Lumen.

## Running Tests

### Run All Tests

```bash
# From repository root
pnpm test
```

### Run Tests for Specific Package

```bash
# Core package
cd packages/lumen-core
pnpm test

# Next.js adapter
cd packages/lumen-nextjs
pnpm test
```

### Watch Mode

```bash
pnpm test -- --watch
```

### Coverage Report

```bash
pnpm test -- --coverage
```

Coverage reports are generated in:
- Terminal output (text)
- `coverage/` directory (HTML, JSON)

## Testing Philosophy

### Unit Tests First

Lumen emphasizes unit tests for core logic:

1. **Pure functions:** Event building, sampling, signing
2. **Isolation:** Each component tested independently
3. **Determinism:** No flaky tests, predictable outputs

### Integration Tests for Adapters

Framework adapters test integration points:

1. **Request extraction:** Verify data extraction from framework objects
2. **Lifecycle hooks:** Verify `waitUntil()` integration
3. **Configuration:** Verify options are passed correctly

### No End-to-End Tests

Lumen is a client SDK - E2E tests belong in consuming applications.

## Coverage Expectations

| Package | Target Coverage |
|---------|----------------|
| `lumen-core` | 90%+ |
| `lumen-nextjs` | 80%+ |

### Critical Paths (100% coverage required)

- Event building logic
- HMAC signing
- Sampling algorithm
- Request data extraction

## Writing New Tests

### Test File Location

Place tests in `test/` directory alongside source:

```
packages/lumen-core/
├── src/
│   ├── event-builder.ts
│   └── sampler.ts
└── test/
    ├── event-builder.test.ts
    └── sampler.test.ts
```

### Test Structure

Use Vitest's `describe`/`it` syntax:

```typescript
import { describe, it, expect } from 'vitest';
import { createEventBuilder } from '../src/event-builder';

describe('EventBuilder', () => {
  describe('build()', () => {
    it('should generate UUID v4 request ID', () => {
      const builder = createEventBuilder();
      const event = builder.build({ keyId: 'test-key' });

      expect(event.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should include ISO 8601 timestamp', () => {
      const builder = createEventBuilder();
      const event = builder.build({ keyId: 'test-key' });

      expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include optional fields when provided', () => {
      const builder = createEventBuilder();
      const event = builder.build({
        keyId: 'test-key',
        method: 'POST',
        pathname: '/api/users',
      });

      expect(event.method).toBe('POST');
      expect(event.pathname).toBe('/api/users');
    });
  });
});
```

### Testing Async Code

Use async/await for promise-based code:

```typescript
import { describe, it, expect } from 'vitest';
import { createSampler } from '../src/sampler';

describe('Sampler', () => {
  it('should deterministically sample based on request ID', async () => {
    const sampler = createSampler(0.5);

    // Same ID should always produce same result
    const result1 = await sampler.shouldSample('test-id-123');
    const result2 = await sampler.shouldSample('test-id-123');

    expect(result1).toBe(result2);
  });
});
```

### Testing Cryptographic Functions

```typescript
import { describe, it, expect } from 'vitest';
import { createSigner } from '../src/signer';

describe('Signer', () => {
  it('should produce consistent signatures', async () => {
    const signer = createSigner('test-secret');
    const timestamp = '1234567890';
    const body = '{"test": true}';

    const sig1 = await signer.sign(timestamp, body);
    const sig2 = await signer.sign(timestamp, body);

    expect(sig1).toBe(sig2);
  });

  it('should produce different signatures for different inputs', async () => {
    const signer = createSigner('test-secret');

    const sig1 = await signer.sign('1234567890', '{"a": 1}');
    const sig2 = await signer.sign('1234567890', '{"a": 2}');

    expect(sig1).not.toBe(sig2);
  });
});
```

## Mocking Conventions

### Mocking Web Crypto API

For environments without Web Crypto:

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  // Vitest provides Web Crypto in Node environment
  // No mocking needed for most tests
});
```

### Mocking HTTP Transport

```typescript
import { vi, describe, it, expect } from 'vitest';
import { createTransport } from '../src/transport';

describe('Transport', () => {
  it('should send event to ingest URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
    });

    vi.stubGlobal('fetch', mockFetch);

    const transport = createTransport({
      ingestUrl: 'https://test.example.com/v1/events',
      timeout: 3000,
    });

    await transport.send({
      body: '{"test": true}',
      signature: 'sig',
      timestamp: '123',
      keyId: 'key',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.example.com/v1/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-lumen-key-id': 'key',
        }),
      })
    );

    vi.unstubAllGlobals();
  });
});
```

### Mocking Next.js Objects

```typescript
import { vi, describe, it, expect } from 'vitest';

describe('NextJS Adapter', () => {
  it('should extract request data from NextRequest', () => {
    const mockRequest = {
      method: 'GET',
      nextUrl: {
        pathname: '/api/users',
        search: '?page=1',
      },
      headers: new Headers({
        'user-agent': 'Mozilla/5.0',
        'x-forwarded-for': '192.168.1.1',
      }),
    };

    const mockEvent = {
      waitUntil: vi.fn(),
    };

    // Test adapter with mock objects
  });
});
```

## Test Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/test/**'],
    },
  },
});
```

## Debugging Tests

### Run Single Test

```bash
pnpm test -- --filter "should generate UUID"
```

### Verbose Output

```bash
pnpm test -- --reporter=verbose
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["--run", "--reporter=verbose"],
  "cwd": "${workspaceFolder}/packages/lumen-core"
}
```

## CI Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch

See `.github/workflows/` for CI configuration.
