import type { ResolvedRegistry } from '../types.js';
import { TOKEN_OVERRIDES_ID } from './ids.js';

/**
 * The small generated modules that carry configuration to the render:
 * `parche:config/*`, each a few exported constants from the resolved
 * registry, and `parche:app/<name>`, an app's own options.
 */

export function generateI18nConfigModule(registry: ResolvedRegistry): string {
  return `export const locales = ${JSON.stringify(registry.i18n.locales)};
export const defaultLocale = ${JSON.stringify(registry.i18n.defaultLocale)};
`;
}

export function generateThemesConfigModule(registry: ResolvedRegistry): string {
  return `export const themes = ${JSON.stringify(registry.themes)};
export const showPanel = ${JSON.stringify(registry.showPanel)};
export const defaultTheme = ${JSON.stringify(registry.defaultTheme ?? null)};
`;
}

/**
 * Layout hints the render path needs — the set of widget keys that render
 * full-bleed (no default SectionWrapper). Kept as a plain static array so
 * DynamicRenderer imports zero widget schemas/components for this decision.
 * Which widgets are full-bleed is declared by the parches, not hardcoded in core.
 */
export function generateLayoutConfigModule(registry: ResolvedRegistry): string {
  return (
    `export const wrapper = ${JSON.stringify(registry.wrapper)};\n` +
    `export const unwrapped = ${JSON.stringify(registry.unwrapped)};\n` +
    `export const tones = ${JSON.stringify(registry.tones)};\n`
  );
}

/**
 * The styles entry: side-effect CSS imports for every file the imported
 * parches contribute (plus any user entry). Empty when none — the base look
 * ships via BaseLayout's own base.css regardless.
 */
export function generateStylesModule(registry: ResolvedRegistry): string {
  // The site's own token values come last, so they win where they are scoped.
  return [...registry.styleEntries.map((p) => `import ${JSON.stringify(p)};`), `import ${JSON.stringify(TOKEN_OVERRIDES_ID)};`].join('\n') + '\n';
}

export function generateFontsConfigModule(registry: ResolvedRegistry): string {
  return `export const fonts = ${JSON.stringify(registry.fonts)};\n`;
}

/** What every page's head carries: the parches' links, the site's search, whether pages get view transitions. */
export function generateHeadConfigModule(registry: ResolvedRegistry): string {
  return (
    `export const headLinks = ${JSON.stringify(registry.headLinks ?? [])};\n` +
    `export const siteSearch = ${JSON.stringify(registry.siteSearch ?? null)};\n` +
    `export const transitions = ${JSON.stringify(registry.transitions ?? true)};\n`
  );
}

/**
 * The site's images, for utils/assets.ts: a lazy loader for every image under
 * `<srcDir>/assets/images` (any case of the usual extensions), keyed as Vite
 * keys a glob, and the prefix that turns an `@/assets/…` path into that key.
 * Generated because a glob must be a literal and the folder is the site's.
 */
export function generateAssetsModule(registry: ResolvedRegistry): string {
  const root = `/${registry.srcDir === '.' ? '' : registry.srcDir + '/'}`;
  const exts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'];
  const pattern = `${root}assets/images/**/*.{${[...exts, ...exts.map((e) => e.toUpperCase())].join(',')}}`;
  return `export const assetRoot = ${JSON.stringify(root)};
export const imageLoaders = import.meta.glob(${JSON.stringify(pattern)});
`;
}

/** Each parche's module for development tools, loaded on demand, by name. */
export function generateDevToolsModule(registry: ResolvedRegistry): string {
  const entries = Object.entries(registry.devTools).map(([name, file]) => `  ${JSON.stringify(name)}: () => import(${JSON.stringify(file)}),`);
  return `export default {\n${entries.join('\n')}\n};\n`;
}

/** An app's options, `parche:app/<name>`: what its factory was given, as data. */
export function generateAppConfigModule(registry: ResolvedRegistry, appName: string): string {
  const app = registry.apps.find((a) => a.name === appName);
  return `export default ${JSON.stringify(app?.config ?? {})};\n`;
}

/**
 * The site config given inline (`parche({ brand, … })`), served as
 * `parche:config` already validated, so consumers see the same defaults
 * whichever way the site was configured.
 */
export function generateInlineSiteConfigModule(registry: ResolvedRegistry): string {
  return `export default ${JSON.stringify(registry.inlineSiteConfig)};\n`;
}
