import type { LumenClient } from '@lumen/core';
import { createLumenClient } from '@lumen/core';
import type { NextFetchEvent, NextRequest } from 'next/server';
import type { CreateNextJSLumenOptions, NextJSLumenClient } from './types';
import { extractRequestData, shouldCapture } from './utils';

export class NextJSProxyAdapter implements NextJSLumenClient {
  private readonly coreClient: LumenClient;
  private readonly excludePaths: string[];
  private readonly debug: boolean;

  constructor(options: CreateNextJSLumenOptions) {
    this.coreClient = createLumenClient(options);
    this.excludePaths = options.excludePaths || [];
    this.debug = options.debug ?? false;
  }

  capture(req: NextRequest, event: NextFetchEvent): void {
    try {
      const pathname = req.nextUrl.pathname;

      if (!shouldCapture(pathname, this.excludePaths)) {
        if (this.debug) {
          console.log(`[Lumen] Skipping: ${pathname}`);
        }
        return;
      }

      const data = extractRequestData(req);

      event.waitUntil(
        Promise.resolve().then(() => {
          this.coreClient.captureEvent(data);
        })
      );

      if (this.debug) {
        console.log(`[Lumen] Scheduled: ${pathname}`);
      }
    } catch (error) {
      if (this.debug) {
        console.warn('[Lumen] Error:', error);
      }
    }
  }
}

export function createLumen(options: CreateNextJSLumenOptions): NextJSLumenClient {
  return new NextJSProxyAdapter(options);
}

export const createNextJSLumen = createLumen;
