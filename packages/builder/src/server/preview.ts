import { AsyncLocalStorage } from 'node:async_hooks';
import type { PreviewContext } from '@parche/astro/dev';

/**
 * The preview's request context: an AsyncLocalStorage under the symbol core
 * reads (previewContext), so a render started inside it — and everything it
 * awaits — sees the drafts, and every other request sees nothing.
 */
const KEY = Symbol.for('parche.preview');

export function previewAls(): AsyncLocalStorage<PreviewContext> {
  const g = globalThis as { [KEY]?: AsyncLocalStorage<PreviewContext> };
  return (g[KEY] ??= new AsyncLocalStorage<PreviewContext>());
}
