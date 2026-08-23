// Keep every template's dependency versions in step with the repo.
//
// A template cannot use `workspace:*` or `catalog:` — they are pnpm-only, and a
// template's whole job is to be copied somewhere that has neither. So it pins
// concrete versions, which means they drift. This puts the catalog back in
// charge: the catalog stays the single source of truth and this materializes it.
//
//   node scripts/sync-template-deps.mjs            # write the current versions
//   node scripts/sync-template-deps.mjs --check    # fail if anything drifted (CI)
//   node scripts/sync-template-deps.mjs --parche 0.6.0
//
// `@parche/*` ranges follow packages/core's version unless --parche says
// otherwise; everything else follows the catalog in pnpm-workspace.yaml.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TEMPLATES = join(ROOT, 'templates');
const args = process.argv.slice(2);
const check = args.includes('--check');
const parcheArg = args[args.indexOf('--parche') + 1];

const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** The catalog block of pnpm-workspace.yaml, as a plain map. */
function readCatalog() {
  const lines = readFileSync(join(ROOT, 'pnpm-workspace.yaml'), 'utf8').split('\n');
  const out = {};
  let inCatalog = false;
  for (const line of lines) {
    if (/^catalog:\s*$/.test(line)) { inCatalog = true; continue; }
    if (inCatalog && /^\S/.test(line)) break;          // dedented: catalog ended
    const m = inCatalog && line.match(/^\s+"?([@a-z0-9/._-]+)"?:\s*(\S+)\s*$/i);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const catalog = readCatalog();
const parcheVersion =
  parcheArg && !parcheArg.startsWith('--')
    ? parcheArg
    : readJSON(join(ROOT, 'packages/core/package.json')).version;
const parcheRange = `^${parcheVersion.replace(/^\^/, '')}`;

const drift = [];
let written = 0;

for (const name of readdirSync(TEMPLATES)) {
  const pkgPath = join(TEMPLATES, name, 'package.json');
  if (!existsSync(pkgPath)) continue;

  const pkg = readJSON(pkgPath);
  let changed = false;

  for (const field of ['dependencies', 'devDependencies']) {
    for (const [dep, current] of Object.entries(pkg[field] ?? {})) {
      const wanted = dep.startsWith('@parche/') || dep === 'create-parche'
        ? parcheRange
        : catalog[dep];
      if (!wanted || wanted === current) continue;

      drift.push(`${name}: ${dep} ${current} → ${wanted}`);
      pkg[field][dep] = wanted;
      changed = true;
    }
  }

  if (changed && !check) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    written++;
  }
}

if (drift.length === 0) {
  console.log(`✓ templates are in step (@parche/* ${parcheRange})`);
  process.exit(0);
}

for (const line of drift) console.log(`  ${line}`);

if (check) {
  console.error(
    `\n✗ ${drift.length} dependency/ies out of step. Run:\n` +
      `    node scripts/sync-template-deps.mjs\n`,
  );
  process.exit(1);
}

console.log(`\n✓ updated ${written} template(s). Run pnpm install, then build them.`);
