/**
 * The builder's session: what the integration learns at startup and the
 * routes need on every request. It lives on a global under a well-known
 * symbol because the integration runs in Astro's process and the routes in
 * Vite's module runner — the same process, different module graphs — and
 * because module invalidation must not reset it.
 */
export interface BuilderEvent {
  type: 'file-changed' | 'catalog-changed';
  collection?: string;
  id?: string;
}

export interface Session {
  token: string;
  previewToken: string;
  host: string | boolean;
  root: string;
  /** The editor's unsaved documents, by the file each stands in for, for the preview. */
  drafts: Map<string, Record<string, unknown>>;
  /** Who listens for changes on disk: one per open editor (SSE). */
  listeners: Set<(e: BuilderEvent) => void>;
}

const KEY = Symbol.for('parche.builder');

export function session(): Session {
  const g = globalThis as { [KEY]?: Session };
  return (g[KEY] ??= { token: '', previewToken: '', host: false, root: '', drafts: new Map(), listeners: new Set() });
}
