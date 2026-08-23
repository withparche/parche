import { fontProviders } from 'astro/config';
import { parcheFontDefs } from './font-variables.js';
import type { ParcheFontDef } from './font-variables.js';

/**
 * Parche's default font set. Assign into your astro.config `fonts`:
 *
 *   import { parcheFonts } from '@parche/core/fonts';
 *   export default defineConfig({ fonts: parcheFonts, ... });
 *
 * BaseLayout renders the matching <Font> tags automatically.
 */
export const parcheFonts = toAstroFonts(parcheFontDefs);

/**
 * Turn plain font data into the shape Astro's `fonts` option wants.
 *
 * The provider is a function call, which is exactly why the definitions
 * themselves stay as data: a config a CMS can edit cannot contain code.
 */
export function toAstroFonts(defs: ParcheFontDef[]) {
  return defs.map((f) => ({
    provider: fontProviders.google(),
    name: f.name,
    cssVariable: f.cssVariable,
    weights: f.weights,
    fallbacks: f.fallbacks,
  }));
}
