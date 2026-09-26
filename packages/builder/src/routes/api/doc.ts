import { session } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { FileError, createDoc, deleteDoc, moveDoc, readDoc, writeDoc } from '../../server/files.js';
import { body, handle, param } from '../../server/http.js';
import { validateDoc } from '../../server/validate.js';
import { validationContext } from '../../server/context.js';

/**
 * One document: `?collection=pages&id=en/home`.
 * GET reads it from disk; PUT saves it (etag-checked); POST creates it;
 * PATCH moves it to another id; DELETE removes it (etag-checked).
 *
 * A save is refused (422) only when the collection's schema rejects the
 * document, since the content layer would then refuse the whole site; tree
 * and props issues are returned with the save, because a page being built
 * may be incomplete for a while.
 */
export const GET = handle(async (_req, url) => json(await readDoc(session().root, param(url, 'collection'), param(url, 'id'))));

const blocking = async (collection: string, id: string, data: Record<string, unknown>) => {
  const issues = await validateDoc(collection, data, await validationContext(collection, id), id);
  const schema = issues.filter((i) => i.source === 'schema');
  if (schema.length) throw new FileError(422, 'the document does not match its collection\'s schema', { issues: schema });
  return issues;
};

export const PUT = handle(async (req, url) => {
  const collection = param(url, 'collection');
  const id = param(url, 'id');
  const input = await body<{ etag: string; data: Record<string, unknown>; body?: string }>(req);
  const issues = await blocking(collection, id, input.data);
  const saved = await writeDoc(session().root, collection, id, input);
  return json({ ...saved, issues });
});

export const POST = handle(async (req, url) => {
  const collection = param(url, 'collection');
  const id = param(url, 'id');
  const input = await body<{ format?: 'json' | 'md'; data: Record<string, unknown>; body?: string }>(req);
  await blocking(collection, id, input.data);
  return json(await createDoc(session().root, collection, id, input), 201);
});

export const PATCH = handle(async (req, url) => {
  const input = await body<{ to: string; etag: string }>(req);
  return json(await moveDoc(session().root, param(url, 'collection'), param(url, 'id'), input.to, input.etag));
});

export const DELETE = handle(async (req, url) => {
  const input = await body<{ etag: string }>(req);
  await deleteDoc(session().root, param(url, 'collection'), param(url, 'id'), input.etag);
  return json({ deleted: true });
});
