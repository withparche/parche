import { create } from 'zustand';
import type { Catalog } from './types';

export type PanelId = 'pages' | 'outline' | 'widgets' | 'design' | 'site';
export type Viewport = 'desktop' | 'tablet' | 'mobile';

interface UiState {
  catalog: Catalog | null;
  catalogError: string | null;
  panel: PanelId | null;
  viewport: Viewport;
  /** The editor's own chrome: dark by default, remembered per browser. */
  dark: boolean;
  /** The widget whose details the right panel shows (from the catalog). */
  inspected: string | null;
  /** Bumped to reload the preview by hand (a saved page reloads by itself: it is a dev page). */
  previewRev: number;
  /** Edit: a click selects. Browse: the page behaves as a visitor's. */
  previewMode: 'edit' | 'browse';
  /** The preview seen under another theme or colour scheme; '' is the site's own. */
  previewTheme: string;
  previewScheme: '' | 'light' | 'dark';
  setPreviewLook: (look: { theme?: string; scheme?: '' | 'light' | 'dark' }) => void;
  /** The collection the documents panel lists. */
  docsCollection: string;
  setDocsCollection: (c: string) => void;
  /** The page a layout or a menu is shown through, by document key. */
  previewVia: Record<string, string>;
  setPreviewVia: (key: string, page: string) => void;
  /** Why the preview could not render the drafts, when it could not. */
  previewError: string | null;
  setPreviewMode: (m: 'edit' | 'browse') => void;
  setPreviewError: (e: string | null) => void;
  bumpPreview: () => void;
  setPanel: (p: PanelId | null) => void;
  setCatalog: (c: Catalog) => void;
  setCatalogError: (e: string) => void;
  togglePanel: (p: PanelId) => void;
  setViewport: (v: Viewport) => void;
  toggleDark: () => void;
  /** Pinned, a side panel takes its own space; unpinned, it floats over the preview. Remembered per browser. */
  pinned: { left: boolean; right: boolean };
  /** A Markdown document shows its body as text instead of the preview. */
  bodyEditor: boolean;
  setBodyEditor: (on: boolean) => void;
  /** The inspector can be closed (to see the whole preview); selecting something opens it again. */
  inspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
  togglePin: (side: 'left' | 'right') => void;
  inspect: (name: string | null) => void;
}

const storedDark = (() => {
  try {
    return localStorage.getItem('parche-builder:dark') !== 'false';
  } catch {
    return true;
  }
})();

const storedPins = (() => {
  try {
    const v = JSON.parse(localStorage.getItem('parche-builder:pinned') ?? 'null');
    if (v && typeof v.left === 'boolean' && typeof v.right === 'boolean') return v as { left: boolean; right: boolean };
  } catch {}
  // As the old builder had it: the documents docked, the inspector floating.
  return { left: true, right: false };
})();

export const useUi = create<UiState>((set) => ({
  catalog: null,
  catalogError: null,
  panel: 'pages',
  viewport: 'desktop',
  dark: storedDark,
  inspected: null,
  previewRev: 0,
  previewMode: 'edit',
  previewError: null,
  previewTheme: '',
  previewScheme: '',
  previewVia: {},
  docsCollection: 'pages',
  setDocsCollection: (docsCollection) => set({ docsCollection }),
  setPreviewVia: (key, page) => set((s) => ({ previewVia: { ...s.previewVia, [key]: page } })),
  setPreviewLook: (look) => set((s) => ({ previewTheme: look.theme ?? s.previewTheme, previewScheme: look.scheme ?? s.previewScheme })),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setPreviewError: (previewError) => set({ previewError }),
  bumpPreview: () => set((s) => ({ previewRev: s.previewRev + 1 })),
  setPanel: (panel) => set({ panel }),
  setCatalog: (catalog) => set({ catalog, catalogError: null }),
  setCatalogError: (catalogError) => set({ catalogError }),
  togglePanel: (p) => set((s) => ({ panel: s.panel === p ? null : p })),
  setViewport: (viewport) => set({ viewport }),
  toggleDark: () =>
    set((s) => {
      try {
        localStorage.setItem('parche-builder:dark', String(!s.dark));
      } catch {}
      return { dark: !s.dark };
    }),
  inspect: (inspected) => set({ inspected }),
  pinned: storedPins,
  inspectorOpen: true,
  bodyEditor: false,
  setBodyEditor: (bodyEditor) => set({ bodyEditor }),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  togglePin: (side) =>
    set((s) => {
      const pinned = { ...s.pinned, [side]: !s.pinned[side] };
      try {
        localStorage.setItem('parche-builder:pinned', JSON.stringify(pinned));
      } catch {}
      return { pinned };
    }),
}));
