import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import type { ParcheUserConfig, ResolvedRegistry } from './types.js';

type SetupHook = NonNullable<AstroIntegration['hooks']['astro:config:setup']>;
type SetupParams = Parameters<SetupHook>[0];

const routesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'routes');

/**
 * The content check a server build prerenders (routes/check.ts); its file is
 * never shipped. Not under /_parche/, the builder's prefix, which no build
 * may contain (test/assert-dist.mjs): the server's route list names it.
 */
const CHECK_ROUTE = '__parche-check.json';

export function removeCheckOutput(outDir: URL) {
  for (const root of [fileURLToPath(outDir), path.join(fileURLToPath(outDir), 'client')]) {
    const file = path.join(root, CHECK_ROUTE);
    if (fs.existsSync(file)) fs.rmSync(file);
  }
}

/**
 * The routes Parche adds to a site: its page route and middleware when the
 * site turns pages on (`routes.pages`), the content check of a server build,
 * and every app's routes, once per locale unless a route is the site's once.
 */
export function injectParcheRoutes(input: {
  resolved: ParcheUserConfig;
  registry: ResolvedRegistry;
  command: SetupParams['command'];
  output: string | undefined;
  injectRoute: SetupParams['injectRoute'];
  addMiddleware: SetupParams['addMiddleware'];
}): void {
  const { resolved, registry, command, output, injectRoute, addMiddleware } = input;

  // Inject routes only when explicitly enabled via routes.pages: true
  if (resolved.routes?.pages) {
    // Catch-all page route
    injectRoute({
      pattern: '[...slug]',
      entrypoint: resolved.routes?.catchAllRoute
        ?? path.resolve(routesDir, '[...slug].astro'),
    });

    // Middleware for i18n locale resolution
    addMiddleware({
      entrypoint: resolved.routes?.middleware
        ?? path.resolve(routesDir, 'middleware.ts'),
      order: 'pre',
    });

    // A server build renders pages per request, where nothing checks
    // their content: one prerendered route checks them all at build
    // time (routes/check.ts), and its file is removed when it is done.
    if (command === 'build' && output === 'server') {
      injectRoute({ pattern: CHECK_ROUTE, entrypoint: path.resolve(routesDir, 'check.ts'), prerender: true });
    }
  }

  // Inject routes from registered apps (with i18n locale prefixes)
  const nonDefaultLocales = registry.i18n.locales.filter(
    (l) => l !== registry.i18n.defaultLocale,
  );
  for (const app of registry.apps) {
    if (app.routes) {
      for (const route of app.routes) {
        // Default locale route (no prefix)
        injectRoute({ pattern: route.pattern, entrypoint: route.entrypoint });
        // Non-default locale routes (prefixed), unless the route is the site's once.
        if (route.localized === false) continue;
        for (const locale of nonDefaultLocales) {
          injectRoute({ pattern: `${locale}/${route.pattern}`, entrypoint: route.entrypoint });
        }
      }
    }
  }
}
