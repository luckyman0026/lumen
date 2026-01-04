import type { Sampler as SamplerInterface } from './types';

/**
 * Deterministic sampler using consistent hashing on request ID.
 * Same request ID always produces the same sampling decision.
 */
export class Sampler implements SamplerInterface {
  private readonly sampleRate: number;
  private readonly threshold: number;

  constructor(sampleRate: number) {
    this.sampleRate = Math.max(0, Math.min(1, sampleRate));
    this.threshold = this.sampleRate * 0xffffffff;
  }

  async shouldSample(requestId: string): Promise<boolean> {
    if (this.sampleRate >= 1.0) return true;
    if (this.sampleRate <= 0.0) return false;

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(requestId));
    const hashArray = new Uint8Array(hashBuffer);

    // First 4 bytes as unsigned 32-bit integer
    const hashValue = ((hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3]) >>> 0;

    return hashValue <= this.threshold;
  }

  getSampleRate(): number {
    return this.sampleRate;
  }
}

export function createSampler(sampleRate = 0.1): SamplerInterface {
  return new Sampler(sampleRate);
}
