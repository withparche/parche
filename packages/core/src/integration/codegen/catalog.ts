import fs from 'node:fs';
import type { ResolvedRegistry } from '../types.js';
import { extractWidgetCategory, extractWidgetKey, humanLabel, loadWidgetDefaults, resolveFromCore } from './shared.js';

/**
 * Generate a JS module that exports:
 *  - `widgetSchemas`  — JSON Schema per widget (from Zod v4 toJSONSchema)
 *  - `widgetMeta`     — label / category / description / defaultProps / ui per widget
 *  - `widgetPropSchemas` — the zod schema itself, for tools that validate props
 *    the way the widget will (refinements a JSON Schema cannot carry)
 *
 * Widgets with a sibling `.props.ts` get a full schema + metadata.
 * Widgets without one get only basic metadata (no schema / no form in builder).
 */
export function generateWidgetSchemasModule(registry: ResolvedRegistry): string {
  const imports: string[] = [`import { z } from ${JSON.stringify(resolveFromCore('zod'))};`];
  const statements: string[] = [];
  let index = 0;

  for (const [virtualId, filePath] of Object.entries(registry.modules)) {
    if (!virtualId.startsWith('parche:widgets/')) continue;
    if (!filePath.endsWith('.astro')) continue;

    const key = extractWidgetKey(virtualId);


    const propsPath = filePath.replace(/\.astro$/, '.props.ts');
    const hasProps = fs.existsSync(propsPath);
    const variants = loadWidgetDefaults(filePath);
    const variantsJson = JSON.stringify(variants ?? [{ props: {} }]);
    const defaultPropsJson = JSON.stringify(variants?.[0]?.props ?? {});
    const keyJson = JSON.stringify(key);

    if (hasProps) {
      // Namespace import: a `.props.ts` missing `schema` or `meta` no longer
      // fails the whole module (it would with a named import). Each widget's
      // schema serialization is isolated in a try/catch so one bad/incompatible
      // schema (e.g. Zod v3, or a construct toJSONSchema can't serialize) is
      // skipped with a warning instead of killing the entire builder palette.
      const m = `p${index}`;
      imports.push(`import * as ${m} from ${JSON.stringify(propsPath)};`);
      statements.push(`if (${m}.schema) widgetPropSchemas[${keyJson}] = ${m}.schema;`);
      statements.push(
        `if (${m}.schema) { try { widgetSchemas[${keyJson}] = z.toJSONSchema(${m}.schema); } ` +
        `catch (e) { console.warn(${JSON.stringify(`[parche] Skipped JSON Schema for widget "${key}": `)} + ((e && e.message) || e)); } }`,
      );
      statements.push(`widgetMeta[${keyJson}] = {
  label: ${m}.meta?.widget?.label ?? ${JSON.stringify(humanLabel(key))},
  category: ${m}.meta?.widget?.category ?? ${JSON.stringify(extractWidgetCategory(virtualId))},
  description: ${m}.meta?.widget?.description ?? '',
  icon: ${m}.meta?.widget?.icon ?? '',
  defaultProps: ${defaultPropsJson},
  defaultVariants: ${variantsJson},
  slots: ${m}.meta?.slots ?? {},
  wrapper: ${m}.meta?.widget?.wrapper !== false,
  hidden: ${m}.meta?.widget?.hidden === true,
  ui: ${m}.meta?.ui ?? {},
};`);
      index++;
    } else {
      // No .props.ts — basic meta only, no schema
      statements.push(`widgetMeta[${keyJson}] = {
  label: ${JSON.stringify(humanLabel(key))},
  category: ${JSON.stringify(extractWidgetCategory(virtualId))},
  description: '',
  icon: '',
  defaultProps: ${defaultPropsJson},
  defaultVariants: ${variantsJson},
  slots: {},
  wrapper: true,
  hidden: false,
  ui: {},
};`);
    }
  }

  // Structural requirements (V2): warn when a requiring parche expects a prop
  // the provider's schema doesn't expose. Runs where the schemas exist (this
  // module), so it fires for builder/dev; presence + versions are gated earlier
  // in createRegistry for every build.
  const requirementChecks = registry.widgetPropRequirements.map((r) => {
    const nameJson = JSON.stringify(r.name);
    const fromJson = JSON.stringify(r.from);
    const propsJson = JSON.stringify(r.props);
    return `{
  const __s = widgetSchemas[${nameJson}];
  if (__s && __s.properties) {
    const __missing = ${propsJson}.filter((p) => !(p in __s.properties));
    if (__missing.length) console.warn(${JSON.stringify(`[parche] ${r.from} requires widget "${r.name}" to expose prop(s): `)} + __missing.join(', ') + ${JSON.stringify(` — provider "${r.name}" schema does not.`)});
  }
}`;
  });

  return `${imports.join('\n')}

export const widgetSchemas = {};
export const widgetMeta = {};
export const widgetPropSchemas = {};

${statements.join('\n')}

${requirementChecks.join('\n')}
`;
}

/**
 * The names of the props each widget declares, read from that widget's
 * `.props.ts` alone and on demand (`parche:registry/widgetProps`). What a
 * page from a collection needs to hand its widget the entry's fields
 * (utils/collections.ts) without the catalog: `parche:registry/widgetSchemas`
 * imports every widget's schema and turns each into JSON Schema, which is
 * for tools, never for a request.
 */
export function generateWidgetPropsModule(registry: ResolvedRegistry): string {
  const entries: string[] = [];
  for (const [virtualId, filePath] of Object.entries(registry.modules)) {
    if (!virtualId.startsWith('parche:widgets/') || !filePath.endsWith('.astro')) continue;
    const propsPath = filePath.replace(/\.astro$/, '.props.ts');
    if (fs.existsSync(propsPath)) entries.push(`  ${JSON.stringify(extractWidgetKey(virtualId))}: () => import(${JSON.stringify(propsPath)}),`);
  }
  return `const loaders = {
${entries.join('\n')}
};

/** The props a widget declares by name, from its schema; null when it declares none (every field passes). */
export async function propNames(key) {
  const load = loaders[key];
  if (!load) return null;
  const m = await load();
  const shape = m.schema && typeof m.schema === 'object' ? m.schema.shape : undefined;
  return shape && typeof shape === 'object' ? Object.keys(shape) : null;
}
`;
}

/** The files the catalog reads beside each widget, for the dev server to watch. */
export function widgetCatalogWatchFiles(registry: ResolvedRegistry): string[] {
  const files: string[] = [];
  for (const [virtualId, filePath] of Object.entries(registry.modules)) {
    if (!virtualId.startsWith('parche:widgets/') || !filePath.endsWith('.astro')) continue;
    for (const ext of ['.props.ts', '.defaults.json']) {
      const sibling = filePath.replace(/\.astro$/, ext);
      if (fs.existsSync(sibling)) files.push(sibling);
    }
  }
  return files;
}
