import { describe, it, expect } from 'vitest';
import { createEventBuilder } from '../src/event-builder';

describe('EventBuilder', () => {
  const keyId = 'test-key-1';
  const builder = createEventBuilder(keyId);

  it('should build event with required fields', () => {
    const data = {
      method: 'GET',
      pathname: '/api/users',
    };

    const event = builder.build(data);

    expect(event.version).toBe('1');
    expect(event.eventType).toBe('request');
    expect(event.requestId).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(event.nonce).toBeDefined();
    expect(event.keyId).toBe(keyId);
    expect(event.method).toBe('GET');
    expect(event.pathname).toBe('/api/users');
  });

  it('should generate unique request IDs', () => {
    const event1 = builder.build({});
    const event2 = builder.build({});
    const event3 = builder.build({});

    expect(event1.requestId).not.toBe(event2.requestId);
    expect(event2.requestId).not.toBe(event3.requestId);
    expect(event1.requestId).not.toBe(event3.requestId);
  });

  it('should generate unique nonces', () => {
    const event1 = builder.build({});
    const event2 = builder.build({});

    expect(event1.nonce).not.toBe(event2.nonce);
  });

  it('should generate valid UUID v4 for requestId', () => {
    const event = builder.build({});
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(event.requestId).toMatch(uuidRegex);
  });

  it('should generate valid ISO 8601 timestamp', () => {
    const event = builder.build({});
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    expect(event.timestamp).toMatch(isoRegex);
    expect(new Date(event.timestamp).getTime()).toBeGreaterThan(0);
  });

  it('should include all optional fields when provided', () => {
    const data = {
      method: 'POST',
      pathname: '/api/create',
      search: '?foo=bar',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      referer: 'https://example.com',
      tags: { environment: 'prod', region: 'us-east-1' },
      metrics: { duration: 123, size: 456 },
    };

    const event = builder.build(data);

    expect(event.method).toBe('POST');
    expect(event.pathname).toBe('/api/create');
    expect(event.search).toBe('?foo=bar');
    expect(event.ip).toBe('192.168.1.1');
    expect(event.userAgent).toBe('Mozilla/5.0');
    expect(event.referer).toBe('https://example.com');
    expect(event.tags).toEqual({ environment: 'prod', region: 'us-east-1' });
    expect(event.metrics).toEqual({ duration: 123, size: 456 });
  });

  it('should omit optional fields when not provided', () => {
    const event = builder.build({});

    expect(event.method).toBeUndefined();
    expect(event.pathname).toBeUndefined();
    expect(event.search).toBeUndefined();
    expect(event.ip).toBeUndefined();
    expect(event.userAgent).toBeUndefined();
    expect(event.referer).toBeUndefined();
    expect(event.tags).toBeUndefined();
    expect(event.metrics).toBeUndefined();
  });

  it('should omit empty tags and metrics objects', () => {
    const event = builder.build({
      tags: {},
      metrics: {},
    });

    expect(event.tags).toBeUndefined();
    expect(event.metrics).toBeUndefined();
  });
});

