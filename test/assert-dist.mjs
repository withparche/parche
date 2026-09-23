// Build-smoke: assert invariants over each project's dist/ after `pnpm -r build`.
// Catches regressions that a green build wouldn't — client-JS leaks (the
// zero-JS-to-client property), unresolved widgets, the lazy widget catalog, and
// the scoped SSR icon set. Run from the repo root: `node test/assert-dist.mjs`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

// Chunks a browser downloads only when it lacks a platform feature: the
// invoker-commands and Popover API polyfills, and the anchor-positioning
// fallback. Budgeted apart from the eager client JS in every project.
const LAZY = /^(floating-ui|invoker|popover-fn)\./;
const LAZY_MAX = 40_000;

// Baselines measured on a good build; thresholds leave a small margin. The
// eager budget of a site with the ui Header includes the elements the Header
// is built on: Sheet (the dialog element) and Collapsible for the mobile menu,
// Menu and Popover for the desktop navigation (~7 KB together over the
// ~21 KB base, most of which is Astro's ClientRouter).
const PROJECTS = {
  'demos/astrowind': { kind: 'static', clientJsMax: 30_000 },
  'examples/blog': { kind: 'static', clientJsMax: 30_000 },
  'examples/custom-widget': { kind: 'static', clientJsMax: 30_000 },
  'examples/i18n': { kind: 'static', clientJsMax: 30_000 },
  'examples/import-widget': { kind: 'static', clientJsMax: 6_000 },
  'examples/markdown-pages': { kind: 'static', clientJsMax: 30_000 },
  'examples/react': { kind: 'static', skipClientBudget: true }, // ships React islands
  'examples/shadcn': { kind: 'static', skipClientBudget: true }, // ships React islands
  // The SSR examples serve /elements: every interactive element's script.
  'examples/ssr-cloudflare': { kind: 'ssr', clientJsMax: 42_000 },
  'examples/ssr-node': { kind: 'ssr', clientJsMax: 42_000 },
  'examples/themes': { kind: 'static', clientJsMax: 30_000 },
  // The elements playground: every element page must build; the eager budget
  // grows with each interactive element's declared cost (see the elements plan).
  'parches/elements/playground': { kind: 'static', clientJsMax: 42_000 },
  'templates/portfolio': { kind: 'static', clientJsMax: 30_000 },
  'templates/saas-landing': {
    kind: 'ssr',
    clientJsMax: 30_000,
    iconSsrMax: 60_000, // scoped `include` keeps this small (baseline ~28 KB)
    layoutChunkMax: 200_000, // lazy catalog keeps this tiny (baseline ~31 KB); eager was ~2.3 MB
    minWidgetChunks: 2, // widgets must be code-split, not bundled into one chunk
  },
};

const WIDGET_CHUNK = /^(Hero|Hero2|HeroText|Features|Features2|Features3|Pricing|Steps|Steps2|FAQs|CallToAction|Brands|Testimonials|Content|Announcement|Note)\w*_.*\.mjs$/;

const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); };

function jsBytes(dir, match = () => true) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir)
    .filter((f) => f.endsWith('.js') && match(f))
    .reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
}

function checkClientBudget(proj, cfg, dir) {
  const eager = jsBytes(dir, (f) => !LAZY.test(f));
  check(eager <= cfg.clientJsMax, `${proj}: client JS ${eager}B > ${cfg.clientJsMax}B budget (0-JS-to-client regression?)`);
  const lazy = jsBytes(dir, (f) => LAZY.test(f));
  check(lazy <= LAZY_MAX, `${proj}: lazy JS ${lazy}B > ${LAZY_MAX}B budget`);
}

function walkHtml(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

for (const [proj, cfg] of Object.entries(PROJECTS)) {
  const dist = join(ROOT, proj, 'dist');
  if (!existsSync(dist)) {
    failures.push(`${proj}: no dist/ — did the build run?`);
    continue;
  }

  if (cfg.kind === 'ssr') {
    check(existsSync(join(dist, 'server', 'entry.mjs')), `${proj}: dist/server/entry.mjs missing`);

    if (!cfg.skipClientBudget) checkClientBudget(proj, cfg, join(dist, 'client', '_astro'));

    const chunksDir = join(dist, 'server', 'chunks');
    if (existsSync(chunksDir)) {
      const files = readdirSync(chunksDir);
      const icon = files.find((f) => /^Icon_.*\.mjs$/.test(f));
      if (icon && cfg.iconSsrMax) {
        const sz = statSync(join(chunksDir, icon)).size;
        check(sz <= cfg.iconSsrMax, `${proj}: Icon chunk ${sz}B > ${cfg.iconSsrMax}B (icon include regressed?)`);
      }
      const layout = files.find((f) => /^layout_.*\.mjs$/.test(f));
      if (layout && cfg.layoutChunkMax) {
        const sz = statSync(join(chunksDir, layout)).size;
        check(sz <= cfg.layoutChunkMax, `${proj}: layout chunk ${sz}B > ${cfg.layoutChunkMax}B (widget catalog no longer lazy?)`);
      }
      if (cfg.minWidgetChunks) {
        const n = files.filter((f) => WIDGET_CHUNK.test(f)).length;
        check(n >= cfg.minWidgetChunks, `${proj}: ${n} lazy widget chunks (< ${cfg.minWidgetChunks}); widgets may be bundled eagerly`);
      }
    }
  } else {
    const htmls = walkHtml(dist);
    check(htmls.length > 0, `${proj}: no HTML built`);

    if (!cfg.skipClientBudget) checkClientBudget(proj, cfg, join(dist, '_astro'));

    const withMissing = htmls.filter((h) => readFileSync(h, 'utf8').includes('data-parche-missing-widget'));
    check(withMissing.length === 0, `${proj}: ${withMissing.length} page(s) with unresolved widgets`);

    const home = join(dist, 'index.html');
    if (existsSync(home)) {
      const m = readFileSync(home, 'utf8').match(/<title>([^<]*)<\/title>/);
      check(!!m && m[1].trim().length > 0, `${proj}: home has no non-empty <title> (site config not served?)`);
    }
  }
}

if (failures.length) {
  console.error(`\n✗ build-smoke FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ build-smoke passed — ${Object.keys(PROJECTS).length} projects, all invariants held`);
