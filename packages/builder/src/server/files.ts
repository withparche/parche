import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import YAML from 'yaml';

/**
 * The builder's only way to touch the project's files. The editor never
 * sends a path: it names a collection and a document id, and this module
 * turns them into a file under `src/content/<collection>/`, refusing
 * anything that would leave it. Pure over the root it is given, so it is
 * tested on temporary folders.
 *
 * A document id is its path inside the collection without the extension
 * (`en/home`, `en/landing/sales`). JSON is read and written as JSON, keeping
 * the file's indentation and trailing newline; Markdown keeps its body
 * verbatim and its frontmatter's comments and order (yaml's Document);
 * YAML is read-only for now.
 */

export const COLLECTIONS = ['pages', 'layouts', 'navigation', 'presets', 'widgets', 'views', 'posts', 'authors', 'taxonomies', 'series'] as const;
export type Collection = (typeof COLLECTIONS)[number];
export type Format = 'json' | 'md' | 'yaml';

const ID = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,200}$/;
const EXTENSIONS: Record<string, Format> = { '.json': 'json', '.md': 'md', '.mdx': 'md', '.yaml': 'yaml', '.yml': 'yaml' };

export class FileError extends Error {
  constructor(
    readonly status: 400 | 404 | 409 | 422,
    message: string,
    readonly detail?: unknown,
  ) {
    super(message);
  }
}

export interface DocSummary {
  id: string;
  format: Format;
  etag: string;
}

export interface Doc extends DocSummary {
  collection: Collection;
  data: Record<string, unknown>;
  /** A Markdown document's body, verbatim. */
  body?: string;
  readOnly: boolean;
  /** The file, relative to the project root, to show. */
  relPath: string;
}

export const etagOf = (bytes: string | Buffer) => createHash('sha1').update(bytes).digest('hex');

function assertCollection(collection: string): asserts collection is Collection {
  if (!(COLLECTIONS as readonly string[]).includes(collection)) throw new FileError(400, `unknown collection "${collection}"`);
}

function assertId(id: string) {
  if (!ID.test(id) || id.split('/').some((seg) => seg === '..' || seg === '.' || seg === '')) {
    throw new FileError(400, `"${id}" is not a document id`);
  }
}

const baseOf = (root: string, collection: Collection) => path.join(root, 'src', 'content', collection);

/** The real directory a file would sit in must be inside the collection's; a symlink out is refused. */
async function assertInside(root: string, collection: Collection, file: string) {
  const base = await realpath(baseOf(root, collection)).catch(() => baseOf(root, collection));
  let dir = path.dirname(file);
  while (!existsSync(dir) && dir !== path.dirname(dir)) dir = path.dirname(dir);
  const real = await realpath(dir);
  if (real !== base && !real.startsWith(base + path.sep)) throw new FileError(400, `"${path.relative(root, file)}" is outside src/content/${collection}`);
}

/** The file of an existing document: the first extension that exists. */
async function findFile(root: string, collection: Collection, id: string): Promise<string | null> {
  for (const ext of Object.keys(EXTENSIONS)) {
    const file = path.join(baseOf(root, collection), `${id}${ext}`);
    if (existsSync(file) && (await stat(file)).isFile()) return file;
  }
  return null;
}

export async function listDocs(root: string, collection: string): Promise<DocSummary[]> {
  assertCollection(collection);
  const base = baseOf(root, collection);
  if (!existsSync(base)) return [];
  const out: DocSummary[] = [];
  const walk = async (dir: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else {
        const format = EXTENSIONS[path.extname(entry.name)];
        if (!format) continue;
        const id = path.relative(base, full).slice(0, -path.extname(entry.name).length).split(path.sep).join('/');
        out.push({ id, format, etag: etagOf(await readFile(full)) });
      }
    }
  };
  await walk(base);
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

function splitFrontmatter(text: string): { front: string; body: string } | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  return m ? { front: m[1], body: m[2] } : null;
}

export async function readDoc(root: string, collection: string, id: string): Promise<Doc> {
  assertCollection(collection);
  assertId(id);
  const file = await findFile(root, collection, id);
  if (!file) throw new FileError(404, `no ${collection} document "${id}"`);
  await assertInside(root, collection, file);
  const text = await readFile(file, 'utf8');
  const format = EXTENSIONS[path.extname(file)];
  const common = { collection, id, format, etag: etagOf(text), relPath: path.relative(root, file).split(path.sep).join('/') };
  if (format === 'json') return { ...common, data: JSON.parse(text), readOnly: false };
  if (format === 'md') {
    const parts = splitFrontmatter(text);
    return { ...common, data: parts ? (YAML.parse(parts.front) ?? {}) : {}, body: parts ? parts.body : text, readOnly: false };
  }
  return { ...common, data: YAML.parse(text) ?? {}, readOnly: true };
}

/** The indentation a JSON file already uses (tabs, or its first indented line's spaces). */
function jsonIndent(text: string): string | number {
  const m = /\n([ \t]+)"/.exec(text);
  if (!m) return 2;
  return m[1].startsWith('\t') ? '\t' : m[1].length;
}

/** Only the keys that changed are touched, so comments and order around them survive. */
function updateFrontmatter(front: string, data: Record<string, unknown>): string {
  const doc = YAML.parseDocument(front);
  const before = (doc.toJS() ?? {}) as Record<string, unknown>;
  for (const key of Object.keys(before)) if (!(key in data)) doc.delete(key);
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) doc.delete(key);
    else if (!isDeepStrictEqual(before[key], value)) doc.set(key, doc.createNode(value));
  }
  return doc.toString().replace(/\n$/, '');
}

async function writeAtomic(file: string, text: string) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, text);
  await rename(tmp, file);
}

export interface WriteInput {
  etag: string;
  data: Record<string, unknown>;
  body?: string;
}

/**
 * Save a document. The etag must be the one the editor read — else someone
 * (a text editor, git) changed the file since, and 409 says so with what is
 * on disk now. Nothing is written when the content did not change, so an
 * untouched document stays byte-identical.
 */
export async function writeDoc(root: string, collection: string, id: string, input: WriteInput): Promise<{ etag: string; written: boolean }> {
  const current = await readDoc(root, collection, id);
  if (current.readOnly) throw new FileError(400, `${current.relPath} is YAML; the builder only reads it for now`);
  if (current.etag !== input.etag) throw new FileError(409, `${current.relPath} changed on disk since it was opened`, { etag: current.etag, data: current.data, body: current.body });
  const file = path.join(root, current.relPath);
  const text = await readFile(file, 'utf8');
  if (isDeepStrictEqual(current.data, input.data) && (input.body === undefined || input.body === current.body)) {
    return { etag: current.etag, written: false };
  }
  let next: string;
  if (current.format === 'json') {
    next = JSON.stringify(input.data, null, jsonIndent(text)) + (text.endsWith('\n') ? '\n' : '');
  } else {
    const parts = splitFrontmatter(text) ?? { front: '', body: text };
    const front = updateFrontmatter(parts.front, input.data);
    next = `---\n${front}\n---\n${input.body ?? parts.body}`;
  }
  await writeAtomic(file, next);
  return { etag: etagOf(next), written: true };
}

/** A new document; 409 when one with that id exists already. */
export async function createDoc(root: string, collection: string, id: string, input: { format?: 'json' | 'md'; data: Record<string, unknown>; body?: string }): Promise<DocSummary> {
  assertCollection(collection);
  assertId(id);
  if (await findFile(root, collection, id)) throw new FileError(409, `${collection} "${id}" exists already`);
  const format = input.format ?? 'json';
  const file = path.join(baseOf(root, collection), `${id}.${format}`);
  await mkdir(path.dirname(file), { recursive: true });
  await assertInside(root, collection, file);
  const text = format === 'json' ? JSON.stringify(input.data, null, 2) + '\n' : `---\n${YAML.stringify(input.data).replace(/\n$/, '')}\n---\n${input.body ?? ''}`;
  await writeAtomic(file, text);
  return { id, format, etag: etagOf(text) };
}

/** Move a document to another id (a rename, or another locale's folder). */
export async function moveDoc(root: string, collection: string, id: string, to: string, etag: string): Promise<DocSummary> {
  const current = await readDoc(root, collection, id);
  assertId(to);
  if (current.etag !== etag) throw new FileError(409, `${current.relPath} changed on disk since it was opened`, { etag: current.etag });
  if (await findFile(root, collection as Collection, to)) throw new FileError(409, `${collection} "${to}" exists already`);
  const from = path.join(root, current.relPath);
  const dest = path.join(baseOf(root, collection as Collection), `${to}${path.extname(from)}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await assertInside(root, collection as Collection, dest);
  await rename(from, dest);
  return { id: to, format: current.format, etag: current.etag };
}

export async function deleteDoc(root: string, collection: string, id: string, etag: string): Promise<void> {
  const current = await readDoc(root, collection, id);
  if (current.etag !== etag) throw new FileError(409, `${current.relPath} changed on disk since it was opened`, { etag: current.etag });
  await rm(path.join(root, current.relPath));
}
