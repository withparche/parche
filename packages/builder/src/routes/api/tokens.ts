import catalog from '@parche/astro/styles/generated/tokens.json';
import meta from '@parche/astro/styles/generated/tokens.meta.json';
import { session } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { body, handle } from '../../server/http.js';
import { readTokens, writeTokens } from '../../server/tokens.js';

const known = new Set([...Object.keys(catalog.light), ...Object.keys(catalog.dark)]);

/**
 * The token catalog (every name with its base value, light and dark, and
 * what it is for) and the site's own values. PUT `{ etag, overrides }` saves them.
 */
export const GET = handle(async () => json({ catalog, meta, ...(await readTokens(session().root)) }));

export const PUT = handle(async (req) => {
  const input = await body<{ etag: string; overrides: unknown }>(req);
  return json(await writeTokens(session().root, input.etag ?? '', input.overrides, known));
});
