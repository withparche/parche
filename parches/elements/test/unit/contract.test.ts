/**
 * The per-element contract. Every folder under `src/` that is not `_shared`
 * must satisfy these rules, so that docs, eject and copy can all read the
 * folder as the unit. Enforced from the first element; see the plan.
 *
 * Folders still on the legacy `atoms/` layout are skipped until they are
 * rebuilt — the list of what is exempt shrinks to zero by the end of phase 1.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createElements from '../../src/index.ts';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src');
const SEMANTIC_CSS = path.resolve(SRC, '../../../packages/core/src/styles/semantic.css');

/** Raw palette utilities an element must never use: tokens only. */
const RAW_PALETTE =
  /\b(?:bg|text|border|ring|outline|from|via|to|fill|stroke|decoration|divide|placeholder|caret|accent|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|primary|secondary|accent|success|warning|danger)-\d{2,3}\b/;

/** Imports an element folder may use besides relative ones. */
const ALLOWED_IMPORTS = [/^@parche\/elements\/utils$/, /^@parche\/elements\/client$/, /^astro:/, /^astro\//, /^astro$/, /^zod$/, /^astro-icon/];

const manifest = createElements();
const registered = manifest.elements ?? {};

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function folderFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? folderFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

const tokenNames = (() => {
  const css = fs.readFileSync(SEMANTIC_CSS, 'utf8');
  return new Set([...css.matchAll(/--ds-([a-z0-9-]+)\s*:/g)].map((m) => m[1]));
})();

/** Element folders on the new layout: `src/<kebab>/` with a `.props.ts`. */
const folders = Object.entries(registered)
  .map(([name, value]) => {
    const entry = typeof value === 'string' ? value : value.entry;
    const dir = path.dirname(entry);
    return { name, dir, entry, value };
  })
  .filter(({ dir }) => path.basename(dir) !== 'atoms');

test('manifest: every registered element path exists', () => {
  for (const [name, value] of Object.entries(registered)) {
    const entry = typeof value === 'string' ? value : value.entry;
    assert.ok(fs.existsSync(entry), `${name}: entry not found: ${entry}`);
    if (typeof value === 'object') {
      for (const [part, p] of Object.entries(value.parts ?? {})) {
        assert.ok(fs.existsSync(p), `${name}.${part}: part not found: ${p}`);
      }
    }
  }
});

test('manifest: every element folder under src/ is registered', () => {
  const dirs = fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && e.name !== 'atoms')
    .map((e) => e.name);
  const registeredDirs = new Set(folders.map((f) => path.basename(f.dir)));
  for (const d of dirs) assert.ok(registeredDirs.has(d), `folder src/${d}/ is not registered in the manifest`);
});

for (const { name, dir, entry, value } of folders) {
  const slug = kebab(name);
  const files = folderFiles(dir);
  const rel = (f: string) => path.relative(dir, f);
  const astro = files.filter((f) => f.endsWith('.astro') && !rel(f).startsWith('examples/'));
  const propsPath = path.join(dir, `${slug}.props.ts`);
  const elementPath = path.join(dir, `${slug}.element.ts`);

  test(`${name}: folder name is the kebab of the element name`, () => {
    assert.equal(path.basename(dir), slug);
  });

  test(`${name}: has ${slug}.props.ts exporting schema and meta, and a README.md with an example`, async () => {
    assert.ok(fs.existsSync(propsPath), `missing ${slug}.props.ts`);
    const mod = await import(propsPath);
    assert.ok(mod.schema, 'props must export `schema`');
    assert.ok(mod.meta?.element, 'props must export `meta.element`');
    assert.ok(fs.existsSync(path.join(dir, 'README.md')), 'missing README.md');
    const examples = files.filter((f) => rel(f).startsWith('examples/') && f.endsWith('.astro'));
    assert.ok(examples.length > 0, 'missing examples/*.astro');
    assert.ok(fs.existsSync(path.join(dir, 'element.json')), 'missing element.json');
  });

  test(`${name}: compound ⇔ index.ts with named parts; single ⇔ one .astro`, () => {
    const compound = typeof value === 'object' && Object.keys(value.parts ?? {}).length > 0;
    if (compound) {
      assert.equal(path.basename(entry), 'index.ts', 'a compound element\'s entry is index.ts');
      const index = fs.readFileSync(entry, 'utf8');
      for (const part of Object.keys((value as { parts?: Record<string, string> }).parts ?? {})) {
        assert.match(index, new RegExp(`export \\{ default as ${part} \\} from '\\./${part}\\.astro'`), `index.ts must re-export ${part} relatively`);
      }
      assert.doesNotMatch(index, /export default/, 'a compound element has no default export');
    } else {
      assert.ok(entry.endsWith('.astro'), 'a single-part element\'s entry is its .astro');
    }
  });

  test(`${name}: interactive ⇔ ${slug}.element.ts exists ⇔ meta.tag, keyboard and noJs`, async () => {
    const { meta } = await import(propsPath);
    const hasElement = fs.existsSync(elementPath);
    assert.equal(!!meta.element.tag, hasElement, 'meta.tag and the .element.ts file must both exist or both be absent');
    if (hasElement) {
      assert.ok(meta.element.keyboard && Object.keys(meta.element.keyboard).length, 'interactive element needs a keyboard map');
      assert.ok(meta.element.noJs, 'interactive element needs noJs behaviour text');
      assert.equal(meta.element.tag.entry, `./${slug}.element.ts`);
      assert.match(meta.element.tag.name, /^parche-[a-z-]+$/);
      const src = fs.readFileSync(elementPath, 'utf8');
      assert.doesNotMatch(src, /^\s*(?:window|document)\./m, 'no window/document access at module scope');
      const root = astro.find((f) => /(?:Root|^[A-Z][a-zA-Z]+)\.astro$/.test(path.basename(f)) && fs.readFileSync(f, 'utf8').includes('.element.ts'));
      assert.ok(root, 'exactly one .astro (the root) imports the element script');
    }
  });

  test(`${name}: meta.parts match the data-part values the .astro files emit`, async () => {
    const { meta } = await import(propsPath);
    const declared = new Set(meta.element.parts.map((p: { name: string }) => p.name));
    const emitted = new Set<string>();
    for (const f of astro) for (const m of fs.readFileSync(f, 'utf8').matchAll(/data-part="([a-z-]+)"/g)) emitted.add(m[1]);
    assert.deepEqual([...emitted].sort(), [...declared].sort(), 'data-part values and meta.parts must agree');
    assert.ok(declared.size > 0, 'at least one part');
  });

  test(`${name}: tokens exist in semantic.css and no raw palette class is used`, async () => {
    const { meta } = await import(propsPath);
    for (const t of meta.element.tokens) assert.ok(tokenNames.has(t), `unknown token "${t}" (not in semantic.css)`);
    for (const f of files.filter((f) => /\.(astro|ts|css)$/.test(f))) {
      const src = fs.readFileSync(f, 'utf8');
      const hit = src.match(RAW_PALETTE);
      assert.equal(hit, null, `${rel(f)} uses a raw palette class: ${hit?.[0]}`);
    }
  });

  test(`${name}: imports stay inside the folder or on the allow-list (copy-ready)`, () => {
    for (const f of files.filter((f) => /\.(astro|ts)$/.test(f))) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/(?:import|from)\s+['"]([^'"]+)['"]/g)) {
        const spec = m[1];
        if (spec.startsWith('.')) {
          const target = path.resolve(path.dirname(f), spec);
          assert.ok(target.startsWith(dir + path.sep) || target === dir, `${rel(f)} imports outside the folder: ${spec}`);
          continue;
        }
        assert.ok(ALLOWED_IMPORTS.some((re) => re.test(spec)), `${rel(f)} imports "${spec}", not on the allow-list`);
        assert.doesNotMatch(spec, /^parche:/, `${rel(f)} must not import a parche:* virtual module`);
      }
    }
  });

  test(`${name}: element.json lists exactly the folder's files`, () => {
    const manifestPath = path.join(dir, 'element.json');
    const json = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(json.name, slug);
    assert.equal(json.type, 'element');
    const listed = new Set((json.files as Array<{ path: string }>).map((f) => f.path));
    const actual = new Set(files.map(rel).filter((f) => f !== 'element.json'));
    assert.deepEqual([...listed].sort(), [...actual].sort(), 'element.json files must match the folder');
  });
}
