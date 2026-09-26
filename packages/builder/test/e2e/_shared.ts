import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { APIRequestContext, Page } from '@playwright/test';

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
