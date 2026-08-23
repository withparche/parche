import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ParcheManifest } from '@parche/core';

/**
 * Built-in Parche themes. Each theme is a parche that contributes its override
 * CSS (scoped to `:root[data-theme="<value>"]`) plus its switcher entry — so a
 * site bundles only the themes it imports, exactly like any other parche.
 *
 *   parche({ parches: [createPrimitives(), createUI(), corporate(), minimal()] })
 */
const dir = path.dirname(fileURLToPath(import.meta.url));
const css = (file: string) => path.resolve(dir, file);

/** Web fonts a theme needs. Data, so it survives the trip into astro.config. */
type ThemeFont = NonNullable<ParcheManifest['fonts']>[number];

const inter = (cssVariable: string): ThemeFont => ({
  cssVariable,
  name: 'Inter',
  weights: [400, 500, 600, 700],
  fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
  preload: true,
});

function theme(name: string, label: string, fonts?: ThemeFont[]): ParcheManifest {
  return {
    name: `theme-${name}`,
    styles: [css(`${name}.css`)],
    themes: [{ label, value: name }],
    // A theme owns its typeface: importing the theme is what makes the site
    // download the family, and a site that never imports it never pays for it.
    ...(fonts ? { fonts } : {}),
  };
}

export const astrowind = (): ParcheManifest => theme('astrowind', 'AstroWind', [inter('--font-sans')]);
export const corporate = (): ParcheManifest => theme('corporate', 'Corporate', [inter('--font-sans')]);
export const minimal = (): ParcheManifest => theme('minimal', 'Minimal');
export const playful = (): ParcheManifest => theme('playful', 'Playful');
export const startup = (): ParcheManifest => theme('startup', 'Startup');
export const starter = (): ParcheManifest => theme('starter', 'Starter');
