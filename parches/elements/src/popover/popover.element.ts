import { ParcheElement, positionFallback, supportsAnchorPositioning } from '@parche/elements/client';

const hasPopover = () => typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;

let polyfill: Promise<void> | null = null;
/** Load the Popover API polyfill once, only where the platform lacks it. */
export function polyfillPopover(): Promise<void> {
  if (hasPopover()) return Promise.resolve();
  polyfill ??= import('@oddbird/popover-polyfill/fn').then((m) => {
    if (!m.isSupported()) m.apply();
  });
  return polyfill;
}

/**
 * <parche-popover> — upgrades a native `[popover]`:
 * - `parche:open` (cancelable) / `parche:opened`, `parche:close` /
 *   `parche:closed`; `data-state` on the root; `aria-expanded` on invokers;
 * - `show()` / `hide()` / `toggle()` for scripts;
 * - positions the surface next to its invoker with `@floating-ui/dom` (lazy)
 *   where CSS anchor positioning is missing; polyfills the API where absent.
 * State lives in the platform's popover state; nothing is cached.
 */
export class ParchePopover extends ParcheElement {
  static tag = 'parche-popover' as const;
  static observedAttributes = ['data-placement', 'data-align'];

  #stop: (() => void) | null = null;

  get surface(): HTMLElement | null {
    return this.querySelector(':scope > [popover]');
  }

  get open(): boolean {
    const surface = this.surface;
    if (!surface) return false;
    try {
      return surface.matches(':popover-open');
    } catch {
      return surface.classList.contains(':popover-open'); // the polyfill's marker
    }
  }

  /** The buttons that target this popover, anywhere in the document. */
  get invokers(): HTMLElement[] {
    const id = this.surface?.id;
    if (!id) return [];
    const q = `[popovertarget="${CSS.escape(id)}"], [commandfor="${CSS.escape(id)}"]`;
    return Array.from(document.querySelectorAll<HTMLElement>(q));
  }

  show(): void {
    this.surface?.showPopover();
  }

  hide(): void {
    this.surface?.hidePopover();
  }

  toggle(): void {
    this.surface?.togglePopover();
  }

  protected setup(signal: AbortSignal): void {
    const surface = this.surface;
    if (!surface) return;

    void polyfillPopover();

    surface.addEventListener(
      'beforetoggle',
      (event) => {
        const opening = (event as ToggleEvent).newState === 'open';
        if (!this.emit(opening ? 'open' : 'close')) event.preventDefault();
      },
      { signal },
    );

    surface.addEventListener(
      'toggle',
      (event) => {
        const open = (event as ToggleEvent).newState === 'open';
        this.update();
        if (open) void this.#anchor();
        else this.#release();
        this.emitted(open ? 'open' : 'close');
      },
      { signal },
    );

    signal.addEventListener('abort', () => this.#release());
  }

  protected update(): void {
    const open = this.open;
    this.setState(this, open ? 'open' : 'closed');
    for (const invoker of this.invokers) invoker.setAttribute('aria-expanded', String(open));
  }

  async #anchor(): Promise<void> {
    if (supportsAnchorPositioning()) return;
    const surface = this.surface;
    const anchor = this.invokers[0];
    if (!surface || !anchor) return;
    this.#release();
    const placement = this.dataset.placement ?? 'bottom';
    const align = this.dataset.align ?? 'center';
    const key = (align === 'center' ? placement : `${placement}-${align}`) as Parameters<typeof positionFallback>[2];
    this.#stop = await positionFallback(anchor, surface, key);
  }

  #release(): void {
    this.#stop?.();
    this.#stop = null;
  }
}

ParchePopover.define();
