import type { Doc } from '../store/documents';
import type { Catalog } from '../store/types';
import { pageUrl } from '../../shared/page-url';

/**
 * The pages a document shows through in the preview: a page is itself; a
 * layout, the pages that use it; a menu or a pattern, the pages that use it
 * directly or through their layout. Page ids, in the order the catalog found them.
 */
export function pagesShowing(doc: Doc | undefined, catalog: Catalog | null): string[] {
  if (!doc || !catalog) return [];
  if (doc.collection === 'pages') return [doc.id];
  if (doc.collection === 'layouts') return catalog.layouts.find((l) => l.id === doc.id)?.usedBy ?? [];
  if (doc.collection === 'patterns') return catalog.patterns.find((p) => p.entry === doc.id)?.usedBy ?? [];
  if (doc.collection === 'navigation') {
    const out: string[] = [];
    for (const u of catalog.navigation.find((n) => n.id === doc.id)?.usedBy ?? []) {
      const [collection, ...rest] = u.doc.split('/');
      const id = rest.join('/');
      if (collection === 'pages') out.push(id);
      if (collection === 'layouts') out.push(...(catalog.layouts.find((l) => l.id === id)?.usedBy ?? []));
    }
    return [...new Set(out)];
  }
  return [];
}

/** What the preview loads for the open document: the page itself, or the page it is shown through. */
export function previewSrc(doc: Doc | undefined, catalog: Catalog | null, via: Record<string, string>): string {
  if (!doc || !catalog) return '/';
  const defaultLocale = catalog.i18n.defaultLocale;
  if (doc.collection === 'pages') return pageUrl(doc.id, doc.data.urlSlug as string | undefined, defaultLocale);
  const blog = catalog.blog;
  if (blog && ['posts', 'views', 'authors', 'series', 'taxonomies'].includes(doc.collection)) return blogPath(doc, catalog) ?? '/';
  const pages = pagesShowing(doc, catalog);
  const page = via[doc.key] && pages.includes(via[doc.key]) ? via[doc.key] : pages[0];
  return page ? catalog.pageUrls[page] ?? pageUrl(page, undefined, defaultLocale) : '/';
}

/**
 * Where a blog document shows: a post at its permalink, a view at the first
 * page that renders it, an author or a series at its own page, the rest at
 * the listing.
 */
function blogPath(doc: Doc, catalog: Catalog): string | null {
  const blog = catalog.blog!;
  const cfg = blog.config as { permalinks: Record<string, string>; authors?: string; series?: boolean };
  const key = doc.id.includes('/') && catalog.i18n.locales.includes(doc.id.split('/')[0]) ? doc.id.split('/').slice(1).join('/') : doc.id;
  switch (doc.collection) {
    case 'posts':
      return blog.postPaths[doc.id] ?? null;
    case 'views':
      return blog.viewPaths[key.replace(/^blog-/, '')] ?? null;
    case 'authors':
      return cfg.authors === 'many' ? cfg.permalinks.author.replace('%author%', key.toLowerCase()) : blog.viewPaths.index;
    case 'series':
      return cfg.series ? cfg.permalinks.series.replace('%series%', key.toLowerCase()) : blog.viewPaths.index;
    default:
      return blog.viewPaths.index;
  }
}
