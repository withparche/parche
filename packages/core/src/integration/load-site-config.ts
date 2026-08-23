import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { siteConfigSchema } from '../types/config.js';
import type { SiteConfig } from '../types/config.js';

/**
 * Extensions the site config may use, in probe order.
 *
 * JSON is a first-class option on purpose: the whole file is plain data, so a
 * git-based CMS can edit the site's identity, its metadata defaults and its
 * translations without anyone touching TypeScript. That is also why nothing in
 * this config may be a function — it has to survive a round trip through JSON.
 */
const CONFIG_EXTENSIONS = ['.ts', '.json', '.mjs', '.js'] as const;

/** Find the site config file, honouring an explicit path or probing for one. */
export function resolveSiteConfigPath(
  rootDir: string,
  configPath: string | undefined,
): string | null {
  if (configPath) {
    const absolute = path.resolve(rootDir, configPath);
    return fs.existsSync(absolute) ? absolute : null;
  }
  for (const ext of CONFIG_EXTENSIONS) {
    const candidate = path.resolve(rootDir, `parche.config${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Read the site config file at integration setup, when there is one.
 *
 * In separate-file mode the config reaches the app as a virtual module resolved
 * by Vite, which is far too late for anything that has to run in
 * `astro:config:setup` — checking that a value is not declared on both sides,
 * or feeding Parche's own declaration into Astro's config. Importing the file
 * directly is the only way to have it that early.
 *
 * The file is TypeScript, so this depends on the runtime being able to load it:
 * Node strips types on its own from 22.18, and always in 24. Below that the
 * import throws, and the caller simply loses the setup-time checks rather than
 * failing the build — which is exactly the behaviour those projects had before.
 * Nothing else depends on it: the virtual module still serves the real config.
 */
/**
 * A dynamic import Vite will not rewrite.
 *
 * Core's source reaches the integration through Vite's module runner, which
 * claims every `import()` it can see — and by the time this hook runs that
 * runner is closed, so the import fails with "Vite module runner has been
 * closed". Building the import through `new Function` hides it from the
 * transform, so Node's own loader handles the file.
 */
const nodeImport = new Function('specifier', 'return import(specifier);') as (
  specifier: string,
) => Promise<Record<string, unknown>>;

export async function tryLoadSiteConfig(
  rootDir: string,
  configPath: string | undefined,
): Promise<SiteConfig | null> {
  const absolute = resolveSiteConfigPath(rootDir, configPath);
  if (!absolute) return null;

  // JSON carries no defineConfig call, so nothing has applied the schema to it.
  // Parsing here is what gives a CMS-authored file the same defaults and the
  // same validation errors a TypeScript one gets.
  if (absolute.endsWith('.json')) {
    return siteConfigSchema.parse(JSON.parse(fs.readFileSync(absolute, 'utf8'))) as SiteConfig;
  }

  try {
    const mod = await nodeImport(pathToFileURL(absolute).href);
    const config = mod.default ?? mod.config;
    return config && typeof config === 'object' ? (config as SiteConfig) : null;
  } catch {
    // Older runtime, or a config that needs a real transform. Not fatal.
    return null;
  }
}
