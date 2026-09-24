#!/usr/bin/env node
/**
 * Moves page and layout content from the section model to the node model:
 *
 *   { widget, props, wrapper: { id, bg, classes } }
 *     → { widget: 'Section', props: { id, tone, width, spacing }, slots: { default: [ { widget, props } ] } }
 *   { widget, props, wrapper: false }   → { widget, props }
 *   { widget: 'layout/Main' }           → { widget: 'Outlet' }
 *   page.template                        → dropped (page templates are gone)
 *
 * The raw-HTML backgrounds become tones: a radial gradient is `glow`, a
 * linear one `gradient`, a dot pattern `dots`. `classes.container` is read for
 * a narrower measure (max-w-3xl → sm, max-w-5xl → md) and a tighter rhythm
 * (py-6 / pt-6 → sm). Anything else in `classes` is dropped and reported.
 *
 * Runs over the paths given (files or directories with src/content), or the
 * repository's demos, templates and examples. Rewrites JSON in place, keeping
 * two-space indentation. Markdown front matter is reported, not rewritten.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const SKIP = new Set(['node_modules', 'dist', '.astro', '.git']);

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP.has(name)) yield* files(p);
    } else if (['.json', '.md', '.yaml', '.yml'].includes(extname(name)) && /[\\/]src[\\/]content[\\/](pages|layouts)[\\/]/.test(p)) {
      yield p;
    }
  }
}

const dropped = [];

function toneFor(bg) {
  if (!bg) return undefined;
  if (/radial-gradient/.test(bg) && !/<svg/.test(bg)) return 'glow';
  if (/linear-gradient/.test(bg)) return 'gradient';
  if (/<pattern|<svg/.test(bg)) return 'dots';
  dropped.push(`unrecognised bg: ${bg.slice(0, 60)}…`);
  return undefined;
}

function fromClasses(classes, file) {
  const out = {};
  const container = typeof classes?.container === 'string' ? classes.container : '';
  if (/max-w-3xl/.test(container)) out.width = 'sm';
  else if (/max-w-5xl|max-w-4xl/.test(container)) out.width = 'md';
  if (/\bpy-0\b|\bpt-0\b/.test(container)) out.spacing = 'none';
  else if (/\bpy-6\b|\bpt-6\b|\bpb-6\b/.test(container)) out.spacing = 'sm';
  for (const key of Object.keys(classes ?? {})) {
    if (key !== 'container') dropped.push(`${file}: classes.${key} dropped`);
  }
  return out;
}

function migrateNode(section, file) {
  if (!section || typeof section !== 'object') return section;
  const { wrapper, ...rest } = section;
  if (rest.widget === 'layout/Main') return { widget: 'Outlet' };
  if (rest.wrapper !== undefined) delete rest.wrapper;
  if (wrapper === undefined || wrapper === false) return rest;
  const props = {};
  if (wrapper.id) props.id = wrapper.id;
  const tone = toneFor(wrapper.bg);
  if (tone) props.tone = tone;
  Object.assign(props, fromClasses(wrapper.classes, file));
  if (wrapper.isDark) props.tone = 'dark';
  if (wrapper.as) dropped.push(`${file}: wrapper.as dropped`);
  return { widget: 'Section', ...(Object.keys(props).length ? { props } : {}), slots: { default: [rest] } };
}

function migrate(data, file) {
  let changed = false;
  if (Array.isArray(data.sections)) {
    const next = data.sections.map((s) => migrateNode(s, file));
    if (JSON.stringify(next) !== JSON.stringify(data.sections)) {
      data.sections = next;
      changed = true;
    }
  }
  if ('template' in data) {
    delete data.template;
    changed = true;
  }
  return changed;
}

const roots = process.argv.slice(2).map((p) => resolve(p));
if (roots.length === 0) roots.push(resolve('demos'), resolve('templates'), resolve('examples'));

let rewritten = 0;
const markdown = [];
for (const root of roots) {
  for (const file of statSync(root).isDirectory() ? files(root) : [root]) {
    if (extname(file) !== '.json') {
      if (/wrapper|layout\/Main|^template:/m.test(readFileSync(file, 'utf8'))) markdown.push(file);
      continue;
    }
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (migrate(data, file)) {
      writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
      rewritten++;
      console.log(`[migrate] ${file}`);
    }
  }
}
console.log(`[migrate] ${rewritten} file(s) rewritten`);
for (const d of [...new Set(dropped)]) console.warn(`[migrate] ${d}`);
for (const m of markdown) console.warn(`[migrate] front matter to edit by hand: ${m}`);
