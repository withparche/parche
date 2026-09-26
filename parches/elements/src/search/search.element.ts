import { ParcheElement } from '@parche/elements/client';

type Pagefind = {
  search(q: string): Promise<{ results: { data(): Promise<PagefindResult> }[] }>;
  options?(o: Record<string, unknown>): Promise<void>;
};
type PagefindResult = { url: string; excerpt: string; meta: Record<string, string> };

/**
 * <parche-search> — searches a Pagefind index. The index script is imported
 * on first use from `bundle`; the query lives in the `param` of the address.
 * Emits `parche:search` (cancelable) and `parche:searchd` with
 * `{ query, count }`.
 */
export class ParcheSearch extends ParcheElement {
  static tag = 'parche-search' as const;
  #pagefind: Promise<Pagefind> | null = null;
  #timer: ReturnType<typeof setTimeout> | undefined;
  #run = 0;

  protected setup(signal: AbortSignal): void {
    const input = this.part<HTMLInputElement>('input');
    const form = this.part<HTMLFormElement>('form');
    const clear = this.part<HTMLButtonElement>('clear');
    const nojs = this.part('nojs');
    if (nojs) nojs.hidden = true;
    if (!input || !form) return;
    form.addEventListener('submit', (e) => { e.preventDefault(); void this.#search(input.value); }, { signal });
    input.addEventListener('input', () => {
      clearTimeout(this.#timer);
      this.#timer = setTimeout(() => void this.#search(input.value), 220);
    }, { signal });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.value = ''; void this.#search(''); } }, { signal });
    clear?.addEventListener('click', () => { input.value = ''; input.focus(); void this.#search(''); }, { signal });
    // A static page cannot read the query on the server: take it from the address.
    const asked = new URL(location.href).searchParams.get(this.getAttribute('param') ?? 'q');
    if (asked && !input.value) input.value = asked;
    if (input.value.trim()) void this.#search(input.value);
  }

  protected update(): void {}

  #load(): Promise<Pagefind> {
    const bundle = this.getAttribute('bundle') ?? '/pagefind/';
    // A URL on the site, not a module Vite should bundle.
    this.#pagefind ??= import(/* @vite-ignore */ `${bundle}pagefind.js`) as Promise<Pagefind>;
    return this.#pagefind;
  }

  async #search(raw: string): Promise<void> {
    const q = raw.trim();
    const run = ++this.#run;
    const status = this.part('status');
    const list = this.part<HTMLOListElement>('results');
    const empty = this.part('empty');
    const clear = this.part<HTMLButtonElement>('clear');
    const param = this.getAttribute('param') ?? 'q';
    const url = new URL(location.href);
    if (q) url.searchParams.set(param, q);
    else url.searchParams.delete(param);
    history.replaceState(history.state, '', url);
    if (clear) clear.hidden = !q;
    if (!q) {
      this.setState(this, 'idle');
      if (status) status.textContent = '';
      if (list) list.replaceChildren();
      if (empty) empty.hidden = true;
      return;
    }
    if (!this.emit('search', { query: q })) return;
    this.setState(this, 'loading');
    if (status) status.textContent = this.getAttribute('loading-label') ?? '';
    try {
      const pagefind = await this.#load();
      const found = await pagefind.search(q);
      const limit = Number(this.getAttribute('limit') ?? 20);
      const data = await Promise.all(found.results.slice(0, limit).map((r) => r.data()));
      if (run !== this.#run) return;
      const n = found.results.length;
      const fill = (t: string | null) => (t ?? '').replaceAll('{n}', String(n)).replaceAll('{q}', q);
      if (status) status.textContent = fill(this.getAttribute(n === 0 ? 'none-label' : n === 1 ? 'result-label' : 'results-label'));
      if (list) list.replaceChildren(...data.map((d) => this.#item(d)));
      if (empty) empty.hidden = n > 0;
      this.setState(this, n > 0 ? 'results' : 'empty');
      this.emitted('search', { query: q, count: n });
    } catch {
      if (run !== this.#run) return;
      this.setState(this, 'empty');
      if (status) status.textContent = '';
      if (empty) empty.hidden = false;
    }
  }

  #item(d: PagefindResult): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'border-t border-border py-5 first:border-t-0';
    const meta = [d.meta.category, d.meta.date].filter(Boolean).join(' · ');
    if (meta) {
      const p = document.createElement('p');
      p.className = 'font-mono text-[10px] leading-none font-medium tracking-[0.16em] text-primary uppercase';
      p.textContent = meta;
      li.append(p);
    }
    const a = document.createElement('a');
    a.href = d.url;
    a.className = 'mt-2 block font-heading text-lg font-semibold text-heading no-underline hover:underline';
    a.textContent = d.meta.title ?? d.url;
    li.append(a);
    // Pagefind's excerpt is text from the page with the matches in <mark>;
    // rebuilt node by node, so nothing else from it becomes markup.
    const ex = document.createElement('p');
    ex.className = 'mt-1.5 text-[15px] leading-[1.6] text-muted [&_mark]:bg-highlight [&_mark]:text-heading';
    for (const [i, chunk] of d.excerpt.split(/<\/?mark>/).entries()) {
      if (!chunk) continue;
      const text = document.createTextNode(new DOMParser().parseFromString(chunk, 'text/html').documentElement.textContent ?? '');
      if (i % 2 === 1) { const m = document.createElement('mark'); m.append(text); ex.append(m); } else ex.append(text);
    }
    li.append(ex);
    return li;
  }
}

ParcheSearch.define();
