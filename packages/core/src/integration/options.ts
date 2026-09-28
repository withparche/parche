import { z } from 'zod';
import { siteConfigSchema, type SiteConfig } from '../types/config.js';
import type { ParcheUserConfig, ParchePreset, ParcheSeoConfig } from './types.js';

/**
 * What `parche({ … })` takes: the options' shape and validation, presets
 * (`extends`), and the split between the integration's options and the
 * site identity given inline. Pure: nothing here touches Astro or the disk.
 */

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

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

// Shape validation for the `parche({ ... })` options. `.strict()` turns a typo'd
// option name (e.g. `parchez`) or a malformed value into a friendly error at
// config time, instead of a deep, cryptic Vite failure later. The `parches`
// array holds manifests (validated structurally by the registry), so it's `any`.
const userConfigSchema = z
  .object({
    overrides: z.record(z.string(), z.string()).optional(),
    config: z.string().optional(),
    parches: z.array(z.any()).optional(),
    transitions: z.boolean().optional(),
    routes: z
      .object({
        pages: z.boolean().optional(),
        templates: z.record(z.string(), z.string()).optional(),
        layouts: z.record(z.string(), z.string()).optional(),
        catchAllRoute: z.string().optional(),
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
    images: z
      .object({
        remote: z.enum(['auto', 'cdn', 'astro', 'none']).optional(),
        cdn: z
          .object({
            hosts: z.array(z.string()).optional(),
            providers: z.record(z.string(), z.string()).optional(),
            fallback: z.string().optional(),
          })
          .strict()
          .optional(),
        layout: z.enum(['constrained', 'full-width', 'fixed']).optional(),
        breakpoints: z.array(z.number().int().positive()).optional(),
        warnUnoptimized: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export function validateUserConfig(userConfig: ParcheUserConfig): void {
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

export interface PreparedConfig {
  /** Integration options only (site data stripped), extends already folded. */
  userConfig: ParcheUserConfig;
  /** Inline site config, when the site identity was given inline. */
  inlineSiteConfig?: SiteConfig;
  /** robots.txt AI-crawler policy. */
  allowAICrawlers: boolean;
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
  const { site, base, brand, metadata, seo, i18n, collections, fonts, config: configPath, ...rest } =
    merged as ParcheConfig & { config?: string };
  const userOpts = rest as ParcheUserConfig;
  // `seo` on the parche() options carries only the robots policy now; the
  // site-wide defaults moved to `metadata`, which is what a page overrides.
  const { allowAICrawlers = true } = (seo ?? {}) as Record<string, unknown>;

  // `brand` is the one required block, so its presence is what marks inline mode
  // — `site` is now just a URL, and a project may legitimately leave it to Astro.
  if (brand) {
    // Inline mode: validate + serve the site identity as parche:config.
    const inlineSiteConfig = siteConfigSchema.parse({ site, base, brand, metadata, i18n, collections, fonts });
    return { userConfig: userOpts, inlineSiteConfig, allowAICrawlers: allowAICrawlers as boolean };
  }

  // Separate-file mode: site identity comes from `config` (or the default
  // ./src/parche.config.json). Only the robots policy is read from seo here.
  if (collections || fonts) {
    throw new Error(
      '[parche] `collections` and `fonts` are site config: with the site config in a file, set them there, not in parche({...}).',
    );
  }
  return {
    userConfig: { ...userOpts, config: configPath },
    allowAICrawlers: allowAICrawlers as boolean,
  };
}

// ---------------------------------------------------------------------------
// Checks the options must pass
// ---------------------------------------------------------------------------

/**
 * Options that only make sense with Parche's page route say so instead of
 * being ignored: a custom catch-all or middleware, and any app that serves
 * pages through a resolver (a blog with posts at the root, collection pages).
 */
export function assertRoutesConsistent(routes: ParcheUserConfig['routes'], resolvers: Array<{ appName: string }>) {
  if (routes?.pages) return;
  const unused = (['catchAllRoute', 'middleware'] as const).filter((k) => routes?.[k]);
  if (unused.length) {
    throw new Error(`[parche] routes.${unused.join(' and routes.')} replace parts of Parche's page route, which is off: add routes: { pages: true }.`);
  }
  if (resolvers.length) {
    throw new Error(
      `[parche] ${[...new Set(resolvers.map((r) => r.appName))].join(', ')} serve pages through Parche's page route (a resolver), which is off: add routes: { pages: true }.`,
    );
  }
}

/**
 * A site under a sub-path (`base`) is not supported yet: the addresses core
 * and the apps build (pages, posts, collection entries, links in content)
 * would all need it, and ignoring it silently shipped broken links.
 */
export function assertBaseSupported(parcheBase: unknown, astroBase: unknown) {
  const set = [parcheBase, astroBase].find((b) => typeof b === 'string' && b !== '' && b !== '/');
  if (set) {
    throw new Error(
      `[parche] base "${set}" is not supported yet: Parche builds every address from the site root. ` +
        'Serve the site at the root of its domain (or a subdomain) for now.',
    );
  }
}
