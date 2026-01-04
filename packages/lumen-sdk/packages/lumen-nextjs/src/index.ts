export { createLumen, createNextJSLumen, NextJSProxyAdapter } from './proxy-adapter';
export { extractRequestData, extractIpAddress, shouldCapture } from './utils';

export type {
  NextJSLumenClient,
  CreateNextJSLumenOptions,
} from './types';

export type {
  LumenConfig,
  LumenEvent,
  EventData,
} from '@lumen/core';
