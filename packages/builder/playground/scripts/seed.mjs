// Replace src/content with a fresh copy of ./seed, the site config with
// ./site.seed.json, and drop the token values a test saved: every test run
// starts from the same files, and what the tests write never reaches git.
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const content = fileURLToPath(new URL('src/content', root));
rmSync(content, { recursive: true, force: true });
rmSync(fileURLToPath(new URL('src/parche.tokens.json', root)), { force: true });
cpSync(fileURLToPath(new URL('seed', root)), content, { recursive: true });
cpSync(fileURLToPath(new URL('site.seed.json', root)), fileURLToPath(new URL('src/parche.config.json', root)));
console.log('seeded src/content');
