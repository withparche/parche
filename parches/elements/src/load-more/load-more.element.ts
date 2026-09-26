import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-load-more> — fetches the page its link points to, appends that
 * page's list items to this page's list, and moves on. If the fetch or the
 * lists fail, it follows the link: the reader always gets the next page.
 * Emits `parche:load` (cancelable) and `parche:loadd` with `{ href, count }`.
 */
export class ParcheLoadMore extends ParcheElement {
  static tag = 'parche-load-more' as const;

  protected setup(signal: AbortSignal): void {
    const link = this.part<HTMLAnchorElement>('link');
    if (!link) return;
    link.addEventListener(
      'click',
      (event) => {
        // A new tab or window is the reader's choice: leave it to the link.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        void this.#load(link);
      },
      { signal },
    );
  }

  protected update(): void {}

  async #load(link: HTMLAnchorElement): Promise<void> {
    if (this.getAttribute('data-state') === 'loading') return;
    const href = link.href;
    if (!this.emit('load', { href })) return;
    const label = link.textContent ?? '';
    const selector = this.getAttribute('list') ?? '[data-load-more-list]';
    const here = document.querySelector(selector);
    this.setState(this, 'loading');
    link.textContent = this.getAttribute('loading-label') ?? label;
    try {
      const res = await fetch(href, { headers: { Accept: 'text/html' } });
      if (!res.ok || !here) throw new Error(`load-more: ${res.status}`);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const there = doc.querySelector(selector);
      if (!there) throw new Error('load-more: no list on the next page');
      const added = Array.from(there.children).map((item) => here.appendChild(document.importNode(item, true)));
      history.replaceState(history.state, '', href);
      const next = doc.querySelector<HTMLAnchorElement>('parche-load-more [data-part="link"]');
      const status = this.part('status');
      if (status) status.textContent = (this.getAttribute('status') ?? '{n} more loaded').replace('{n}', String(added.length));
      // Focus the first new item's link, so a keyboard reader continues where the list grew.
      (added[0]?.querySelector('a[href]') as HTMLElement | null)?.focus({ preventScroll: true });
      if (next) {
        link.href = next.getAttribute('href') ?? next.href;
        link.textContent = label;
        this.setState(this, 'idle');
      } else {
        this.setState(this, 'done');
        link.remove();
      }
      this.emitted('load', { href, count: added.length });
    } catch {
      location.assign(href);
    }
  }
}

ParcheLoadMore.define();
