import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolveSiteUrl, resolveI18n } from '../utils/site.js';
import { toAstroFonts } from '../config/fonts.js';
import { setDevInfo } from '../dev/info.js';
import { tryLoadSiteConfig, resolveSiteConfigPath } from './load-site-config.js';
import { vitePluginParche } from './vite-plugin-parche.js';
import { createRegistry } from './registry/index.js';
import { assertBaseSupported, assertRoutesConsistent, prepareParcheConfig, validateUserConfig, type ParcheConfigContext, type ParcheConfigInput, type PreparedConfig } from './options.js';
import { injectParcheRoutes, removeCheckOutput } from './routes.js';
import { processRobotsTxt } from './robots.js';
import type { ResolvedRegistry } from './types.js';
import type { ParcheUserConfig, ParchePreset, UIRegistry, ParcheApp, ParcheManifest, ParcheRequires } from './types.js';

/**
 * The integration, hook by hook. What each step does lives beside it:
 * options.ts (what `parche()` takes), registry/ (what the parches provide,
 * merged), codegen/ and vite-plugin-parche.ts (the `parche:*` modules),
 * routes.ts (what is injected), robots.ts (what a build writes last).
 */
function createIntegration(prepare: (ctx: ParcheConfigContext) => PreparedConfig): AstroIntegration {
  let resolvedSiteUrl = '';
  let allowAICrawlers = true;
  // Whether anything will actually produce /sitemap-index.xml. robots.txt
  // must not advertise a file the build never writes.
  let hasSitemap = false;
  // The parches' build-done hooks, collected at setup.
  let buildDone: ResolvedRegistry['buildDone'] = [];
  return {
    name: 'parche',
    hooks: {
      'astro:config:setup': async ({ command, updateConfig, config, injectRoute, addMiddleware }) => {
        const ctx: ParcheConfigContext = {
          command,
          mode: command === 'dev' ? 'development' : 'production',
          env: process.env,
          tenant: process.env.PARCHE_TENANT,
        };
        const prepared = prepare(ctx);
        const resolved = prepared.userConfig;
        allowAICrawlers = prepared.allowAICrawlers;
        hasSitemap = (config.integrations ?? []).some((i) => i?.name === '@astrojs/sitemap');
        validateUserConfig(resolved);
        // The site URL may live in either config; it must not live in both.
        // In inline mode we can see Parche's at setup, so the conflict fails
        // fast and a Parche-only declaration is pushed into Astro, which needs
        // `site` for canonicals, Open Graph and the sitemap.
        // Inline mode hands us the site config directly; separate-file mode needs
        // it read from disk, since the virtual module resolves far too late.
        const rootDirEarly = fileURLToPath(config.root);
        const configFile = resolveSiteConfigPath(rootDirEarly, resolved.config);
        const siteConfig =
          prepared.inlineSiteConfig ?? (await tryLoadSiteConfig(rootDirEarly, resolved.config));
        if (command === 'dev') {
          setDevInfo({
            root: rootDirEarly,
            siteConfigPath: prepared.inlineSiteConfig ? null : configFile,
            siteConfigMode: prepared.inlineSiteConfig ? 'inline' : 'json',
          });
        }
        if (configFile) {
          // Pin the probed file so the registry does not fall back to a .ts path
          // that may not exist — the config can just as well be parche.config.json.
          resolved.config = path.relative(rootDirEarly, configFile) || undefined;
        }
        // A JSON config has no defineConfig call to apply the schema, so serve the
        // validated object rather than the raw file: consumers must see the same
        // defaults whichever format the site chose.
        const servedSiteConfig =
          prepared.inlineSiteConfig ?? (configFile?.endsWith('.json') ? siteConfig ?? undefined : undefined);
        assertBaseSupported((siteConfig as any)?.base, config.base);
        const parcheSiteUrl = (siteConfig as any)?.site;
        resolvedSiteUrl = resolveSiteUrl(config.site ? String(config.site) : undefined, parcheSiteUrl);
        if (!config.site && parcheSiteUrl) {
          updateConfig({ site: parcheSiteUrl });
        }

        // Same rule for i18n: one declaration, either side.
        const parcheI18n = resolveI18n(config.i18n, (siteConfig as any)?.i18n);
        if (parcheI18n) {
          updateConfig({ i18n: parcheI18n });
        }
        const rootDir = fileURLToPath(config.root);
        const resolvedRegistry = createRegistry(resolved, rootDir, parcheI18n ?? config.i18n, servedSiteConfig, fileURLToPath(config.srcDir));
        buildDone = resolvedRegistry.buildDone;
        assertRoutesConsistent(resolved.routes, resolvedRegistry.resolvers);

        // Fonts are data in the config and manifests; Astro needs provider
        // objects, which is code — so Parche builds them here. Same rule as the
        // rest: if the project already set `fonts` in astro.config, that wins and
        // Parche stays out of the way.
        if (!config.fonts?.length && resolvedRegistry.fonts.length > 0) {
          updateConfig({ fonts: toAstroFonts(resolvedRegistry.fonts) });
        }

        // Images: the Image element reads the options from a build constant
        // (elements import nothing from parche:*, so a copied one still works
        // and falls back to the defaults). Astro gets the layout and the
        // breakpoints when its own config sets none, so Markdown images are
        // responsive too.
        const images = resolved.images ?? {};
        const imageLayout = images.layout ?? 'constrained';
        updateConfig({
          image: {
            ...(config.image?.layout ? {} : { layout: imageLayout }),
            ...(images.breakpoints && !config.image?.breakpoints ? { breakpoints: images.breakpoints } : {}),
          },
          vite: {
            define: {
              'import.meta.env.PARCHE_IMAGES': JSON.stringify(JSON.stringify(images)),
              // Measuring Parche itself (bench/, utils/profile.ts): off unless the build runs with PARCHE_PROFILE=1.
              'import.meta.env.PARCHE_PROFILE': JSON.stringify(process.env.PARCHE_PROFILE ?? ''),
              // Content frozen in place (utils/entries.ts), so a widget that mutates its props fails the build instead of changing the next page: on in the test builds.
              'import.meta.env.PARCHE_DEBUG_FREEZE': JSON.stringify(process.env.PARCHE_DEBUG_FREEZE ?? ''),
            },
          },
        });

        injectParcheRoutes({ resolved, registry: resolvedRegistry, command, output: config.output, injectRoute, addMiddleware });

        // Resolve @core/* alias for backward compatibility with widget internal imports
        const coreDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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

      'astro:build:done': async ({ dir, logger }) => {
        removeCheckOutput(dir);
        processRobotsTxt(dir, resolvedSiteUrl, allowAICrawlers, hasSitemap);
        if (process.env.PARCHE_PROFILE === '1') {
          // utils/profile.ts keeps its totals on this process-wide symbol.
          const totals = (globalThis as any)[Symbol.for('parche.profile')] as Map<string, { calls: number; ms: number }> | undefined;
          const rows = [...(totals ?? new Map()).entries()].map(([name, t]) => ({ name, calls: t.calls, ms: Math.round(t.ms) })).sort((a, b) => b.ms - a.ms);
          logger.info(rows.length ? 'profile (ms, calls):\n' + rows.map((r) => `  ${r.name.padEnd(24)} ${String(r.ms).padStart(8)}  ${r.calls}`).join('\n') : 'profile: no spans recorded in this process');
        }
        // Then each parche's own, in order, with its name on what it logs.
        for (const hook of buildDone) {
          await hook.run({ dir, logger: logger.fork(`parche:${hook.name}`) });
        }
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
 *     `./src/parche.config.json`). The parches stay in
 *     astro.config; everything else lives in that file (authored with
 *     `defineConfig` from `@parche/astro/config`).
 *
 * The argument may also be a function of the runtime context
 * (`(ctx) => config`) for env-based / conditional / multi-tenant setups, and any
 * config may `extends` a `parchePreset(...)`.
 *
 * @example
 * // astro.config.mjs
 * import parche from '@parche/astro';
 * export default defineConfig({
 *   integrations: [parche({ parches: [createUI()], config: './src/parche.config.json', routes: { pages: true } })],
 * });
 */
export default function parche(input: ParcheConfigInput = {}): AstroIntegration {
  return createIntegration((ctx) => prepareParcheConfig(input, ctx));
}

export { parchePreset, resolveExtends, prepareParcheConfig, assertRoutesConsistent, assertBaseSupported } from './options.js';
export type { ParcheConfig, ParcheConfigContext, ParcheConfigInput } from './options.js';
export { buildAutoGeneratedRobots } from './robots.js';
export type { ParcheUserConfig, ParchePreset, UIRegistry, ParcheApp, ParcheManifest, ParcheRequires };
