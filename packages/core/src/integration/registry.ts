import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ParcheUserConfig, ResolvedRegistry, ParcheManifest } from './types.js';
import type { SiteConfig } from '../types/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreDir = path.resolve(__dirname, '..');

function corePath(...segments: string[]): string {
  return path.resolve(coreDir, ...segments);
}

/** Keep the first entry per theme `value` (parche order = precedence). */
function dedupeThemes(
  themes: Array<{ label: string; value: string }>,
): Array<{ label: string; value: string }> {
  const seen = new Set<string>();
  return themes.filter((t) => (seen.has(t.value) ? false : (seen.add(t.value), true)));
}

/** The always-present base look (no data-theme). Themes are added by parches. */
const DEFAULT_THEME = { label: 'Default', value: '' };

/** Parse "1.2.3" (ignoring build/prerelease suffix) into a numeric tuple. */
function parseVersion(v: string): [number, number, number] | null {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v.trim().replace(/^v/, ''));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function cmpVersion(a: [number, number, number], b: [number, number, number]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/**
 * Minimal semver range check for peer requirements: `*`/``/`latest` = any;
 * caret `^x.y.z` (npm semantics, incl. 0.x pinning); tilde `~x.y.z`;
 * `>=x.y.z`; anything else is treated as an exact match.
 */
function satisfiesVersion(actual: string, range: string): boolean {
  const r = range.trim();
  if (!r || r === '*' || r === 'latest') return true;
  const a = parseVersion(actual);
  if (!a) return false;
  if (r.startsWith('>=')) {
    const b = parseVersion(r.slice(2));
    return !!b && cmpVersion(a, b) >= 0;
  }
  if (r.startsWith('^')) {
    const b = parseVersion(r.slice(1));
    if (!b || cmpVersion(a, b) < 0) return false;
    if (b[0] > 0) return a[0] === b[0];
    if (b[1] > 0) return a[0] === 0 && a[1] === b[1];
    return a[0] === 0 && a[1] === 0 && a[2] === b[2];
  }
  if (r.startsWith('~')) {
    const b = parseVersion(r.slice(1));
    return !!b && a[0] === b[0] && a[1] === b[1] && cmpVersion(a, b) >= 0;
  }
  const b = parseVersion(r);
  return !!b && cmpVersion(a, b) === 0;
}

/** Built-in core component registry */
const CORE_MODULES: Record<string, string> = {
  // Theme / i18n engine controls (consumed by the ui parche's Header)
  'parche:components/ThemeToggle': corePath('components/common/ThemeToggle.astro'),
  'parche:components/ThemeSelector': corePath('components/common/ThemeSelector.astro'),
  'parche:components/OptimizedImage': corePath('components/common/OptimizedImage.astro'),
  'parche:components/LocaleSwitcher': corePath('components/common/LocaleSwitcher.astro'),
  'parche:components/ThemePanel': corePath('components/common/ThemePanel.astro'),

  // Layouts
  'parche:layouts/BaseLayout': corePath('layouts/BaseLayout.astro'),

  // DynamicRenderer & LayoutRenderer
  'parche:DynamicRenderer': corePath('components/DynamicRenderer.astro'),
  'parche:LayoutRenderer': corePath('components/LayoutRenderer.astro'),

  // Utils (named exports)
  'parche:utils/metadata': corePath('utils/metadata.ts'),
  'parche:utils/i18n': corePath('utils/i18n.ts'),
  'parche:utils/layout': corePath('utils/layout.ts'),
  // Note: layout/Header, layout/Footer and the contact/content templates are
  // now provided by the ui parche — core no longer ships chrome or primitives.
};

/** Core modules that use named exports instead of default export. Frozen default —
 *  each createRegistry call gets its own Set seeded from this (never mutate this). */
const BASE_NAMED_EXPORTS: readonly string[] = [
  'parche:utils/metadata',
  'parche:utils/i18n',
  'parche:utils/layout',
];

/**
 * Convert an override key ('widgets:hero:Hero') to a virtual module ID ('parche:widgets/hero/Hero')
 */
function overrideKeyToVirtualId(key: string): string {
  return 'parche:' + key.replace(/:/g, '/');
}

/**
 * Build the complete resolved registry from user config.
 */
export function createRegistry(
  userConfig: ParcheUserConfig,
  rootDir: string,
  astroI18n?: { locales?: Array<string | { path: string; codes: string[] }>; defaultLocale?: string },
  inlineSiteConfig?: SiteConfig,
): ResolvedRegistry {
  const modules: Record<string, string> = { ...CORE_MODULES };

  // Site config: `parche({ site })` passes it inline (served as parche:config by
  // the vite plugin); otherwise parche:config points at the user's config file.
  if (!inlineSiteConfig) {
    const configPath = userConfig.config || './parche.config.ts';
    modules['parche:config'] = path.resolve(rootDir, configPath);
  }

  // Modules that use named exports — instance-local, seeded from the frozen base
  // so registrations don't bleed between createRegistry calls in one process.
  const namedExportModules = new Set<string>(BASE_NAMED_EXPORTS);

  // Surface silent last-wins collisions and bad parche paths with attribution,
  // instead of an opaque "Unknown virtual module" / ESM error much later.
  const collisions: string[] = [];
  const badPaths: string[] = [];
  const setModule = (parcheName: string, kind: string, virtualId: string, absPath: string) => {
    if (!path.isAbsolute(absPath)) {
      badPaths.push(`"${parcheName}" ${kind} "${virtualId}" → not an absolute path: ${absPath}`);
    } else if (!fs.existsSync(absPath)) {
      badPaths.push(`"${parcheName}" ${kind} "${virtualId}" → file not found: ${absPath}`);
    }
    const prev = modules[virtualId];
    if (prev && prev !== absPath) {
      collisions.push(`${virtualId} — "${parcheName}" overwrites ${prev}`);
    }
    modules[virtualId] = absPath;
  };

  // Register parches (order = precedence: later wins). Each parche contributes
  // primitives / widgets / templates / routes / config to the system.
  const parches = userConfig.parches ?? [];
  const providedPrimitives = new Set<string>();
  const providedWidgets = new Set<string>();
  const providedTemplates = new Set<string>();
  const apps: ParcheManifest[] = [];
  const contributedStyles: string[] = [];
  const contributedThemes: Array<{ label: string; value: string }> = [];
  const contentGlobs: string[] = [];
  const fullBleedWidgets: string[] = [];

  for (const parche of parches) {
    if (parche.styles) contributedStyles.push(...parche.styles);
    if (parche.themes) contributedThemes.push(...parche.themes);
    if (parche.content) contentGlobs.push(...parche.content);
    if (parche.fullBleed) fullBleedWidgets.push(...parche.fullBleed);
    if (parche.primitives) {
      for (const [name, absPath] of Object.entries(parche.primitives)) {
        setModule(parche.name, 'primitive', `parche:primitives/${name}`, absPath);
        providedPrimitives.add(name);
      }
    }
    if (parche.widgets) {
      for (const [name, absPath] of Object.entries(parche.widgets)) {
        setModule(parche.name, 'widget', `parche:widgets/${name}`, absPath);
        providedWidgets.add(name);
      }
    }
    if (parche.templates) {
      for (const [name, absPath] of Object.entries(parche.templates)) {
        setModule(parche.name, 'template', `parche:templates/${name}`, absPath);
        providedTemplates.add(name);
      }
    }
    if (parche.namedExportModules) {
      for (const id of parche.namedExportModules) namedExportModules.add(id);
    }
    // A parche that injects routes / resolves slugs / exposes config is an "app".
    if (parche.routes || parche.resolver || parche.config) {
      apps.push(parche);
    }
  }

  if (badPaths.length) {
    console.warn('[parche] Parche path problems (these modules will fail to load):\n  - ' + badPaths.join('\n  - '));
  }
  if (collisions.length) {
    console.warn(
      '[parche] Duplicate registrations — the last parche wins. If this is intentional, use `overrides` to make it explicit:\n  - ' +
        collisions.join('\n  - '),
    );
  }

  // Add user-defined templates
  if (userConfig.routes?.templates) {
    for (const [name, userPath] of Object.entries(userConfig.routes.templates)) {
      modules[`parche:templates/${name}`] = path.resolve(rootDir, userPath);
      providedTemplates.add(name);
    }
  }

  // Add user-defined layouts
  if (userConfig.routes?.layouts) {
    for (const [name, userPath] of Object.entries(userConfig.routes.layouts)) {
      modules[`parche:layouts/${name}`] = path.resolve(rootDir, userPath);
    }
  }

  // Validate parche requirements (V2: presence of every capability, plus
  // peer-parche version ranges). Structural widget-prop checks run where the
  // schemas are available (widgetSchemas generation), not here.
  const providedThemes = new Set<string>(['', ...contributedThemes.map((t) => t.value)]);
  const parcheVersions = new Map<string, string | undefined>(parches.map((p) => [p.name, p.version]));

  const missing: string[] = [];
  const widgetPropRequirements: Array<{ from: string; name: string; props: string[] }> = [];
  for (const parche of parches) {
    const req = parche.requires;
    if (!req) continue;
    for (const name of req.primitives ?? []) {
      if (!providedPrimitives.has(name)) missing.push(`"${parche.name}" requires primitive "${name}" (parche:primitives/${name})`);
    }
    for (const w of req.widgets ?? []) {
      const name = typeof w === 'string' ? w : w.name;
      if (!providedWidgets.has(name)) {
        missing.push(`"${parche.name}" requires widget "${name}" (parche:widgets/${name})`);
      } else if (typeof w === 'object' && w.props?.length) {
        widgetPropRequirements.push({ from: parche.name, name, props: w.props });
      }
    }
    for (const name of req.templates ?? []) {
      if (!providedTemplates.has(name)) missing.push(`"${parche.name}" requires template "${name}" (parche:templates/${name})`);
    }
    for (const value of req.themes ?? []) {
      if (!providedThemes.has(value)) missing.push(`"${parche.name}" requires theme "${value}"`);
    }
    for (const dep of req.parches ?? []) {
      if (!parcheVersions.has(dep.name)) {
        missing.push(`"${parche.name}" requires parche "${dep.name}"${dep.version ? ` (${dep.version})` : ''} — not imported`);
      } else if (dep.version) {
        const actual = parcheVersions.get(dep.name);
        if (!actual) {
          missing.push(`"${parche.name}" requires "${dep.name}@${dep.version}" but "${dep.name}" declares no version`);
        } else if (!satisfiesVersion(actual, dep.version)) {
          missing.push(`"${parche.name}" requires "${dep.name}@${dep.version}" but found ${actual}`);
        }
      }
    }
  }
  if (missing.length) {
    throw new Error(
      '[parche] Unsatisfied parche requirements — add a parche that provides them:\n  - ' + missing.join('\n  - '),
    );
  }

  // Apply user overrides (these take priority)
  if (userConfig.overrides) {
    for (const [key, overridePath] of Object.entries(userConfig.overrides)) {
      const virtualId = overrideKeyToVirtualId(key);
      modules[virtualId] = path.resolve(rootDir, overridePath);
    }
  }

  // Resolve i18n config from Astro's official i18n settings
  const resolvedLocales = (astroI18n?.locales ?? ['en']).map((loc) =>
    typeof loc === 'string' ? loc : loc.codes[0],
  );
  const i18n = {
    locales: resolvedLocales,
    defaultLocale: astroI18n?.defaultLocale ?? 'en',
  };

  // Resolve themes: the base look plus whatever the imported parches contribute.
  // `themes.available` still overrides explicitly, for full manual control.
  const themes = userConfig.themes?.available ?? dedupeThemes([DEFAULT_THEME, ...contributedThemes]);
  const showPanel = userConfig.themes?.showPanel ?? themes.length > 1;

  // Aggregate the CSS to bundle: what the parches contribute (e.g. themes) plus
  // an optional user entry. A site ships only the CSS of the parches it imports.
  const styleEntries = [...contributedStyles];
  if (userConfig.styles?.entry) {
    styleEntries.push(path.resolve(rootDir, userConfig.styles.entry));
  }

  // Collect app resolvers
  const resolvers: Array<{ appName: string; entrypoint: string }> = [];
  for (const app of apps) {
    if (app.resolver) {
      resolvers.push({ appName: app.name, entrypoint: app.resolver.entrypoint });
    }
  }

  return {
    modules,
    namedExportModules,
    fullBleedWidgets,
    widgetPropRequirements,
    inlineSiteConfig,
    i18n,
    themes,
    showPanel,
    styleEntries,
    contentGlobs,
    apps,
    resolvers,
  };
}
