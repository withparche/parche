import { ParcheElement, positionFallback, supportsAnchorPositioning } from '@parche/elements/client';
import { polyfillPopover } from '../popover/popover.element.ts';

/**
 * <parche-tooltip> — shows its `role="tooltip"` surface (a manual popover)
 * on hover after `delay` and on focus at once; hides on leave, blur and
 * Escape. Links the trigger (the first element before the surface) with
 * `aria-describedby`. Positions with CSS anchors, or with the lazy fallback
 * where the platform has none.
 */
export class ParcheTooltip extends ParcheElement {
  static tag = 'parche-tooltip' as const;

  #timer: ReturnType<typeof setTimeout> | null = null;
  #stop: (() => void) | null = null;

  get surface(): HTMLElement | null {
    return this.querySelector(':scope > [role="tooltip"]');
  }

  get trigger(): HTMLElement | null {
    const first = this.firstElementChild as HTMLElement | null;
    return first && first !== this.surface ? first : null;
  }

  get open(): boolean {
    return this.dataset.state === 'open';
  }

  show(): void {
    this.#cancel();
    const surface = this.surface;
    if (!surface || this.open) return;
    try {
      surface.showPopover();
    } catch {
      return;
    }
    this.dataset.state = 'open';
    void this.#anchor();
  }

  hide(): void {
    this.#cancel();
    const surface = this.surface;
    if (!surface || !this.open) return;
    try {
      surface.hidePopover();
    } catch {}
    this.dataset.state = 'closed';
    this.#stop?.();
    this.#stop = null;
  }

  protected setup(signal: AbortSignal): void {
    const surface = this.surface;
    const trigger = this.trigger;
    if (!surface || !trigger) return;

    void polyfillPopover();

    const delay = Number(this.getAttribute('delay') ?? 300);
    const later = () => {
      this.#cancel();
      this.#timer = setTimeout(() => this.show(), delay);
    };

    trigger.addEventListener('pointerenter', later, { signal });
    trigger.addEventListener('pointerleave', () => this.hide(), { signal });
    trigger.addEventListener('pointerdown', () => this.hide(), { signal });
    trigger.addEventListener('focusin', () => this.show(), { signal });
    trigger.addEventListener('focusout', () => this.hide(), { signal });
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' && this.open) this.hide();
      },
      { signal },
    );
    signal.addEventListener('abort', () => {
      this.#cancel();
      this.#stop?.();
    });
  }

  protected update(): void {
    const surface = this.surface;
    const trigger = this.trigger;
    if (!surface || !trigger) return;
    const ids = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (!ids.includes(surface.id)) trigger.setAttribute('aria-describedby', [...ids, surface.id].join(' '));
  }

  #cancel(): void {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
  }

  async #anchor(): Promise<void> {
    if (supportsAnchorPositioning()) return;
    const surface = this.surface;
    const trigger = this.trigger;
    if (!surface || !trigger) return;
    this.#stop?.();
    this.#stop = await positionFallback(trigger, surface, (this.dataset.placement ?? 'top') as 'top');
  }
}

ParcheTooltip.define();
