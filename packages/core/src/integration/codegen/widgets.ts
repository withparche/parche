import type { ResolvedRegistry } from '../types.js';
import { extractWidgetKey } from './shared.js';

/**
 * Generate the widget catalog as LAZY loaders. Each widget is a `() => import()`
 * so Vite code-splits it into its own chunk, loaded only when a rendered section
 * references it — the SSR server never holds the whole catalog resident. Renderers
 * call `loadWidgets(keys)` in their (async) frontmatter to resolve just the
 * components a page uses before rendering synchronously.
 *
 * Elements are not widgets: nothing renders them by key, and a compound
 * element's parts (`Tabs/Panel`, `Menu/Panel`) would collide on a short name.
 * They have their own catalog, `parche:registry/elements`.
 */
export function generateWidgetMapModule(registry: ResolvedRegistry): string {
  const entries: { key: string; importPath: string }[] = [];

  for (const virtualId of Object.keys(registry.modules)) {
    if (virtualId.startsWith('parche:widgets/')) {
      entries.push({ key: extractWidgetKey(virtualId), importPath: virtualId });
    }
  }

  const loaderEntries = entries
    .map((e) => `  ${JSON.stringify(e.key)}: () => import(${JSON.stringify(e.importPath)}),`)
    .join('\n');

  return `export const widgetLoaders = {
${loaderEntries}
};

/** Resolve the given widget keys (deduped) to their components. Keys with no
 *  loader (e.g. the synthetic 'Outlet') are skipped. */
export async function loadWidgets(keys) {
  const out = {};
  await Promise.all(
    [...new Set(keys)].map(async (key) => {
      const loader = widgetLoaders[key];
      if (loader) out[key] = (await loader()).default;
    }),
  );
  return out;
}
`;
}
