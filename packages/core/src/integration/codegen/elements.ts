import fs from 'node:fs';
import type { ResolvedRegistry } from '../types.js';
import { resolveFromCore } from './shared.js';

/**
 * Generate the elements catalog, `parche:registry/elements`:
 *  - `elementSchemas` — JSON Schema per element: `{ root, parts: { Part: … } }`
 *  - `elementMeta`    — the `ElementMeta.element` block + `ui` per element
 *  - `elementIndex`   — `[{ name, parts, interactive, from, dir, overridden }]`
 *
 * Reads each element's `.props.ts` (exports `schema`, optional `parts` with a
 * `schema` each, and `meta`). Like the widget schemas module, every import is a
 * namespace import and every serialization is guarded, so one bad file skips
 * with a warning instead of killing the catalog. Overrides of compound
 * elements are checked here — the only place their module actually loads —
 * for the named parts the original exposed.
 */
export function generateElementsModule(registry: ResolvedRegistry): string {
  const imports: string[] = [`import { z } from ${JSON.stringify(resolveFromCore('zod'))};`];
  const statements: string[] = [];
  const index: string[] = [];
  let i = 0;

  for (const prim of Object.values(registry.elements)) {
    const nameJson = JSON.stringify(prim.name);
    const partNames = Object.keys(prim.parts);
    const virtualId = `parche:elements/${prim.name}`;
    const overridden = registry.overridden[virtualId];

    index.push(`{ name: ${nameJson}, parts: ${JSON.stringify(partNames)}, interactive: false, from: ${JSON.stringify(prim.from)}, dir: ${JSON.stringify(prim.dir)}, overridden: ${JSON.stringify(overridden ?? null)} }`);

    if (prim.props) {
      const m = `p${i}`;
      imports.push(`import * as ${m} from ${JSON.stringify(prim.props)};`);
      // `parts` is optional (single-part elements have none); read it through
      // Reflect.get so Rollup does not warn about a missing named export.
      statements.push(
        `if (${m}.schema) { try { elementSchemas[${nameJson}] = { root: z.toJSONSchema(${m}.schema), parts: {} }; } ` +
        `catch (e) { console.warn(${JSON.stringify(`[parche] Skipped JSON Schema for element "${prim.name}": `)} + ((e && e.message) || e)); } }`,
      );
      statements.push(
        `const ${m}Parts = Reflect.get(${m}, 'parts'); if (${m}Parts && elementSchemas[${nameJson}]) { for (const [part, def] of Object.entries(${m}Parts)) { ` +
        `if (def && def.schema) { try { elementSchemas[${nameJson}].parts[part] = z.toJSONSchema(def.schema); } ` +
        `catch (e) { console.warn(${JSON.stringify(`[parche] Skipped JSON Schema for element "${prim.name}" part `)} + JSON.stringify(part) + ': ' + ((e && e.message) || e)); } } } }`,
      );
      statements.push(
        `if (${m}.meta && ${m}.meta.element) { elementMeta[${nameJson}] = { ...${m}.meta.element, ui: ${m}.meta.ui ?? {} }; ` +
        `const __e = elementIndex.find((e) => e.name === ${nameJson}); if (__e) __e.interactive = !!${m}.meta.element.tag; }`,
      );
      i++;
    }

    // An ejected compound element must keep the original's named parts.
    if (overridden && prim.compound && partNames.length) {
      const o = `o${i}`;
      imports.push(`import * as ${o} from ${JSON.stringify(prim.entry)};`);
      statements.push(
        `for (const __p of ${JSON.stringify(partNames)}) { if (!(__p in ${o})) console.warn(${JSON.stringify(`[parche] override "elements:${prim.name}" is missing export "`)} + __p + '" — widgets that import it will fail.'); }`,
      );
      i++;
    }
  }

  return `${imports.join('\n')}

export const elementSchemas = {};
export const elementMeta = {};
export const elementIndex = [
${index.map((e) => `  ${e},`).join('\n')}
];

${statements.join('\n')}
`;
}

/** The files the catalog reads for each element, for the dev server to watch: its props, its client entries, its README. */
export function elementCatalogWatchFiles(registry: ResolvedRegistry): string[] {
  const files: string[] = [];
  for (const prim of Object.values(registry.elements)) {
    if (prim.props) files.push(prim.props);
    try {
      for (const f of fs.readdirSync(prim.dir)) {
        if (f.endsWith('.element.ts') || f === 'README.md') files.push(`${prim.dir}/${f}`);
      }
    } catch { /* dir may not exist for a bad override; already reported */ }
  }
  return files;
}
