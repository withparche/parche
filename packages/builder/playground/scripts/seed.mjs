// Replace src/content with a fresh copy of ./seed: every test run starts
// from the same files, and what the tests write never reaches git.
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const content = fileURLToPath(new URL('src/content', root));
rmSync(content, { recursive: true, force: true });
cpSync(fileURLToPath(new URL('seed', root)), content, { recursive: true });
console.log('seeded src/content');
