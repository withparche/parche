import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ResolvedRegistry } from '../types.js';
import { tokensToCss, validateOverrides } from '../../config/token-overrides.js';

const TOKENS_CATALOG_PATH = fileURLToPath(new URL('../../styles/generated/tokens.json', import.meta.url));

/** The token names the generated catalog knows, to check a site's overrides against. */
let knownTokens: Set<string> | null = null;
function tokenNames(): Set<string> {
  if (knownTokens) return knownTokens;
  try {
    const catalog = JSON.parse(fs.readFileSync(TOKENS_CATALOG_PATH, 'utf-8')) as Record<string, Record<string, string>>;
    knownTokens = new Set([...Object.keys(catalog.light ?? {}), ...Object.keys(catalog.dark ?? {})]);
  } catch {
    knownTokens = new Set();
  }
  return knownTokens;
}

/** `<srcDir>/parche.tokens.json` as CSS; nothing when the file is absent. Problems are warned about, and left out. */
export function generateTokenOverrides(registry: ResolvedRegistry, warn: (message: string) => void = (m) => console.warn(`[parche] ${m}`)): string {
  if (!fs.existsSync(registry.tokenOverridesPath)) return '';
  const file = `${registry.srcDir}/parche.tokens.json`;
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(registry.tokenOverridesPath, 'utf-8'));
  } catch (e) {
    warn(`${file} is not valid JSON: ${(e as Error).message}`);
    return '';
  }
  const { overrides, issues } = validateOverrides(raw, tokenNames());
  for (const i of issues) warn(`${file} ${i.path}: ${i.message} (left out)`);
  return tokensToCss(overrides);
}
