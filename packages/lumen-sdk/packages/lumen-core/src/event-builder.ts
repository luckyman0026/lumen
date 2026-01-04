import type { EventBuilder as EventBuilderInterface, EventData, LumenEvent } from './types';

const EVENT_VERSION = '1';
const DEFAULT_EVENT_TYPE = 'request';

export class EventBuilder implements EventBuilderInterface {
  private readonly keyId: string;

  constructor(keyId: string) {
    this.keyId = keyId;
  }

  build(data: EventData): LumenEvent {
    return {
      version: EVENT_VERSION,
      eventType: DEFAULT_EVENT_TYPE,
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      nonce: this.generateNonce(),
      keyId: this.keyId,
      ...this.extractOptionalFields(data),
    };
  }

  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private extractOptionalFields(data: EventData): Partial<LumenEvent> {
    const fields: Partial<LumenEvent> = {};

    if (data.method !== undefined) fields.method = data.method;
    if (data.pathname !== undefined) fields.pathname = data.pathname;
    if (data.search !== undefined) fields.search = data.search;
    if (data.ip !== undefined) fields.ip = data.ip;
    if (data.userAgent !== undefined) fields.userAgent = data.userAgent;
    if (data.referer !== undefined) fields.referer = data.referer;
    if (data.tags !== undefined && Object.keys(data.tags).length > 0) fields.tags = data.tags;
    if (data.metrics !== undefined && Object.keys(data.metrics).length > 0) fields.metrics = data.metrics;

    return fields;
  }
}

export function createEventBuilder(keyId: string): EventBuilderInterface {
  return new EventBuilder(keyId);
}
