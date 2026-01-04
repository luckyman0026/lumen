import { createEventBuilder } from './event-builder';
import { createSampler } from './sampler';
import { createSigner } from './signer';
import { createTransport } from './transport';
import type {
  LumenConfig,
  EventData,
  EventBuilder,
  Sampler,
  Signer,
  Transport,
} from './types';

export class LumenClient {
  private readonly config: Required<LumenConfig>;
  private readonly eventBuilder: EventBuilder;
  private readonly sampler: Sampler;
  private readonly signer: Signer;
  private readonly transport: Transport;

  constructor(config: LumenConfig) {
    this.config = this.validateConfig(config);
    this.eventBuilder = createEventBuilder(this.config.keyId);
    this.sampler = createSampler(this.config.sampleRate);
    this.signer = createSigner(this.config.keyId, this.config.hmacSecret);
    this.transport = createTransport(this.config.timeout, this.config.debug);

    if (this.config.debug) {
      console.log('[Lumen] Initialized:', {
        ingestUrl: this.config.ingestUrl,
        keyId: this.config.keyId,
        sampleRate: this.config.sampleRate,
        timeout: this.config.timeout,
      });
    }
  }

  captureEvent(data: EventData): void {
    void this.captureEventAsync(data);
  }

  private async captureEventAsync(data: EventData): Promise<void> {
    try {
      const event = this.eventBuilder.build(data);

      if (!(await this.sampler.shouldSample(event.requestId))) {
        if (this.config.debug) {
          console.log(`[Lumen] Dropped by sampling: ${event.requestId}`);
        }
        return;
      }

      const body = JSON.stringify({ events: [event] });
      const timestamp = Date.now();
      const signedPayload = await this.signer.sign(body, timestamp);

      await this.transport.send(this.config.ingestUrl, signedPayload);

      if (this.config.debug) {
        console.log(`[Lumen] Captured: ${event.requestId}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.warn('[Lumen] Error:', error);
      }
    }
  }

  private validateConfig(config: LumenConfig): Required<LumenConfig> {
    if (!config.ingestUrl) {
      throw new Error('[Lumen] ingestUrl is required');
    }
    if (!config.keyId) {
      throw new Error('[Lumen] keyId is required');
    }
    if (!config.hmacSecret) {
      throw new Error('[Lumen] hmacSecret is required');
    }

    try {
      new URL(config.ingestUrl);
    } catch {
      throw new Error('[Lumen] ingestUrl must be a valid URL');
    }

    return {
      ingestUrl: config.ingestUrl,
      keyId: config.keyId,
      hmacSecret: config.hmacSecret,
      sampleRate: config.sampleRate ?? 0.1,
      timeout: config.timeout ?? 3000,
      debug: config.debug ?? false,
    };
  }
}

export function createLumenClient(config: LumenConfig): LumenClient {
  return new LumenClient(config);
}
