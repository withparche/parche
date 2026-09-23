import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-carousel> — drives a scroll-snap track:
 * - previous / next buttons and the slide picker scroll the track to a
 *   slide; ArrowLeft / ArrowRight and Home / End on the track do the same;
 * - an IntersectionObserver tracks which slide is in view (by touch, wheel
 *   or buttons alike) and keeps `data-index`, the slides' `data-state`, the
 *   picker's `aria-current` and the buttons' `disabled` in step;
 * - `parche:changed` after the visible slide changes.
 * Scrolling itself is the browser's; smooth unless motion is reduced.
 */
export class ParcheCarousel extends ParcheElement {
  static tag = 'parche-carousel' as const;
  static observedAttributes = ['data-index'];

  get index(): number {
    return Number(this.dataset.index ?? 0);
  }

  get slides(): HTMLElement[] {
    return this.parts('slide');
  }

  get track(): HTMLElement | null {
    return this.part('track');
  }

  /** Scroll to a slide by index (clamped). */
  go(index: number): void {
    const slides = this.slides;
    const track = this.track;
    if (!track || slides.length === 0) return;
    const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: this.reducedMotion ? 'auto' : 'smooth' });
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
        const map: Record<string, number> = { ArrowRight: this.index + 1, ArrowLeft: this.index - 1, Home: 0, End: this.slides.length - 1 };
        if (event.key in map) {
          event.preventDefault();
          this.go(map[event.key]);
        }
      },
      { signal },
    );

    // The slide most in view is the current one. Threshold 0.6 so a slide
    // half scrolled away does not flip the state back and forth.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.index);
        if (index !== this.index) {
          this.dataset.index = String(index); // → update()
          this.emitted('change', { index });
        }
      },
      { root: track, threshold: 0.6 },
    );
    for (const slide of this.slides) observer.observe(slide);
    signal.addEventListener('abort', () => observer.disconnect());
  }

  protected update(): void {
    const index = this.index;
    const slides = this.slides;
    slides.forEach((slide, i) => this.setState(slide, i === index ? 'active' : 'inactive'));
    for (const dot of this.parts('dot')) {
      if (Number(dot.dataset.index) === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    }
    const prev = this.part<HTMLButtonElement>('prev');
    const next = this.part<HTMLButtonElement>('next');
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= slides.length - 1;
  }
}

ParcheCarousel.define();
