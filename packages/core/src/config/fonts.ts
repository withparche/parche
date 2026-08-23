import { fontProviders } from 'astro/config';
import type { ParcheFontDef } from './font-variables.js';

/**
 * Turn plain font data into the shape Astro's `fonts` option wants.
 *
 * The provider is a function call, which is exactly why the definitions
 * themselves stay as data: a config a CMS can edit cannot contain code. The
 * integration calls this with the resolved set and hands the result to Astro.
 *
 * Core ships no web fonts of its own — a typeface is part of a visual identity,
 * so it belongs to a theme parche or to the site's own config. What core does
 * provide is the fallback chain in `base.css`, which costs no download.
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
