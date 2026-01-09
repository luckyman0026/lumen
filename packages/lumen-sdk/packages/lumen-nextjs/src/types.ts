import type { LumenConfig } from '@lumen/lumen-core';
import type { NextRequest, NextFetchEvent } from 'next/server';

export interface NextJSLumenClient {
  capture(req: NextRequest, event: NextFetchEvent): void;
}

export interface CreateNextJSLumenOptions extends LumenConfig {
  excludePaths?: string[];
  debug?: boolean;
}
