#!/usr/bin/env node
/**
 * Renames the pre-layered token names to the ref / sys layering:
 *
 *   --color-<family>-<step>                 → --ds-ref-color-<family>-<step>
 *   --ds-color-<role>                       → --ds-sys-color-<role>
 *   --ds-{size,weight,tracking,leading}-<s> → --ds-sys-type-<s>-{size,weight,tracking,leading}
 *   --ds-font-{heading,body}                → --ds-sys-font-{heading,body}
 *
 * The Tailwind bridges (--color-primary, --radius-md, bg-surface …) are not
 * tokens and are left alone. Runs over the paths given, or the whole
 * repository; skips the changelog, the research notes, the token sources and
 * the generated files. Sites and parches outside this repo can run it on their
 * own files: `node scripts/codemod-tokens.mjs src`.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const RULES = [
  [/--color-(neutral|primary|secondary|accent|success|warning|danger)-(\d{2,3})\b/g, '--ds-ref-color-$1-$2'],
  [/--ds-color-/g, '--ds-sys-color-'],
  [/--ds-(size|weight|tracking|leading)-(h1|h2|h3|body|caption|label)\b/g, '--ds-sys-type-$2-$1'],
  [/--ds-font-(heading|body)\b/g, '--ds-sys-font-$1'],
];

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.astro', 'generated', 'tokens', 'docs']);
const SKIP_FILES = new Set(['CHANGELOG.md', 'codemod-tokens.mjs', 'build-tokens.mjs']);
const EXTS = new Set(['.css', '.astro', '.ts', '.tsx', '.mjs', '.js', '.md', '.json', '.yaml', '.yml']);

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* files(p);
    } else if (EXTS.has(extname(name)) && !SKIP_FILES.has(name)) {
      yield p;
    }
  }
}

const roots = process.argv.slice(2).map((p) => resolve(p));
if (roots.length === 0) roots.push(resolve('.'));

let touched = 0;
for (const root of roots) {
  for (const file of statSync(root).isDirectory() ? files(root) : [root]) {
    const before = readFileSync(file, 'utf8');
    let after = before;
    for (const [re, to] of RULES) after = after.replace(re, to);
    if (after !== before) {
      writeFileSync(file, after);
      touched++;
      console.log(`[codemod] ${file}`);
    }
  }
}
console.log(`[codemod] ${touched} file(s) rewritten`);
