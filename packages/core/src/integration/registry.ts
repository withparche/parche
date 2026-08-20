import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ParcheUserConfig, ResolvedRegistry } from './types.js';

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
  // Common components
  'parche:components/Header': corePath('components/common/Header.astro'),
  'parche:components/Footer': corePath('components/common/Footer.astro'),
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

  // Layout widgets (Header/Footer registered as widgets under layout/ namespace)
  'parche:widgets/layout/Header': corePath('components/common/Header.astro'),
  'parche:widgets/layout/Footer': corePath('components/common/Footer.astro'),

  // Utils (named exports)
  'parche:utils/metadata': corePath('utils/metadata.ts'),
  'parche:utils/i18n': corePath('utils/i18n.ts'),
  'parche:utils/layout': corePath('utils/layout.ts'),

  // Built-in templates
  'parche:templates/contact': corePath('templates/contact.astro'),
  'parche:templates/content': corePath('templates/content.astro'),

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

  // Register primitives (foundational building blocks) as parche:primitives/*
  if (userConfig.primitives) {
    for (const [name, absPath] of Object.entries(userConfig.primitives)) {
      modules[`parche:primitives/${name}`] = absPath;
    }
  }

  // Register widgets as parche:widgets/*
  if (userConfig.ui) {
    for (const [name, absPath] of Object.entries(userConfig.ui.widgets)) {
      modules[`parche:widgets/${name}`] = absPath;
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

  // Add app widgets and templates
  const apps = userConfig.apps ?? [];
  for (const app of apps) {
    if (app.widgets) {
      for (const [name, absPath] of Object.entries(app.widgets)) {
        modules[`parche:widgets/${name}`] = absPath;
      }
    }
    if (app.templates) {
      for (const [name, absPath] of Object.entries(app.templates)) {
        modules[`parche:templates/${name}`] = absPath;
      }
    }
    if (app.namedExportModules) {
      for (const id of app.namedExportModules) {
        NAMED_EXPORT_MODULES.add(id);
      }
    }
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
