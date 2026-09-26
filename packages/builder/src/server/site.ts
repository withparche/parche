import { existsSync } from 'node:fs';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ZodType } from 'zod';
import { etagOf, FileError } from './files.js';

/**
 * The site's identity, `src/parche.config.json` (or the file parche() is
 * pointed at): read and written like a document, checked with core's own
 * schema. A site that declares its identity inline in astro.config has no
 * file to write: the editor shows it read-only.
 */
export async function readSite(file: string | null): Promise<{ data: Record<string, unknown>; etag: string; readOnly: boolean }> {
  if (!file || !existsSync(file)) return { data: {}, etag: '', readOnly: true };
  const text = await readFile(file, 'utf8');
  return { data: JSON.parse(text), etag: etagOf(text), readOnly: !file.endsWith('.json') };
}

export async function writeSite(file: string | null, etag: string, data: unknown, schema: ZodType): Promise<{ etag: string }> {
  if (!file || !file.endsWith('.json')) throw new FileError(400, 'the site identity is declared in astro.config: edit it there');
  const current = await readSite(file);
  if (current.etag !== etag) throw new FileError(409, `${path.basename(file)} changed on disk since it was opened`, { etag: current.etag, data: current.data });
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new FileError(422, 'the site config does not match its schema', { issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) });
  const old = await readFile(file, 'utf8');
  const indent = /\n([ \t]+)"/.exec(old)?.[1] ?? '  ';
  const text = JSON.stringify(data, null, indent.startsWith('\t') ? '\t' : indent.length) + (old.endsWith('\n') ? '\n' : '');
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, text);
  await rename(tmp, file);
  return { etag: etagOf(text) };
}
