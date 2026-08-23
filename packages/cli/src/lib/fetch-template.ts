import { cp } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { downloadTemplate } from 'giget';
import type { Source } from './resolve-source.js';

const IGNORE = /(^|[/\\])(node_modules|dist|\.astro|\.git)([/\\]|$)/;

/** Fetch a resolved source into `target` (local copy or giget download). */
export async function fetchTemplate(
  src: Source,
  target: string,
  opts: { ref?: string; force?: boolean } = {},
): Promise<void> {
  if (src.type === 'local') {
    const from = resolve(src.path!.replace(/^~/, homedir()));
    await cp(from, target, { recursive: true, filter: (s) => !IGNORE.test(s) });
    return;
  }

  const specs = [src.spec!, ...(src.fallbackSpec ? [src.fallbackSpec] : [])];
  let lastErr: unknown;
  for (const spec of specs) {
    try {
      await downloadTemplate(opts.ref ? `${spec}#${opts.ref}` : spec, {
        dir: target,
        forceClean: opts.force,
      });

      // giget resolves the repository, not the subdirectory: asking for a path
      // that does not exist downloads the tarball, extracts nothing and reports
      // success. Without this check the scaffolder carries on over an empty
      // directory and still tells the user everything went well.
      if (!existsSync(target) || readdirSync(target).length === 0) {
        throw new Error(`\`${spec}\` resolved to nothing`);
      }
      return;
    } catch (err) {
      lastErr = err;
    }
  }

  // Every source failed. The likeliest cause is a template name that does not
  // exist — often because the two positional arguments were given the other way
  // round — so say that rather than surfacing the last HTTP error alone.
  const tried = specs.map((s) => `  ${s}`).join('\n');
  throw new Error(
    `Could not fetch a template. Tried:\n${tried}\n\n` +
      `Usage: parche astro new [template] [directory] — template first.\n` +
      `Last error: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`,
  );
}
