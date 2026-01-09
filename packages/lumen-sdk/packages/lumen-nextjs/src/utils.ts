import type { NextRequest } from 'next/server';
import type { EventData } from '@lumen/lumen-core';

const DEFAULT_EXCLUDE_PATTERNS = [
  /^\/_next\/static\//,
  /^\/_next\/image\//,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/apple-touch-icon.*\.png$/,
  /^\/android-chrome-.*\.png$/,
  /^\/manifest\.json$/,
];

export function shouldCapture(pathname: string, customExcludes: string[] = []): boolean {
  for (const pattern of DEFAULT_EXCLUDE_PATTERNS) {
    if (pattern.test(pathname)) return false;
  }

  for (const pattern of customExcludes) {
    if (pathname.includes(pattern)) return false;
  }

  return true;
}

export function extractRequestData(req: NextRequest): EventData {
  const url = req.nextUrl;

  return {
    method: req.method,
    pathname: url.pathname,
    search: url.search || undefined,
    ip: extractIpAddress(req),
    userAgent: req.headers.get('user-agent') || undefined,
    referer: req.headers.get('referer') || undefined,
  };
}

/**
 * Extract IP from headers: x-real-ip, x-forwarded-for, or cf-connecting-ip
 */
export function extractIpAddress(req: NextRequest): string | undefined {
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  return undefined;
}
