/**
 * The shape of a web font, as plain data.
 *
 * Core defines the shape and nothing else: it ships no fonts. A typeface is part
 * of a visual identity, so it belongs to whoever owns that identity — a theme
 * parche declares its fonts in its manifest, and a site can declare or override
 * them in `parche.config.ts`. Both are data, so a JSON config carries them and a
 * CMS can edit them.
 *
 * What core does provide is the fallback chain in `base.css`, so a project with
 * no theme renders in the system stack instead of downloading anything.
 */
export interface ParcheFontDef {
  /** The CSS variable this font fills, e.g. '--font-sans'. */
  cssVariable: string;
  /** Family name at the provider, e.g. 'Inter'. */
  name: string;
  weights: number[];
  fallbacks: string[];
  /** Preload the first file. Worth it for the family above the fold, only. */
  preload?: boolean;
}

/** Fallback stacks, exported so a theme can reuse them rather than retype them. */
export const sans = ['ui-sans-serif', 'system-ui', 'sans-serif'];
export const serif = ['ui-serif', 'Georgia', 'serif'];
export const mono = ['ui-monospace', 'SFMono-Regular', 'monospace'];
