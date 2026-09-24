import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-command> — reveals the copy button where the clipboard exists,
 * copies the command on click, swaps the button's text to the copied label
 * for 1.4 seconds and announces it, then emits `parche:copied`.
 */
export class ParcheCommand extends ParcheElement {
  static tag = 'parche-command' as const;

  #timer: ReturnType<typeof setTimeout> | null = null;

  protected setup(signal: AbortSignal): void {
    const copy = this.part<HTMLButtonElement>('copy');
    const text = this.part('text');
    if (!copy || !text || typeof navigator === 'undefined' || !navigator.clipboard) return;
    copy.hidden = false;
    const idle = copy.textContent ?? '';
    copy.addEventListener(
      'click',
      async () => {
        try {
          await navigator.clipboard.writeText(text.textContent ?? '');
        } catch {
          return;
        }
        const done = this.getAttribute('copied-label') ?? 'Copied';
        copy.textContent = done;
        const status = this.part('status');
        if (status) status.textContent = done;
        if (this.#timer) clearTimeout(this.#timer);
        this.#timer = setTimeout(() => {
          copy.textContent = idle;
          if (status) status.textContent = '';
        }, 1400);
        this.emitted('copy', { text: text.textContent ?? '' });
      },
      { signal },
    );
    signal.addEventListener('abort', () => {
      if (this.#timer) clearTimeout(this.#timer);
    });
  }

  protected update(): void {}
}

ParcheCommand.define();
