import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-toc> — marks the link of the heading in view as current:
 * - on scroll (throttled to a frame) the last heading whose top has passed
 *   `offset` (a sticky header) is current; the first one before any has;
 *   the last one once the page is scrolled to the bottom;
 * - `aria-current="true"` on that link, `data-state="current"` alongside;
 * - `parche:changed` with the slug after a change.
 * Nothing else: the links are ordinary anchors.
 */
export class ParcheToc extends ParcheElement {
  static tag = 'parche-toc' as const;

  #current: string | null = null;
  #frame = 0;

  get links(): HTMLAnchorElement[] {
    return this.parts<HTMLAnchorElement>('link');
  }

  protected setup(signal: AbortSignal): void {
    const headings = this.links.map((a) => document.getElementById(a.dataset.slug ?? '')).filter((h): h is HTMLElement => !!h);
    if (headings.length === 0) return;
    const offset = Number(this.getAttribute('offset') ?? 80);

    const measure = () => {
      this.#frame = 0;
      let current = headings[0];
      for (const h of headings) if (h.getBoundingClientRect().top <= offset + 1) current = h;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = headings[headings.length - 1];
      this.#set(current.id);
    };
    const schedule = () => {
      if (!this.#frame) this.#frame = requestAnimationFrame(measure);
    };

    document.addEventListener('scroll', schedule, { passive: true, signal });
    window.addEventListener('resize', schedule, { passive: true, signal });
    signal.addEventListener('abort', () => cancelAnimationFrame(this.#frame));
    measure();
  }

  protected update(): void {
    for (const link of this.links) {
      const on = link.dataset.slug === this.#current;
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      this.setState(link, on ? 'current' : 'idle');
    }
  }

  #set(slug: string | null): void {
    if (slug === this.#current) return;
    this.#current = slug;
    this.update();
    this.emitted('change', { slug });
  }
}

ParcheToc.define();
