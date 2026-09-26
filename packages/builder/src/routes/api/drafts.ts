import { session } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { body, handle } from '../../server/http.js';
import { readDoc } from '../../server/files.js';
import { layoutSchema, navigationSchema, pageSchema, patternSchema } from '@parche/astro/content/pure';
import type { ZodType } from 'zod';

const schemas: Record<string, ZodType> = { pages: pageSchema, layouts: layoutSchema, patterns: patternSchema, navigation: navigationSchema };

/**
 * The editor's unsaved documents, for the preview: `PUT { docs: [{ collection, id, data }] }`
 * replaces them all. Each is parsed as its collection would (defaults and
 * all) and kept by the file it stands in for; one that does not parse is
 * kept as it is, and the render will say what is wrong.
 */
export const PUT = handle(async (req) => {
  const s = session();
  const { docs } = await body<{ docs: { collection: string; id: string; data: Record<string, unknown> }[] }>(req);
  const next = new Map<string, Record<string, unknown>>();
  for (const d of docs ?? []) {
    const { relPath } = await readDoc(s.root, d.collection, d.id);
    const parsed = schemas[d.collection]?.safeParse(d.data);
    next.set(relPath, parsed?.success ? (parsed.data as Record<string, unknown>) : d.data);
  }
  s.drafts.clear();
  for (const [k, v] of next) s.drafts.set(k, v);
  return json({ drafts: next.size });
});
