import { fontProviders } from 'astro/config';
import { parcheFontDefs } from './font-variables.js';

/**
 * Parche's default font set. Assign into your astro.config `fonts`:
 *
 *   import { parcheFonts } from '@parche/core/fonts';
 *   export default defineConfig({ fonts: parcheFonts, ... });
 *
 * BaseLayout renders the matching <Font> tags automatically.
 */
export const parcheFonts = parcheFontDefs.map((f) => ({
  provider: fontProviders.google(),
  name: f.name,
  cssVariable: f.cssVariable,
  weights: f.weights,
  fallbacks: f.fallbacks,
}));
