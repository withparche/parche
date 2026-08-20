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
 * Single source of truth for Parche's font set. BaseLayout renders a <Font>
 * for each entry; the `parcheFonts` config helper builds the astro.config array
 * from the same list, so the two never drift.
 */
export const parcheFontDefs: ParcheFontDef[] = [
  { cssVariable: '--font-sans', name: 'Geist', weights: [400, 500, 600, 700], fallbacks: sans, preload: true },
  { cssVariable: '--font-serif', name: 'Lora', weights: [400, 700], fallbacks: serif },
  { cssVariable: '--font-mono', name: 'JetBrains Mono', weights: [400], fallbacks: mono },
  { cssVariable: '--font-heading-alt', name: 'Literata', weights: [400, 700], fallbacks: serif },
  { cssVariable: '--font-body-alt', name: 'Libre Franklin', weights: [400, 500, 600, 700], fallbacks: sans },
  { cssVariable: '--font-rounded', name: 'Nunito', weights: [400, 500, 600, 700], fallbacks: sans },
  { cssVariable: '--font-tech', name: 'Schibsted Grotesk', weights: [400, 500, 600, 700], fallbacks: sans },
  { cssVariable: '--font-tech-body', name: 'DM Sans', weights: [400, 500, 600, 700], fallbacks: sans },
];

export const parcheFontVariables = parcheFontDefs.map((f) => f.cssVariable);
