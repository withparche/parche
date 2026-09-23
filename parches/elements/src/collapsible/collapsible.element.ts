import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-collapsible> — upgrades a native <details>:
 * - mirrors the open state to `data-state` on the root (the styling hook);
 * - emits `parche:toggle` before a user toggle (cancelable) and
 *   `parche:toggled` after;
 * - `force-open="(media query)"`: while it matches, the details stays open and
 *   the summary is inert — an accordion on small screens, open panels on wide.
 * State lives in the <details>; nothing is cached.
 */
export class ParcheCollapsible extends ParcheElement {
  static tag = 'parche-collapsible' as const;
  static observedAttributes = ['force-open'];

  #media: MediaQueryList | null = null;
  #onMedia = () => this.update();

  get details(): HTMLDetailsElement | null {
    return this.querySelector(':scope > details');
  }

  get open(): boolean {
    return this.details?.open ?? false;
  }

  set open(value: boolean) {
    const d = this.details;
    if (d && d.open !== value) d.open = value;
  }

  protected setup(signal: AbortSignal): void {
    const details = this.details;
    if (!details) return;

    // A click on the summary is the user's toggle: announce it, allow veto.
    details.addEventListener(
      'click',
      (event) => {
        const summary = (event.target as Element).closest('summary');
        if (!summary || summary.parentElement !== details) return;
        if (this.#forced()) {
          event.preventDefault();
          return;
        }
        const next = !details.open;
        if (!this.emit('toggle', { open: next })) event.preventDefault();
      },
      { signal },
    );

    // The native toggle event fires after the state changed (also when a
    // sibling with the same `name` closed us). Sync the hook, announce.
    details.addEventListener(
      'toggle',
      () => {
        this.update();
        this.emitted('toggle', { open: details.open });
      },
      { signal },
    );

    signal.addEventListener('abort', () => this.#media?.removeEventListener('change', this.#onMedia));
  }

  protected update(): void {
    const details = this.details;
    if (!details) return;

    const query = this.getAttribute('force-open');
    if (query !== (this.#media?.media ?? null)) {
      this.#media?.removeEventListener('change', this.#onMedia);
      this.#media = query && typeof matchMedia === 'function' ? matchMedia(query) : null;
      this.#media?.addEventListener('change', this.#onMedia);
    }

    if (this.#forced() && !details.open) details.open = true;
    this.setState(this, details.open ? 'open' : 'closed');
    const summary = this.part('trigger');
    if (summary) summary.setAttribute('aria-disabled', this.#forced() ? 'true' : 'false');
  }

  #forced(): boolean {
    return this.#media?.matches ?? false;
  }
}

ParcheCollapsible.define();
