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
 * Then every node's props move to the common vocabulary (VOCABULARY below):
 * the things a section lists are `items`, buttons are `actions`, a text link
 * is `link`, the arrangement is `layout`, a form posts to `endpoint` with a
 * `submit` label, and the simple inline HTML in short texts becomes inline
 * Markdown. Every step is idempotent: running it twice changes nothing.
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
    } else if (['.json', '.md', '.yaml', '.yml'].includes(extname(name)) && /[\\/]src[\\/]content[\\/](pages|layouts|presets)[\\/]/.test(p)) {
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

/**
 * Widgets that merged into one: the old name becomes the new one with a
 * `layout`, and props that changed shape are rewritten.
 */
const RENAMES = {
  Hero2: (props) => ({ widget: 'Hero', props: { layout: 'split', ...props } }),
  Features2: (props) => ({ widget: 'Features', props: { style: 'cards', ...stripItemClasses(props) } }),
  Features3: ({ isBeforeContent, isAfterContent, ...props }) => ({ widget: 'Features', props: { style: 'list', ...stripItemClasses(props) } }),
  Features: (props) => ({ widget: 'Features', props: stripItemClasses(props) }),
  Steps: ({ isReversed, ...props }) => ({ widget: 'Steps', props: { layout: props.image ? 'timeline' : 'grid', ...props, ...(isReversed ? { reversed: true } : {}) } }),
  Steps2: ({ isReversed, ...props }) => ({ widget: 'Steps', props: { layout: 'numbered', ...props, ...(isReversed ? { reversed: true } : {}) } }),
  // Proof shapes: a number says where it comes from, a quote who said it.
  Stats: (props) => ({
    widget: 'Stats',
    props: !props.stats ? props : {
      ...props,
      stats: props.stats.map(({ amount, title, ...rest }) => ({ value: amount ?? '', label: title ?? '', ...rest })),
    },
  }),
  Testimonials: (props) => ({
    widget: 'Testimonials',
    props: !props.testimonials ? props : {
      ...props,
      testimonials: props.testimonials.map(({ testimonial, job, image, ...rest }) => ({
        ...rest,
        // Only the legacy field moves: a quote already in the new shape keeps its text.
        ...(testimonial !== undefined ? { text: testimonial } : {}),
        ...(job ? { role: job } : {}),
        ...(image?.src ? { avatar: { src: image.src, alt: image.alt ?? '' } } : {}),
      })),
    },
  }),
  Content: ({ isReversed, isAfterContent, ...props }) => ({ widget: 'Content', props: { ...props, ...(isReversed ? { reversed: true } : {}) } }),
  'layout/Header': (props) => ({ widget: 'Header', props }),
  'layout/Footer': (props) => ({ widget: 'Footer', props }),
  HeroText: ({ callToAction, callToAction2, ...props }) => ({
    widget: 'Hero',
    props: {
      layout: 'text',
      ...props,
      actions: [
        ...(callToAction?.text ? [{ ...callToAction, variant: 'primary' }] : []),
        ...(callToAction2?.text ? [{ ...callToAction2, variant: 'secondary' }] : []),
      ],
    },
  }),
};

/**
 * Renames `from` to `to` in place, keeping the key where the author put it,
 * unless `to` is already set; drops `from` either way.
 */
function move(props, from, to, map = (v) => v) {
  if (!(from in props)) return props;
  const keep = !(to in props) && props[from] !== undefined;
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    if (k !== from) out[k] = v;
    else if (keep) {
      const mapped = map(v);
      if (mapped !== undefined) out[to] = mapped;
    }
  }
  return out;
}

/** A single legacy `callToAction` becomes a one-button `actions` list. */
const toActions = (cta) => (cta && (cta.text || cta.icon) ? [cta] : []);
const mapList = (list, fn) => (Array.isArray(list) ? list.map(fn) : list);

/**
 * The common vocabulary, per widget. Each entry takes props and returns props;
 * props already in the new shape pass through unchanged.
 */
const VOCABULARY = {
  Features: (p) => {
    const next = move(p, 'style', 'layout');
    return {
      ...next,
      ...(next.items ? { items: mapList(next.items, (i) => move(i, 'callToAction', 'link', (c) => (c?.text ? { text: c.text, href: c.href ?? '#' } : undefined))) } : {}),
    };
  },
  Stats: (p) => move(p, 'stats', 'items'),
  Testimonials: (p) => move(move(p, 'testimonials', 'items'), 'callToAction', 'actions', toActions),
  Team: (p) => move(p, 'members', 'items'),
  Timeline: (p) => move(p, 'entries', 'items'),
  Projects: (p) => {
    const next = move(p, 'projects', 'items');
    return next.items
      ? { ...next, items: mapList(next.items, (item) => move(item, 'links', 'actions', (links) => links.map(({ label, ...l }) => ({ ...l, text: label })))) }
      : next;
  },
  Pricing: (p) => {
    const next = move(p, 'prices', 'items');
    if (!Array.isArray(next.items)) return next;
    return {
      ...next,
      items: next.items.map((plan) => {
        let out = move(plan, 'callToAction', 'actions', toActions);
        out = move(out, 'hasRibbon', 'recommended');
        out = move(out, 'ribbonTitle', 'badge');
        if (Array.isArray(out.items) && !out.features) {
          out = move(out, 'items', 'features', (items) => items.map((f) => (typeof f === 'string' ? f : f.description ?? f.title ?? '')).filter(Boolean));
        }
        if (out.recommended === false) delete out.recommended;
        return out;
      }),
    };
  },
  Showcase: (p) => {
    const next = move(p, 'demos', 'items');
    return next.items ? { ...next, items: mapList(next.items, (d) => move(d, 'body', 'description')) } : next;
  },
  Cases: (p) => (p.items ? { ...p, items: mapList(p.items, (c) => move(c, 'summary', 'description')) } : p),
  Content: (p) => move(p, 'callToAction', 'actions', toActions),
  Steps: (p) => move(p, 'callToAction', 'actions', toActions),
  Contact: (p) => move(move(move(p, 'action', 'endpoint'), 'button', 'submit'), 'description', 'note'),
  Newsletter: (p) => move(move(move(p, 'text', 'subtitle'), 'action', 'endpoint'), 'button', 'submit'),
  BlogLatestPosts: blogLink,
  BlogHighlightedPosts: blogLink,
};

function blogLink(p) {
  const { linkText, linkUrl, ...rest } = move(p, 'information', 'subtitle');
  if (linkText === undefined && linkUrl === undefined) return rest;
  if (linkText === '') return { ...rest, link: false };
  return { ...rest, link: { text: linkText ?? 'View all posts', ...(linkUrl ? { href: linkUrl } : {}) } };
}

function vocabulary(node) {
  const to = VOCABULARY[node.widget];
  return to && node.props ? { ...node, props: textToMarkdown(to(node.props)) } : node.props ? { ...node, props: textToMarkdown(node.props) } : node;
}

/**
 * Short texts accept inline Markdown now, so the HTML authors wrote to stress
 * a word becomes Markdown: a highlight span is ==x==, a mono span `x`, a
 * semibold span **x**, a <br> a newline. Anything else is left as written.
 */
const TEXT_KEYS = new Set(['tagline', 'title', 'subtitle', 'description', 'note', 'text']);
function toMarkdown(value) {
  return value
    .replace(/<span class=['"]text-highlight['"]>([^<]*)<\/span>/g, '==$1==')
    .replace(/<span class=['"]font-mono[^'"]*['"]>([^<`]*)<\/span>/g, '`$1`')
    .replace(/<span class=['"]font-semibold['"]>([^<*]*)<\/span>/g, '**$1**')
    .replace(/\s*<br\s*\/?>\s*/g, '\n');
}
function textToMarkdown(value, key) {
  if (typeof value === 'string') return TEXT_KEYS.has(key) ? toMarkdown(value) : value;
  if (Array.isArray(value)) return value.map((v) => textToMarkdown(v, key === 'features' ? 'text' : undefined));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, textToMarkdown(v, k)]));
  return value;
}

/** Per-item `classes` overrides are gone: the look is the widget's style. */
function stripItemClasses(props) {
  if (!Array.isArray(props.items)) return props;
  return { ...props, items: props.items.map(({ classes, ...item }) => item) };
}

function rename(node) {
  const to = RENAMES[node.widget];
  if (!to) return node;
  const { widget, props } = to(node.props ?? {});
  return { ...node, widget, props };
}

function migrateNode(section, file) {
  if (!section || typeof section !== 'object') return section;
  const { wrapper, ...rest } = section;
  if (rest.widget === 'layout/Main') return { widget: 'Outlet' };
  if (rest.wrapper !== undefined) delete rest.wrapper;
  Object.assign(rest, vocabulary(rename(rest)));
  for (const [name, list] of Object.entries(rest.slots ?? {})) {
    if (Array.isArray(list)) rest.slots[name] = list.map((n) => migrateNode(n, file));
  }
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
  // Page sections, a preset's tree, and nodes in a page's named outlets.
  const lists = [
    [data, 'sections'],
    [data, 'tree'],
    ...Object.keys(data.slots ?? {}).map((name) => [data.slots, name]),
  ];
  for (const [owner, key] of lists) {
    if (!Array.isArray(owner[key])) continue;
    // Snapshot first: a nested rewrite mutates the slot arrays in place.
    const before = JSON.stringify(owner[key]);
    const next = owner[key].map((s) => migrateNode(s, file));
    if (JSON.stringify(next) !== before) {
      owner[key] = next;
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

/** What the previous models look like in YAML or front matter, which is reported rather than rewritten. */
const OLD_SHAPES = /wrapper|layout\/Main|^template:|^\s*-?\s*(stats|testimonials|members|entries|projects|prices|demos|callToAction|hasRibbon|ribbonTitle|linkText|linkUrl|information):/m;

let rewritten = 0;
const markdown = [];
for (const root of roots) {
  for (const file of statSync(root).isDirectory() ? files(root) : [root]) {
    if (extname(file) !== '.json') {
      if (OLD_SHAPES.test(readFileSync(file, 'utf8'))) markdown.push(file);
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
for (const m of markdown) console.warn(`[migrate] YAML or front matter to edit by hand: ${m}`);
