import { Idiomorph } from 'idiomorph';

/**
 * The preview's own script, which the editor injects into the preview frame
 * (same origin: the editor calls it directly, no messages to trust). It
 *
 * - refreshes the page in place: fetches it again (the server renders it
 *   with the editor's drafts), morphs the body with Idiomorph and adds the
 *   head's new styles and scripts, so scroll, focus and state survive;
 * - reads the markers nodes leave in the preview (`<!--parche-node:id-->`)
 *   and outlines the node under the pointer and the selected one, in an
 *   overlay of its own (a shadow root outside <body>, which the morph never
 *   touches);
 * - in edit mode, turns a click into a selection; in browse mode, keeps
 *   links inside the preview so the drafts stay in place.
 */
export interface PreviewApi {
  refresh(): Promise<{ ok: boolean; status: number; excerpt?: string }>;
  select(id: string | null): void;
  setMode(mode: 'edit' | 'browse'): void;
  onSelect?: (id: string) => void;
  onNavigate?: (path: string) => void;
  /** A node's name for the overlay's label, from the editor's catalog. */
  describe?: (id: string) => string;
  /** Unsaved token values, as CSS, over the page's own (a style kept after every other). */
  setTokens(css: string): void;
  /** What each token resolves to on this page now, light or dark as the page is. */
  computed(names: string[]): Record<string, string>;
}

declare global {
  interface Window {
    __parchePreview?: PreviewApi;
  }
}

const prefix = /^\/_parche\/preview\/[^/]+/.exec(location.pathname)?.[0] ?? '';
const SCROLL = `parche-preview-scroll:${location.pathname}`;

// ---------------------------------------------------------------- markers

/** The top-level elements between each node's markers, innermost node winning. */
let owner = new WeakMap<Element, string>();
let ranges = new Map<string, { start: Comment; end: Comment }>();

function index() {
  owner = new WeakMap();
  ranges = new Map();
  const open = new Map<string, Comment>();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
  const pairs: { id: string; start: Comment; end: Comment }[] = [];
  for (let c = walker.nextNode() as Comment | null; c; c = walker.nextNode() as Comment | null) {
    const m = /^(\/?)parche-node:([\w.-]+)$/.exec(c.data);
    if (!m) continue;
    if (!m[1]) open.set(m[2], c);
    else {
      const start = open.get(m[2]);
      if (start) pairs.push({ id: m[2], start, end: c });
    }
  }
  // Outer pairs first, so inner ones overwrite the elements they own.
  pairs.sort((a, b) => (a.start.compareDocumentPosition(b.start) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  for (const p of pairs) {
    ranges.set(p.id, p);
    const range = document.createRange();
    range.setStartAfter(p.start);
    range.setEndBefore(p.end);
    const all = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT);
    for (let el = all.currentNode as Element | null; el; el = all.nextNode() as Element | null) {
      if (el instanceof Element && range.intersectsNode(el) && !el.contains(p.start)) owner.set(el, p.id);
    }
  }
}

function idAt(target: EventTarget | null): string | null {
  for (let el = target instanceof Element ? target : null; el; el = el.parentElement) {
    const id = owner.get(el);
    if (id) return id;
  }
  return null;
}

function rectOf(id: string): DOMRect | null {
  const r = ranges.get(id);
  if (!r || !r.start.isConnected) return null;
  const range = document.createRange();
  range.setStartAfter(r.start);
  range.setEndBefore(r.end);
  const rect = range.getBoundingClientRect();
  return rect.width || rect.height ? rect : null;
}

// ---------------------------------------------------------------- overlay

const host = document.createElement('parche-builder-overlay');
host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';
const shadow = host.attachShadow({ mode: 'open' });
shadow.innerHTML = `<style>
  .box{position:fixed;border-radius:3px;pointer-events:none;transition:all .08s ease-out}
  .hover{outline:1px dashed #6366f1;outline-offset:-1px}
  .selected{outline:2px solid #4f46e5;outline-offset:-2px}
  .label{position:absolute;left:-2px;top:-20px;font:600 11px/1 ui-sans-serif,system-ui,sans-serif;color:#fff;background:#4f46e5;padding:4px 6px;border-radius:3px 3px 3px 0;white-space:nowrap}
  .box[hidden]{display:none}
</style><div class="box hover" hidden></div><div class="box selected" hidden><span class="label"></span></div>`;
const hoverBox = shadow.querySelector<HTMLElement>('.hover')!;
const selectBox = shadow.querySelector<HTMLElement>('.selected')!;
const label = shadow.querySelector<HTMLElement>('.label')!;
document.documentElement.append(host);

let mode: 'edit' | 'browse' = 'edit';
let hovered: string | null = null;
let selected: string | null = null;

function place(box: HTMLElement, id: string | null) {
  const rect = id ? rectOf(id) : null;
  if (!rect) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  box.style.left = `${rect.left}px`;
  box.style.top = `${rect.top}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
}

function draw() {
  place(hoverBox, mode === 'edit' && hovered !== selected ? hovered : null);
  place(selectBox, selected);
  if (selected) label.textContent = api.describe?.(selected.split('.')[0]) ?? '';
}

let frame = 0;
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(() => ((frame = 0), draw()));
};
addEventListener('scroll', schedule, { passive: true, capture: true });
addEventListener('resize', schedule, { passive: true });

document.addEventListener('mousemove', (e) => {
  if (mode !== 'edit') return;
  const id = idAt(e.target);
  if (id !== hovered) {
    hovered = id;
    schedule();
  }
});
document.addEventListener('mouseleave', () => {
  hovered = null;
  schedule();
});

// In edit mode a click selects; nothing on the page acts on it.
document.addEventListener(
  'click',
  (e) => {
    if (mode === 'edit') {
      const id = idAt(e.target);
      e.preventDefault();
      e.stopPropagation();
      if (id) api.onSelect?.(id.split('.')[0]);
      return;
    }
    // Browse mode: a link to this site stays in the preview.
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || a.target === '_blank' || a.origin !== location.origin || a.pathname.startsWith('/_parche/')) return;
    e.preventDefault();
    location.href = `${prefix}${a.pathname}${a.search}${a.hash}`;
  },
  true,
);

// ---------------------------------------------------------------- refresh

function mergeHead(next: Document) {
  const have = new Set([...document.head.children].map((el) => el.outerHTML));
  for (const el of next.head.children) {
    const tag = el.tagName;
    const wanted = tag === 'STYLE' || (tag === 'LINK' && (el as HTMLLinkElement).rel === 'stylesheet') || (tag === 'SCRIPT' && (el as HTMLScriptElement).src);
    if (!wanted || have.has(el.outerHTML)) continue;
    if (tag === 'SCRIPT') {
      // A script must be created here to run.
      const s = document.createElement('script');
      for (const a of el.attributes) s.setAttribute(a.name, a.value);
      document.head.append(s);
    } else document.head.append(document.importNode(el, true));
  }
  if (next.title) document.title = next.title;
}

let refreshing: Promise<unknown> = Promise.resolve();
async function refresh(): Promise<{ ok: boolean; status: number; excerpt?: string }> {
  const run = async () => {
    const res = await fetch(location.href, { cache: 'no-store' });
    const html = await res.text();
    if (!res.ok) return { ok: false, status: res.status, excerpt: new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim().slice(0, 400) };
    const next = new DOMParser().parseFromString(html, 'text/html');
    mergeHead(next);
    Idiomorph.morph(document.body, next.body, { morphStyle: 'innerHTML', ignoreActiveValue: true });
    for (const a of ['data-theme', 'lang', 'dir']) {
      const v = next.documentElement.getAttribute(a);
      if (v !== null && a !== 'data-theme') document.documentElement.setAttribute(a, v);
    }
    index();
    schedule();
    return { ok: true, status: res.status };
  };
  const p = refreshing.then(run, run);
  refreshing = p;
  return p;
}

// ---------------------------------------------------------------- api

const api: PreviewApi = {
  refresh,
  select(id) {
    selected = id;
    const rect = id ? rectOf(id) : null;
    if (rect && (rect.bottom < 0 || rect.top > innerHeight)) {
      scrollBy({ top: rect.top - 80, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    schedule();
  },
  setMode(m) {
    mode = m;
    hovered = null;
    schedule();
  },
  setTokens(css) {
    let style = document.getElementById('parche-builder-tokens') as HTMLStyleElement | null;
    if (!css) return style?.remove();
    if (!style) {
      style = document.createElement('style');
      style.id = 'parche-builder-tokens';
    }
    style.textContent = css;
    // Last in <head>, so it wins where it is scoped; the refresh never removes it.
    document.head.append(style);
    schedule();
  },
  computed(names) {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]));
  },
};
window.__parchePreview = api;

// A reload (a save makes Astro reload the page) keeps the reader's place.
addEventListener('pagehide', () => {
  try {
    sessionStorage.setItem(SCROLL, String(scrollY));
  } catch {}
});
try {
  const y = Number(sessionStorage.getItem(SCROLL));
  if (y) scrollTo(0, y);
} catch {}

index();
draw();
if (prefix) api.onNavigate?.(location.pathname.slice(prefix.length) || '/');
dispatchEvent(new Event('parche-preview-ready'));
