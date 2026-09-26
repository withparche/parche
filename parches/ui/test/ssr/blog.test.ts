/**
 * The blog widgets of the views: they read the route's context (the posts, the
 * page, the terms) and take props that win over it.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PostList from '../../src/widgets/blog/PostList.astro';
import PageHeader from '../../src/widgets/blog/PageHeader.astro';
import Featured from '../../src/widgets/blog/Featured.astro';
import TaxonomyNav from '../../src/widgets/blog/TaxonomyNav.astro';
import Pagination from '../../src/widgets/blog/Pagination.astro';
import type { BlogCard, BlogContext } from '../../src/lib/blog-context';

let container: AstroContainer | null = null;
async function render(Widget: any, props: Record<string, unknown> = {}, blog?: Partial<BlogContext>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Widget, { props, locals: blog ? { parche: { blog } } : {} });
}

const card = (n: number, extra: Partial<BlogCard> = {}): BlogCard => ({
  title: `Post ${n}`,
  excerpt: `Lead of post ${n}.`,
  href: `/post-${n}`,
  date: `2026-09-0${n}T00:00:00.000Z`,
  dateText: `${n} Sept 2026`,
  authors: [{ name: 'Jane Doe', href: '/blog/author/jane' }],
  category: { name: 'Guides', href: '/blog/category/guides' },
  tags: [{ name: 'astro', href: '/blog/tag/astro' }],
  readingTime: `${n} min read`,
  featured: n === 1,
  ...extra,
});

const ctx = (extra: Partial<BlogContext> = {}): Partial<BlogContext> => ({
  view: 'index',
  preset: 'company',
  authors: 'many',
  labels: { emptyState: 'Nothing here.', pageSummary: 'Page {current} of {last} · {total} posts', postsCount: '{count} posts', categoryLabel: 'Category', newerPosts: 'Newer', olderPosts: 'Older' },
  listing: { href: '/blog', title: 'Blog' },
  rss: '/rss.xml',
  posts: [card(1), card(2), card(3)],
  featured: [card(1)],
  terms: { tags: [{ name: 'astro', href: '/blog/tag/astro', count: 3 }], categories: [{ name: 'Guides', href: '/blog/category/guides', count: 3 }] },
  ...extra,
});

test("PostList renders the page's posts, and leaves out the ones the view already features", async () => {
  const html = await render(PostList, { layout: 'list' }, ctx({ shown: ['/post-1'] }));
  expect(html).not.toContain('href="/post-1"');
  expect(html).toContain('href="/post-2"');
  expect(html).toContain('#astro');
  expect(html).toContain('<time datetime="2026-09-02T00:00:00.000Z"');
});

test('PostList shows no byline on a blog with one writer, and no category on its own page', async () => {
  const one = await render(PostList, { layout: 'cards' }, ctx({ authors: 'one' }));
  expect(one).not.toContain('Jane Doe');
  const onCategory = await render(PostList, { layout: 'cards' }, ctx({ term: { kind: 'categories', name: 'Guides', href: '/blog/category/guides', count: 3 } }));
  expect(onCategory).not.toContain('>Guides<');
  const elsewhere = await render(PostList, { layout: 'cards' }, ctx());
  expect(elsewhere).toContain('>Guides<');
});

test('PostList prefixes issue numbers and says so when empty', async () => {
  expect(await render(PostList, {}, ctx({ posts: [card(2, { issue: 142 })] }))).toContain('#142 · Post 2');
  expect(await render(PostList, {}, ctx({ posts: [] }))).toContain('Nothing here.');
  expect(await render(PostList, { empty: 'Soon.' }, ctx({ posts: [] }))).toContain('Soon.');
});

test('PostList takes a fixed list outside a blog page', async () => {
  const html = await render(PostList, { layout: 'compact', posts: [card(3)] });
  expect(html).toContain('Post 3');
});

test('PageHeader takes the listing title, or the term with a trail and its count', async () => {
  expect(await render(PageHeader, {}, ctx())).toMatch(/<h1[^>]*>Blog<\/h1>/);
  const term = await render(PageHeader, {}, ctx({ term: { kind: 'categories', name: 'Guides', href: '/blog/category/guides', count: 3, description: 'How-tos.' }, page: { current: 1, last: 1, total: 3, hrefs: ['/blog/category/guides'] } }));
  expect(term).toMatch(/<h1[^>]*>Guides<\/h1>/);
  expect(term).toContain('How-tos.');
  expect(term).toContain('3 posts');
  expect(term).toMatch(/href="\/blog"[^>]*>Blog<\/a>/);
  expect(await render(PageHeader, { title: 'Notes on type' }, ctx())).toContain('Notes on type');
});

test('Featured leads with the featured post; lead adds three beside it', async () => {
  const one = await render(Featured, {}, ctx());
  expect(one).toContain('Post 1');
  expect(one).toContain('data-layout="one"');
  const lead = await render(Featured, { layout: 'lead' }, ctx({ featured: [card(1), card(2), card(3), card(4), card(5)] }));
  expect(lead).toContain('Post 4');
  expect(lead).not.toContain('Post 5');
});

test('TaxonomyNav links every term, marks the current one, and keeps All and the feed', async () => {
  const html = await render(TaxonomyNav, { kind: 'categories' }, ctx({ term: { kind: 'categories', name: 'Guides', href: '/blog/category/guides', count: 3 } }));
  expect(html).toMatch(/href="\/blog\/category\/guides"[^>]*aria-current="page"/);
  expect(html).toContain('href="/blog"');
  expect(html).toContain('href="/rss.xml"');
  expect(await render(TaxonomyNav, {}, ctx())).toContain('#astro');
});

test('Pagination reads the page, with numbers and a summary; nothing for one page', async () => {
  const html = await render(Pagination, {}, ctx({ page: { current: 2, last: 3, total: 14, hrefs: ['/blog', '/blog/2', '/blog/3'] } }));
  expect(html).toContain('Page 2 of 3 · 14 posts');
  expect(html).toContain('href="/blog/3"');
  expect(await render(Pagination, {}, ctx({ page: { current: 1, last: 1, total: 3, hrefs: ['/blog'] } }))).not.toContain('Page 1');
});
