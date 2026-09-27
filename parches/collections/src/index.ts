import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ParcheManifest } from '@parche/astro';
import type { CollectionPages } from './pages.js';

export type { CollectionPages } from './pages.js';

/**
 * Pages from collections of plain data: every entry of a collection (a
 * product, a course, a place) gets a page at `path`, rendered by `widget`
 * with the entry's fields as its props. The collection holds only its data,
 * with the schema the site gives it in content.config.ts; the page's
 * structure is the widget's — usually a pattern built with Parche.
 *
 *   createCollectionPages({
 *     products: { path: '/products/%slug%', widget: 'pattern/product-page', layout: 'store' },
 *   })
 *
 * The widget takes the fields it declares, by name; `props` maps the ones
 * whose names differ (`{ title: 'name' }`), and the rest are left out, so the
 * collection may say more than a page shows. A field the widget requires
 * and an entry lacks fails the build with the page's address. Each entry
 * carries its address as `href` wherever a `{ "$collection": … }` lists it.
 */
export default function createCollectionPages(collections: Record<string, CollectionPages>): ParcheManifest {
  for (const [name, spec] of Object.entries(collections)) {
    if (typeof spec?.path !== 'string' || !spec.path.startsWith('/') || !spec.path.includes('%slug%')) {
      throw new Error(`[parche] collection pages "${name}": path must start with "/" and hold %slug% (it is "${spec?.path}")`);
    }
    if (typeof spec.widget !== 'string' || spec.widget === '') throw new Error(`[parche] collection pages "${name}": widget is required`);
  }
  const src = path.dirname(fileURLToPath(import.meta.url));
  const urls = path.resolve(src, 'urls.ts');
  return {
    name: 'collection-pages',
    config: collections as unknown as Record<string, unknown>,
    resolver: { entrypoint: path.resolve(src, 'resolver.ts') },
    urls: Object.fromEntries(Object.keys(collections).map((name) => [name, urls])),
  };
}
