import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-gallery> — turns the thumbnail links into a lightbox. A click (or
 * Enter) on a thumbnail opens the native modal dialog on that item: the stage
 * shows the full image (or a copy of the placeholder), the bar the caption
 * and "n of total". ←/→ step through and wrap around; Escape, the close
 * button and a click outside close it; the dialog returns focus to the
 * thumbnail. Emits `parche:open` (cancelable) and `parche:opend`.
 */
export class ParcheGallery extends ParcheElement {
  static tag = 'parche-gallery' as const;

  #index = 0;

  protected setup(signal: AbortSignal): void {
    const dialog = this.part<HTMLDialogElement>('lightbox');
    const triggers = this.parts<HTMLAnchorElement>('trigger');
    if (!dialog || triggers.length === 0 || typeof dialog.showModal !== 'function') return;

    triggers.forEach((trigger, i) => {
      trigger.addEventListener(
        'click',
        (event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; // a new tab stays a new tab
          event.preventDefault();
          if (!this.emit('open', { index: i })) return;
          this.#show(i);
          dialog.showModal();
          this.part('close')?.focus();
          this.emitted('open', { index: i });
        },
        { signal },
      );
    });

    this.part('previous')?.addEventListener('click', () => this.#show(this.#index - 1), { signal });
    this.part('next')?.addEventListener('click', () => this.#show(this.#index + 1), { signal });
    this.part('close')?.addEventListener('click', () => dialog.close(), { signal });
    dialog.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          this.#show(this.#index + 1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          this.#show(this.#index - 1);
        }
      },
      { signal },
    );
    // A click on the backdrop lands on the dialog itself; where `closedby`
    // is not supported, close it by hand.
    dialog.addEventListener(
      'click',
      (event) => {
        if (event.target === dialog && !('closedBy' in HTMLDialogElement.prototype)) dialog.close();
      },
      { signal },
    );
  }

  protected update(): void {}

  #show(index: number): void {
    const triggers = this.parts<HTMLAnchorElement>('trigger');
    const total = triggers.length;
    this.#index = ((index % total) + total) % total;
    const trigger = triggers[this.#index];
    const media = trigger.querySelector<HTMLElement>('[data-part="media"]');
    const stage = this.part('stage');
    if (stage && media) {
      const copy = media.cloneNode(true) as HTMLElement;
      if (copy instanceof HTMLImageElement) {
        copy.src = media.getAttribute('data-full') || copy.src;
        copy.loading = 'eager';
        copy.removeAttribute('class');
      }
      // The copy is content of the stage, not parts of this element.
      for (const el of [copy, ...copy.querySelectorAll('[data-part]')]) el.removeAttribute('data-part');
      stage.replaceChildren(copy);
    }
    const caption = this.part('title');
    if (caption) caption.textContent = trigger.closest('figure')?.querySelector('figcaption')?.textContent ?? '';
    const count = this.part('count');
    if (count) count.textContent = (this.getAttribute('count-label') ?? '{n} of {total}').replace('{n}', String(this.#index + 1)).replace('{total}', String(total));
  }
}

ParcheGallery.define();
