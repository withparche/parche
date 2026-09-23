/**
 * `@parche/elements/client` — the client-side base every interactive
 * element builds on. Importable on the server (nothing runs at module scope).
 */
export { ParcheElement } from './_shared/element.js';
export { tabbable, trapFocus, roving, focusQuietly } from './_shared/focus.js';
export type { RovingOptions } from './_shared/focus.js';
export {
  rememberFocus,
  closeOnEscape,
  closeOnOutside,
  supportsAnchorPositioning,
  positionFallback,
} from './_shared/overlay.js';
