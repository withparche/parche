import { existsSync } from 'node:fs';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { validateOverrides, type OverrideIssue, type TokenOverrides } from '@parche/astro/tokens';
import { etagOf, FileError } from './files.js';

/**
 * The site's own token values: `src/parche.tokens.json`, read and written
 * like a document (etag-checked, atomic). Core turns the file into CSS and
 * reloads it when it changes, so a save shows at once. Pure over the root
 * and the token names it is given.
 */
export const TOKENS_FILE = path.join('src', 'parche.tokens.json');

export async function readTokens(root: string): Promise<{ overrides: TokenOverrides; etag: string; exists: boolean }> {
  const file = path.join(root, TOKENS_FILE);
  if (!existsSync(file)) return { overrides: {}, etag: '', exists: false };
  const text = await readFile(file, 'utf8');
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new FileError(422, `${TOKENS_FILE} is not valid JSON`);
  }
  return { overrides: validateOverrides(raw).overrides, etag: etagOf(text), exists: true };
}

/** Save the overrides; none at all removes the file. Unknown names and unsafe values are refused, with their paths. */
export async function writeTokens(root: string, etag: string, overrides: unknown, known: Set<string>): Promise<{ etag: string; issues: OverrideIssue[] }> {
  const current = await readTokens(root);
  if (current.etag !== etag) throw new FileError(409, `${TOKENS_FILE} changed on disk since it was opened`, { etag: current.etag, overrides: current.overrides });
  const { overrides: clean, issues } = validateOverrides(overrides, known);
  if (issues.length) throw new FileError(422, 'some token values cannot be written', { issues });
  const file = path.join(root, TOKENS_FILE);
  if (!clean.base && !clean.themes) {
    if (current.exists) await rm(file);
    return { etag: '', issues: [] };
  }
  const text = JSON.stringify(clean, null, 2) + '\n';
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, text);
  await rename(tmp, file);
  return { etag: etagOf(text), issues: [] };
}
