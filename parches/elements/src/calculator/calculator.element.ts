import { ParcheElement } from '@parche/elements/client';
import { evaluate, format } from './formula';

/**
 * <parche-calculator> — recomputes the results on every change, steps the
 * numbers with − and +, reads and writes the inputs to the URL when shared,
 * and copies the link. Emits `parche:calculated` with the values and results.
 */
export class ParcheCalculator extends ParcheElement {
  static tag = 'parche-calculator' as const;

  protected setup(signal: AbortSignal): void {
    const fields = Array.from(this.querySelectorAll<HTMLInputElement>('input[name]'));
    const shared = this.hasAttribute('data-share');
    if (shared) {
      const params = new URLSearchParams(location.search);
      for (const f of fields) {
        const v = params.get(f.name);
        if (v !== null && v !== '' && !Number.isNaN(Number(v))) f.value = v;
      }
    }
    for (const row of this.parts('input')) {
      const field = row.querySelector<HTMLInputElement>('input[name]');
      if (!field) continue;
      const step = (dir: number) => {
        dir > 0 ? field.stepUp() : field.stepDown();
        this.#compute(shared);
      };
      row.querySelector('[data-part="decrement"]')?.addEventListener('click', () => step(-1), { signal });
      row.querySelector('[data-part="increment"]')?.addEventListener('click', () => step(1), { signal });
    }
    this.addEventListener('input', () => this.#compute(shared), { signal });
    const copy = this.part<HTMLButtonElement>('share');
    const row = this.querySelector<HTMLElement>('[data-share-row]');
    if (copy && row && typeof navigator !== 'undefined' && navigator.clipboard) {
      row.hidden = false;
      const idle = copy.textContent ?? '';
      copy.addEventListener(
        'click',
        async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            copy.textContent = copy.dataset.copied ?? idle;
            setTimeout(() => (copy.textContent = idle), 1400);
          } catch {
            /* the link stays in the address bar */
          }
        },
        { signal },
      );
    }
    this.#compute(shared);
  }

  protected update(): void {}

  #compute(shared: boolean): void {
    const fields = Array.from(this.querySelectorAll<HTMLInputElement>('input[name]'));
    const vars: Record<string, number> = {};
    for (const f of fields) {
      vars[f.name] = Number(f.value) || 0;
      const echo = f.parentElement?.querySelector('[data-part="echo"]');
      if (echo) echo.textContent = echo.textContent?.replace(/-?[\d.,]+/, f.value) ?? f.value;
    }
    const locale = this.getAttribute('locale') ?? 'en-GB';
    const out: Record<string, number> = {};
    for (const r of this.parts('result')) {
      const value = r.querySelector('[data-part="value"]');
      try {
        const n = evaluate(r.dataset.formula ?? '0', vars);
        out[r.dataset.formula ?? ''] = n;
        if (value) value.textContent = `${r.dataset.prefix ?? ''}${format(n, Number(r.dataset.decimals ?? 0), locale)}${r.dataset.suffix ?? ''}`;
      } catch {
        if (value) value.textContent = '–';
      }
    }
    if (shared) {
      const url = new URL(location.href);
      for (const [k, v] of Object.entries(vars)) url.searchParams.set(k, String(v));
      history.replaceState(history.state, '', url);
      const link = this.part('link');
      if (link) link.textContent = `${url.pathname}${url.search}`;
    }
    this.emitted('calculate', { values: vars, results: out });
  }
}

ParcheCalculator.define();
