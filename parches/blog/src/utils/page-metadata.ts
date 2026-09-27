import { resolveMetadata } from 'parche:utils/metadata';

/**
 * A blog page's metadata, resolved the way core resolves a page's: the
 * author's own `metadata` first, then what the route says about the page
 * (its type, its picture, whether it is thin enough to keep out of the
 * index), then the site's defaults — its name, its default picture, robots,
 * the Twitter card. Only what is the blog's own is added on top: the page's
 * schema.org type and its structured data. The title carries the site's
 * name, as every page's does.
 */
export interface BlogPageMetadata {
  title: string;
  description?: string;
  /** The author's own metadata (a post's frontmatter `metadata`): wins over everything. */
  metadata?: Record<string, unknown>;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
  noindex?: boolean;
  article?: Record<string, unknown>;
  pageType?: string;
  jsonLd?: unknown[];
}

export function blogMetadata(site: any, locale: string, page: BlogPageMetadata) {
  const own = page.metadata ?? {};
  const defined = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
  const meta = { ...defined({ ogType: page.ogType, ogImage: page.ogImage, twitterCard: page.twitterCard, noindex: page.noindex, article: page.article }), ...defined(own) };
  const resolved = resolveMetadata({ title: page.title, description: page.description, metadata: meta } as any, site, { locale });
  return {
    ...resolved,
    title: `${resolved.title} — ${site.brand.name}`,
    ...(page.pageType ? { pageType: page.pageType } : {}),
    ...(page.jsonLd ? { jsonLd: page.jsonLd } : {}),
  };
}
