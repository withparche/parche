import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-carousel> — drives a scroll-snap track:
 * - the position is the slide at the start of the track: `data-index`,
 *   read from the scroll offset (throttled to a frame), so touch, wheel,
 *   keyboard and the buttons all agree;
 * - with several slides per view the last ones can never reach the start,
 *   so only `count - perView + 1` positions exist: the surplus picker
 *   buttons hide, and "next" disables at the last reachable position;
 * - previous / next and the picker scroll to a position; ArrowLeft /
 *   ArrowRight and Home / End on the track do the same;
 * - `parche:changed` after the position changes.
 * Scrolling itself is the browser's; smooth unless motion is reduced.
 */
export class ParcheCarousel extends ParcheElement {
  static tag = 'parche-carousel' as const;
  static observedAttributes = ['data-index'];

  #frame = 0;

  get index(): number {
    return Number(this.dataset.index ?? 0);
  }

  get slides(): HTMLElement[] {
    return this.parts('slide');
  }

  get track(): HTMLElement | null {
    return this.part('track');
  }

  /** Slides visible at once, from the stylesheet's responsive variable. */
  get perView(): number {
    return Math.max(1, Number(getComputedStyle(this).getPropertyValue('--carousel-per-view')) || 1);
  }

  /** How many positions the track can snap to. */
  get positions(): number {
    return Math.max(1, this.slides.length - this.perView + 1);
  }

  /** Scroll so that slide `index` is first in view (clamped to a reachable position). */
  go(index: number): void {
    const track = this.track;
    const slides = this.slides;
    if (!track || slides.length === 0) return;
    const target = slides[Math.max(0, Math.min(this.positions - 1, index))];
    track.scrollTo({ left: target.offsetLeft - slides[0].offsetLeft, behavior: this.reducedMotion ? 'auto' : 'smooth' });
  }

  protected setup(signal: AbortSignal): void {
    const track = this.track;
    if (!track) return;

    this.part('prev')?.addEventListener('click', () => this.go(this.index - 1), { signal });
    this.part('next')?.addEventListener('click', () => this.go(this.index + 1), { signal });
    this.part('dots')?.addEventListener(
      'click',
      (event) => {
        const dot = (event.target as Element).closest<HTMLElement>('[data-part="dot"]');
        if (dot) this.go(Number(dot.dataset.index));
      },
      { signal },
    );

    track.addEventListener(
      'keydown',
      (event) => {
        if (event.target !== track) return;
        const map: Record<string, number> = { ArrowRight: this.index + 1, ArrowLeft: this.index - 1, Home: 0, End: this.positions - 1 };
        if (event.key in map) {
          event.preventDefault();
          this.go(map[event.key]);
        }
      },
      { signal },
    );

    // The position follows the scroll offset, whatever moved it.
    const measure = () => {
      this.#frame = 0;
      const slides = this.slides;
      if (slides.length < 2) return;
      const step = slides[1].offsetLeft - slides[0].offsetLeft || 1;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      const index = atEnd ? this.positions - 1 : Math.min(this.positions - 1, Math.round(track.scrollLeft / step));
      if (index !== this.index) {
        this.dataset.index = String(index); // → update()
        this.emitted('change', { index });
      }
    };
    const schedule = () => {
      if (!this.#frame) this.#frame = requestAnimationFrame(measure);
    };
    track.addEventListener('scroll', schedule, { passive: true, signal });
    track.addEventListener('scrollend', measure, { passive: true, signal }); // no frame needed once the scroll settles
    window.addEventListener('resize', () => (schedule(), this.update()), { passive: true, signal });
    signal.addEventListener('abort', () => cancelAnimationFrame(this.#frame));
  }

  protected update(): void {
    const index = this.index;
    const positions = this.positions;
    this.slides.forEach((slide, i) => this.setState(slide, i === index ? 'active' : 'inactive'));
    for (const dot of this.parts<HTMLButtonElement>('dot')) {
      const i = Number(dot.dataset.index);
      dot.hidden = i >= positions;
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    }
    const prev = this.part<HTMLButtonElement>('prev');
    const next = this.part<HTMLButtonElement>('next');
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= positions - 1;
  }
}

ParcheCarousel.define();
