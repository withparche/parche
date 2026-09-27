import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { session, type Draft } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { body, handle } from '../../server/http.js';
import { readDoc } from '../../server/files.js';
import { loadBlog } from '../../server/blog.js';
import { markdownRenderer } from '../../server/markdown.js';
import { layoutSchema, navigationSchema, pageSchema, patternSchema } from '@parche/astro/content/pure';
import type { ZodType } from 'zod';

const core: Record<string, ZodType> = { pages: pageSchema, layouts: layoutSchema, patterns: patternSchema, navigation: navigationSchema };

/**
 * The editor's unsaved documents, for the preview: `PUT { docs: [{ collection, id, data, body? }] }`
 * replaces them all. Each is parsed as its collection would (defaults, dates
 * and all) and kept by the file it stands in for; one that does not parse is
 * kept as it is, and the render will say what is wrong. A Markdown body is
 * rendered to HTML here, with the site's pipeline, so the page shows it.
 */
export const PUT = handle(async (req) => {
  const s = session();
  const { docs } = await body<{ docs: { collection: string; id: string; data: Record<string, unknown>; body?: string }[] }>(req);
  const blog = (docs ?? []).some((d) => !(d.collection in core)) ? await loadBlog() : null;
  const schemas: Record<string, ZodType | undefined> = { ...core, ...(blog?.schemas ?? {}) };
  const next = new Map<string, Draft>();
  for (const d of docs ?? []) {
    const { relPath } = await readDoc(s.root, d.collection, d.id);
    const parsed = schemas[d.collection]?.safeParse(d.data);
    const draft: Draft = { data: parsed?.success ? (parsed.data as Record<string, unknown>) : d.data };
    const render = typeof d.body === 'string' ? markdownRenderer() : null;
    if (render) {
      const r = await (await render).render(d.body!, { frontmatter: draft.data, fileURL: pathToFileURL(path.join(s.root, relPath)) });
      const meta = r.metadata as { localImagePaths?: string[]; remoteImagePaths?: string[] };
      draft.body = d.body;
      draft.rendered = { html: r.code, metadata: { ...r.metadata, imagePaths: [...(meta.localImagePaths ?? []), ...(meta.remoteImagePaths ?? [])] } };
    }
    next.set(relPath, draft);
  }
  s.drafts.clear();
  for (const [k, v] of next) s.drafts.set(k, v);
  return json({ drafts: next.size });
});
