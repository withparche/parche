import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-share> — reveals and drives what needs script:
 * - the copy-link button: writes `url` to the clipboard and announces
 *   `copied-text` in the status region (cleared after a moment);
 * - the native share button, only where `navigator.share` exists;
 * - `parche:shared` after either, with the network.
 * The network links are ordinary anchors and are left alone.
 */
export class ParcheShare extends ParcheElement {
  static tag = 'parche-share' as const;

  #timer: ReturnType<typeof setTimeout> | null = null;

  protected setup(signal: AbortSignal): void {
    const copy = this.querySelector<HTMLButtonElement>('[data-part="item"][data-network="copy"]');
    if (copy && typeof navigator !== 'undefined' && navigator.clipboard) {
      copy.hidden = false;
      copy.addEventListener(
        'click',
        async () => {
          try {
            await navigator.clipboard.writeText(this.getAttribute('url') ?? location.href);
            this.#announce(this.getAttribute('copied-text') ?? 'Link copied');
            this.emitted('share', { network: 'copy' });
          } catch {}
        },
        { signal },
      );
    }

    const native = this.part<HTMLButtonElement>('native');
    if (native && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      native.hidden = false;
      native.addEventListener(
        'click',
        async () => {
          try {
            await navigator.share({ url: this.getAttribute('url') ?? location.href, title: this.getAttribute('title') ?? document.title });
            this.emitted('share', { network: 'native' });
          } catch {
            // Cancelled by the user: nothing to report.
          }
        },
        { signal },
      );
    }

    signal.addEventListener('abort', () => {
      if (this.#timer) clearTimeout(this.#timer);
    });
  }

  protected update(): void {}

  #announce(text: string): void {
    const status = this.part('status');
    if (!status) return;
    status.textContent = text;
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = setTimeout(() => (status.textContent = ''), 2000);
  }
}

ParcheShare.define();
