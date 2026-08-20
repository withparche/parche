import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ParcheUserConfig, ResolvedRegistry, ParcheManifest } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreDir = path.resolve(__dirname, '..');

function corePath(...segments: string[]): string {
  return path.resolve(coreDir, ...segments);
}

/** Default themes available out of the box */
const DEFAULT_THEMES = [
  { label: 'Default', value: '' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Playful', value: 'playful' },
  { label: 'Startup', value: 'startup' },
  { label: 'Starter', value: 'starter' },
];

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

/** Modules that use named exports instead of default export */
const NAMED_EXPORT_MODULES = new Set([
  'parche:utils/metadata',
  'parche:utils/i18n',
  'parche:utils/layout',
]);

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
): ResolvedRegistry {
  const modules: Record<string, string> = { ...CORE_MODULES };

  // Add config module
  const configPath = userConfig.config || './src/config.ts';
  modules['parche:config'] = path.resolve(rootDir, configPath);

  // Register parches (order = precedence: later wins). Each parche contributes
  // primitives / widgets / templates / routes / config to the system.
  const parches = userConfig.parches ?? [];
  const providedPrimitives = new Set<string>();
  const providedWidgets = new Set<string>();
  const apps: ParcheManifest[] = [];

  for (const parche of parches) {
    if (parche.primitives) {
      for (const [name, absPath] of Object.entries(parche.primitives)) {
        modules[`parche:primitives/${name}`] = absPath;
        providedPrimitives.add(name);
      }
    }
    if (parche.widgets) {
      for (const [name, absPath] of Object.entries(parche.widgets)) {
        modules[`parche:widgets/${name}`] = absPath;
        providedWidgets.add(name);
      }
    }
    if (parche.templates) {
      for (const [name, absPath] of Object.entries(parche.templates)) {
        modules[`parche:templates/${name}`] = absPath;
      }
    }
    if (parche.namedExportModules) {
      for (const id of parche.namedExportModules) NAMED_EXPORT_MODULES.add(id);
    }
    // A parche that injects routes / resolves slugs / exposes config is an "app".
    if (parche.routes || parche.resolver || parche.config) {
      apps.push(parche);
    }
  }

  // Add user-defined templates
  if (userConfig.routes?.templates) {
    for (const [name, userPath] of Object.entries(userConfig.routes.templates)) {
      modules[`parche:templates/${name}`] = path.resolve(rootDir, userPath);
    }
  }

  // Add user-defined layouts
  if (userConfig.routes?.layouts) {
    for (const [name, userPath] of Object.entries(userConfig.routes.layouts)) {
      modules[`parche:layouts/${name}`] = path.resolve(rootDir, userPath);
    }
  }

  // Validate parche requirements (V1: capability presence).
  const missing: string[] = [];
  for (const parche of parches) {
    for (const name of parche.requires?.primitives ?? []) {
      if (!providedPrimitives.has(name)) missing.push(`"${parche.name}" requires primitive "${name}" (parche:primitives/${name})`);
    }
    for (const name of parche.requires?.widgets ?? []) {
      if (!providedWidgets.has(name)) missing.push(`"${parche.name}" requires widget "${name}" (parche:widgets/${name})`);
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

  // Resolve themes config
  const themes = userConfig.themes?.available ?? DEFAULT_THEMES;
  const showPanel = userConfig.themes?.showPanel ?? themes.length > 1;

  // Resolve styles entry — user can provide their own CSS file
  const stylesEntry = userConfig.styles?.entry
    ? path.resolve(rootDir, userConfig.styles.entry)
    : corePath('styles/themes/index.css');
  modules['parche:config/styles'] = stylesEntry;

  // Collect app resolvers
  const resolvers: Array<{ appName: string; entrypoint: string }> = [];
  for (const app of apps) {
    if (app.resolver) {
      resolvers.push({ appName: app.name, entrypoint: app.resolver.entrypoint });
    }
  }

  return {
    modules,
    namedExportModules: NAMED_EXPORT_MODULES,
    i18n,
    themes,
    showPanel,
    apps,
    resolvers,
  };
}
