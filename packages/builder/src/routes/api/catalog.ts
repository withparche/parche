import type { APIRoute } from 'astro';
import { session } from '../../server/session.js';
import { forbidden, json, refuse } from '../../server/guard.js';
import { buildCatalog } from '../../server/catalog.js';

export const GET: APIRoute = async ({ request }) => {
  const why = refuse(request, session());
  if (why) return forbidden(why);
  return json(await buildCatalog());
};
