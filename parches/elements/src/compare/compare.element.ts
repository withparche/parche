import { ParcheElement } from '@parche/elements/client';

/** <parche-compare> — the range input sets --pos, which clips the before side. */
export class ParcheCompare extends ParcheElement {
  static tag = 'parche-compare' as const;

  protected setup(signal: AbortSignal): void {
    const range = this.part<HTMLInputElement>('range');
    if (!range) return;
    const sync = () => this.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', sync, { signal });
    sync();
  }

  protected update(): void {}
}

ParcheCompare.define();
