import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-countdown> — fills the unit boxes with the time left until `to`,
 * once a second (or a minute when seconds are not shown), and switches to
 * the `done` text when the moment has passed.
 */
export class ParcheCountdown extends ParcheElement {
  static tag = 'parche-countdown' as const;

  #timer: ReturnType<typeof setInterval> | null = null;

  protected setup(signal: AbortSignal): void {
    const target = Date.parse(this.getAttribute('to') ?? '');
    const units = this.part('units');
    if (!units || Number.isNaN(target)) return;
    units.hidden = false;
    const tick = () => this.#render(target);
    tick();
    const perSecond = Boolean(this.querySelector('[data-unit="seconds"]'));
    this.#timer = setInterval(tick, perSecond ? 1000 : 15000);
    signal.addEventListener('abort', () => {
      if (this.#timer) clearInterval(this.#timer);
    });
  }

  protected update(): void {}

  #render(target: number): void {
    let left = Math.max(0, target - Date.now());
    if (left === 0) {
      this.setState(this, 'done');
      const units = this.part('units');
      if (units) units.hidden = true;
      const date = this.part('date');
      if (date) date.textContent = this.getAttribute('done') ?? date.textContent;
      if (this.#timer) clearInterval(this.#timer);
      return;
    }
    const parts: Record<string, number> = {};
    for (const [unit, ms] of [['days', 86400000], ['hours', 3600000], ['minutes', 60000], ['seconds', 1000]] as const) {
      parts[unit] = Math.floor(left / ms);
      left -= parts[unit] * ms;
    }
    for (const box of this.parts('unit')) {
      const value = box.querySelector('[data-part="value"]');
      const n = parts[box.dataset.unit ?? ''] ?? 0;
      if (value) value.textContent = box.dataset.unit === 'days' ? String(n) : String(n).padStart(2, '0');
    }
  }
}

ParcheCountdown.define();
