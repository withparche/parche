import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useDocs, isDirty } from '../store/documents';
import { useSelection } from '../store/selection';
import { useUi } from '../store/ui';
import type { PreviewApi } from '../../preview-client/index';
import { draftCss, tokensDirty, useTokens } from '../store/tokens';

/** Unsaved token values as CSS; once saved, the site's own CSS carries them. */
const tokenCss = () => (tokensDirty(useTokens.getState()) ? draftCss() : '');

/** The preview client of the frame now shown, for panels that talk to the page (tokens). */
let active: PreviewApi | null = null;
export const previewClient = () => active;

export const previewToken = document.querySelector<HTMLMetaElement>('meta[name="parche-builder-preview-token"]')?.content ?? '';

/**
 * The link between the editor and its preview frame. On each load of the
 * frame it injects the preview client (same origin, called directly) and
 * wires selection both ways. On each edit it sends the open documents as
 * drafts — with their node ids, which the render turns into markers — and
 * asks the frame to refresh in place.
 */
export function usePreview(frame: React.RefObject<HTMLIFrameElement | null>) {
  const client = useRef<PreviewApi | null>(null);
  // The document whose drafts the server holds: the frame loads a page only
  // once its drafts are there, so its first render already carries markers.
  const [ready, setReady] = useState<string | null>(null);

  // Drafts, then a refresh, a moment after the last edit.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last: unknown;
    const push = async () => {
      const { docs, current } = useDocs.getState();
      const open = Object.values(docs).filter((d) => d.key === current || isDirty(d));
      try {
        await api('drafts', { method: 'PUT', body: { docs: open.map((d) => ({ collection: d.collection, id: d.id, data: d.data })) } });
      } catch {
        return;
      }
      setReady(current);
      const res = await client.current?.refresh();
      if (res) useUi.getState().setPreviewError(res.ok ? null : `The preview could not render (${res.status}). ${res.excerpt ?? ''}`);
    };
    const unsub = useDocs.subscribe((s) => {
      const doc = s.current ? s.docs[s.current] : undefined;
      const key = doc ? `${doc.key}:${doc.past.length}:${doc.future.length}` : null;
      if (key === last) return;
      last = key;
      clearTimeout(timer);
      timer = setTimeout(() => void push(), 150);
    });
    void push();
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  // The selection, both ways.
  useEffect(() => useSelection.subscribe((s) => client.current?.select(s.node)), []);
  useEffect(() => useUi.subscribe((s) => client.current?.setMode(s.previewMode)), []);
  // Unsaved token values show at once, over the page's own.
  useEffect(() => useTokens.subscribe(() => client.current?.setTokens(tokenCss())), []);

  /** Called on every load of the frame (a navigation, or Astro's reload after a save). */
  const onLoad = () => {
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!win || !doc || !win.location.pathname.startsWith('/_parche/preview/')) return;
    const wire = () => {
      const c = win.__parchePreview;
      if (!c) return;
      client.current = c;
      active = c;
      c.setTokens(tokenCss());
      c.onSelect = (id) => useSelection.getState().select(id);
      c.describe = (id) => {
        const { docs, current } = useDocs.getState();
        const d = current ? docs[current] : undefined;
        const widget = d ? findWidget(d.data, id) : undefined;
        const catalog = useUi.getState().catalog;
        return widget ? catalog?.widgets[widget]?.label ?? catalog?.jsonWidgets?.[widget]?.label ?? widget : '';
      };
      c.setMode(useUi.getState().previewMode);
      c.select(useSelection.getState().node);
      // Drafts sent before this load may have missed it: render them now.
      void c.refresh();
    };
    if (win.__parchePreview) return wire();
    win.addEventListener('parche-preview-ready', wire, { once: true });
    const script = doc.createElement('script');
    script.type = 'module';
    script.src = '/_parche/builder/assets/preview-client.js';
    doc.head.append(script);
  };
  return { onLoad, ready };
}

function findWidget(data: Record<string, any>, id: string): string | undefined {
  const walk = (nodes: any[]): string | undefined => {
    for (const n of nodes ?? []) {
      if (n?.id === id) return n.widget;
      for (const kids of Object.values(n?.slots ?? {})) {
        const w = walk(kids as any[]);
        if (w) return w;
      }
    }
    return undefined;
  };
  return walk(data.sections) ?? walk(data.tree) ?? Object.values(data.slots ?? {}).map((l) => walk(l as any[])).find(Boolean);
}
