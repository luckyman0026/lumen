import { describe, it, expect, vi } from 'vitest';
import { NextJSProxyAdapter } from '../src/proxy-adapter';
import type { NextRequest, NextFetchEvent } from 'next/server';

// Mock NextRequest
function createMockRequest(url: string, method: string = 'GET'): NextRequest {
  const urlObj = new URL(url);
  return {
    method,
    nextUrl: urlObj,
    headers: new Headers({
      'user-agent': 'Mozilla/5.0',
      'x-real-ip': '192.168.1.1',
    }),
  } as unknown as NextRequest;
}

// Mock NextFetchEvent
function createMockEvent(): NextFetchEvent {
  return {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  } as unknown as NextFetchEvent;
}

describe('NextJSProxyAdapter', () => {
  const config = {
    ingestUrl: 'https://ingest.example.com/v1/events',
    keyId: 'test-key',
    hmacSecret: 'test-secret',
    sampleRate: 1.0, // Always sample for testing
    debug: false,
  };

  it('should capture regular requests', () => {
    const adapter = new NextJSProxyAdapter(config);
    const req = createMockRequest('https://example.com/api/users');
    const event = createMockEvent();

    adapter.capture(req, event);

    // Should call waitUntil
    expect(event.waitUntil).toHaveBeenCalled();
  });

  it('should skip static assets by default', () => {
    const adapter = new NextJSProxyAdapter(config);
    const event = createMockEvent();

    const staticPaths = [
      'https://example.com/_next/static/chunk.js',
      'https://example.com/_next/image/photo.jpg',
      'https://example.com/favicon.ico',
      'https://example.com/robots.txt',
    ];

    staticPaths.forEach(url => {
      const req = createMockRequest(url);
      adapter.capture(req, event);
    });

    // Should not call waitUntil for static assets
    expect(event.waitUntil).not.toHaveBeenCalled();
  });

  it('should respect custom exclude paths', () => {
    const adapter = new NextJSProxyAdapter({
      ...config,
      excludePaths: ['/admin', '/internal'],
    });

    const req1 = createMockRequest('https://example.com/admin/dashboard');
    const req2 = createMockRequest('https://example.com/internal/health');
    const event = createMockEvent();

    adapter.capture(req1, event);
    adapter.capture(req2, event);

    // Should not call waitUntil for excluded paths
    expect(event.waitUntil).not.toHaveBeenCalled();
  });

  it('should capture API routes', () => {
    const adapter = new NextJSProxyAdapter(config);
    const req = createMockRequest('https://example.com/api/data', 'POST');
    const event = createMockEvent();

    adapter.capture(req, event);

    expect(event.waitUntil).toHaveBeenCalled();
  });

  it('should handle errors gracefully', () => {
    const adapter = new NextJSProxyAdapter(config);
    const req = createMockRequest('https://example.com/test');
    const event = {
      waitUntil: () => {
        throw new Error('Test error');
      },
    } as unknown as NextFetchEvent;

    // Should not throw
    expect(() => adapter.capture(req, event)).not.toThrow();
  });
});

