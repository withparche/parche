/**
 * The design system as data. The token layers come from the generated
 * catalog (`tokens.json`, built from the DTCG sources), so the pages document
 * what ships and nothing else; descriptions come from the sources themselves.
 * The shadcn alias layer and the themes are still CSS, read with a small
 * block parser because they are flat `selector { --name: value; }` files.
 */
import catalog from '../../../../../packages/core/src/styles/generated/tokens.json';
import refSource from '../../../../../packages/core/tokens/ref.json';
import sysSource from '../../../../../packages/core/tokens/sys.json';
import confSource from '../../../../../packages/core/tokens/conf.json';
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

const light: Record<string, string> = catalog.light;
const dark: Record<string, string> = catalog.dark;
const describe = (source: unknown, ...path: string[]): string | undefined => {
  let node: any = source;
  for (const p of path) node = node?.[p];
  return node?.$description;
};
const entries = (prefix: string) => Object.entries(light).filter(([k]) => k.startsWith(prefix));

/** Layer ref: the OKLCH ramps, `--ds-ref-color-<family>-<step>`. */
export const families = ['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'danger'] as const;
export const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;
export const ramps = families.map((family) => ({
  family,
  description: describe(refSource, 'color', family) ?? '',
  steps: steps.map((step) => ({ step, name: `--ds-ref-color-${family}-${step}`, value: light[`--ds-ref-color-${family}-${step}`] ?? '' })),
}));

/** Layer ref too: radii and shadows, bridged to Tailwind as rounded-* and shadow-*. */
export const radii = entries('--ds-ref-radius-').map(([name, value]) => ({ name, value, utility: name.replace('--ds-ref-radius-', 'rounded-') }));
export const shadows = entries('--ds-ref-shadow-').map(([name, value]) => ({ name, value, utility: name.replace('--ds-ref-shadow-', 'shadow-') }));

/** Layer sys: the colour roles, light and dark, with the description from the source. */
export interface Role {
  name: string; // --ds-sys-color-primary
  short: string; // primary
  utility: string; // bg-primary / text-primary
  light: string;
  dark: string;
  note?: string;
}

export const colorRoles: Role[] = entries('--ds-sys-color-').map(([name, value]) => {
  const short = name.replace('--ds-sys-color-', '');
  return { name, short, utility: short, light: value, dark: dark[name] ?? '', note: describe(sysSource, 'color', short) };
});

/** Contrast pairs the elements rely on: foreground on background, with the WCAG target. */
export const contrastPairs: Array<{ fg: string; bg: string; target: number; where: string; advisory?: boolean }> = [
  { fg: 'text', bg: 'background', target: 4.5, where: 'body copy' },
  { fg: 'heading', bg: 'background', target: 3, where: 'headings (large text)' },
  { fg: 'muted', bg: 'background', target: 4.5, where: 'secondary copy' },
  { fg: 'muted', bg: 'surface', target: 4.5, where: 'secondary copy on cards' },
  { fg: 'on-surface', bg: 'surface', target: 4.5, where: 'text on cards' },
  { fg: 'on-surface', bg: 'surface-2', target: 4.5, where: 'text on chips and table headers' },
  { fg: 'muted', bg: 'surface-2', target: 4.5, where: 'secondary copy on chips' },
  { fg: 'on-primary', bg: 'primary', target: 4.5, where: 'primary buttons' },
  { fg: 'primary', bg: 'background', target: 4.5, where: 'ghost buttons' },
  { fg: 'link', bg: 'background', target: 4.5, where: 'links in running text' },
  { fg: 'on-primary', bg: 'primary-hover', target: 4.5, where: 'primary buttons under the pointer' },
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

/** Layer sys: typography, six styles × four tokens, plus the font roles. */
export const typeStyles = ['h1', 'h2', 'h3', 'lead', 'body', 'caption', 'label'] as const;
export const typography = typeStyles.map((style) => ({
  style,
  size: light[`--ds-sys-type-${style}-size`] ?? '',
  weight: light[`--ds-sys-type-${style}-weight`] ?? '',
  tracking: light[`--ds-sys-type-${style}-tracking`] ?? '',
  leading: light[`--ds-sys-type-${style}-leading`] ?? '',
}));
export const fonts = entries('--ds-sys-font-').map(([name, value]) => ({
  name,
  value,
  description: describe(sysSource, 'font', name.replace('--ds-sys-font-', '')) ?? '',
}));

/** Layer conf: the knobs, with their description. */
export const conf = entries('--ds-conf-').map(([name, value]) => {
  const path = name.replace('--ds-conf-', '').split('-');
  return { name, value, description: describe(confSource, ...path) ?? '' };
});

/** The shadcn/ui alias layer: their names → our tokens. */
const shadcn = parseBlocks(shadcnCss);
const find = (blocks: Block[], test: (s: string) => boolean) => blocks.filter((b) => test(b.selector));
const merge = (blocks: Block[]) => Object.assign({}, ...blocks.map((b) => b.declarations)) as Record<string, string>;
export const shadcnAliases = Object.entries(merge(find(shadcn, (s) => s === ':root'))).map(([name, value]) => ({ name, value }));

/** The themes: what each overrides. */
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

/** Which layer a token name belongs to. */
export function layerOf(name: string): 'ref' | 'sys' | 'comp' | 'conf' | 'other' {
  const m = name.match(/^--ds-(ref|sys|comp|conf)-/);
  return (m?.[1] as 'ref' | 'sys' | 'comp' | 'conf' | undefined) ?? 'other';
}

/** How many elements consume each role, from the catalog. */
export function usage(elementMeta: Record<string, { tokens?: string[] } | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, meta] of Object.entries(elementMeta)) {
    for (const t of meta?.tokens ?? []) (out[t] ??= []).push(name);
  }
  return out;
}
