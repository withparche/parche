import { create } from 'zustand';
import { tokensToCss, type TokenOverrides } from '@parche/astro/tokens';
import { api, ApiError } from '../api';

/**
 * The site's own token values, being edited: what is saved, the draft over
 * it, and which scope (the base look or one theme) and scheme (light,
 * dark) the editor shows. The draft reaches the preview as CSS at once; a
 * save writes src/parche.tokens.json, which core turns into the site's CSS.
 */
export type Scope = { kind: 'base' } | { kind: 'theme'; name: string };
export type Mode = 'light' | 'dark';

export interface TokenMeta {
  layer: 'ref' | 'sys' | 'conf';
  type: string | null;
  group: string;
  description?: string;
}

interface TokensState {
  loaded: boolean;
  catalog: { light: Record<string, string>; dark: Record<string, string> } | null;
  meta: Record<string, TokenMeta>;
  saved: TokenOverrides;
  draft: TokenOverrides;
  etag: string;
  scope: Scope;
  mode: Mode;
  saving: boolean;
  error: string | null;
  load: () => Promise<void>;
  setScope: (s: Scope) => void;
  setMode: (m: Mode) => void;
  set: (name: string, value: string | undefined) => void;
  save: () => Promise<void>;
  discard: () => void;
}

/** The overrides map a scope and mode edit, created as needed. */
function mapFor(o: TokenOverrides, scope: Scope, mode: Mode, create: boolean): Record<string, string> | undefined {
  if (scope.kind === 'base') {
    if (create) ((o.base ??= {})[mode] ??= {});
    return o.base?.[mode];
  }
  if (create) (((o.themes ??= {})[scope.name] ??= {})[mode] ??= {});
  return o.themes?.[scope.name]?.[mode];
}

/** Drop emptied maps, so the saved file holds only what differs. */
function prune(o: TokenOverrides): TokenOverrides {
  const scheme = (s?: { light?: Record<string, string>; dark?: Record<string, string> }) => {
    if (!s) return undefined;
    const out: typeof s = {};
    if (s.light && Object.keys(s.light).length) out.light = s.light;
    if (s.dark && Object.keys(s.dark).length) out.dark = s.dark;
    return out.light || out.dark ? out : undefined;
  };
  const base = scheme(o.base);
  const themes = Object.fromEntries(Object.entries(o.themes ?? {}).map(([k, v]) => [k, scheme(v)]).filter(([, v]) => v));
  return { ...(base ? { base } : {}), ...(Object.keys(themes).length ? { themes } : {}) };
}

export const valueIn = (o: TokenOverrides, scope: Scope, mode: Mode, name: string) => mapFor(o, scope, mode, false)?.[name];
export const draftCss = () => tokensToCss(useTokens.getState().draft);
export const tokensDirty = (s: Pick<TokensState, 'saved' | 'draft'>) => JSON.stringify(prune(s.saved)) !== JSON.stringify(prune(s.draft));

export const useTokens = create<TokensState>((set, get) => ({
  loaded: false,
  catalog: null,
  meta: {},
  saved: {},
  draft: {},
  etag: '',
  scope: { kind: 'base' },
  mode: 'light',
  saving: false,
  error: null,
  load: async () => {
    const r = await api<{ catalog: TokensState['catalog']; meta: TokensState['meta']; overrides: TokenOverrides; etag: string }>('tokens');
    set({ loaded: true, catalog: r.catalog, meta: r.meta, saved: r.overrides, draft: structuredClone(r.overrides), etag: r.etag, error: null });
  },
  setScope: (scope) => set({ scope }),
  setMode: (mode) => set({ mode }),
  set: (name, value) =>
    set((s) => {
      const draft = structuredClone(s.draft);
      const map = mapFor(draft, s.scope, s.mode, value !== undefined);
      if (value === undefined) delete map?.[name];
      else map![name] = value;
      return { draft: prune(draft) };
    }),
  save: async () => {
    const { draft, etag } = get();
    set({ saving: true, error: null });
    try {
      const r = await api<{ etag: string }>('tokens', { method: 'PUT', body: { etag, overrides: prune(draft) } });
      set({ saving: false, saved: prune(structuredClone(draft)), etag: r.etag });
    } catch (e) {
      const detail = e instanceof ApiError ? (e.body as { detail?: { issues?: { path: string; message: string }[] } }).detail : undefined;
      set({ saving: false, error: detail?.issues ? detail.issues.map((i) => `${i.path}: ${i.message}`).join('; ') : e instanceof Error ? e.message : String(e) });
    }
  },
  discard: () => set((s) => ({ draft: structuredClone(s.saved) })),
}));
