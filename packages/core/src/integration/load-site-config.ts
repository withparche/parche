import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { SiteConfig } from '../types/config.js';

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
  if (!configPath) return null;

  const absolute = path.resolve(rootDir, configPath);
  if (!fs.existsSync(absolute)) return null;

  try {
    const mod = await nodeImport(pathToFileURL(absolute).href);
    const config = mod.default ?? mod.config;
    return config && typeof config === 'object' ? (config as SiteConfig) : null;
  } catch {
    // Older runtime, or a config that needs a real transform. Not fatal.
    return null;
  }
}
