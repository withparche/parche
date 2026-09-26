import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileError, createDoc, deleteDoc, listDocs, moveDoc, readDoc, writeDoc } from '../src/server/files.ts';

function site() {
  const root = mkdtempSync(join(tmpdir(), 'parche-files-'));
  mkdirSync(join(root, 'src/content/pages/en/landing'), { recursive: true });
  mkdirSync(join(root, 'src/content/posts'), { recursive: true });
  writeFileSync(join(root, 'src/content/pages/en/home.json'), '{\n    "title": "Home",\n    "sections": []\n}\n');
  writeFileSync(join(root, 'src/content/pages/en/landing/sales.json'), '{"title":"Sales"}');
  writeFileSync(join(root, 'src/content/posts/hello.md'), '---\n# the post\'s title\ntitle: Hello\ntags: [a, b] # two tags\n---\n\nThe *body*, untouched.\n');
  return root;
}

const rejects = async (p: Promise<unknown>, status: number, re?: RegExp) => {
  await assert.rejects(p, (e) => e instanceof FileError && e.status === status && (!re || re.test(e.message)));
};

test('lists documents by id, nested, with their format', async () => {
  const root = site();
  const docs = await listDocs(root, 'pages');
  assert.deepEqual(docs.map((d) => [d.id, d.format]), [['en/home', 'json'], ['en/landing/sales', 'json']]);
  assert.deepEqual(await listDocs(root, 'layouts'), []);
  await rejects(listDocs(root, 'secrets'), 400, /unknown collection/);
});

test('an untouched document is not written, so it stays byte-identical', async () => {
  const root = site();
  const doc = await readDoc(root, 'pages', 'en/home');
  const before = readFileSync(join(root, 'src/content/pages/en/home.json'), 'utf8');
  const r = await writeDoc(root, 'pages', 'en/home', { etag: doc.etag, data: structuredClone(doc.data) });
  assert.equal(r.written, false);
  assert.equal(readFileSync(join(root, 'src/content/pages/en/home.json'), 'utf8'), before);
});

test('a change keeps the file\'s own indentation and trailing newline', async () => {
  const root = site();
  const doc = await readDoc(root, 'pages', 'en/home');
  await writeDoc(root, 'pages', 'en/home', { etag: doc.etag, data: { ...doc.data, title: 'Welcome' } });
  assert.equal(readFileSync(join(root, 'src/content/pages/en/home.json'), 'utf8'), '{\n    "title": "Welcome",\n    "sections": []\n}\n');
});

test('Markdown keeps its body verbatim and the frontmatter\'s comments', async () => {
  const root = site();
  const doc = await readDoc(root, 'posts', 'hello');
  assert.equal(doc.body, '\nThe *body*, untouched.\n');
  await writeDoc(root, 'posts', 'hello', { etag: doc.etag, data: { ...doc.data, title: 'Hi' } });
  const text = readFileSync(join(root, 'src/content/posts/hello.md'), 'utf8');
  assert.match(text, /# the post's title\ntitle: Hi\n/);
  assert.match(text, /# two tags/);
  assert.ok(text.endsWith('---\n\nThe *body*, untouched.\n'));
});

test('a stale etag is a conflict that brings what is on disk', async () => {
  const root = site();
  const doc = await readDoc(root, 'pages', 'en/home');
  writeFileSync(join(root, 'src/content/pages/en/home.json'), '{"title":"Edited elsewhere"}\n');
  await assert.rejects(writeDoc(root, 'pages', 'en/home', { etag: doc.etag, data: { title: 'Mine' } }), (e) => e instanceof FileError && e.status === 409 && (e.detail as { data: { title: string } }).data.title === 'Edited elsewhere');
});

test('ids that leave the collection are refused, symlinks too', async () => {
  const root = site();
  for (const id of ['../x', 'en/../../x', '/etc/passwd', 'en//home', '.hidden', 'en/./home']) await rejects(readDoc(root, 'pages', id), 400);
  const outside = mkdtempSync(join(tmpdir(), 'parche-outside-'));
  writeFileSync(join(outside, 'x.json'), '{}');
  symlinkSync(outside, join(root, 'src/content/pages/escape'));
  await rejects(readDoc(root, 'pages', 'escape/x'), 400, /outside src\/content\/pages/);
});

test('create, move and delete, each refusing to clobber', async () => {
  const root = site();
  const made = await createDoc(root, 'pages', 'es/home', { data: { title: 'Inicio' } });
  assert.equal(readFileSync(join(root, 'src/content/pages/es/home.json'), 'utf8'), '{\n  "title": "Inicio"\n}\n');
  await rejects(createDoc(root, 'pages', 'es/home', { data: {} }), 409);
  await rejects(moveDoc(root, 'pages', 'es/home', 'en/home', made.etag), 409, /exists already/);
  await moveDoc(root, 'pages', 'es/home', 'es/inicio', made.etag);
  assert.ok(existsSync(join(root, 'src/content/pages/es/inicio.json')));
  await rejects(deleteDoc(root, 'pages', 'es/inicio', 'stale'), 409);
  await deleteDoc(root, 'pages', 'es/inicio', made.etag);
  assert.ok(!existsSync(join(root, 'src/content/pages/es/inicio.json')));
});
