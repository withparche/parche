import { ParcheElement, readConsent, writeConsent } from '@parche/elements/client';

/**
 * <parche-consent> — opens when the visitor has not chosen yet, records the
 * choice (all, only necessary, or per category), and reopens from any
 * `[data-consent-open]` (or link to `#cookie-preferences`) on the page, with
 * the recorded choice checked.
 * Emits `parche:consent` on the document (see _shared/consent.ts).
 */
export class ParcheConsent extends ParcheElement {
  static tag = 'parche-consent' as const;

  protected setup(signal: AbortSignal): void {
    const keys = (this.getAttribute('categories') ?? '').split(/\s+/).filter(Boolean);
    const all = (on: boolean) => Object.fromEntries(keys.map((k) => [k, on]));
    const choose = (choices: Record<string, boolean>) => {
      writeConsent(choices);
      this.#close();
    };
    this.part('accept')?.addEventListener('click', () => choose(all(true)), { signal });
    this.part('reject')?.addEventListener('click', () => choose(all(false)), { signal });
    this.part('customize')?.addEventListener('click', () => this.#showChoices(), { signal });
    this.part('save')?.addEventListener('click', () => {
      const picked = Object.fromEntries(this.parts<HTMLInputElement>('option').map((o) => [o.value, o.checked]));
      choose({ ...all(false), ...picked });
    }, { signal });
    document.addEventListener('click', (e) => {
      const opener = (e.target as Element | null)?.closest?.('[data-consent-open], a[href$="#cookie-preferences"]');
      if (!opener) return;
      e.preventDefault();
      this.#open(true);
    }, { signal });
    this.addEventListener('keydown', (e) => { if (e.key === 'Escape' && readConsent()) this.#close(); }, { signal });
    if (!readConsent()) this.#open(false);
  }

  protected update(): void {}

  #open(reopened: boolean): void {
    const panel = this.part('panel');
    if (!panel) return;
    panel.hidden = false;
    this.setState(this, 'open');
    const recorded = readConsent();
    for (const o of this.parts<HTMLInputElement>('option')) o.checked = Boolean(recorded?.[o.value]);
    if (reopened) {
      this.#showChoices();
      this.part<HTMLButtonElement>('save')?.focus();
    }
  }

  #showChoices(): void {
    const choices = this.part('choices');
    if (choices) choices.hidden = false;
    const save = this.part('save');
    if (save) save.hidden = false;
    const customize = this.part('customize');
    if (customize) customize.hidden = true;
  }

  #close(): void {
    const panel = this.part('panel');
    if (panel) panel.hidden = true;
    this.setState(this, 'closed');
  }
}

ParcheConsent.define();
