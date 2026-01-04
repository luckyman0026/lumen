import type { SignedPayload, Transport as TransportInterface } from './types';

export class Transport implements TransportInterface {
  private readonly timeout: number;
  private readonly debug: boolean;

  constructor(timeout = 3000, debug = false) {
    this.timeout = timeout;
    this.debug = debug;
  }

  async send(url: string, payload: SignedPayload): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: payload.headers,
        body: payload.body,
        signal: controller.signal,
        redirect: 'manual',
      });

      if (this.debug) {
        if (response.ok || response.status === 202) {
          console.log(`[Lumen] Event sent: ${response.status}`);
        } else {
          console.warn(`[Lumen] Unexpected status: ${response.status}`);
        }
      }
    } catch (error) {
      if (this.debug) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`[Lumen] Timeout after ${this.timeout}ms`);
        } else {
          console.warn('[Lumen] Send failed:', error);
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export function createTransport(timeout?: number, debug?: boolean): TransportInterface {
  return new Transport(timeout, debug);
}
