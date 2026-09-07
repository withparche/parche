import path from 'node:path';
import fs from 'node:fs';
import { siteConfigSchema } from '../types/config.js';
import type { SiteConfig } from '../types/config.js';

/**
 * The site config is JSON, and lives at `src/parche.config.json`.
 *
 * JSON only, deliberately. Core reads this file during `astro:config:setup` —
 * before Vite exists — so that it can hand `site`, `base` and `i18n` to Astro
 * and catch a value declared on both sides. Reading a TypeScript config means
 * executing it, and Node refuses to strip types from files under
 * `node_modules`, which is exactly where core's own `./config` entrypoint lives
 * once a project installs it. So a `.ts` config failed to load for every real
 * consumer — silently, and the symptom surfaced three steps later as a broken
 * RSS feed — while working fine inside this monorepo, where the package is a
 * symlink and the realpath falls outside `node_modules`. The repo could not
 * reproduce its own bug.
 *
 * Carrying a transpiler to paper over that is a lot of machinery for a file
 * that is plain data by contract: nothing in it may be a function, an import or
 * a class instance, because a git-based CMS has to be able to edit it.
 */
const CONFIG_FILENAME = 'parche.config.json';

/** Formats that used to be probed. Found now, they are reported, not ignored. */
const LEGACY_EXTENSIONS = ['.ts', '.mjs', '.js'] as const;

function legacyCandidates(rootDir: string): string[] {
  const found: string[] = [];
  for (const dir of [path.resolve(rootDir, 'src'), rootDir]) {
    for (const ext of LEGACY_EXTENSIONS) {
      const candidate = path.join(dir, `parche.config${ext}`);
      if (fs.existsSync(candidate)) found.push(candidate);
    }
  }
  return found;
}

/**
 * Find the site config file, honouring an explicit path or probing for one.
 *
 * Probes `src/parche.config.json` first, then the project root, which is where
 * it used to live. Throws rather than returning null whenever something is
 * clearly meant to be the config but cannot be used — a `.ts` file, or a copy
 * in both places. A config that fails to load is why `site` goes missing, and
 * that has to be loud.
 */
export function resolveSiteConfigPath(
  rootDir: string,
  configPath: string | undefined,
): string | null {
  if (configPath) {
    const absolute = path.resolve(rootDir, configPath);
    if (!absolute.endsWith('.json')) {
      throw new Error(
        `[parche] The site config must be JSON, but \`config\` points at "${configPath}".\n` +
          `  Convert it to ${CONFIG_FILENAME} — it is plain data, so the contents carry over as-is.`,
      );
    }
    return fs.existsSync(absolute) ? absolute : null;
  }

  const inSrc = path.resolve(rootDir, 'src', CONFIG_FILENAME);
  const atRoot = path.resolve(rootDir, CONFIG_FILENAME);
  const found = [inSrc, atRoot].filter((f) => fs.existsSync(f));

  if (found.length > 1) {
    throw new Error(
      `[parche] Two site configs found:\n` +
        found.map((f) => `  - ${path.relative(rootDir, f)}`).join('\n') +
        `\n  Keep one. src/${CONFIG_FILENAME} is the home.`,
    );
  }
  if (found.length === 1) return found[0];

  const legacy = legacyCandidates(rootDir);
  if (legacy.length > 0) {
    throw new Error(
      `[parche] The site config must be JSON. Found ${legacy
        .map((f) => `"${path.relative(rootDir, f)}"`)
        .join(', ')}, which core cannot read.\n` +
        `  Rename it to src/${CONFIG_FILENAME} and drop the defineConfig() wrapper —\n` +
        `  the object inside it is already plain data, so nothing else changes.`,
    );
  }

  return null;
}

/**
 * Read the site config file, when there is one.
 *
 * In separate-file mode the config also reaches the app as a virtual module
 * resolved by Vite, which is far too late for anything that has to run in
 * `astro:config:setup`. Reading it here is what makes those checks possible.
 *
 * Nothing has applied the schema to the raw file, so parsing it here is what
 * gives a CMS-authored config the same defaults and the same validation errors
 * that `defineConfig` used to provide.
 */
export async function tryLoadSiteConfig(
  rootDir: string,
  configPath: string | undefined,
): Promise<SiteConfig | null> {
  const absolute = resolveSiteConfigPath(rootDir, configPath);
  if (!absolute) return null;

  return siteConfigSchema.parse(JSON.parse(fs.readFileSync(absolute, 'utf8'))) as SiteConfig;
}
