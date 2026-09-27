import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const CONTENT = fileURLToPath(new URL('../../playground/src/content/', import.meta.url));
export const file = (rel: string) => readFileSync(CONTENT + rel, 'utf8');

/** The session token, as the editor page carries it. */
export async function token(page: Page): Promise<string> {
  await page.goto('/_parche/builder');
  return (await page.locator('meta[name="parche-builder-token"]').getAttribute('content')) ?? '';
}

export function api(request: APIRequestContext, t: string) {
  const headers = { 'x-parche-builder': t };
  return {
    get: (path: string) => request.get(`/_parche/api/${path}`, { headers }),
    put: (path: string, data: unknown) => request.put(`/_parche/api/${path}`, { headers: { ...headers, 'content-type': 'application/json' }, data }),
    post: (path: string, data: unknown) => request.post(`/_parche/api/${path}`, { headers: { ...headers, 'content-type': 'application/json' }, data }),
  };
}

/**
 * Wait for the preview to be quiet: the dev server reloads open pages now
 * and then on its own (dependency optimisation, the content sync after an
 * earlier test's save), and a test that marks the page must not lose it.
 */
export async function settle(page: Page) {
  let last = Date.now();
  const onNav = (f: { parentFrame(): unknown }) => {
    if (f.parentFrame()) last = Date.now();
  };
  page.on('framenavigated', onNav);
  await expect.poll(() => Date.now() - last > 1200, { timeout: 15_000 }).toBe(true);
  page.off('framenavigated', onNav);
  await expect.poll(() => page.locator('iframe[title="Preview"]').evaluate((f: HTMLIFrameElement) => typeof (f.contentWindow as any)?.__parchePreview?.onSelect)).toBe('function');
}
