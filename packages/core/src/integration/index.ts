import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { resolveSiteUrl, resolveI18n } from '../utils/site.js';
import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';
import { vitePluginParche } from './vite-plugin-parche.js';
import { createRegistry } from './registry.js';
import { siteConfigSchema, type SiteConfig } from '../types/config.js';
import type { ParcheUserConfig, ParchePreset, ParcheSeoConfig, UIRegistry, ParcheApp, ParcheManifest, ParcheRequires } from './types.js';

// ---------------------------------------------------------------------------
// Preset composition (`extends`)
// ---------------------------------------------------------------------------

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Deep-merge two config fragments. Objects merge recursively; primitives and
 * arrays are replaced by the override (last wins) — except `parches`, which the
 * caller concatenates. `undefined` on the override never clobbers the base.
 */
function deepMerge<T>(base: T, over: T): T {
  if (over === undefined) return base;
  if (isPlainObject(base) && isPlainObject(over)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(over)) {
      out[key] = deepMerge((base as Record<string, unknown>)[key], (over as Record<string, unknown>)[key]);
    }
    return out as T;
  }
  return over;
}

/** Merge an override config onto a base, concatenating `parches` (base first). */
function mergeConfig(base: ParchePreset, over: ParchePreset): ParchePreset {
  const merged = deepMerge(base, over);
  const baseParches = base.parches ?? [];
  const overParches = over.parches ?? [];
  if (baseParches.length || overParches.length) {
    merged.parches = [...baseParches, ...overParches];
  }
  return merged;
}

/**
 * Identity helper that types and freezes a reusable config fragment for
 * `extends`. Authoring a preset through it gets you inference and a clear
 * boundary; it does no work beyond returning the object.
 */
export function parchePreset(preset: ParchePreset): ParchePreset {
  return preset;
}

/** Fold a config's `extends` chain into a single flat config (presets first). */
export function resolveExtends(userConfig: ParcheUserConfig): ParcheUserConfig {
  if (!userConfig.extends) return userConfig;
  const presets = Array.isArray(userConfig.extends) ? userConfig.extends : [userConfig.extends];
  let base: ParchePreset = {};
  for (const preset of presets) base = mergeConfig(base, preset);
  const { extends: _drop, ...rest } = userConfig;
  return mergeConfig(base, rest) as ParcheUserConfig;
}

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
        default: z.string().optional(),
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

// ---------------------------------------------------------------------------
// Config resolution
// ---------------------------------------------------------------------------

/** Runtime context passed to the function form of `parche()`. */
export interface ParcheConfigContext {
  /** Astro command driving this run. */
  command: 'dev' | 'build' | 'preview' | 'sync';
  /** Convenience alias: 'development' for dev, 'production' otherwise. */
  mode: 'development' | 'production';
  /** Environment variables, for env-based / white-label branching. */
  env: Record<string, string | undefined>;
  /** Tenant id from PARCHE_TENANT (multi-tenant / white-label), if set. */
  tenant: string | undefined;
}

type SiteConfigInput = Parameters<typeof siteConfigSchema.parse>[0];

/**
 * The Parche config object: integration options (parches, routes, themes,
 * styles, overrides, extends) plus, optionally, the site identity inline. Omit
 * the site fields and point `config` at a separate file instead — both styles
 * are equally supported. `seo` carries the site SEO fields and the build-time
 * `allowAICrawlers`.
 */
export type ParcheConfig = Omit<ParcheUserConfig, 'seo'> &
  Partial<Omit<SiteConfigInput, 'seo'>> & {
    seo?: (SiteConfigInput extends { seo?: infer S } ? S : never) & ParcheSeoConfig;
  };

/** `parche()` accepts a config object or a function of the runtime context. */
export type ParcheConfigInput = ParcheConfig | ((ctx: ParcheConfigContext) => ParcheConfig);

interface PreparedConfig {
  /** Integration options only (site data stripped), extends already folded. */
  userConfig: ParcheUserConfig;
  /** Inline site config, when the site identity was given inline. */
  inlineSiteConfig?: SiteConfig;
  /** robots.txt AI-crawler policy. */
  allowAICrawlers: boolean;
}

/**
 * Shared integration body. `prepare` turns the runtime context into the resolved
 * options; everything downstream (registry, route injection, robots.txt) is
 * identical regardless of how the config was authored.
 */
function createIntegration(prepare: (ctx: ParcheConfigContext) => PreparedConfig): AstroIntegration {
  let resolvedSiteUrl = '';
  let allowAICrawlers = true;
  return {
    name: 'parche',
    hooks: {
      'astro:config:setup': ({ command, updateConfig, config, injectRoute, addMiddleware }) => {
        const ctx: ParcheConfigContext = {
          command,
          mode: command === 'dev' ? 'development' : 'production',
          env: process.env,
          tenant: process.env.PARCHE_TENANT,
        };
        const prepared = prepare(ctx);
        const resolved = prepared.userConfig;
        allowAICrawlers = prepared.allowAICrawlers;
        validateUserConfig(resolved);
        // The site URL may live in either config; it must not live in both.
        // In inline mode we can see Parche's at setup, so the conflict fails
        // fast and a Parche-only declaration is pushed into Astro, which needs
        // `site` for canonicals, Open Graph and the sitemap.
        const parcheSiteUrl = prepared.inlineSiteConfig?.site?.url;
        resolvedSiteUrl = resolveSiteUrl(config.site ? String(config.site) : undefined, parcheSiteUrl);
        if (!config.site && parcheSiteUrl) {
          updateConfig({ site: parcheSiteUrl });
        }

        // Same rule for i18n: one declaration, either side.
        const parcheI18n = resolveI18n(config.i18n, (prepared.inlineSiteConfig as any)?.i18n);
        if (parcheI18n) {
          updateConfig({ i18n: parcheI18n });
        }
        const rootDir = fileURLToPath(config.root);
        const resolvedRegistry = createRegistry(resolved, rootDir, parcheI18n ?? config.i18n, prepared.inlineSiteConfig);

        // Resolve @core/* alias for backward compatibility with widget internal imports
        const coreDir = path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          '..',
        );

        const routesDir = path.resolve(coreDir, 'routes');

        // Inject routes only when explicitly enabled via routes.pages: true
        if (resolved.routes?.pages) {
          // Catch-all page route
          injectRoute({
            pattern: '[...slug]',
            entrypoint: resolved.routes?.catchAllRoute
              ?? path.resolve(routesDir, '[...slug].astro'),
          });

          // 404 page
          injectRoute({
            pattern: '404',
            entrypoint: resolved.routes?.notFoundRoute
              ?? path.resolve(routesDir, '404.astro'),
          });

          // Middleware for i18n locale resolution
          addMiddleware({
            entrypoint: resolved.routes?.middleware
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
        processRobotsTxt(dir, resolvedSiteUrl, allowAICrawlers);
      },
    },
  };
}

/**
 * The Parche Astro integration. One entry, two equally supported styles for the
 * site identity:
 *
 *   • Inline — pass `site` (and optionally metadata/seo/organization) right here.
 *     It's validated and served as `parche:config`; no separate file needed.
 *   • Separate file — omit `site` and point `config` at a file (default
 *     `./parche.config.ts` at the project root). The parches stay in
 *     astro.config; everything else lives in that file (authored with
 *     `defineConfig` from `@parche/core/config`).
 *
 * The argument may also be a function of the runtime context
 * (`(ctx) => config`) for env-based / conditional / multi-tenant setups, and any
 * config may `extends` a `parchePreset(...)`.
 *
 * @example
 * // astro.config.mjs
 * import parche from '@parche/core';
 * export default defineConfig({
 *   integrations: [parche({ parches: [createUI()], config: './parche.config.ts', routes: { pages: true } })],
 * });
 */
export default function parche(input: ParcheConfigInput = {}): AstroIntegration {
  return createIntegration((ctx) => prepareParcheConfig(input, ctx));
}

/**
 * Resolve a config input (object or function) into the pieces the integration
 * needs: the integration options, an optional inline site config, and the
 * robots policy. Pure — exported for testing. Folds `extends`, splits the site
 * identity out of the options, and picks inline vs separate-file mode.
 */
export function prepareParcheConfig(
  input: ParcheConfigInput,
  ctx: ParcheConfigContext,
): PreparedConfig {
  const cfg = typeof input === 'function' ? input(ctx) : input;
  // Fold `extends` first (a preset may seed site data or parches), then split
  // the site identity out of the integration options.
  const merged = resolveExtends(cfg as unknown as ParcheUserConfig) as unknown as ParcheConfig;
  const { site, metadata, seo, organization, config: configPath, ...rest } =
    merged as ParcheConfig & { config?: string };
  const userOpts = rest as ParcheUserConfig;
  const { allowAICrawlers = true, ...siteSeo } = (seo ?? {}) as Record<string, unknown>;

  if (site) {
    // Inline mode: validate + serve the site identity as parche:config.
    const inlineSiteConfig = siteConfigSchema.parse({ site, metadata, seo: siteSeo, organization });
    return { userConfig: userOpts, inlineSiteConfig, allowAICrawlers: allowAICrawlers as boolean };
  }

  // Separate-file mode: site identity comes from `config` (or the default
  // ./parche.config.ts). Only the robots policy is read from seo here.
  return {
    userConfig: { ...userOpts, config: configPath },
    allowAICrawlers: allowAICrawlers as boolean,
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

export type { ParcheUserConfig, ParchePreset, UIRegistry, ParcheApp, ParcheManifest, ParcheRequires };
