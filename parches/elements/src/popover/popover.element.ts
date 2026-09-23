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
 * - positions the surface next to its invoker (or the `anchor` element) with
 *   `@floating-ui/dom` (lazy) where CSS anchor positioning is missing;
 *   polyfills the API where absent;
 * - `open-on-hover`: opens on pointer hover and closes shortly after the
 *   pointer leaves both invoker and surface, on hover-capable devices only.
 * State lives in the platform's popover state; nothing is cached.
 */
export class ParchePopover extends ParcheElement {
  static tag = 'parche-popover' as const;
  static observedAttributes = ['data-placement', 'data-align'];

  #stop: (() => void) | null = null;
  #hoverTimer: ReturnType<typeof setTimeout> | null = null;
  #openedByHover = false;

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
    const surface = this.surface;
    if (!surface) return;
    // `source` makes the invoker the implicit anchor (and the light-dismiss
    // ancestor) for opens from script or hover, as a click would; older
    // engines ignore the option or throw on it, hence the fallback.
    try {
      surface.showPopover({ source: this.invokers[0] ?? undefined } as Parameters<HTMLElement['showPopover']>[0]);
    } catch {
      surface.showPopover();
    }
  }

  hide(): void {
    this.surface?.hidePopover();
  }

  toggle(): void {
    this.surface?.togglePopover();
  }

  /** The element the surface hangs from: `anchor` by id, else the first invoker. */
  get anchorElement(): HTMLElement | null {
    const id = this.getAttribute('anchor');
    return (id && document.getElementById(id)) || this.invokers[0] || null;
  }

  protected setup(signal: AbortSignal): void {
    const surface = this.surface;
    if (!surface) return;

    void polyfillPopover();

    // An explicit anchor on the first invoker, so the placement grammar
    // works however the popover was opened (click, hover, script); `anchor`
    // names another element instead.
    const invoker = this.invokers[0];
    if (invoker && !this.hasAttribute('anchor') && surface.id) {
      const name = `--parche-anchor-${surface.id}`;
      invoker.style.setProperty('anchor-name', name);
      surface.style.setProperty('position-anchor', name);
    }

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

    if (this.hasAttribute('open-on-hover') && typeof matchMedia === 'function' && matchMedia('(hover: hover)').matches) {
      const cancel = () => {
        if (this.#hoverTimer) clearTimeout(this.#hoverTimer);
        this.#hoverTimer = null;
      };
      for (const el of [...this.invokers, surface]) {
        el.addEventListener(
          'pointerenter',
          () => {
            cancel();
            if (!this.open) {
              this.#openedByHover = true;
              this.show();
            }
          },
          { signal },
        );
        el.addEventListener(
          'pointerleave',
          () => {
            cancel();
            this.#hoverTimer = setTimeout(() => this.open && this.hide(), 150);
          },
          { signal },
        );
      }
      // A click on the trigger while hover already opened it would toggle it
      // shut: the first click keeps it open, the next one closes it.
      for (const invoker of this.invokers) {
        invoker.addEventListener(
          'click',
          (event) => {
            if (this.open && this.#openedByHover) {
              event.preventDefault();
              this.#openedByHover = false;
              this.keptOpen();
            }
          },
          { signal },
        );
      }
      surface.addEventListener(
        'toggle',
        (event) => {
          if ((event as ToggleEvent).newState === 'closed') this.#openedByHover = false;
        },
        { signal },
      );
      signal.addEventListener('abort', cancel);
    }

    signal.addEventListener('abort', () => this.#release());
  }

  /** A click on the trigger kept a hover-opened surface open; subclasses may move focus in. */
  protected keptOpen(): void {}

  protected update(): void {
    const open = this.open;
    this.setState(this, open ? 'open' : 'closed');
    for (const invoker of this.invokers) invoker.setAttribute('aria-expanded', String(open));
  }

  async #anchor(): Promise<void> {
    if (supportsAnchorPositioning()) return;
    const surface = this.surface;
    const anchor = this.anchorElement;
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
