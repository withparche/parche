/**
 * Overlay helpers shared by Dialog, Sheet, Popover, Tooltip and Menu — the
 * behaviours every floating surface repeats: return focus to the invoker,
 * close on Escape, close on outside click, and position next to an anchor
 * where CSS anchor positioning is missing. Native-first: `<dialog>` and
 * `[popover]` own the layering, light dismiss and focus for modals; these
 * helpers fill in what the platform does not do yet.
 */

/** Remember the invoker before opening; call the returned function on close. */
export function rememberFocus(): () => void {
  const previous = document.activeElement as HTMLElement | null;
  return () => {
    if (previous && previous.isConnected) previous.focus({ preventScroll: true });
  };
}

/** Run `close` on Escape while `signal` is alive. */
export function closeOnEscape(target: HTMLElement | Document, close: () => void, signal: AbortSignal): void {
  target.addEventListener(
    'keydown',
    (event) => {
      if ((event as KeyboardEvent).key === 'Escape') {
        event.preventDefault();
        close();
      }
    },
    { signal },
  );
}

/**
 * Run `close` on a pointer-down outside `surface` and `invoker`. Listens in the
 * capture phase so a click that removes the target still counts as outside.
 */
export function closeOnOutside(
  surface: HTMLElement,
  invoker: HTMLElement | null,
  close: () => void,
  signal: AbortSignal,
): void {
  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target as Node;
      if (surface.contains(target) || invoker?.contains(target)) return;
      close();
    },
    { capture: true, signal },
  );
}

/** True when the browser positions `[popover]` with CSS anchor positioning. */
export function supportsAnchorPositioning(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('anchor-name: --a') && CSS.supports('position-area: bottom');
}

/**
 * Positioning fallback for browsers without CSS anchor positioning. Loads
 * `@floating-ui/dom` lazily, so evergreen browsers never download it. Returns
 * a cleanup that stops auto-updating.
 */
export async function positionFallback(
  anchor: HTMLElement,
  floating: HTMLElement,
  placement: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'bottom-start' | 'bottom-end' = 'bottom',
  offsetPx = 8,
): Promise<() => void> {
  const { computePosition, autoUpdate, offset, flip, shift } = await import('@floating-ui/dom');
  const update = async () => {
    const { x, y } = await computePosition(anchor, floating, {
      placement,
      middleware: [offset(offsetPx), flip(), shift({ padding: 8 })],
    });
    Object.assign(floating.style, { position: 'fixed', left: `${x}px`, top: `${y}px`, margin: '0' });
  };
  return autoUpdate(anchor, floating, update);
}
