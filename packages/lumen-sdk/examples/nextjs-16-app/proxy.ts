import { createLumen } from '@lumen/lumen-nextjs';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const tracker = createLumen({
  ingestUrl: process.env.LUMEN_INGEST_URL ?? '',
  keyId: process.env.LUMEN_KEY_ID ?? '',
  hmacSecret: process.env.LUMEN_HMAC_SECRET ?? '',
  sampleRate: Number.parseFloat(process.env.LUMEN_SAMPLE_RATE ?? '0.1'),
  timeout: 2000,
  debug: true,
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  // @ts-expect-error - Minor type differences between Next.js 15 and 16, runtime compatible
  tracker.capture(req, event);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
