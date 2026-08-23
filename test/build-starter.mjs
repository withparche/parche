// Starter smoke: scaffold `hello-parche` via the CLI (as real users do), build
// the scaffolded copy against the LOCAL packages, and assert its dist. This is
// the only coverage for the starter — it can't build in place (the `{{ }}`
// placeholders make it invalid, hence its workspace exclusion). Heavy (installs),
// so it's a separate script meant for CI. Run from the repo root.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
// Matched by the `templates/*` workspace glob (only hello-parche is excluded),
// so `pnpm install` links it and `workspace:*` deps resolve to local packages.
const SMOKE = join(ROOT, 'templates', '_starter_smoke');
const LOCK = join(ROOT, 'pnpm-lock.yaml');

const run = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: 'inherit' });
const fail = (msg) => {
  console.error(`✗ starter smoke FAILED: ${msg}`);
  process.exit(1);
};

// The CLI must be built to scaffold.
if (!existsSync(join(ROOT, 'packages/cli/dist/index.js'))) run('pnpm --filter @parche/cli build');

const lockBefore = existsSync(LOCK) ? readFileSync(LOCK, 'utf8') : null;
rmSync(SMOKE, { recursive: true, force: true });

let failure = null;
try {
  // 1. Scaffold from the local template (replaces {{ }} placeholders).
  run(`node packages/cli/dist/index.js astro new ./templates/hello-parche ${SMOKE} --no-install --no-git --yes`);

  // 2. Structural checks: placeholders gone, root config in place, manifest removed.
  const leftover = execSync(`grep -rl '{{' ${SMOKE} || true`).toString().trim();
  if (leftover) failure = `unreplaced placeholders in:\n${leftover}`;
  else if (!existsSync(join(SMOKE, 'parche.config.ts'))) failure = 'parche.config.ts missing at project root';
  else if (existsSync(join(SMOKE, 'parche.template.json'))) failure = 'parche.template.json not removed';

  if (!failure) {
    // 3. Point @parche/* at the local workspace packages, then install + build.
    const pkgPath = join(SMOKE, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    for (const field of ['dependencies', 'devDependencies']) {
      for (const dep of Object.keys(pkg[field] ?? {})) {
        if (dep.startsWith('@parche/')) pkg[field][dep] = 'workspace:*';
      }
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    run('pnpm install --no-frozen-lockfile');
    run(`pnpm --filter ${pkg.name} build`);

    // 4. Assert the built starter: home HTML with a real title, no unresolved
    //    widgets. With a node adapter the prerendered home lands in dist/client/.
    const home = [join(SMOKE, 'dist', 'index.html'), join(SMOKE, 'dist', 'client', 'index.html')].find(
      (p) => existsSync(p),
    );
    if (!home) failure = 'home index.html not produced (dist/ or dist/client/)';
    else {
      const html = readFileSync(home, 'utf8');
      const title = html.match(/<title>([^<]*)<\/title>/);
      if (!title || !title[1].trim()) failure = 'home has no non-empty <title>';
      else if (html.includes('data-parche-missing-widget')) failure = 'home has unresolved widgets';
    }
  }
} catch (e) {
  failure = `command failed: ${e.message}`;
} finally {
  rmSync(SMOKE, { recursive: true, force: true });
  // Restore the lockfile: adding/removing a transient workspace member must not
  // leave the repo dirty.
  if (lockBefore !== null && readFileSync(LOCK, 'utf8') !== lockBefore) {
    writeFileSync(LOCK, lockBefore);
  }
}

if (failure) fail(failure);
console.log('✓ starter smoke passed — hello-parche scaffolds and builds against local packages');
