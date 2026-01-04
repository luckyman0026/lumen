export interface LumenConfig {
  ingestUrl: string;
  keyId: string;
  hmacSecret: string;
  sampleRate?: number;
  timeout?: number;
  debug?: boolean;
}

export interface LumenEvent {
  version: string;
  eventType: string;
  requestId: string;
  timestamp: string;
  nonce: string;
  keyId: string;
  method?: string;
  pathname?: string;
  search?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  tags?: Record<string, string>;
  metrics?: Record<string, number>;
}

export interface EventData {
  method?: string;
  pathname?: string;
  search?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  tags?: Record<string, string>;
  metrics?: Record<string, number>;
}

export interface SignedPayload {
  body: string;
  headers: {
    'Content-Type': string;
    'X-API-Key': string;
    'x-lumen-key-id': string;
    'x-lumen-ts': string;
    'x-lumen-signature': string;
  };
}

export interface Transport {
  send(url: string, payload: SignedPayload): Promise<void>;
}

export interface EventBuilder {
  build(data: EventData): LumenEvent;
}

export interface Sampler {
  shouldSample(requestId: string): Promise<boolean>;
}

export interface Signer {
  sign(body: string, timestamp: number): Promise<SignedPayload>;
}
