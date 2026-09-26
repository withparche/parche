import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-sticky-bar> — shows the bar once the reader is `after` screens down,
 * hides it while the page footer is in view. `inert` keeps a hidden bar out of
 * the tab order. Emits `parche:toggled` with `{ shown }`.
 */
export class ParcheStickyBar extends ParcheElement {
  static tag = 'parche-sticky-bar' as const;

  #footerVisible = false;

  protected setup(signal: AbortSignal): void {
    // The site footer, not a card's, a quote's or a dialog's.
    const footers = Array.from(document.querySelectorAll('footer'));
    const footer = footers.find((f) => !f.closest('main, article, section, aside, blockquote, figure, dialog, [popover]')) ?? footers.at(-1);
    if (footer && typeof IntersectionObserver === 'function') {
      const io = new IntersectionObserver((entries) => {
        this.#footerVisible = entries.some((e) => e.isIntersecting);
        this.#sync();
      });
      io.observe(footer);
      signal.addEventListener('abort', () => io.disconnect());
    }
    addEventListener('scroll', () => this.#sync(), { passive: true, signal });
    this.#sync();
  }

  protected update(): void {}

  #sync(): void {
    const after = Number(this.getAttribute('after') ?? 0.8);
    // On a page shorter than that, half of what it can scroll, so the bar still comes.
    const room = document.documentElement.scrollHeight - innerHeight;
    const shown = scrollY > Math.min(innerHeight * after, room / 2) && room > 0 && !this.#footerVisible;
    if ((this.getAttribute('data-state') === 'shown') === shown) return;
    this.setState(this, shown ? 'shown' : 'hidden');
    const bar = this.part('bar');
    if (bar) bar.inert = !shown;
    this.emitted('toggle', { shown });
  }
}

ParcheStickyBar.define();
