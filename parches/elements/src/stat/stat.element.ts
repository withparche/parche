import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-stat> — counts the figure up from zero when the element enters
 * the viewport, once. Parses "$1,200+", "99.9%", "5K", "<1s": the number in
 * the middle animates, prefix and suffix stay. Skipped entirely under
 * reduced motion. While counting, the visible text is `aria-hidden` and a
 * visually hidden twin announces the final figure, so assistive tech never
 * reads the intermediate numbers.
 */
export class ParcheStat extends ParcheElement {
  static tag = 'parche-stat' as const;

  #done = false;

  protected setup(signal: AbortSignal): void {
    if (this.reducedMotion) return;
    const target = this.querySelector<HTMLElement>('[data-counter]');
    if (!target) return;
    const raw = this.getAttribute('value') ?? target.textContent ?? '';
    const match = raw.match(/^([^0-9]*?)([\d,]+(?:\.\d+)?)\s*(.*)$/);
    if (!match) return;
    const num = parseFloat(match[2].replace(/,/g, ''));
    if (Number.isNaN(num)) return;
    const decimals = (match[2].split('.')[1] ?? '').length;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || this.#done) return;
        this.#done = true;
        observer.disconnect();
        this.#count(target, raw, match[1], num, decimals, match[3]);
      },
      { threshold: 0.3 },
    );
    observer.observe(this);
    signal.addEventListener('abort', () => observer.disconnect());
  }

  protected update(): void {}

  #count(target: HTMLElement, raw: string, prefix: string, num: number, decimals: number, suffix: string): void {
    const twin = document.createElement('span');
    twin.className = 'sr-only';
    twin.textContent = raw;
    target.after(twin);
    target.setAttribute('aria-hidden', 'true');

    const duration = 1500;
    const start = performance.now();
    const format = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      target.textContent = `${prefix}${format(eased * num)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
      else {
        target.textContent = raw;
        target.removeAttribute('aria-hidden');
        twin.remove();
        this.emitted('count');
      }
    };
    target.textContent = `${prefix}${format(0)}${suffix}`;
    requestAnimationFrame(step);
  }
}

ParcheStat.define();
