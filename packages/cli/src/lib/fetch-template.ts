import { cp } from 'node:fs/promises';
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
      return;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}
