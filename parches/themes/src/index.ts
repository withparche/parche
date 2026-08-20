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

function theme(name: string, label: string): ParcheManifest {
  return {
    name: `theme-${name}`,
    styles: [css(`${name}.css`)],
    themes: [{ label, value: name }],
  };
}

export const corporate = (): ParcheManifest => theme('corporate', 'Corporate');
export const minimal = (): ParcheManifest => theme('minimal', 'Minimal');
export const playful = (): ParcheManifest => theme('playful', 'Playful');
export const startup = (): ParcheManifest => theme('startup', 'Startup');
export const starter = (): ParcheManifest => theme('starter', 'Starter');
