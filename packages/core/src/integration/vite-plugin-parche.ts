import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { setTokenOverridesReloader } from '../dev/info.js';
import type { ResolvedRegistry } from './types.js';
import {
  APP_CONFIG_PREFIX,
  APP_CONFIG_VIRTUAL_PREFIX,
  ASSETS_CONFIG_ID,
  ASSETS_CONFIG_VIRTUAL,
  DEV_TOOLS_ID,
  DEV_TOOLS_VIRTUAL,
  ELEMENTS_ID,
  ELEMENTS_VIRTUAL,
  ENTRY_URLS_ID,
  ENTRY_URLS_VIRTUAL,
  FONTS_CONFIG_ID,
  FONTS_CONFIG_VIRTUAL,
  HEAD_CONFIG_ID,
  HEAD_CONFIG_VIRTUAL,
  I18N_CONFIG_ID,
  I18N_CONFIG_VIRTUAL,
  LAYOUT_CONFIG_ID,
  LAYOUT_CONFIG_VIRTUAL,
  PARCHE_PREFIX,
  RESOLVERS_ID,
  RESOLVERS_VIRTUAL,
  STYLES_CONFIG_ID,
  STYLES_CONFIG_VIRTUAL,
  TEMPLATE_MAP_ID,
  TEMPLATE_MAP_VIRTUAL,
  THEMES_CONFIG_ID,
  THEMES_CONFIG_VIRTUAL,
  TOKEN_OVERRIDES_ID,
  TOKEN_OVERRIDES_VIRTUAL,
  VIRTUAL_PREFIX,
  WIDGET_MAP_ID,
  WIDGET_MAP_VIRTUAL,
  WIDGET_PROPS_ID,
  WIDGET_PROPS_VIRTUAL,
  WIDGET_SCHEMAS_ID,
  WIDGET_SCHEMAS_VIRTUAL,
} from './codegen/ids.js';
import { generateWidgetMapModule } from './codegen/widgets.js';
import { generateTemplateMapModule } from './codegen/templates.js';
import { generateWidgetPropsModule, generateWidgetSchemasModule, widgetCatalogWatchFiles } from './codegen/catalog.js';
import { elementCatalogWatchFiles, generateElementsModule } from './codegen/elements.js';
import { generateEntryUrlsModule, generateResolversModule } from './codegen/resolvers.js';
import {
  generateAppConfigModule,
  generateAssetsModule,
  generateDevToolsModule,
  generateFontsConfigModule,
  generateHeadConfigModule,
  generateI18nConfigModule,
  generateInlineSiteConfigModule,
  generateLayoutConfigModule,
  generateStylesModule,
  generateThemesConfigModule,
} from './codegen/config.js';
import { generateTokenOverrides } from './codegen/tokens.js';
import { BASE_CSS_PATH, baseCssWithSources, isCoreBaseCss } from './codegen/sources.js';

/** The ids a parche imports, and what Vite resolves each to. */
const RESOLVE: Record<string, string> = {
  [WIDGET_MAP_ID]: WIDGET_MAP_VIRTUAL,
  [TEMPLATE_MAP_ID]: TEMPLATE_MAP_VIRTUAL,
  [I18N_CONFIG_ID]: I18N_CONFIG_VIRTUAL,
  [FONTS_CONFIG_ID]: FONTS_CONFIG_VIRTUAL,
  [HEAD_CONFIG_ID]: HEAD_CONFIG_VIRTUAL,
  [ASSETS_CONFIG_ID]: ASSETS_CONFIG_VIRTUAL,
  [THEMES_CONFIG_ID]: THEMES_CONFIG_VIRTUAL,
  [STYLES_CONFIG_ID]: STYLES_CONFIG_VIRTUAL,
  [TOKEN_OVERRIDES_ID]: TOKEN_OVERRIDES_VIRTUAL,
  [LAYOUT_CONFIG_ID]: LAYOUT_CONFIG_VIRTUAL,
  [WIDGET_SCHEMAS_ID]: WIDGET_SCHEMAS_VIRTUAL,
  [WIDGET_PROPS_ID]: WIDGET_PROPS_VIRTUAL,
  [ELEMENTS_ID]: ELEMENTS_VIRTUAL,
  [RESOLVERS_ID]: RESOLVERS_VIRTUAL,
  [DEV_TOOLS_ID]: DEV_TOOLS_VIRTUAL,
  [ENTRY_URLS_ID]: ENTRY_URLS_VIRTUAL,
};

/** The generated modules that need nothing but the registry, by resolved id. */
const GENERATE: Record<string, (registry: ResolvedRegistry) => string> = {
  [WIDGET_MAP_VIRTUAL]: generateWidgetMapModule,
  [TEMPLATE_MAP_VIRTUAL]: generateTemplateMapModule,
  [I18N_CONFIG_VIRTUAL]: generateI18nConfigModule,
  [FONTS_CONFIG_VIRTUAL]: generateFontsConfigModule,
  [ASSETS_CONFIG_VIRTUAL]: generateAssetsModule,
  [HEAD_CONFIG_VIRTUAL]: generateHeadConfigModule,
  [THEMES_CONFIG_VIRTUAL]: generateThemesConfigModule,
  [STYLES_CONFIG_VIRTUAL]: generateStylesModule,
  [LAYOUT_CONFIG_VIRTUAL]: generateLayoutConfigModule,
  [WIDGET_PROPS_VIRTUAL]: generateWidgetPropsModule,
  [RESOLVERS_VIRTUAL]: generateResolversModule,
  [ENTRY_URLS_VIRTUAL]: generateEntryUrlsModule,
  [DEV_TOOLS_VIRTUAL]: generateDevToolsModule,
};

/**
 * The Vite plugin that serves every `parche:*` module: the generated ones
 * (`codegen/`), each from the resolved registry, and the ones that stand for
 * a file on disk (a widget, an element, a template, the site config), which
 * re-export it. It also feeds Tailwind's root with the parches' sources and
 * reloads the site's token overrides when they change.
 */
export function vitePluginParche(registry: ResolvedRegistry): Plugin {
  return {
    name: 'vite-plugin-parche',
    enforce: 'pre',

    // The token overrides file may appear, change or go while the server
    // runs (the builder writes it): its CSS module reloads each time. A tool
    // that just wrote it asks at once (reloadTokenOverrides in dev/), so a
    // render right after the save never gets the old CSS while the watcher
    // catches up.
    configureServer(server) {
      const reloadNow = () => {
        for (const env of Object.values(server.environments ?? {})) {
          const mod = env.moduleGraph.getModuleById(TOKEN_OVERRIDES_VIRTUAL);
          if (mod) {
            env.moduleGraph.invalidateModule(mod);
            // Each environment reloads its own module (the server-level
            // reloadModule takes the old mixed graph's nodes, not these).
            void (env as { reloadModule?: (m: typeof mod) => Promise<void> }).reloadModule?.(mod)?.catch(() => undefined);
          }
        }
      };
      setTokenOverridesReloader(reloadNow);
      const reload = (file: string) => {
        if (path.resolve(file) === registry.tokenOverridesPath) reloadNow();
      };
      server.watcher.on('add', reload);
      server.watcher.on('change', reload);
      server.watcher.on('unlink', reload);
    },

    resolveId(id) {
      if (id in RESOLVE) return RESOLVE[id];
      if (id.startsWith(APP_CONFIG_PREFIX)) return '\0' + id;
      if (id.startsWith(PARCHE_PREFIX)) {
        return '\0' + id;
      }
    },

    load(id) {
      // Feed Tailwind's root (core's base.css) with each parche's absolute
      // @source globs, appended to the file's own content. Done in `load` (not
      // `transform`) so @tailwindcss/vite compiles the augmented CSS regardless
      // of plugin ordering. Absolute paths are the only ones that reach sibling
      // packages once installed from npm.
      if (registry.contentGlobs.length > 0 && isCoreBaseCss(id.split('?')[0])) {
        this.addWatchFile(BASE_CSS_PATH);
        return baseCssWithSources(registry);
      }

      // Inline site config (parche({ site })) — serve the validated object directly
      // instead of re-exporting a user file. Must come before the generic
      // module resolution, which has no file path for parche:config here.
      if (id === '\0parche:config' && registry.inlineSiteConfig) {
        return generateInlineSiteConfigModule(registry);
      }

      if (id in GENERATE) return GENERATE[id](registry);

      if (id === TOKEN_OVERRIDES_VIRTUAL) {
        if (fs.existsSync(registry.tokenOverridesPath)) this.addWatchFile(registry.tokenOverridesPath);
        return generateTokenOverrides(registry);
      }
      if (id === WIDGET_SCHEMAS_VIRTUAL) {
        // Watch .props.ts and .defaults.json files for HMR
        for (const file of widgetCatalogWatchFiles(registry)) this.addWatchFile(file);
        return generateWidgetSchemasModule(registry);
      }
      if (id === ELEMENTS_VIRTUAL) {
        // Watch each element's props, client entry and README for HMR
        for (const file of elementCatalogWatchFiles(registry)) this.addWatchFile(file);
        return generateElementsModule(registry);
      }

      // App config virtual modules: parche:app/{name}
      if (id.startsWith(APP_CONFIG_VIRTUAL_PREFIX)) {
        return generateAppConfigModule(registry, id.slice(APP_CONFIG_VIRTUAL_PREFIX.length));
      }

      if (!id.startsWith(VIRTUAL_PREFIX)) return;

      const virtualId = id.slice(1); // strip \0
      const resolved = registry.modules[virtualId];

      if (!resolved) {
        this.error(`[parche] Unknown virtual module: ${virtualId}`);
        return;
      }

      // Watch the resolved file for HMR
      this.addWatchFile(resolved);

      const quotedPath = JSON.stringify(resolved);

      // CSS files are side-effect imports (no exports)
      if (resolved.endsWith('.css')) {
        return `import ${quotedPath};`;
      }

      // Use named exports for utility modules, default export for components
      if (registry.namedExportModules.has(virtualId)) {
        return `export * from ${quotedPath};`;
      }
      return `export { default } from ${quotedPath};`;
    },
  };
}
