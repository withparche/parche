/**
 * ParcheCounter — animated counter Web Component.
 * Counts up from 0 to the target value when the element enters the viewport.
 * Parses values like "$1,200+", "99.9%", "5K", "<1s".
 *
 * Usage: wrap stat elements with <parche-counter>, mark values with data-value="10K+".
 */
class ParcheCounter extends HTMLElement {
  private observer: IntersectionObserver | null = null;
  private animated = false;

  connectedCallback() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.animated) {
          this.animated = true;
          this.animateAll();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private animateAll() {
    this.querySelectorAll<HTMLElement>('[data-value]').forEach((el) => {
      const raw = el.dataset.value || '';
      const match = raw.match(/^([^0-9]*?)([\d,]+(?:\.\d+)?)\s*([KkMmBb%+]?.*)$/);
      if (!match) return;

      const num = parseFloat(match[2].replace(/,/g, ''));
      if (isNaN(num)) return;

      const prefix = match[1];
      const suffix = match[3];
      const duration = 1500;
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = `${prefix}${Math.round(eased * num).toLocaleString()}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = raw; // restore exact original string
        }
      };

      el.textContent = `${prefix}0${suffix}`;
      requestAnimationFrame(step);
    });
  }
}

if (!customElements.get('parche-counter')) {
  customElements.define('parche-counter', ParcheCounter);
}
