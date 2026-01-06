import { describe, it, expect } from 'vitest';
import { createSampler } from '../src/sampler';

describe('Sampler', () => {
  it('should always sample when rate is 1.0', async () => {
    const sampler = createSampler(1.0);

    // Test with multiple request IDs
    for (let i = 0; i < 100; i++) {
      const requestId = `request-${i}`;
      expect(await sampler.shouldSample(requestId)).toBe(true);
    }
  });

  it('should never sample when rate is 0.0', async () => {
    const sampler = createSampler(0.0);

    // Test with multiple request IDs
    for (let i = 0; i < 100; i++) {
      const requestId = `request-${i}`;
      expect(await sampler.shouldSample(requestId)).toBe(false);
    }
  });

  it('should be deterministic for same request ID', async () => {
    const sampler = createSampler(0.5);
    const requestId = 'test-request-123';

    const result1 = await sampler.shouldSample(requestId);
    const result2 = await sampler.shouldSample(requestId);
    const result3 = await sampler.shouldSample(requestId);

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  it('should produce different results for different request IDs', async () => {
    const sampler = createSampler(0.5);

    const results = new Set<boolean>();
    for (let i = 0; i < 100; i++) {
      const requestId = `request-${i}`;
      results.add(await sampler.shouldSample(requestId));
    }

    // With rate 0.5 and 100 samples, we should see both true and false
    expect(results.size).toBe(2);
    expect(results.has(true)).toBe(true);
    expect(results.has(false)).toBe(true);
  });

  it('should approximate the sample rate', async () => {
    const sampleRate = 0.3;
    const sampler = createSampler(sampleRate);
    const iterations = 1000;

    let sampled = 0;
    for (let i = 0; i < iterations; i++) {
      const requestId = `request-${i}`;
      if (await sampler.shouldSample(requestId)) {
        sampled++;
      }
    }

    const actualRate = sampled / iterations;
    // Allow 10% margin of error
    expect(actualRate).toBeGreaterThan(sampleRate * 0.9);
    expect(actualRate).toBeLessThan(sampleRate * 1.1);
  });

  it('should clamp sample rate to 0-1 range', async () => {
    const samplerHigh = createSampler(1.5);
    const samplerLow = createSampler(-0.5);

    // Should behave like 1.0 (always sample)
    expect(await samplerHigh.shouldSample('test-1')).toBe(true);

    // Should behave like 0.0 (never sample)
    expect(await samplerLow.shouldSample('test-2')).toBe(false);
  });
});

