/**
 * Builds the blog context a route hands to its view (see ui's
 * lib/blog-context.ts for the shape): the posts as cards with every link and
 * string resolved, the page, the terms with their counts, the term or author
 * the page is about. Routes differ only in which posts they query.
 */
import { getCollection } from 'astro:content';
import { resolveAssets } from 'parche:utils/assets';
import { calculateReadingTime } from './reading-time.js';
import { getPublishedPosts } from './post-helpers.js';
import { findRelatedPosts } from './related-posts.js';
import { extractTOC } from './toc.js';
import { formatDate } from './dates.js';
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

/**
 * A series described in the `series` collection: `{locale}/{name}`, then
 * `{name}`. Read from the list, not with getEntry, so a series without a file
 * (or a site without the collection) is not reported as missing.
 */
async function describedSeries(name: string, locale: string): Promise<any> {
  let entries: any[] = [];
  try {
    entries = await getCollection('series' as any);
  } catch {
    return null;
  }
  return entries.find((e) => e.id === `${locale}/${name}`) ?? entries.find((e) => e.id === name) ?? null;
}

/** Author entries by key, looked up once per render: `{locale}/{key}`, then `{key}`. */
async function authorLookup(locale: string) {
  let entries: any[] = [];
  try {
    entries = await getCollection('authors' as any);
  } catch {
    entries = [];
  }
  const cache = new Map<string, any>();
  return async (key: string) => {
    if (cache.has(key)) return cache.get(key);
    const entry = entries.find((e) => e.id === `${locale}/${key}`) ?? entries.find((e) => e.id === key);
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
      dateText: formatDate(d.publishDate, dateLocale, cfg.dateFormat),
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
    ...(cfg.subscribe ? { subscribe: { href: localizePath(cfg.subscribe.path, locale, defaultLocale), ...(cfg.subscribe.endpoint ? { endpoint: cfg.subscribe.endpoint } : {}) } } : {}),
    // Featured: the posts marked so first, then the newest, four at most (a
    // lead story and three beside it).
    featured: await toCards([...marked, ...all.filter((p: Post) => !p.data.featured)].slice(0, 4), o),
    terms: await toTerms(o),
  };
}

/**
 * The context of an article page: the post as a card with its full image, the
 * rendered body and its outline, the authors with their bio and post count,
 * where the post sits in its series, and the related posts.
 */
export async function articleContext(entry: Post, html: string, url: string, o: ContextOptions) {
  const { cfg, locale, defaultLocale, showDrafts } = o;
  const all = getPublishedPosts(await getCollection('posts'), showDrafts, locale);
  const [card] = await toCards([entry], o);
  const d = entry.data;
  const author = await authorLookup(locale);

  const authors = [];
  for (const key of d.authors ?? []) {
    const a = await author(key);
    const count = all.filter((p: Post) => (p.data.authors ?? []).includes(key)).length;
    authors.push({
      name: a?.name ?? key,
      ...(a?.role ? { role: a.role } : {}),
      ...(a?.bio ? { bio: a.bio } : {}),
      ...(a?.avatar ? { avatar: a.avatar } : {}),
      href: resolveAuthorHref(cfg, a?.key ?? key, locale, defaultLocale),
      count,
    });
  }
  if (authors.length === 0 && d.authorName) authors.push({ name: d.authorName, count: 0 });

  let series;
  if (d.series) {
    const name = d.series.name;
    const described = await describedSeries(name, locale);
    const parts = all.filter((p: Post) => p.data.series?.name === name).sort((a: Post, b: Post) => a.data.series.order - b.data.series.order);
    const upcoming = (described?.data?.status ?? 'ongoing') === 'ongoing' ? (described?.data?.upcoming ?? []) : [];
    const at = parts.findIndex((p: Post) => p.id === entry.id);
    const prev = at > 0 ? parts[at - 1] : undefined;
    const next = at >= 0 && at < parts.length - 1 ? parts[at + 1] : undefined;
    const soon = !next && upcoming[0] ? upcoming[0] : undefined;
    series = {
      title: described?.data?.title ?? name,
      ...(described?.data?.description ? { description: described.data.description } : {}),
      ...(cfg.series ? { href: resolveTaxonomyPermalink(cfg.permalinks.series, name, locale, defaultLocale) } : {}),
      part: d.series.order,
      total: parts.length + upcoming.length,
      ...(prev ? { prev: { title: prev.data.title, href: resolvePostPermalink(cfg.permalinks.post, prev, locale, defaultLocale) } } : {}),
      ...(next
        ? { next: { title: next.data.title, href: resolvePostPermalink(cfg.permalinks.post, next, locale, defaultLocale) } }
        : soon
          ? { next: { title: soon.title, ...(soon.date ? { dateText: formatDate(soon.date, locale, { year: 'numeric', month: 'long', day: 'numeric' }) } : {}) } }
          : {}),
    };
  }

  const related = cfg.relatedPostsCount > 0 ? await toCards(findRelatedPosts(entry, all, cfg.relatedPostsCount), o) : [];

  return {
    ...(await baseContext('post', o)),
    posts: [],
    article: {
      post: {
        ...card,
        ...(d.image ? { image: (await resolveAssets(d.image)) as any } : {}),
        ...(d.modifiedDate ? { modifiedText: formatDate(d.modifiedDate, locale, cfg.dateFormat) } : {}),
      },
      html,
      toc: extractTOC(html)
        .filter((i) => i.depth === 2)
        .map((i) => ({ text: i.text, slug: i.slug, ...(i.children.length ? { children: i.children.map((c) => ({ text: c.text, slug: c.slug })) } : {}) })),
      url,
      authors: await resolveAssets(authors),
      ...(series ? { series } : {}),
      related,
    },
  };
}

/**
 * A series page's context: its title and description (from the `series`
 * collection when the series is described there), the published parts in
 * order and the announced ones with their date.
 */
export async function seriesContext(name: string, posts: Post[], o: ContextOptions) {
  const { cfg, locale, defaultLocale } = o;
  const described = await describedSeries(name, locale);
  const ordered = [...posts].sort((a: Post, b: Post) => a.data.series.order - b.data.series.order);
  const status: 'ongoing' | 'complete' = described?.data?.status ?? 'ongoing';
  const upcoming = status === 'ongoing' ? (described?.data?.upcoming ?? []) : [];
  const dateText = (d: Date) => formatDate(d, locale, cfg.dateFormat);
  const parts = [
    ...ordered.map((p: Post, i: number) => ({
      n: i + 1,
      title: p.data.title,
      href: resolvePostPermalink(cfg.permalinks.post, p, locale, defaultLocale),
      dateText: dateText(p.data.publishDate),
      upcoming: false,
    })),
    ...upcoming.map((u: any, i: number) => ({
      n: ordered.length + i + 1,
      title: u.title,
      ...(u.date ? { dateText: formatDate(u.date, locale, { year: 'numeric', month: 'long' }) } : {}),
      upcoming: true,
    })),
  ];
  return {
    title: described?.data?.title ?? name,
    ...(described?.data?.description ? { description: described.data.description } : {}),
    status,
    published: ordered.length,
    total: parts.length,
    parts,
  };
}

/** Every writer of the locale with at least one post, most published first. */
export async function writersContext(o: ContextOptions) {
  const { cfg, locale, defaultLocale, showDrafts } = o;
  const all = getPublishedPosts(await getCollection('posts'), showDrafts, locale);
  const author = await authorLookup(locale);
  const counts = new Map<string, number>();
  for (const p of all) for (const key of p.data.authors ?? []) counts.set(key, (counts.get(key) ?? 0) + 1);
  const writers = [];
  for (const [key, count] of [...counts].sort((a, b) => b[1] - a[1])) {
    const a = await author(key);
    writers.push({
      key: a?.key ?? key,
      name: a?.name ?? key,
      ...(a?.role ? { role: a.role } : {}),
      ...(a?.avatar ? { avatar: a.avatar } : {}),
      href: resolveAuthorHref(cfg, a?.key ?? key, locale, defaultLocale),
      count,
    });
  }
  return resolveAssets(writers);
}

/**
 * An archive page's context: one year's posts grouped by month, newest first,
 * and every year with its count, so a reader can get back to the thing they
 * half remember. The newest year is the archive's own page.
 */
export async function archiveContext(year: number | undefined, o: ContextOptions) {
  const { cfg, locale, defaultLocale, showDrafts } = o;
  const all = getPublishedPosts(await getCollection('posts'), showDrafts, locale);
  const yearOf = (p: Post) => p.data.publishDate.getUTCFullYear();
  const counts = new Map<number, number>();
  for (const p of all) counts.set(yearOf(p), (counts.get(yearOf(p)) ?? 0) + 1);
  const years = [...counts.keys()].sort((a, b) => b - a);
  const shown = year ?? years[0];
  const base = localizePath(cfg.permalinks.archive, locale, defaultLocale);
  const months = new Map<string, Post[]>();
  for (const p of all.filter((x: Post) => yearOf(x) === shown)) {
    const label = formatDate(p.data.publishDate, locale, { year: 'numeric', month: 'long' });
    months.set(label, [...(months.get(label) ?? []), p]);
  }
  return {
    year: shown,
    total: all.length,
    years: years.map((y) => ({ year: y, count: counts.get(y)!, href: y === years[0] ? base : `${base}/${y}`, current: y === shown })),
    months: [...months].map(([label, posts]) => ({
      label,
      count: posts.length,
      posts: posts.map((p: Post) => ({
        title: p.data.title,
        href: resolvePostPermalink(cfg.permalinks.post, p, locale, defaultLocale),
        date: p.data.publishDate.toISOString(),
        dateText: formatDate(p.data.publishDate, locale, cfg.dateFormat),
      })),
    })),
  };
}
