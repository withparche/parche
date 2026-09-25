import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-filter> — shows only the items carrying the chosen value. Items are
 * the elements with `data-filter` inside the `items` part; the option with an
 * empty value shows everything. Counts missing from the markup are filled in
 * from the items. Emits `parche:filter` (cancelable) and `parche:filterd`.
 */
export class ParcheFilter extends ParcheElement {
  static tag = 'parche-filter' as const;

  protected setup(signal: AbortSignal): void {
    const items = this.#items();
    // The bar only makes sense with script: it stays hidden until now.
    const bar = this.part('bar');
    if (bar) bar.hidden = false;
    for (const option of this.parts<HTMLButtonElement>('option')) {
      const value = option.dataset.value ?? '';
      if (!option.dataset.count) {
        const n = value ? items.filter((el) => this.#tags(el).includes(value)).length : items.length;
        const count = option.querySelector('[data-part="count"]');
        if (count) count.textContent = ` · ${n}`;
      }
      option.addEventListener('click', () => this.#apply(value), { signal });
    }
    this.part('clear')?.addEventListener('click', () => this.#apply(''), { signal });
  }

  protected update(): void {}

  #items(): HTMLElement[] {
    return Array.from(this.part('items')?.querySelectorAll<HTMLElement>('[data-filter]') ?? []);
  }

  #tags(el: HTMLElement): string[] {
    return (el.dataset.filter ?? '').split(/\s+/).filter(Boolean);
  }

  #apply(value: string): void {
    if (!this.emit('filter', { value })) return;
    const items = this.#items();
    let shown = 0;
    for (const el of items) {
      const on = !value || this.#tags(el).includes(value);
      el.hidden = !on;
      if (on) shown++;
    }
    for (const option of this.parts<HTMLButtonElement>('option')) {
      const on = (option.dataset.value ?? '') === value;
      option.setAttribute('aria-pressed', String(on));
      this.setState(option, on ? 'on' : 'off');
    }
    const empty = this.part('empty');
    if (empty) empty.hidden = shown > 0;
    const status = this.part('status');
    if (status) status.textContent = (this.getAttribute('status-template') ?? 'Showing {n} of {total}').replace('{n}', String(shown)).replace('{total}', String(items.length));
    this.emitted('filter', { value, shown });
  }
}

ParcheFilter.define();
