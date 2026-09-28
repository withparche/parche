import type { ResolvedRegistry } from '../types.js';

/** `urlFor(collection)`: the function that gives an entry of that collection its address, or undefined. */
export function generateEntryUrlsModule(registry: ResolvedRegistry): string {
  const entries = Object.entries(registry.entryUrls ?? {}).map(([name, file]) => `  ${JSON.stringify(name)}: () => import(${JSON.stringify(file)}),`);
  return `const modules = {\n${entries.join('\n')}\n};
const loaded = {};
export async function urlFor(collection) {
  const load = modules[collection];
  if (!load) return undefined;
  return (loaded[collection] ??= (await load()).default);
}
`;
}

/**
 * The module that aggregates the apps' resolvers, `parche:registry/resolvers`:
 * `resolveContent(slug, locale, opts)` asks each in turn, `getResolverPaths`
 * lists every address for a static build, and `routeFor` + `resolveRoute`
 * give a server the same lookup a build made.
 */
export function generateResolversModule(registry: ResolvedRegistry): string {
  if (registry.resolvers.length === 0) {
    return `
export async function resolveContent() { return null; }
export async function getResolverPaths() { return []; }
export async function routeFor() { return null; }
export async function resolveRoute() { return null; }
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

// The addresses the resolvers serve, from the lists they give a static
// build, read once per server (never in development, where content
// changes): a request is one lookup, and the resolver gets the key and the
// locale it listed, exactly as a built page does. The first to list an
// address keeps it, as in a build.
async function routes(locales, defaultLocale, opts) {
  const map = new Map();
  for (const [i, r] of resolvers.entries()) {
    for (const p of await r.getPaths(locales, defaultLocale, opts)) {
      const slug = p.params.slug ?? '';
      if (!map.has(slug)) map.set(slug, { resolver: i, key: p.props?.resolverSlug ?? slug, locale: p.props?.resolverLocale });
    }
  }
  return map;
}
let cached = null;
export async function routeFor(slug, locales, defaultLocale, opts) {
  const map = await (import.meta.env.PROD ? (cached ??= routes(locales, defaultLocale, opts)) : routes(locales, defaultLocale, opts));
  return map.get(slug ?? '') ?? null;
}
export async function resolveRoute(route, locale, opts) {
  return resolvers[route.resolver].resolve(route.key, locale, opts);
}
`;
}
