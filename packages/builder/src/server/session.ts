/**
 * The builder's session: what the integration learns at startup and the
 * routes need on every request. It lives on a global under a well-known
 * symbol because the integration runs in Astro's process and the routes in
 * Vite's module runner — the same process, different module graphs — and
 * because module invalidation must not reset it.
 */
export interface Session {
  token: string;
  previewToken: string;
  host: string | boolean;
  root: string;
}

const KEY = Symbol.for('parche.builder');

export function session(): Session {
  const g = globalThis as { [KEY]?: Session };
  return (g[KEY] ??= { token: '', previewToken: '', host: false, root: '' });
}
