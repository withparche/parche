import { json } from '../../server/guard.js';
import { body, handle, param } from '../../server/http.js';
import { validateDoc } from '../../server/validate.js';
import { validationContext } from '../../server/context.js';

/** Check an unsaved document: `POST ?collection=pages&id=en/home` with `{ data }`. */
export const POST = handle(async (req, url) => {
  const collection = param(url, 'collection');
  const id = param(url, 'id');
  const { data } = await body<{ data: Record<string, unknown> }>(req);
  return json({ issues: await validateDoc(collection, data, await validationContext(collection, id), id) });
});
