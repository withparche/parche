import { getCollection } from 'astro:content';

/**
 * A collection's entries, read once, and what is derived from them, computed
 * once. Content is immutable while a build runs and while a server serves
 * it, so anything that reads a collection for every page (a post's lookup,
 * a sorted listing, the counts of a taxonomy) can be read and prepared a
 * single time; done per page, the cost of one page grows with the size of
 * the site, and the site's with its square. In development nothing is kept,
 * so an edit is seen at once. The rule is the one utils/i18n.ts, layout.ts
 * and patterns.ts already follow for pages, layouts and patterns.
 */
const CACHE = import.meta.env.PROD;

export interface CollectionEntry {
  id: string;
  data: Record<string, unknown>;
  body?: string;
  [key: string]: unknown;
}

const lists = new Map<string, Promise<CollectionEntry[]>>();

/** The entries of a collection, as `getCollection` gives them; none when the collection does not exist. */
export function entriesOf(collection: string): Promise<CollectionEntry[]> {
  if (CACHE && lists.has(collection)) return lists.get(collection)!;
  const list = getCollection(collection as never)
    .then((entries) => entries as unknown as CollectionEntry[])
    .catch(() => [] as CollectionEntry[]);
  if (CACHE) lists.set(collection, list);
  return list;
}

const derived = new Map<string, unknown>();

/**
 * `compute()` once per key for the life of the build or server: an index, a
 * sorted list, a count. The key names what is computed and every input it
 * depends on (`blog:posts:en:drafts`), so two callers with the same needs
 * share one result and two with different ones never do.
 */
export function memo<T>(key: string, compute: () => T): T {
  if (!CACHE) return compute();
  if (!derived.has(key)) derived.set(key, compute());
  return derived.get(key) as T;
}
