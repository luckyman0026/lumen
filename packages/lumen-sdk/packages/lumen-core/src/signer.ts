import type { SignedPayload, Signer as SignerInterface } from './types';

/**
 * HMAC-SHA256 signer for payload verification.
 * Signature: HMAC-SHA256(secret, timestamp + "." + body), base64url encoded.
 */
export class Signer implements SignerInterface {
  private readonly keyId: string;
  private readonly secret: string;

  constructor(keyId: string, secret: string) {
    this.keyId = keyId;
    this.secret = secret;
  }

  async sign(body: string, timestamp: number): Promise<SignedPayload> {
    const signingInput = `${timestamp}.${body}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
    const signature = this.base64UrlEncode(new Uint8Array(signatureBuffer));

    return {
      body,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.secret,
        'x-lumen-key-id': this.keyId,
        'x-lumen-ts': timestamp.toString(),
        'x-lumen-signature': signature,
      },
    };
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}

export function createSigner(keyId: string, secret: string): SignerInterface {
  return new Signer(keyId, secret);
}
