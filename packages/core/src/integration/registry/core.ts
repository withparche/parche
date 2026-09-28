import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** What core itself brings to every registry: its modules, tones, the base theme. */

const coreDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** An absolute path inside @parche/astro's `src`. */
export function corePath(...segments: string[]): string {
  return path.resolve(coreDir, ...segments);
}

/** Built-in core component registry */
export const CORE_MODULES: Record<string, string> = {
  // Theme / i18n engine controls (consumed by the ui parche's Header)
  'parche:components/ThemeToggle': corePath('components/common/ThemeToggle.astro'),
  'parche:components/ThemeSelector': corePath('components/common/ThemeSelector.astro'),
  'parche:components/OptimizedImage': corePath('components/common/OptimizedImage.astro'),
  'parche:components/LocaleSwitcher': corePath('components/common/LocaleSwitcher.astro'),
  'parche:components/ThemePanel': corePath('components/common/ThemePanel.astro'),

  // Layouts
  'parche:layouts/BaseLayout': corePath('layouts/BaseLayout.astro'),

  // DynamicRenderer & LayoutRenderer
  'parche:NodeRenderer': corePath('components/NodeRenderer.astro'),
  'parche:LayoutRenderer': corePath('components/LayoutRenderer.astro'),
  // The frame every page shares (core's route and the apps' routes).
  'parche:Page': corePath('components/Page.astro'),

  // Utils (named exports)
  'parche:utils/metadata': corePath('utils/metadata.ts'),
  'parche:utils/i18n': corePath('utils/i18n.ts'),
  'parche:utils/layout': corePath('utils/layout.ts'),
  'parche:utils/assets': corePath('utils/assets.ts'),
  'parche:utils/patterns': corePath('utils/patterns.ts'),
  'parche:utils/site': corePath('utils/site.ts'),
  'parche:utils/entries': corePath('utils/entries.ts'),
  // Note: Header and Footer are widgets of the ui parche (hidden from the
  // palette by their meta); core ships no chrome and no elements.
};

/** Core modules that use named exports instead of default export. Frozen default —
 *  each createRegistry call gets its own Set seeded from this (never mutate this). */
export const BASE_NAMED_EXPORTS: readonly string[] = [
  'parche:utils/metadata',
  'parche:utils/i18n',
  'parche:utils/layout',
  'parche:utils/assets',
  'parche:utils/patterns',
  'parche:utils/site',
  'parche:utils/entries',
];

/** The tones every site has; a parche adds more with `tones` and a rule. */
export const CORE_TONES: ReadonlyArray<{ name: string; label: string }> = [
  { name: 'default', label: 'Default' },
  { name: 'muted', label: 'Muted' },
  { name: 'dark', label: 'Dark' },
  { name: 'primary', label: 'Primary' },
];

/** The always-present base look (no data-theme). Themes are added by parches. */
export const DEFAULT_THEME = { label: 'Default', value: '' };

/** Keep the first entry per theme `value` (parche order = precedence). */
export function dedupeThemes(
  themes: Array<{ label: string; value: string }>,
): Array<{ label: string; value: string }> {
  const seen = new Set<string>();
  return themes.filter((t) => (seen.has(t.value) ? false : (seen.add(t.value), true)));
}

/**
 * Whether a widget's `.props.ts` declares `wrapper: false`. Read as text, not
 * imported: the registry runs in the config phase and must not evaluate widget
 * code, and the render path needs this list without loading any schema.
 */
export function declaresNoWrapper(astroPath: string): boolean {
  const propsPath = astroPath.replace(/\.astro$/, '.props.ts');
  try {
    return /wrapper\s*:\s*false/.test(fs.readFileSync(propsPath, 'utf8'));
  } catch {
    return false;
  }
}
