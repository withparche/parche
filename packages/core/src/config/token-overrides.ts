/**
 * A site's own token values, over the base look and over each theme, as
 * data: `src/parche.tokens.json`.
 *
 *   {
 *     "base":   { "light": { "--ds-sys-color-primary": "oklch(0.52 0.15 150)" }, "dark": { … } },
 *     "themes": { "product": { "light": { … }, "dark": { … } } }
 *   }
 *
 * Keys are token names as the generated catalog writes them (tokens.json)
 * or a component token (`--ds-comp-*`). It becomes CSS with the selectors
 * the tokens and the themes use themselves (`:root`, `.dark`,
 * `:root[data-theme="x"]`, `:root[data-theme="x"].dark`), imported after
 * every other style, so each value wins where it is scoped. The visual
 * builder writes this file; a person can too.
 */
export type Scheme = { light?: Record<string, string>; dark?: Record<string, string> };

export interface TokenOverrides {
  base?: Scheme;
  themes?: Record<string, Scheme>;
}

export interface OverrideIssue {
  path: string;
  message: string;
}

const NAME = /^--ds-(ref|sys|conf|comp)-[a-z0-9-]+$/;
const THEME = /^[a-z0-9][a-z0-9-]*$/;

/** A value that stays a value: nothing that could close the declaration or the rule. */
export const safeValue = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '' && !/[;{}]|<\//.test(v);

/**
 * The overrides that can be written as CSS, and what was left out: unknown
 * names (checked against the catalog when one is given; component tokens
 * are the element's own, so any `--ds-comp-*` passes), unsafe values,
 * malformed theme names.
 */
export function validateOverrides(raw: unknown, known?: Set<string>): { overrides: TokenOverrides; issues: OverrideIssue[] } {
  const issues: OverrideIssue[] = [];
  const scheme = (value: unknown, at: string): Scheme => {
    const out: Scheme = {};
    if (!value || typeof value !== 'object') return out;
    for (const mode of ['light', 'dark'] as const) {
      const entries = (value as Record<string, unknown>)[mode];
      if (!entries || typeof entries !== 'object') continue;
      const kept: Record<string, string> = {};
      for (const [name, v] of Object.entries(entries as Record<string, unknown>)) {
        const where = `${at}.${mode}.${name}`;
        if (!NAME.test(name)) issues.push({ path: where, message: 'not a Parche token name' });
        else if (known && !name.startsWith('--ds-comp-') && !known.has(name)) issues.push({ path: where, message: 'no such token' });
        else if (!safeValue(v)) issues.push({ path: where, message: 'not a value a declaration can hold' });
        else kept[name] = v.trim();
      }
      if (Object.keys(kept).length) out[mode] = kept;
    }
    return out;
  };
  const r = (raw ?? {}) as Record<string, unknown>;
  const overrides: TokenOverrides = {};
  const base = scheme(r.base, 'base');
  if (base.light || base.dark) overrides.base = base;
  for (const [theme, value] of Object.entries((r.themes ?? {}) as Record<string, unknown>)) {
    if (!THEME.test(theme)) {
      issues.push({ path: `themes.${theme}`, message: 'not a theme name' });
      continue;
    }
    const s = scheme(value, `themes.${theme}`);
    if (s.light || s.dark) (overrides.themes ??= {})[theme] = s;
  }
  return { overrides, issues };
}

const block = (selector: string, decls: Record<string, string> | undefined) =>
  decls && Object.keys(decls).length ? `${selector} {\n${Object.entries(decls).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n` : '';

export function tokensToCss(o: TokenOverrides): string {
  let css = block(':root', o.base?.light) + block('.dark', o.base?.dark);
  for (const [theme, s] of Object.entries(o.themes ?? {})) {
    css += block(`:root[data-theme="${theme}"]`, s.light) + block(`:root[data-theme="${theme}"].dark`, s.dark);
  }
  return css;
}
