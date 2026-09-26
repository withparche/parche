#!/usr/bin/env node
/**
 * Design tokens: DTCG JSON in packages/core/tokens/ → CSS in
 * packages/core/src/styles/generated/.
 *
 *   ref.json  → generated/ref.css   --ds-ref-*  + the Tailwind bridge for ramps, radii, shadows
 *   sys.json  → generated/sys.css   --ds-sys-*  light in :root, dark in .dark, + the role bridge
 *   conf.json → generated/conf.css  --ds-conf-*
 *   all       → generated/tokens.json (flat name → value, both modes), tokens.d.ts,
 *               and tokens.meta.json (name → layer, type, group, description)
 *
 * A token's $value may be a CSS string, a number, a fontFamily array, a
 * typography object, or a reference "{group.path.to.token}" that becomes
 * var(--ds-<group>-<path>). Only the reference form is resolved here; values
 * are emitted verbatim so what is in the JSON is what is in the CSS.
 *
 * No dependencies. `node scripts/build-tokens.mjs` writes; `--check` fails
 * when the written files would differ (CI).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'packages/core/tokens');
const out = resolve(root, 'packages/core/src/styles/generated');
const check = process.argv.includes('--check');

const groups = ['ref', 'sys', 'conf'];
const files = Object.fromEntries(groups.map((g) => [g, JSON.parse(readFileSync(resolve(src, `${g}.json`), 'utf8'))]));

/** Walk a DTCG tree; yields { path: ['color','neutral','50'], type, token }. */
function* walk(node, path = [], inherited) {
  if (node && typeof node === 'object' && '$value' in node) {
    yield { path, type: node.$type ?? inherited, token: node };
    return;
  }
  const type = node?.$type ?? inherited;
  for (const [k, v] of Object.entries(node ?? {})) {
    if (k.startsWith('$')) continue;
    yield* walk(v, [...path, k], type);
  }
}

const cssName = (group, path) => `--ds-${group}-${path.join('-')}`;

/** "{ref.color.primary.50}" → "var(--ds-ref-color-primary-50)"; anything else verbatim. */
function ref(value) {
  return String(value).replace(/\{([a-z]+)\.([^}]+)\}/g, (_, g, p) => {
    if (!groups.includes(g)) throw new Error(`Unknown token group in reference {${g}.${p}}`);
    return `var(${cssName(g, p.split('.'))})`;
  });
}

/** One token → [[cssName, cssValue]] (typography expands to four). */
function emit(group, path, type, value) {
  if (type === 'typography') {
    const t = value;
    return [
      [cssName(group, [...path, 'size']), ref(t.fontSize)],
      [cssName(group, [...path, 'weight']), String(t.fontWeight)],
      [cssName(group, [...path, 'tracking']), ref(t.letterSpacing)],
      [cssName(group, [...path, 'leading']), String(t.lineHeight)],
    ];
  }
  if (type === 'fontFamily') {
    const v = Array.isArray(value) ? value.map(ref).join(', ') : ref(value);
    return [[cssName(group, path), v]];
  }
  return [[cssName(group, path), ref(value)]];
}

const flat = { light: {}, dark: {} };
const names = new Set();

function block(selector, decls, comment) {
  const body = decls.map(([n, v]) => `  ${n}: ${v};`).join('\n');
  return `${comment ? `/* ${comment} */\n` : ''}${selector} {\n${body}\n}\n`;
}

// ---- ref ------------------------------------------------------------------
{
  const decls = [];
  const bridge = [];
  for (const { path, type, token } of walk(files.ref)) {
    for (const [n, v] of emit('ref', path, type, token.$value)) {
      decls.push([n, v]);
      names.add(n);
      flat.light[n] = v;
      flat.dark[n] = v;
    }
    // Tailwind bridge: --color-neutral-50 (bg-neutral-50), --radius-md, --shadow-md.
    // Ramps stay reachable for the compat layer; elements never use them.
    const [kind, ...rest] = path;
    if (kind === 'color') bridge.push([`--color-${rest.join('-')}`, `var(${cssName('ref', path)})`]);
    // Radii pass through the conf scale: a theme sets --ds-conf-radius-scale to
    // 0 for square corners or 1.5 for rounder ones without touching the ref values.
    if (kind === 'radius') bridge.push([`--radius-${rest.join('-')}`, `calc(var(${cssName('ref', path)}) * var(--ds-conf-radius-scale))`]);
    if (kind === 'shadow') bridge.push([`--shadow-${rest.join('-')}`, `var(${cssName('ref', path)})`]);
  }
  const css =
    header('ref', 'Reference tokens: ramps, radii, shadows, font stacks.') +
    block(':root', decls) +
    '\n' +
    block('@theme inline', bridge, 'Tailwind bridge: bg-neutral-100, rounded-md, shadow-lg read the ref tokens');
  write('ref.css', css);
}

// ---- sys ------------------------------------------------------------------
{
  const light = [];
  const dark = [];
  const bridge = [];
  for (const { path, type, token } of walk(files.sys)) {
    for (const [n, v] of emit('sys', path, type, token.$value)) {
      light.push([n, v]);
      names.add(n);
      flat.light[n] = v;
      flat.dark[n] = v;
    }
    const d = token.$extensions?.parche?.dark;
    if (d !== undefined) {
      for (const [n, v] of emit('sys', path, type, d)) {
        dark.push([n, v]);
        flat.dark[n] = v;
      }
    }
    if (path[0] === 'color') bridge.push([`--color-${path.slice(1).join('-')}`, `var(${cssName('sys', path)})`]);
    // font-heading and font-body read the font roles. Not mono: its role reads
    // the --font-mono face variable, which a --font-mono bridge would shadow.
    if (path[0] === 'font' && path[1] !== 'mono') bridge.push([`--font-${path[1]}`, `var(${cssName('sys', path)})`]);
  }
  const css =
    header('sys', 'System tokens: colour roles (light and dark), font roles, type styles.') +
    block(':root', light, 'Light') +
    '\n' +
    block('.dark', dark, 'Dark') +
    '\n' +
    block('@theme inline', bridge, 'Tailwind bridge: bg-surface, text-muted, border-border, outline-ring read the roles');
  write('sys.css', css);
}

// ---- tones ----------------------------------------------------------------
// A tone re-declares the sys colour roles for one section. `dark` is the
// dark-mode block scoped to a section; `muted` and `primary` remap roles.
{
  const darkRoles = [];
  for (const { path, type, token } of walk(files.sys)) {
    if (path[0] !== 'color') continue;
    const d = token.$extensions?.parche?.dark;
    if (d !== undefined) darkRoles.push(...emit('sys', path, type, d));
  }
  const role = (name) => `var(--ds-sys-color-${name})`;
  // Scoped to the Section element's hook: elements such as Button and Toast
  // carry a data-tone of their own, and a bare [data-tone] would repaint them.
  const tone = (name) => `.parche-section[data-tone="${name}"]`;
  const css =
    header('tones', 'Section tones: each re-declares the sys colour roles inside a toned Section.') +
    block(tone('dark'), darkRoles, 'The dark-mode roles, scoped to the section') +
    '\n' +
    block(tone('muted'), [['--ds-sys-color-background', role('surface-2')], ['--ds-sys-color-surface', role('background')]], 'A quieter canvas; cards keep the page colour so they still lift') +
    '\n' +
    block(
      tone('primary'),
      [
        ['--ds-sys-color-background', role('primary')],
        ['--ds-sys-color-surface', role('primary-hover')],
        ['--ds-sys-color-surface-2', role('primary-hover')],
        ['--ds-sys-color-surface-hover', role('primary-hover')],
        ['--ds-sys-color-on-surface', role('on-primary')],
        ['--ds-sys-color-text', role('on-primary')],
        ['--ds-sys-color-heading', role('on-primary')],
        ['--ds-sys-color-muted', `color-mix(in oklab, ${role('on-primary')} 80%, ${role('primary')})`],
        ['--ds-sys-color-link', role('on-primary')],
        ['--ds-sys-color-border', `color-mix(in oklab, ${role('on-primary')} 30%, transparent)`],
        ['--ds-sys-color-border-soft', `color-mix(in oklab, ${role('on-primary')} 15%, transparent)`],
        ['--ds-sys-color-ring', role('on-primary')],
      ],
      'The brand colour as canvas, everything on it in on-primary',
    );
  write('tones.css', css);
}

// ---- conf -----------------------------------------------------------------
{
  const decls = [];
  for (const { path, type, token } of walk(files.conf)) {
    for (const [n, v] of emit('conf', path, type, token.$value)) {
      decls.push([n, v]);
      names.add(n);
      flat.light[n] = v;
      flat.dark[n] = v;
    }
  }
  write('conf.css', header('conf', 'Configuration tokens: geometry and rhythm knobs.') + block(':root', decls));
}

// ---- catalog --------------------------------------------------------------
write('tokens.json', JSON.stringify(flat, null, 2) + '\n');
// What a tool shows beside each name (the visual builder's token editor):
// its layer, its type, the group it sits in and what it is for.
{
  const meta = {};
  for (const g of groups) {
    for (const { path, type, token } of walk(files[g])) {
      for (const [n] of emit(g, path, type, token.$value)) {
        meta[n] = { layer: g, type: type ?? null, group: path[0], ...(token.$description ? { description: token.$description } : {}) };
      }
    }
  }
  write('tokens.meta.json', JSON.stringify(meta, null, 2) + '\n');
}
write(
  'tokens.d.ts',
  header('types', 'Every token name, for .props.ts `tokens` lists and the contract test.', '//') +
    `export type DsToken =\n${[...names].map((n) => `  | '${n}'`).join('\n')};\n` +
    `export const dsTokens: readonly DsToken[];\n`,
);
write('tokens.js', header('names', 'Every token name at runtime.', '//') + `export const dsTokens = ${JSON.stringify([...names])};\n`);

function header(name, what, c = '/*') {
  const line = `Generated from packages/core/tokens/*.json by scripts/build-tokens.mjs. Do not edit; run \`pnpm tokens\`.`;
  return c === '//' ? `// ${line}\n// ${what}\n\n` : `/* ${line}\n   ${what} */\n\n`;
}

function write(file, content) {
  const p = resolve(out, file);
  if (check) {
    const current = existsSync(p) ? readFileSync(p, 'utf8') : null;
    if (current !== content) {
      console.error(`[tokens] ${file} is out of date. Run \`pnpm tokens\`.`);
      process.exitCode = 1;
    }
    return;
  }
  mkdirSync(out, { recursive: true });
  writeFileSync(p, content);
}

if (!check) console.log(`[tokens] wrote ${names.size} tokens to ${out.replace(root + '/', '')}`);
