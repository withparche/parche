/**
 * The content check of a server build. A static build checks every page as
 * it prerenders it (NodeRenderer); a server build renders pages per request,
 * where the catalog must never load, so without this nothing checked them.
 * Injected only into server builds and prerendered once: every page in every
 * locale, prepared with its layout exactly as the page route prepares it
 * (utils/prepare.ts), against the catalog. Any issue fails the build; the
 * file it writes is removed when the build is done (integration/index.ts).
 */
import type { APIRoute } from 'astro';
import { widgetMeta } from 'parche:registry/widgetSchemas';
import { tones } from 'parche:config/layout';
import { defaultLocale } from 'parche:config/i18n';
import { buildSlugMap } from 'parche:utils/i18n';
import { resolveLayout } from 'parche:utils/layout';
import { prepareTrees, checkPrepared } from '../utils/prepare.js';

export const prerender = true;

export const GET: APIRoute = async () => {
  const problems: string[] = [];
  const pages = await buildSlugMap();
  for (const page of pages) {
    const data = page.data as { layout?: string; sections?: unknown[]; slots?: Record<string, unknown[]>; wrapper?: unknown };
    const layout = await resolveLayout(data.layout || 'default', page.locale, defaultLocale);
    const prepared = await prepareTrees({
      nodes: layout,
      outlets: {
        nodes: { default: (data.sections ?? []) as any[], ...((data.slots ?? {}) as Record<string, any[]>) },
        wrappers: data.wrapper !== undefined ? { default: data.wrapper as any } : undefined,
      },
      base: 'layout',
      locale: page.locale,
    });
    for (const issue of checkPrepared(prepared, { widgetMeta: widgetMeta as Record<string, unknown>, tones })) {
      problems.push(`${page.entryId}: ${issue.path}: ${issue.message}`);
    }
  }
  if (problems.length) {
    throw new Error(`[parche] ${problems.length} content issue(s) in the pages:\n  ${problems.join('\n  ')}`);
  }
  return new Response(JSON.stringify({ pages: pages.length }), { headers: { 'content-type': 'application/json' } });
};
