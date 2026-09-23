import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The CLI's own version, read from its package.json at run time so it can
 * never drift from what was published. Walks up from this module: the built
 * files sit in `dist/` and `dist/lib/`, the sources in `src/lib/`.
 */
function read(): string {
  const require = createRequire(import.meta.url);
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const file = join(dir, 'package.json');
    if (existsSync(file)) {
      try {
        const pkg = require(file) as { name?: string; version?: string };
        if (pkg.name === '@parche/cli' && pkg.version) return pkg.version;
      } catch {}
    }
    dir = dirname(dir);
  }
  return '0.0.0';
}

export const version = read();
