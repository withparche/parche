/**
 * Focus helpers shared by interactive elements. Pure DOM functions; nothing
 * runs at module scope.
 */

const TABBABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), iframe, audio[controls], video[controls], ' +
  '[contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])';

/** Elements inside `root` a user can reach with Tab, in document order. */
export function tabbable(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => !el.hasAttribute('inert') && el.closest('[inert]') === null && isVisible(el),
  );
}

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

/**
 * Keep Tab / Shift+Tab inside `root` while `signal` is alive. Native `<dialog>`
 * modals do this themselves; use it for non-modal overlays that still want a
 * contained tab order (menus, sheets that are not modal).
 */
export function trapFocus(root: HTMLElement, signal: AbortSignal): void {
  root.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Tab') return;
      const items = tabbable(root);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !root.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    { signal },
  );
}

export interface RovingOptions {
  /** 'horizontal' → ArrowLeft/Right, 'vertical' → ArrowUp/Down, 'both' → all four. */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Wrap from last to first and back. Default true. */
  loop?: boolean;
  /** Called with the item that received focus. */
  onMove?: (item: HTMLElement, index: number) => void;
}

/**
 * Roving tabindex over `items` (WAI-ARIA APG): exactly one item is tabbable,
 * arrows move focus, Home/End jump. Returns a `setActive(index)` to move the
 * tab stop programmatically (e.g. when the selected tab changes).
 */
export function roving(
  items: () => HTMLElement[],
  container: HTMLElement,
  signal: AbortSignal,
  options: RovingOptions = {},
): (index: number) => void {
  const { orientation = 'horizontal', loop = true, onMove } = options;
  const prev = orientation === 'vertical' ? ['ArrowUp'] : orientation === 'horizontal' ? ['ArrowLeft'] : ['ArrowUp', 'ArrowLeft'];
  const next = orientation === 'vertical' ? ['ArrowDown'] : orientation === 'horizontal' ? ['ArrowRight'] : ['ArrowDown', 'ArrowRight'];

  const setActive = (index: number, focus = false) => {
    const list = items();
    list.forEach((el, i) => el.setAttribute('tabindex', i === index ? '0' : '-1'));
    if (focus && list[index]) {
      list[index].focus();
      onMove?.(list[index], index);
    }
  };

  container.addEventListener(
    'keydown',
    (event) => {
      const list = items();
      const current = list.indexOf(event.target as HTMLElement);
      if (current === -1) return;
      let target = -1;
      if (prev.includes(event.key)) target = current - 1;
      else if (next.includes(event.key)) target = current + 1;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = list.length - 1;
      if (target === -1) return;
      if (target < 0) target = loop ? list.length - 1 : 0;
      if (target >= list.length) target = loop ? 0 : list.length - 1;
      event.preventDefault();
      setActive(target, true);
    },
    { signal },
  );

  return (index: number) => setActive(index, false);
}

/** Focus `el` and, when it is inside a scroll container, avoid the scroll jump. */
export function focusQuietly(el: HTMLElement | null): void {
  el?.focus({ preventScroll: true });
}
