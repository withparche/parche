export interface ParcheFontDef {
  cssVariable: string;
  name: string;
  weights: number[];
  fallbacks: string[];
  preload?: boolean;
}

const sans = ['ui-sans-serif', 'system-ui', 'sans-serif'];
const serif = ['ui-serif', 'Georgia', 'serif'];
const mono = ['ui-monospace', 'SFMono-Regular', 'monospace'];

/**
 * The base set: only the families core's own stylesheets read.
 *
 * A font is a download, so the default is the minimum that makes the base look
 * work — `--font-sans` for body and headings, `--font-mono` for code. Anything
 * else is a design decision, and design decisions belong to a theme: a theme
 * parche contributes its own fonts through its manifest, and a site can add or
 * replace any of them from `parche.config.ts`. Later contributors win per
 * `cssVariable`.
 *
 * This used to be eight families filling variables nothing consumed, while the
 * one two themes actually asked for was not among them.
 */
export const parcheFontDefs: ParcheFontDef[] = [
  { cssVariable: '--font-sans', name: 'Geist', weights: [400, 500, 600, 700], fallbacks: sans, preload: true },
  { cssVariable: '--font-mono', name: 'JetBrains Mono', weights: [400], fallbacks: mono },
];

export { sans, serif, mono };

export const parcheFontVariables = parcheFontDefs.map((f) => f.cssVariable);
