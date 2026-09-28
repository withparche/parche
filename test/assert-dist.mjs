// Build-smoke: assert invariants over each project's dist/ after `pnpm -r build`.
// Catches regressions that a green build wouldn't — client-JS leaks (the
// zero-JS-to-client property), unresolved widgets, the lazy widget catalog, and
// the scoped SSR icon set. Run from the repo root: `node test/assert-dist.mjs`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { sitePages, walkHtml } from './page-js.mjs';

const ROOT = process.cwd();

// Chunks a browser downloads only when it lacks a platform feature: the
// invoker-commands and Popover API polyfills, and the anchor-positioning
// fallback. Budgeted apart from the eager client JS in every project.
const LAZY = /^(floating-ui|invoker|popover-fn)\./;
const LAZY_MAX = 40_000;

// Client JS is budgeted per page: what the heaviest page of a static site
// downloads before it runs (test/page-js.mjs: its module scripts, inline
// modules and every chunk they import statically, once each). Each element's
// script is emitted once and loaded only by pages that render it, so a new
// element costs the pages that use it, not every site; the sum of all chunks
// in _astro/ said nothing about any page.
//
// Measured on a good build, with a margin of about 8%. A page with the ui
// parche starts at ~21 KB: Astro's ClientRouter (~16 KB) and the header's
// elements (Menu, Sheet, Collapsible, Popover on the shared base). The
// heaviest are the pages with the most interactive widgets (the demo's home,
// a post with its table of contents and share, the Calculator page).
// `node test/page-js.mjs <project>` lists the pages, heaviest first.
//
// SSR projects have no built HTML to read: they keep a budget on the total
// of their client chunks (`clientJsMax`).
const PROJECTS = {
  'demos/astrowind': { kind: 'static', pageJsMax: 36_500 }, // 33.7 KB on /
  'examples/blog': { kind: 'static', pageJsMax: 27_500 },
  'examples/custom-widget': { kind: 'static', pageJsMax: 23_500 }, // 21.5 KB
  'examples/i18n': { kind: 'static', pageJsMax: 29_500 }, // 27.3 KB
  'examples/import-widget': { kind: 'static', pageJsMax: 1_000 }, // no JS at all
  'examples/markdown-pages': { kind: 'static', pageJsMax: 23_500 }, // 21.5 KB
  'examples/react': { kind: 'static', skipClientBudget: true }, // ships React islands
  'examples/shadcn': { kind: 'static', skipClientBudget: true }, // ships React islands
  // The SSR examples serve /elements: every interactive element's script.
  'examples/ssr-cloudflare': { kind: 'ssr', clientJsMax: 69_000 },
  'examples/ssr-node': { kind: 'ssr', clientJsMax: 69_000 },
  'examples/themes': { kind: 'static', pageJsMax: 27_500 }, // 25.3 KB
  // The elements playground: one page per element; the heaviest is the
  // Calculator's (its formula reader).
  'parches/elements/playground': { kind: 'static', pageJsMax: 36_500 }, // 33.5 KB on /calculator/
  'templates/portfolio': { kind: 'static', pageJsMax: 18_000 }, // 16.4 KB: the ClientRouter
  'templates/saas-landing': {
    kind: 'ssr',
    clientJsMax: 60_500,
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
  if (cfg.clientJsMax) {
    const eager = jsBytes(dir, (f) => !LAZY.test(f));
    check(eager <= cfg.clientJsMax, `${proj}: client JS ${eager}B > ${cfg.clientJsMax}B budget (0-JS-to-client regression?)`);
  }
  const lazy = jsBytes(dir, (f) => LAZY.test(f));
  check(lazy <= LAZY_MAX, `${proj}: lazy JS ${lazy}B > ${LAZY_MAX}B budget`);
}

function checkPageBudget(proj, cfg, dist) {
  const [heaviest] = sitePages(dist);
  if (!heaviest) return;
  check(
    heaviest.bytes <= cfg.pageJsMax,
    `${proj}: ${heaviest.page} loads ${heaviest.bytes}B of JS (${heaviest.gzip}B gzipped) > ${cfg.pageJsMax}B per-page budget — \`node test/page-js.mjs ${proj}\` lists the pages`,
  );
}

// The visual builder runs only under `astro dev` (parche astro builder): no
// build may carry its routes, its preview markers or its session.
const BUILDER_TRACES = ['/_parche/', '<!--parche-node:', 'parche.builder'];
function builderTraces(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) builderTraces(full, acc);
    else if (/\.(html|m?js|css|json)$/.test(entry.name)) {
      const text = readFileSync(full, 'utf8');
      const hit = BUILDER_TRACES.find((t) => text.includes(t));
      if (hit) acc.push(`${full.slice(ROOT.length + 1)} (${hit})`);
    }
  }
  return acc;
}

for (const [proj, cfg] of Object.entries(PROJECTS)) {
  const dist = join(ROOT, proj, 'dist');
  if (!existsSync(dist)) {
    failures.push(`${proj}: no dist/ — did the build run?`);
    continue;
  }
  const traces = builderTraces(dist);
  check(traces.length === 0, `${proj}: the builder leaked into the build: ${traces.slice(0, 3).join(', ')}`);

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

    if (!cfg.skipClientBudget) {
      checkClientBudget(proj, cfg, join(dist, '_astro'));
      checkPageBudget(proj, cfg, dist);
    }

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
