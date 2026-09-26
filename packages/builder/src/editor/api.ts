/**
 * Every call to the builder's API carries the session token the server put in
 * the page (a meta tag), which is how the server tells the editor from any
 * other page in the browser.
 */
const token = document.querySelector<HTMLMetaElement>('meta[name="parche-builder-token"]')?.content ?? '';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(typeof body === 'object' && body && 'error' in body ? String((body as { error: unknown }).error) : `HTTP ${status}`);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/_parche/api/${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'x-parche-builder': token,
      ...(init.body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const body = res.headers.get('content-type')?.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}
