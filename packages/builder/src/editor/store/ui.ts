import { create } from 'zustand';
import type { Catalog } from './types';

export type PanelId = 'pages' | 'widgets';
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
  setCatalog: (c: Catalog) => void;
  setCatalogError: (e: string) => void;
  togglePanel: (p: PanelId) => void;
  setViewport: (v: Viewport) => void;
  toggleDark: () => void;
  inspect: (name: string | null) => void;
}

const storedDark = (() => {
  try {
    return localStorage.getItem('parche-builder:dark') !== 'false';
  } catch {
    return true;
  }
})();

export const useUi = create<UiState>((set) => ({
  catalog: null,
  catalogError: null,
  panel: 'widgets',
  viewport: 'desktop',
  dark: storedDark,
  inspected: null,
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
}));
