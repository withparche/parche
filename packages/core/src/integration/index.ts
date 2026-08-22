import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';
import { vitePluginParche } from './vite-plugin-parche.js';
import { createRegistry } from './registry.js';
import type { ParcheUserConfig, UIRegistry, ParcheApp, ParcheManifest, ParcheRequires } from './types.js';

// Shape validation for the `parche({ ... })` options. `.strict()` turns a typo'd
// option name (e.g. `parchez`) or a malformed value into a friendly error at
// config time, instead of a deep, cryptic Vite failure later. The `parches`
// array holds manifests (validated structurally by the registry), so it's `any`.
const userConfigSchema = z
  .object({
    overrides: z.record(z.string(), z.string()).optional(),
    config: z.string().optional(),
    parches: z.array(z.any()).optional(),
    routes: z
      .object({
        pages: z.boolean().optional(),
        templates: z.record(z.string(), z.string()).optional(),
        layouts: z.record(z.string(), z.string()).optional(),
        catchAllRoute: z.string().optional(),
        notFoundRoute: z.string().optional(),
        middleware: z.string().optional(),
      })
      .strict()
      .optional(),
    themes: z
      .object({
        available: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
        showPanel: z.boolean().optional(),
      })
      .strict()
      .optional(),
    styles: z.object({ entry: z.string().optional() }).strict().optional(),
    seo: z.object({ allowAICrawlers: z.boolean().optional() }).strict().optional(),
  })
  .strict();

function validateUserConfig(userConfig: ParcheUserConfig): void {
  const result = userConfigSchema.safeParse(userConfig);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`[parche] Invalid parche() options:\n${issues}`);
  }
}

export default function parche(userConfig: ParcheUserConfig = {}): AstroIntegration {
  let resolvedSiteUrl = '';
  return {
    name: 'parche',
    hooks: {
      'astro:config:setup': ({ updateConfig, config, injectRoute, addMiddleware }) => {
        validateUserConfig(userConfig);
        resolvedSiteUrl = config.site ?? '';
        const rootDir = fileURLToPath(config.root);
        const resolvedRegistry = createRegistry(userConfig, rootDir, config.i18n);

        // Resolve @core/* alias for backward compatibility with widget internal imports
        const coreDir = path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          '..',
        );

        const routesDir = path.resolve(coreDir, 'routes');

        // Inject routes only when explicitly enabled via routes.pages: true
        if (userConfig.routes?.pages) {
          // Catch-all page route
          injectRoute({
            pattern: '[...slug]',
            entrypoint: userConfig.routes?.catchAllRoute
              ?? path.resolve(routesDir, '[...slug].astro'),
          });

          // 404 page
          injectRoute({
            pattern: '404',
            entrypoint: userConfig.routes?.notFoundRoute
              ?? path.resolve(routesDir, '404.astro'),
          });

          // Middleware for i18n locale resolution
          addMiddleware({
            entrypoint: userConfig.routes?.middleware
              ?? path.resolve(routesDir, 'middleware.ts'),
            order: 'pre',
          });
        }

        // Inject routes from registered apps (with i18n locale prefixes)
        const nonDefaultLocales = resolvedRegistry.i18n.locales.filter(
          (l) => l !== resolvedRegistry.i18n.defaultLocale,
        );
        for (const app of resolvedRegistry.apps) {
          if (app.routes) {
            for (const route of app.routes) {
              // Default locale route (no prefix)
              injectRoute({ pattern: route.pattern, entrypoint: route.entrypoint });
              // Non-default locale routes (prefixed)
              for (const locale of nonDefaultLocales) {
                injectRoute({ pattern: `${locale}/${route.pattern}`, entrypoint: route.entrypoint });
              }
            }
          }
        }

        updateConfig({
          vite: {
            plugins: [vitePluginParche(resolvedRegistry)],
            resolve: {
              alias: {
                '@core': coreDir,
              },
            },
          },
        });
      },

      'astro:build:done': ({ dir }) => {
        const allowAICrawlers = userConfig.seo?.allowAICrawlers ?? true;
        processRobotsTxt(dir, resolvedSiteUrl, allowAICrawlers);
      },
    },
  };
}

const ROBOTS_MARKER = '# === PARCHE:AUTO-GENERATED';

function processRobotsTxt(outDir: URL, siteUrl: string, allowAICrawlers: boolean) {
  const robotsPath = path.join(fileURLToPath(outDir), 'robots.txt');
  // Also check the static client dir for SSR builds
  const clientDir = path.join(fileURLToPath(outDir), 'client');
  const robotsClientPath = fs.existsSync(clientDir)
    ? path.join(clientDir, 'robots.txt')
    : null;

  const targetPath = fs.existsSync(robotsPath)
    ? robotsPath
    : robotsClientPath && fs.existsSync(robotsClientPath)
      ? robotsClientPath
      : null;

  const generated = buildAutoGeneratedRobots(siteUrl, allowAICrawlers);

  if (targetPath) {
    const content = fs.readFileSync(targetPath, 'utf-8');
    const markerIdx = content.indexOf(ROBOTS_MARKER);
    if (markerIdx !== -1) {
      // Replace everything from the marker onwards
      const before = content.slice(0, markerIdx);
      fs.writeFileSync(targetPath, before + ROBOTS_MARKER + '\n' + generated, 'utf-8');
    }
    // If no marker, don't touch the file — user has full control
  } else {
    // No robots.txt exists — generate a complete one
    const outPath = robotsClientPath
      ? path.join(clientDir, 'robots.txt')
      : robotsPath;
    const fullContent = `User-agent: *\nAllow: /\n\n${ROBOTS_MARKER}\n${generated}`;
    fs.writeFileSync(outPath, fullContent, 'utf-8');
  }
}

function buildAutoGeneratedRobots(siteUrl: string, allowAICrawlers: boolean): string {
  const lines: string[] = [];

  if (!allowAICrawlers) {
    lines.push(
      '',
      '# AI Crawlers',
      'User-agent: GPTBot',
      'Disallow: /',
      '',
      'User-agent: Google-Extended',
      'Disallow: /',
      '',
      'User-agent: CCBot',
      'Disallow: /',
      '',
      'User-agent: anthropic-ai',
      'Disallow: /',
      '',
      'User-agent: ClaudeBot',
      'Disallow: /',
    );
  }

  if (siteUrl) {
    lines.push('', `Sitemap: ${siteUrl.replace(/\/$/, '')}/sitemap-index.xml`);
  }

  return lines.join('\n');
}

export type { ParcheUserConfig, UIRegistry, ParcheApp, ParcheManifest, ParcheRequires };
