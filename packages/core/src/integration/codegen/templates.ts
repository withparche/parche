import type { ResolvedRegistry } from '../types.js';
import { extractTemplateKey } from './shared.js';

/**
 * The templates the apps register, as LAZY loaders by name, like the
 * widgets: a route loads the one a resolver names, and nothing else comes
 * with it. Imported eagerly, every template (and every widget, element and
 * icon set it uses) sat in the page route's closure, loaded on every cold
 * start of a server whether a request needed a template or not.
 */
export function generateTemplateMapModule(registry: ResolvedRegistry): string {
  const entries = Object.keys(registry.modules)
    .filter((virtualId) => virtualId.startsWith('parche:templates/'))
    .map((virtualId) => `  ${JSON.stringify(extractTemplateKey(virtualId))}: () => import(${JSON.stringify(virtualId)}),`);

  return `export const templateLoaders = {
${entries.join('\n')}
};

/** The template a resolver names, loaded on demand; undefined when no parche registers it. */
export async function loadTemplate(name) {
  const load = templateLoaders[name];
  return load ? (await load()).default : undefined;
}
`;
}
