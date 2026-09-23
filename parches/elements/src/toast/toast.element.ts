import { ParcheElement } from '@parche/elements/client';

export interface ToastDetail {
  title: string;
  description?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  /** Milliseconds; 0 keeps the toast until dismissed. Defaults to the region's `duration`. */
  duration?: number;
}

/**
 * <parche-toaster> — the live region for toasts:
 * - `show(detail)` clones the template, fills it and appends it to the
 *   `role="status"` list, so assistive tech announces it; returns a function
 *   that dismisses it;
 * - listens to `parche:toast` on `document`, so any script can notify without
 *   a reference to the element;
 * - auto-dismiss after `duration`, paused while the pointer or focus is on
 *   the toast; the dismiss button works for server-rendered toasts too;
 * - at most five at a time: the oldest goes first;
 * - `parche:dismissed` after a toast leaves.
 */
export class ParcheToaster extends ParcheElement {
  static tag = 'parche-toaster' as const;

  #timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

  get list(): HTMLElement | null {
    return this.part('list');
  }

  show(detail: ToastDetail): () => void {
    const template = this.part<HTMLTemplateElement>('template');
    const list = this.list;
    if (!template || !list) return () => {};
    const toast = (template.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    const tone = detail.tone ?? 'neutral';
    toast.dataset.tone = tone;
    for (const icon of toast.querySelectorAll<HTMLElement>('[data-part="icon"]')) {
      if (icon.dataset.tone !== tone) icon.remove();
    }
    toast.querySelector('[data-part="title"]')!.textContent = detail.title;
    const description = toast.querySelector<HTMLElement>('[data-part="description"]')!;
    if (detail.description) description.textContent = detail.description;
    else description.remove();

    const open = this.parts('toast');
    if (open.length >= 5) this.dismiss(open[0]);
    list.append(toast);
    this.#schedule(toast, detail.duration ?? Number(this.getAttribute('duration') ?? 5000));
    return () => this.dismiss(toast);
  }

  dismiss(toast: HTMLElement): void {
    if (!toast.isConnected || toast.dataset.state === 'closing') return;
    const timer = this.#timers.get(toast);
    if (timer) clearTimeout(timer);
    this.#timers.delete(toast);
    const remove = () => {
      toast.remove();
      this.emitted('dismiss');
    };
    this.setState(toast, 'closing');
    if (this.reducedMotion || toast.getAnimations().length === 0) remove();
    else toast.addEventListener('transitionend', remove, { once: true });
  }

  protected setup(signal: AbortSignal): void {
    document.addEventListener(
      'parche:toast',
      (event) => {
        const detail = (event as CustomEvent<ToastDetail>).detail;
        if (detail?.title) this.show(detail);
      },
      { signal },
    );

    this.addEventListener(
      'click',
      (event) => {
        const button = (event.target as Element).closest('[data-part="dismiss"]');
        const toast = button?.closest<HTMLElement>('[data-part="toast"]');
        if (toast) this.dismiss(toast);
      },
      { signal },
    );

    // Hovering or focusing a toast pauses its clock; leaving restarts it.
    const pause = (event: Event) => {
      const toast = (event.target as Element).closest<HTMLElement>('[data-part="toast"]');
      const timer = toast && this.#timers.get(toast);
      if (timer) clearTimeout(timer);
    };
    const resume = (event: Event) => {
      const toast = (event.target as Element).closest<HTMLElement>('[data-part="toast"]');
      if (toast && this.#timers.has(toast)) this.#schedule(toast, Number(this.getAttribute('duration') ?? 5000));
    };
    this.addEventListener('pointerenter', pause, { capture: true, signal });
    this.addEventListener('focusin', pause, { signal });
    this.addEventListener('pointerleave', resume, { capture: true, signal });
    this.addEventListener('focusout', resume, { signal });

    for (const toast of this.parts('toast')) this.#schedule(toast, Number(this.getAttribute('duration') ?? 5000));
  }

  protected update(): void {}

  #schedule(toast: HTMLElement, duration: number): void {
    if (duration <= 0) return;
    const existing = this.#timers.get(toast);
    if (existing) clearTimeout(existing);
    this.#timers.set(
      toast,
      setTimeout(() => this.dismiss(toast), duration),
    );
  }
}

ParcheToaster.define();
