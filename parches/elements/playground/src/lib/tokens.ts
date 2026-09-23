/**
 * The design system as data, read from the real stylesheets at build time so
 * the pages document what ships and nothing else. A small CSS block parser
 * is enough: the token files are flat `selector { --name: value; }` blocks.
 */
import tokensCss from '../../../../../packages/core/src/styles/tokens.css?raw';
import semanticCss from '../../../../../packages/core/src/styles/semantic.css?raw';
import shadcnCss from '../../../../../packages/core/src/styles/shadcn-compat.css?raw';
import astrowindCss from '../../../../themes/src/astrowind.css?raw';
import corporateCss from '../../../../themes/src/corporate.css?raw';
import minimalCss from '../../../../themes/src/minimal.css?raw';
import playfulCss from '../../../../themes/src/playful.css?raw';
import startupCss from '../../../../themes/src/startup.css?raw';

export interface Block {
  selector: string;
  declarations: Record<string, string>;
  /** The comment right above a declaration, when there is one. */
  comments: Record<string, string>;
}

/** Top-level rule blocks with their custom properties; nested rules are skipped. */
export function parseBlocks(css: string): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const selector = css
      .slice(i, open)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim()
      .split(/[;}]/)
      .pop()!
      .trim();
    // find the matching close brace
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    const declarations: Record<string, string> = {};
    const comments: Record<string, string> = {};
    let pending = '';
    // only the top level of the body: strip nested blocks first
    const flat = body.replace(/[^{}]*\{[\s\S]*?\}/g, (m) => (m.includes('{') ? '' : m));
    for (const raw of flat.split('\n')) {
      const line = raw.trim();
      const comment = line.match(/^\/\*\s*(.*?)\s*\*\/$/);
      if (comment) {
        pending = comment[1];
        continue;
      }
      const decl = line.match(/^(--[a-z0-9-]+)\s*:\s*([^;]+);?\s*(?:\/\*\s*(.*?)\s*\*\/)?$/i);
      if (decl) {
        declarations[decl[1]] = decl[2].trim();
        if (decl[3]) comments[decl[1]] = decl[3];
        else if (pending) comments[decl[1]] = pending;
        pending = '';
      } else if (line === '') {
        pending = '';
      }
    }
    if (Object.keys(declarations).length) blocks.push({ selector, declarations, comments });
    i = j;
  }
  return blocks;
}

const tokens = parseBlocks(tokensCss);
const semantic = parseBlocks(semanticCss);
const shadcn = parseBlocks(shadcnCss);

const find = (blocks: Block[], test: (s: string) => boolean) => blocks.filter((b) => test(b.selector));
const merge = (blocks: Block[]) => Object.assign({}, ...blocks.map((b) => b.declarations)) as Record<string, string>;
const mergeComments = (blocks: Block[]) => Object.assign({}, ...blocks.map((b) => b.comments)) as Record<string, string>;

/** Layer 1: the raw OKLCH ramps, `--color-<family>-<step>`. */
export const families = ['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'danger'] as const;
export const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;
const rampRoot = merge(find(tokens, (s) => s === ':root'));
export const ramps = families.map((family) => ({
  family,
  steps: steps.map((step) => ({ step, value: rampRoot[`--color-${family}-${step}`] ?? '' })),
}));

/** Layer 1 too: radii and shadows, from the `@theme` block. */
const themeBlock = merge(find(tokens, (s) => s === '@theme'));
export const radii = Object.entries(themeBlock).filter(([k]) => k.startsWith('--radius-')).map(([name, value]) => ({ name, value }));
export const shadows = Object.entries(themeBlock).filter(([k]) => k.startsWith('--shadow-')).map(([name, value]) => ({ name, value }));

/** Layer 2: the semantic roles, light and dark, with the comment beside each. */
const light = merge(find(semantic, (s) => s === ':root'));
const dark = merge(find(semantic, (s) => s === '.dark'));
const lightComments = mergeComments(find(semantic, (s) => s === ':root'));
const darkComments = mergeComments(find(semantic, (s) => s === '.dark'));
const bridge = merge(find(semantic, (s) => s === '@theme inline'));

export interface Role {
  name: string; // --ds-color-primary
  short: string; // primary
  utility: string; // bg-primary / text-primary
  light: string;
  dark: string;
  note?: string;
}

export const colorRoles: Role[] = Object.keys(light)
  .filter((k) => k.startsWith('--ds-color-'))
  .map((name) => {
    const short = name.replace('--ds-color-', '');
    const bridged = Object.entries(bridge).find(([, v]) => v === `var(${name})`)?.[0]?.replace('--color-', '');
    return { name, short, utility: bridged ?? '', light: light[name], dark: dark[name] ?? '', note: lightComments[name] ?? darkComments[name] };
  });

/** Contrast pairs the elements rely on: foreground on background, with the WCAG target. */
export const contrastPairs: Array<{ fg: string; bg: string; target: number; where: string; advisory?: boolean }> = [
  { fg: 'text', bg: 'background', target: 4.5, where: 'body copy' },
  { fg: 'heading', bg: 'background', target: 3, where: 'headings (large text)' },
  { fg: 'muted', bg: 'background', target: 4.5, where: 'secondary copy' },
  { fg: 'muted', bg: 'surface', target: 4.5, where: 'secondary copy on cards' },
  { fg: 'on-surface', bg: 'surface', target: 4.5, where: 'text on cards' },
  { fg: 'on-primary', bg: 'primary', target: 4.5, where: 'primary buttons' },
  { fg: 'primary', bg: 'background', target: 4.5, where: 'links, ghost buttons' },
  { fg: 'primary', bg: 'primary-soft', target: 4.5, where: 'primary badges' },
  { fg: 'highlight', bg: 'background', target: 4.5, where: 'highlighted words' },
  { fg: 'on-success', bg: 'success', target: 4.5, where: 'success buttons' },
  { fg: 'success', bg: 'success-soft', target: 4.5, where: 'success badges' },
  { fg: 'success', bg: 'background', target: 4.5, where: 'success text' },
  { fg: 'on-warning', bg: 'warning', target: 4.5, where: 'warning buttons' },
  { fg: 'warning', bg: 'warning-soft', target: 4.5, where: 'warning badges' },
  { fg: 'on-danger', bg: 'danger', target: 4.5, where: 'danger buttons' },
  { fg: 'danger', bg: 'danger-soft', target: 4.5, where: 'danger badges' },
  { fg: 'danger', bg: 'background', target: 4.5, where: 'error messages' },
  // Decorative borders have no requirement; the same role draws the boundary
  // of inputs and checkboxes, where WCAG 1.4.11 asks 3:1. Reported, not failed.
  { fg: 'border', bg: 'background', target: 3, where: 'form control boundaries (1.4.11)', advisory: true },
  { fg: 'ring', bg: 'background', target: 3, where: 'focus ring (non-text)' },
];

/** Layer 2: typography, six styles × four tokens, plus the two font roles. */
export const typeStyles = ['h1', 'h2', 'h3', 'body', 'caption', 'label'] as const;
export const typography = typeStyles.map((style) => ({
  style,
  size: light[`--ds-size-${style}`] ?? '',
  weight: light[`--ds-weight-${style}`] ?? '',
  tracking: light[`--ds-tracking-${style}`] ?? '',
  leading: light[`--ds-leading-${style}`] ?? '',
}));
export const fonts = [
  { name: '--ds-font-heading', value: light['--ds-font-heading'] ?? '' },
  { name: '--ds-font-body', value: light['--ds-font-body'] ?? '' },
];

/** The shadcn/ui alias layer: their names → our tokens. */
export const shadcnAliases = Object.entries(merge(find(shadcn, (s) => s === ':root'))).map(([name, value]) => ({ name, value }));

/** Layer 3: what each theme overrides. */
const themeSources: Array<{ value: string; label: string; css: string }> = [
  { value: 'astrowind', label: 'AstroWind', css: astrowindCss },
  { value: 'corporate', label: 'Corporate', css: corporateCss },
  { value: 'minimal', label: 'Minimal', css: minimalCss },
  { value: 'playful', label: 'Playful', css: playfulCss },
  { value: 'startup', label: 'Startup', css: startupCss },
];

export interface ThemeDoc {
  value: string;
  label: string;
  intro: string;
  light: Record<string, string>;
  dark: Record<string, string>;
  /** Rules that are not token overrides (geometry resets, selectors on elements). */
  extras: string[];
}

export const themes: ThemeDoc[] = themeSources.map(({ value, label, css }) => {
  const blocks = parseBlocks(css);
  const intro = (css.match(/Theme:\s*([^\n]*)\n([\s\S]*?)=+\s*\*\//)?.[2] ?? '').replace(/\s+/g, ' ').trim();
  const norm = (s: string) => s.replace(/'/g, '"').replace(/\s+/g, '');
  const isTheme = (s: string) => norm(s).includes(`[data-theme="${value}"]`);
  // A token block is the root selector alone, in light or dark.
  const tokenLike = (s: string) => new RegExp(`^(:root)+\\[data-theme="${value}"\\](\\.dark)?$`).test(norm(s));
  const lightBlocks = blocks.filter((b) => isTheme(b.selector) && tokenLike(b.selector) && !norm(b.selector).endsWith('.dark'));
  const darkBlocks = blocks.filter((b) => isTheme(b.selector) && tokenLike(b.selector) && norm(b.selector).endsWith('.dark'));
  const extras = [...css.matchAll(/\n([^\n{}]*data-theme[^\n{}]*)\{/g)].map((m) => m[1].trim()).filter((s) => !tokenLike(s));
  return { value, label, intro, light: merge(lightBlocks), dark: merge(darkBlocks), extras };
});

/** How many elements consume each role, from the catalog. */
export function usage(elementMeta: Record<string, { tokens?: string[] } | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, meta] of Object.entries(elementMeta)) {
    for (const t of meta?.tokens ?? []) (out[t] ??= []).push(name);
  }
  return out;
}
