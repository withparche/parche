import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-toc> — follows the reader, inside a box that never grows:
 * - on scroll (throttled to a frame) the last heading whose top has passed
 *   `offset` (a sticky header), or its own scroll-margin-top when that is
 *   lower, is current; the first one before any has;
 *   the last one once the page is scrolled to the bottom;
 * - every section with some of its text on screen is `visible`: a section
 *   runs from its heading to the next one (the last, to the end of the
 *   heading's container);
 * - links get `data-state` current / visible / idle, and the current one
 *   `aria-current="true"`;
 * - a group is open while its branch holds the current link or a visible
 *   one; the others are closed and inert;
 * - the indicator spans the visible links that are not folded away, and
 *   follows them while groups animate (a ResizeObserver on the track);
 * - when what is marked changes, the viewport scrolls itself (never the
 *   page) to keep the marked links clear of its faded edges; `data-fade`
 *   marks the edges that have more to scroll;
 * - `parche:changed` with the slug after the current link changes.
 */
export class ParcheToc extends ParcheElement {
  static tag = 'parche-toc' as const;

  #current: string | null = null;
  #visible = new Set<string>();
  #frame = 0;
  #reveal = 0;

  get links(): HTMLAnchorElement[] {
    return this.parts<HTMLAnchorElement>('link');
  }

  protected setup(signal: AbortSignal): void {
    const links = this.links;
    const headings = links.map((a) => document.getElementById(a.dataset.slug ?? '')).filter((h): h is HTMLElement => !!h);
    if (headings.length === 0) return;
    const offset = Number(this.getAttribute('offset') ?? 80);
    const viewport = this.part('viewport');
    const track = this.part('track');

    // A link jumps its heading to its scroll-margin-top, which may sit below
    // `offset`: that line counts as passed too, or the jump would mark the
    // section before it.
    const line = headings.map((h) => Math.max(offset, parseFloat(getComputedStyle(h).scrollMarginTop) || 0) + 1);

    const measure = () => {
      this.#frame = 0;
      const tops = headings.map((h) => h.getBoundingClientRect().top);
      let current = 0;
      tops.forEach((top, i) => {
        if (top <= line[i]) current = i;
      });
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = headings.length - 1;
      const end = headings[headings.length - 1].parentElement?.getBoundingClientRect().bottom ?? Infinity;
      const visible = new Set<string>();
      headings.forEach((h, i) => {
        const bottom = i + 1 < tops.length ? tops[i + 1] : end;
        if (bottom > (i + 1 < tops.length ? line[i + 1] : offset) && tops[i] < window.innerHeight) visible.add(h.id);
      });
      visible.add(headings[current].id);
      this.#set(headings[current].id, visible);
    };
    const schedule = () => {
      if (!this.#frame) this.#frame = requestAnimationFrame(measure);
    };

    document.addEventListener('scroll', schedule, { passive: true, signal });
    window.addEventListener('resize', schedule, { passive: true, signal });
    viewport?.addEventListener('scroll', () => this.#fade(), { passive: true, signal });
    // The track changes size while a group opens or closes, and when fonts
    // load: the indicator and the fades follow.
    const resized = new ResizeObserver(() => {
      this.#place();
      this.#fade();
    });
    if (track) resized.observe(track);
    if (viewport) resized.observe(viewport);
    signal.addEventListener('abort', () => {
      cancelAnimationFrame(this.#frame);
      clearTimeout(this.#reveal);
      resized.disconnect();
    });
    measure();
  }

  protected update(): void {
    const links = this.links;
    const currentLink = links.find((a) => a.dataset.slug === this.#current) ?? null;
    for (const link of links) {
      const slug = link.dataset.slug ?? '';
      const state = slug === this.#current ? 'current' : this.#visible.has(slug) ? 'visible' : 'idle';
      if (state === 'current') link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      this.setState(link, state);
    }
    // A group is open while its section is current or has text on screen:
    // the subsections open as the reader arrives, before they are current.
    const reading = links.filter((a) => a === currentLink || this.#visible.has(a.dataset.slug ?? ''));
    for (const group of this.parts('group')) {
      const branch = group.parentElement;
      const open = currentLink === null || reading.some((a) => !!branch?.contains(a));
      this.setState(group, open ? 'open' : 'closed');
      group.inert = !open;
    }
    this.#place();
  }

  #set(slug: string, visible: Set<string>): void {
    const same = slug === this.#current && visible.size === this.#visible.size && [...visible].every((s) => this.#visible.has(s));
    if (same) return;
    const moved = slug !== this.#current;
    this.#current = slug;
    this.#visible = visible;
    this.update();
    // Scroll the box once the groups have finished folding, so the target
    // is where it ends up, not where it was.
    clearTimeout(this.#reveal);
    this.#reveal = window.setTimeout(() => this.#keepInView(), this.reducedMotion ? 0 : 220);
    if (moved) this.emitted('change', { slug });
  }

  /** The links the indicator spans: current or visible, and not folded away. */
  #marked(): HTMLAnchorElement[] {
    return this.links.filter(
      (a) =>
        (a.dataset.slug === this.#current || this.#visible.has(a.dataset.slug ?? '')) &&
        !a.closest('[data-part="group"][data-state="closed"]'),
    );
  }

  /** Stretch the indicator over the marked links. */
  #place(): void {
    const track = this.part('track');
    const indicator = this.part('indicator');
    if (!track || !indicator) return;
    const shown = this.#marked();
    if (shown.length === 0) {
      delete indicator.dataset.shown;
      return;
    }
    const base = track.getBoundingClientRect().top;
    const first = shown[0].getBoundingClientRect();
    const last = shown[shown.length - 1].getBoundingClientRect();
    indicator.style.transform = `translateY(${first.top - base}px)`;
    indicator.style.height = `${last.bottom - first.top}px`;
    indicator.dataset.shown = '';
    // The first placement jumps; the ones after it glide.
    if (!('ready' in indicator.dataset)) requestAnimationFrame(() => (indicator.dataset.ready = ''));
  }

  /**
   * Keep the marked links inside the box, clear of the faded edges, without
   * touching the page: the whole range when it fits, else from the current
   * link down.
   */
  #keepInView(): void {
    const viewport = this.part('viewport');
    const shown = this.#marked();
    if (!viewport || shown.length === 0 || viewport.scrollHeight <= viewport.clientHeight) return;
    const box = viewport.getBoundingClientRect();
    const current = shown.find((a) => a.dataset.slug === this.#current) ?? shown[0];
    const top = shown[0].getBoundingClientRect().top - box.top + viewport.scrollTop;
    const bottom = shown[shown.length - 1].getBoundingClientRect().bottom - box.top + viewport.scrollTop;
    const margin = 40; // the fade's depth
    const room = viewport.clientHeight - 2 * margin;
    let target: number | null = null;
    if (bottom - top > room) target = current.getBoundingClientRect().top - box.top + viewport.scrollTop - margin;
    else if (top < viewport.scrollTop + margin) target = top - margin;
    else if (bottom > viewport.scrollTop + viewport.clientHeight - margin) target = bottom - viewport.clientHeight + margin;
    if (target === null || Math.abs(target - viewport.scrollTop) < 2) return;
    viewport.scrollTo({ top: Math.max(0, target), behavior: this.reducedMotion ? 'instant' : 'smooth' });
  }

  /** Fade the edges of the box that have more to scroll. */
  #fade(): void {
    const viewport = this.part('viewport');
    if (!viewport) return;
    const above = viewport.scrollTop > 1;
    const below = viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1;
    const fade = above && below ? 'both' : above ? 'top' : below ? 'bottom' : null;
    if (fade) viewport.dataset.fade = fade;
    else delete viewport.dataset.fade;
  }
}

ParcheToc.define();
