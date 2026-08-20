import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import type { ResolvedRegistry } from './types.js';

/**
 * Resolve a bare specifier to an absolute path from @parche/core's own location.
 *
 * Generated virtual modules have no place on disk, so a bare `import ... from 'zod'`
 * inside one is resolved by Vite relative to the consuming project root — which under
 * pnpm's isolated node_modules will not see core's dependencies. Emitting the absolute
 * path instead pins the import to the copy core itself declares.
 *
 * Uses `import.meta.resolve` rather than `require.resolve` so the package's `import`
 * export condition wins: `require.resolve` picks the CJS entry, which Vite then inlines
 * as ESM and blows up with "exports is not defined".
 */
function resolveFromCore(specifier: string): string {
  try {
    return fileURLToPath(import.meta.resolve(specifier));
  } catch {
    // Fall back to the bare specifier; the consumer may hoist or declare it itself.
    return specifier;
  }
}

/**
 * A single variant of default props for a widget.
 * Widgets can provide multiple variants (e.g., "minimal", "with image")
 * so the builder can randomly pick one when adding a new section.
 */
interface DefaultVariant {
  label?: string;
  props: Record<string, unknown>;
}

/**
 * Load widget default variants from a sibling `.defaults.json` file.
 * Supports two formats:
 *   - Array of variants: [{ label?: string, props: {...} }, ...]
 *   - Single props object: { title: "...", ... } (wrapped as one variant)
 * Returns null if the file doesn't exist or can't be parsed.
 */
function loadWidgetDefaults(astroFilePath: string): DefaultVariant[] | null {
  const defaultsPath = astroFilePath.replace(/\.astro$/, '.defaults.json');
  try {
    const raw = JSON.parse(fs.readFileSync(defaultsPath, 'utf-8'));
    if (Array.isArray(raw)) {
      // Array format: each element must have a `props` field
      return raw.map((entry: unknown) => {
        if (entry && typeof entry === 'object' && 'props' in entry) {
          return entry as DefaultVariant;
        }
        // Bare props object inside array
        return { props: entry as Record<string, unknown> };
      });
    }
    // Single object format: wrap as one variant
    return [{ props: raw as Record<string, unknown> }];
  } catch {
    return null;
  }
}

const PARCHE_PREFIX = 'parche:';
const VIRTUAL_PREFIX = '\0parche:';
const WIDGET_MAP_ID = 'parche:registry/widgets';
const WIDGET_MAP_VIRTUAL = '\0parche:registry/widgets';
const TEMPLATE_MAP_ID = 'parche:registry/templates';
const TEMPLATE_MAP_VIRTUAL = '\0parche:registry/templates';
const I18N_CONFIG_ID = 'parche:config/i18n';
const I18N_CONFIG_VIRTUAL = '\0parche:config/i18n';
const THEMES_CONFIG_ID = 'parche:config/themes';
const THEMES_CONFIG_VIRTUAL = '\0parche:config/themes';
const WIDGET_SCHEMAS_ID = 'parche:registry/widgetSchemas';
const WIDGET_SCHEMAS_VIRTUAL = '\0parche:registry/widgetSchemas';
const RESOLVERS_ID = 'parche:registry/resolvers';
const RESOLVERS_VIRTUAL = '\0parche:registry/resolvers';
const APP_CONFIG_PREFIX = 'parche:app/';
const APP_CONFIG_VIRTUAL_PREFIX = '\0parche:app/';

/**
 * Extract a widget key from a virtual module ID.
 * Widgets use the full path after the prefix to avoid collisions.
 * Atoms use the short name (last segment).
 *
 * 'parche:widgets/hero/Hero'    → 'hero/Hero'
 * 'parche:widgets/legacy/Hero'  → 'legacy/Hero'
 * 'parche:primitives/Button'         → 'Button'
 */
function extractWidgetKey(virtualId: string): string {
  if (virtualId.startsWith('parche:widgets/')) {
    return virtualId.replace('parche:widgets/', '');
  }
  const path = virtualId.replace('parche:', '');
  return path.split('/').pop()!;
}

/**
 * Extract a template key from a virtual module ID.
 * 'parche:templates/contact' → 'contact'
 */
function extractTemplateKey(virtualId: string): string {
  return virtualId.replace('parche:templates/', '');
}

/**
 * Generate a JS module that exports the widget map.
 */
function generateWidgetMapModule(registry: ResolvedRegistry): string {
  const entries: { varName: string; key: string; importPath: string }[] = [];
  let index = 0;

  for (const virtualId of Object.keys(registry.modules)) {
    if (virtualId.startsWith('parche:widgets/') || virtualId.startsWith('parche:primitives/')) {
      const key = extractWidgetKey(virtualId);
      entries.push({ varName: `W${index}`, key, importPath: virtualId });
      index++;
    }
  }

  const imports = entries.map((e) => `import ${e.varName} from '${e.importPath}';`).join('\n');
  const mapEntries = entries.map((e) => `  '${e.key}': ${e.varName},`).join('\n');

  return `${imports}

export const widgetMap = {
${mapEntries}
};
`;
}

/**
 * Generate a JS module that exports the template map.
 * The injected catch-all route imports this to render templates by name.
 */
function generateTemplateMapModule(registry: ResolvedRegistry): string {
  const entries: { varName: string; key: string; virtualId: string }[] = [];
  let index = 0;

  for (const virtualId of Object.keys(registry.modules)) {
    if (virtualId.startsWith('parche:templates/')) {
      const key = extractTemplateKey(virtualId);
      entries.push({ varName: `T${index}`, key, virtualId });
      index++;
    }
  }

  const imports = entries.map((e) => `import ${e.varName} from '${e.virtualId}';`).join('\n');
  const mapEntries = entries.map((e) => `  '${e.key}': ${e.varName},`).join('\n');

  return `${imports}

export const templateMap = {
${mapEntries}
};
`;
}

/**
 * Generate a JS module that exports i18n config.
 */
function generateI18nConfigModule(registry: ResolvedRegistry): string {
  return `export const locales = ${JSON.stringify(registry.i18n.locales)};
export const defaultLocale = ${JSON.stringify(registry.i18n.defaultLocale)};
`;
}

/**
 * Generate a JS module that exports available themes.
 */
function generateThemesConfigModule(registry: ResolvedRegistry): string {
  return `export const themes = ${JSON.stringify(registry.themes)};
export const showPanel = ${JSON.stringify(registry.showPanel)};
`;
}

/**
 * Derive the palette category from a widget virtual ID.
 * 'parche:widgets/hero/Hero'           → 'hero'
 * 'parche:widgets/call-to-action/CTA'  → 'call-to-action'
 */
function extractWidgetCategory(virtualId: string): string {
  const after = virtualId.replace('parche:widgets/', '');
  const slashIdx = after.lastIndexOf('/');
  return slashIdx >= 0 ? after.slice(0, slashIdx) : after;
}

/**
 * Convert a PascalCase component name to a human-readable label.
 * Splits at lowercase→uppercase transitions to preserve acronyms.
 * 'FeaturesList' → 'Features List'
 * 'CallToAction' → 'Call To Action'
 * 'FAQs'         → 'FAQs'   (no lowercase→uppercase transition)
 */
function humanLabel(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
}

/**
 * Generate a JS module that exports:
 *  - `widgetSchemas`  — JSON Schema per widget (from Zod v4 toJSONSchema)
 *  - `widgetMeta`     — label / category / description / defaultProps / ui per widget
 *
 * Widgets with a sibling `.props.ts` get a full schema + metadata.
 * Widgets without one get only basic metadata (no schema / no form in builder).
 */
function generateWidgetSchemasModule(registry: ResolvedRegistry): string {
  const imports: string[] = [`import { z } from ${JSON.stringify(resolveFromCore('zod'))};`];
  const schemaEntries: string[] = [];
  const metaEntries: string[] = [];
  let index = 0;

  for (const [virtualId, filePath] of Object.entries(registry.modules)) {
    if (!virtualId.startsWith('parche:widgets/')) continue;
    if (!filePath.endsWith('.astro')) continue;

    const key = extractWidgetKey(virtualId);

    // Layout widgets (layout/Header, layout/Footer) are structural — skip builder palette
    if (key.startsWith('layout/')) continue;

    const propsPath = filePath.replace(/\.astro$/, '.props.ts');
    const hasProps = fs.existsSync(propsPath);
    const variants = loadWidgetDefaults(filePath);
    const variantsJson = JSON.stringify(variants ?? [{ props: {} }]);
    const defaultPropsJson = JSON.stringify(variants?.[0]?.props ?? {});

    if (hasProps) {
      const varName = `p${index}`;
      imports.push(`import { schema as ${varName}_s, meta as ${varName}_m } from ${JSON.stringify(propsPath)};`);

      schemaEntries.push(`  ${JSON.stringify(key)}: z.toJSONSchema(${varName}_s)`);

      metaEntries.push(`  ${JSON.stringify(key)}: {
    label: ${varName}_m?.widget?.label ?? ${JSON.stringify(humanLabel(key))},
    category: ${varName}_m?.widget?.category ?? ${JSON.stringify(extractWidgetCategory(virtualId))},
    description: ${varName}_m?.widget?.description ?? '',
    icon: ${varName}_m?.widget?.icon ?? '',
    defaultProps: ${defaultPropsJson},
    defaultVariants: ${variantsJson},
    ui: ${varName}_m?.ui ?? {},
  }`);
      index++;
    } else {
      // No .props.ts — basic meta only, no schema
      metaEntries.push(`  ${JSON.stringify(key)}: {
    label: ${JSON.stringify(humanLabel(key))},
    category: ${JSON.stringify(extractWidgetCategory(virtualId))},
    description: '',
    icon: '',
    defaultProps: ${defaultPropsJson},
    defaultVariants: ${variantsJson},
    ui: {},
  }`);
    }
  }

  return `${imports.join('\n')}

export const widgetSchemas = {
${schemaEntries.join(',\n')}
};

export const widgetMeta = {
${metaEntries.join(',\n')}
};
`;
}

/**
 * Generate a JS module that aggregates all app resolvers.
 * Exports resolveContent(slug, locale, opts) and getResolverPaths(locales, defaultLocale, opts).
 */
function generateResolversModule(registry: ResolvedRegistry): string {
  if (registry.resolvers.length === 0) {
    return `
export async function resolveContent() { return null; }
export async function getResolverPaths() { return []; }
`;
  }

  const imports: string[] = [];
  const resolverNames: string[] = [];

  registry.resolvers.forEach((r, i) => {
    const varResolve = `resolve_${i}`;
    const varPaths = `getPaths_${i}`;
    imports.push(
      `import { resolve as ${varResolve}, getPaths as ${varPaths} } from ${JSON.stringify(r.entrypoint)};`,
    );
    resolverNames.push(`{ resolve: ${varResolve}, getPaths: ${varPaths} }`);
  });

  return `${imports.join('\n')}

const resolvers = [${resolverNames.join(', ')}];

export async function resolveContent(slug, locale, opts) {
  for (const r of resolvers) {
    const result = await r.resolve(slug, locale, opts);
    if (result) return result;
  }
  return null;
}

export async function getResolverPaths(locales, defaultLocale, opts) {
  const all = [];
  for (const r of resolvers) {
    const paths = await r.getPaths(locales, defaultLocale, opts);
    all.push(...paths);
  }
  return all;
}
`;
}

export function vitePluginParche(registry: ResolvedRegistry): Plugin {
  return {
    name: 'vite-plugin-parche',
    enforce: 'pre',

    resolveId(id) {
      if (id === WIDGET_MAP_ID) return WIDGET_MAP_VIRTUAL;
      if (id === TEMPLATE_MAP_ID) return TEMPLATE_MAP_VIRTUAL;
      if (id === I18N_CONFIG_ID) return I18N_CONFIG_VIRTUAL;
      if (id === THEMES_CONFIG_ID) return THEMES_CONFIG_VIRTUAL;

      if (id === WIDGET_SCHEMAS_ID) return WIDGET_SCHEMAS_VIRTUAL;
      if (id === RESOLVERS_ID) return RESOLVERS_VIRTUAL;
      if (id.startsWith(APP_CONFIG_PREFIX)) return '\0' + id;
      if (id.startsWith(PARCHE_PREFIX)) {
        return '\0' + id;
      }
    },

    load(id) {
      if (id === WIDGET_MAP_VIRTUAL) return generateWidgetMapModule(registry);
      if (id === TEMPLATE_MAP_VIRTUAL) return generateTemplateMapModule(registry);
      if (id === I18N_CONFIG_VIRTUAL) return generateI18nConfigModule(registry);
      if (id === THEMES_CONFIG_VIRTUAL) return generateThemesConfigModule(registry);
      if (id === RESOLVERS_VIRTUAL) return generateResolversModule(registry);
      if (id === WIDGET_SCHEMAS_VIRTUAL) {
        // Watch .props.ts and .defaults.json files for HMR
        for (const [virtualId, filePath] of Object.entries(registry.modules)) {
          if (!virtualId.startsWith('parche:widgets/') || !filePath.endsWith('.astro')) continue;
          for (const ext of ['.props.ts', '.defaults.json']) {
            const sibling = filePath.replace(/\.astro$/, ext);
            if (fs.existsSync(sibling)) {
              this.addWatchFile(sibling);
            }
          }
        }
        return generateWidgetSchemasModule(registry);
      }

      // App config virtual modules: parche:app/{name}
      if (id.startsWith(APP_CONFIG_VIRTUAL_PREFIX)) {
        const appName = id.slice(APP_CONFIG_VIRTUAL_PREFIX.length);
        const app = registry.apps.find((a) => a.name === appName);
        return `export default ${JSON.stringify(app?.config ?? {})};\n`;
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
