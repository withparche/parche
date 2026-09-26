/**
 * @parche/astro/dev — what development tools (the builder) need from core
 * that the virtual modules do not carry: the project's paths, and the
 * renderer's own helpers, so a tool resolves references and JSON widgets
 * exactly as a page does. An unstable, tooling-only contract: it moves with
 * core and is not for sites. Import it from code Vite runs (a route), not
 * from an integration: the helpers read the content store.
 */
export { getDevInfo, setDevInfo } from './info.js';
export type { DevInfo } from './info.js';
export { resolveSiteConfigPath } from '../integration/load-site-config.js';
export { resolveRefs } from '../utils/refs.js';
export { expandPresets } from '../utils/presets.js';
export { loadJsonWidgets } from '../utils/json-widgets.js';
export { defineJsonWidget } from '../content/json-widgets.js';
