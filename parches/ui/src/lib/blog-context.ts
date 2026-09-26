/**
 * What a blog route knows, handed to the widgets of its view.
 *
 * The blog's pages are JSON views (lists of widgets), so the view decides how
 * a page looks and never wires data: the route queries the posts, the page,
 * the terms and the author, and leaves them here, on `Astro.locals.parche.blog`.
 * A blog widget reads what it needs and still takes props, which win: the
 * same PostList renders the route's posts in a view and a fixed list on a home
 * page.
 *
 * The ui parche cannot import the blog parche (the dependency runs the other
 * way), so the shape is declared here and the blog builds objects of it.
 */

/** A post as a list shows it: everything resolved (links, date, reading time). */
export interface BlogCard {
  title: string;
  excerpt?: string;
  href: string;
  image?: { src: string; alt?: string };
  /** ISO date, for <time datetime>. */
  date: string;
  /** The date as the site formats it, in the page's locale. */
  dateText: string;
  authors: { name: string; href?: string; avatar?: { src: string; alt?: string } }[];
  category?: { name: string; href: string };
  tags: { name: string; href: string }[];
  /** "9 min read", already formatted; absent when reading time is off. */
  readingTime?: string;
  featured: boolean;
  /** A newsletter issue number. */
  issue?: number;
  series?: { name: string; part: number };
}

export interface BlogTerm {
  name: string;
  href: string;
  count: number;
  description?: string;
}

export interface BlogPageInfo {
  current: number;
  last: number;
  /** Posts in the whole list, not only this page. */
  total: number;
  /** The href of page n. */
  hrefs: string[];
}

export interface BlogContext {
  /** Which view is rendering: index, taxonomy, author, series, post, archive, subscribe, search. */
  view: string;
  preset: 'personal' | 'company' | 'magazine' | 'newsletter';
  /** One writer or several: bylines are left out for one. */
  authors: 'one' | 'many';
  /** The UI strings in the page's language (see the blog's labels). */
  labels: Record<string, string>;
  listing: { href: string; title: string };
  /** The site's name: who a newsletter issue is from. */
  brand?: string;
  rss?: string;
  /** The subscription page and where its form posts, when the blog has one. */
  subscribe?: { href: string; endpoint?: string };
  /** This page's posts. */
  posts: BlogCard[];
  /** Posts marked featured (or the newest, when none is), newest first. */
  featured: BlogCard[];
  /** Hrefs of the posts the view already features on this page; a list leaves them out. */
  shown?: string[];
  page?: BlogPageInfo;
  /** Every tag and category with its count, for navigation. */
  terms: { tags: BlogTerm[]; categories: BlogTerm[] };
  /** The term this page filters by, on a tag or category page. */
  term?: BlogTerm & { kind: 'tags' | 'categories' };
  author?: {
    name: string;
    role?: string;
    bio?: string;
    avatar?: { src: string; alt?: string };
    links: { label: string; href: string }[];
    count: number;
  };
  /** On an article page. */
  article?: BlogArticle;
  /** On an author page: every writer, for "Other writers". */
  writers?: { key: string; name: string; role?: string; avatar?: { src: string; alt?: string }; href: string; count: number }[];
  /** On an archive page. */
  archive?: {
    year: number;
    total: number;
    years: { year: number; count: number; href: string; current: boolean }[];
    months: { label: string; count: number; posts: { title: string; href: string; date: string; dateText: string }[] }[];
  };
  /** On a series page. */
  series?: {
    title: string;
    description?: string;
    status: 'ongoing' | 'complete';
    published: number;
    total: number;
    parts: { n: number; title: string; href?: string; dateText?: string; upcoming: boolean }[];
  };
}

/** What an article page knows about its post. */
export interface BlogArticle {
  post: BlogCard & { image?: { src: string; alt?: string; caption?: string }; modifiedText?: string };
  /** The rendered body. */
  html: string;
  /** The body's h2 and h3, for a table of contents. */
  toc: { text: string; slug: string; children?: { text: string; slug: string }[] }[];
  /** The page's absolute URL, for sharing. */
  url: string;
  authors: { name: string; role?: string; bio?: string; avatar?: { src: string; alt?: string }; href?: string; count: number }[];
  series?: {
    title: string;
    description?: string;
    /** The series page, when the blog builds series pages. */
    href?: string;
    part: number;
    /** Published parts plus the announced ones. */
    total: number;
    prev?: { title: string; href: string };
    /** The next part: a link when published, a date when announced. */
    next?: { title: string; href?: string; dateText?: string };
  };
  related: BlogCard[];
}

/** The blog context of this request, or undefined outside a blog page. */
export function blogContext(locals: unknown): BlogContext | undefined {
  return (locals as { parche?: { blog?: BlogContext } } | undefined)?.parche?.blog;
}
