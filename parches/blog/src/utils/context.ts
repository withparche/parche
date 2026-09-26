/**
 * Builds the blog context a route hands to its view (see ui's
 * lib/blog-context.ts for the shape): the posts as cards with every link and
 * string resolved, the page, the terms with their counts, the term or author
 * the page is about. Routes differ only in which posts they query.
 */
import { getCollection, getEntry } from 'astro:content';
import { resolveAssets } from 'parche:utils/assets';
import { calculateReadingTime } from './reading-time.js';
import { getPublishedPosts } from './post-helpers.js';
import { createTaxonomyResolver } from './taxonomy.js';
import { resolvePostPermalink, resolveTaxonomyPermalink, resolveAuthorHref, localizePath, type ResolvedBlogConfig } from '../types.js';
import { resolveLabels, format } from '../labels.js';
import type { PageData } from './blog-query.js';

type Post = any;

export interface ContextOptions {
  cfg: ResolvedBlogConfig;
  locale: string;
  defaultLocale: string;
  showDrafts: boolean;
}

/** Author entries by key, looked up once per render: `{locale}/{key}`, then `{key}`. */
async function authorLookup(locale: string) {
  const cache = new Map<string, any>();
  return async (key: string) => {
    if (cache.has(key)) return cache.get(key);
    let entry: any = null;
    try {
      entry = (await getEntry('authors' as any, `${locale}/${key}`)) ?? (await getEntry('authors' as any, key));
    } catch {
      entry = null;
    }
    const data = entry ? { ...entry.data, key: entry.data.urlSlug ?? key } : null;
    cache.set(key, data);
    return data;
  };
}

/** The posts as cards, in the order given. */
export async function toCards(posts: Post[], o: ContextOptions) {
  const { cfg, locale, defaultLocale } = o;
  const labels = resolveLabels(cfg.labels, locale, defaultLocale);
  const tax = await createTaxonomyResolver(locale);
  const author = await authorLookup(locale);
  const dateLocale = locale;
  const cards = [];
  for (const post of posts) {
    const d = post.data;
    const minutes = d.readingTime ?? (cfg.readingTime ? calculateReadingTime(post.body ?? '', cfg.wordsPerMinute).minutes : undefined);
    const authors = [];
    for (const key of d.authors ?? []) {
      const a = await author(key);
      authors.push({
        name: a?.name ?? key,
        href: resolveAuthorHref(cfg, a?.key ?? key, locale, defaultLocale),
        ...(a?.avatar ? { avatar: a.avatar } : {}),
      });
    }
    if (authors.length === 0 && d.authorName) authors.push({ name: d.authorName });
    cards.push({
      title: d.title,
      excerpt: d.description ?? d.excerpt,
      href: resolvePostPermalink(cfg.permalinks.post, post, locale, defaultLocale),
      ...(d.image ? { image: d.image } : {}),
      date: d.publishDate.toISOString(),
      dateText: d.publishDate.toLocaleDateString(dateLocale, cfg.dateFormat),
      authors,
      ...(d.category
        ? { category: { name: tax.titleFor('categories', d.category), href: resolveTaxonomyPermalink(cfg.permalinks.category, tax.slugFor('categories', d.category), locale, defaultLocale) } }
        : {}),
      tags: (d.tags ?? []).map((t: string) => ({ name: tax.titleFor('tags', t), href: resolveTaxonomyPermalink(cfg.permalinks.tag, tax.slugFor('tags', t), locale, defaultLocale) })),
      ...(minutes ? { readingTime: format(labels.readingTime, { minutes }) } : {}),
      featured: Boolean(d.featured),
      ...(d.issue ? { issue: d.issue } : {}),
      ...(d.series ? { series: { name: d.series.name, part: d.series.order } } : {}),
    });
  }
  return resolveAssets(cards);
}

/** Every tag and category of the locale, with counts and links, most used first. */
export async function toTerms(o: ContextOptions) {
  const { cfg, locale, defaultLocale, showDrafts } = o;
  const posts = getPublishedPosts(await getCollection('posts'), showDrafts, locale);
  const tax = await createTaxonomyResolver(locale);
  const termOf = (kind: 'tags' | 'categories', value: string, n: number) => {
    const t = tax.term(kind, value);
    const pattern = kind === 'tags' ? cfg.permalinks.tag : cfg.permalinks.category;
    return {
      name: t.title,
      count: n,
      href: resolveTaxonomyPermalink(pattern, t.slug, locale, defaultLocale),
      ...(t.description ? { description: t.description } : {}),
    };
  };
  const count = (values: (string | undefined)[]) => {
    const m = new Map<string, number>();
    for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };
  return {
    tags: count(posts.flatMap((p: Post) => p.data.tags ?? [])).map(([value, n]) => termOf('tags', value, n)),
    categories: count(posts.map((p: Post) => p.data.category)).map(([value, n]) => termOf('categories', value, n)),
  };
}

/** A paginated list's position, with the href of every page. */
export function toPage(page: PageData, baseUrl: string) {
  return {
    current: page.currentPage,
    last: page.lastPage,
    total: page.total,
    hrefs: Array.from({ length: page.lastPage }, (_, i) => (i === 0 ? baseUrl : `${baseUrl}/${i + 1}`)),
  };
}

/** The shared part of every blog context. */
export async function baseContext(view: string, o: ContextOptions) {
  const { cfg, locale, defaultLocale, showDrafts } = o;
  const labels = resolveLabels(cfg.labels, locale, defaultLocale);
  const all = getPublishedPosts(await getCollection('posts'), showDrafts, locale);
  const marked = all.filter((p: Post) => p.data.featured);
  return {
    view,
    preset: cfg.preset,
    authors: cfg.authors,
    labels: labels as unknown as Record<string, string>,
    listing: { href: localizePath(cfg.permalinks.listing, locale, defaultLocale), title: labels.listingTitle },
    ...(cfg.rss ? { rss: localizePath(cfg.permalinks.rss, locale, defaultLocale) } : {}),
    // Featured: the posts marked so first, then the newest, four at most (a
    // lead story and three beside it).
    featured: await toCards([...marked, ...all.filter((p: Post) => !p.data.featured)].slice(0, 4), o),
    terms: await toTerms(o),
  };
}
