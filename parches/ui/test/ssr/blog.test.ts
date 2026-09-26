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
import ArticleHeader from '../../src/widgets/blog/ArticleHeader.astro';
import ArticleBody from '../../src/widgets/blog/ArticleBody.astro';
import SeriesBox from '../../src/widgets/blog/SeriesBox.astro';
import AuthorBox from '../../src/widgets/blog/AuthorBox.astro';
import ReadNext from '../../src/widgets/blog/ReadNext.astro';
import TOC from '../../src/widgets/blog/TOC.astro';
import SeriesParts from '../../src/widgets/blog/SeriesParts.astro';
import AuthorProfile from '../../src/widgets/blog/AuthorProfile.astro';
import Writers from '../../src/widgets/blog/Writers.astro';
import Archive from '../../src/widgets/blog/Archive.astro';
import type { BlogArticle, BlogCard, BlogContext } from '../../src/lib/blog-context';

let container: AstroContainer | null = null;
async function render(Widget: any, props: Record<string, unknown> = {}, blog?: Partial<BlogContext>, slots?: Record<string, string>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Widget, { props, locals: blog ? { parche: { blog } } : {}, ...(slots ? { slots } : {}) });
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

const article = (extra: Partial<BlogArticle> = {}): BlogArticle => ({
  post: { ...card(2), excerpt: 'The lead.' },
  html: '<h2 id="one">One</h2><p>First paragraph.</p><h2 id="two">Two</h2>',
  toc: [{ text: 'One', slug: 'one' }, { text: 'Two', slug: 'two' }],
  url: 'https://example.com/post-2',
  authors: [{ name: 'Jane Doe', role: 'Editor', bio: 'Writes things.', href: '/blog/author/jane', count: 5 }],
  related: [card(3), card(4)],
  ...extra,
});
const post = (a: Partial<BlogArticle> = {}, c: Partial<BlogContext> = {}) => ctx({ view: 'post', article: article(a), labels: { ...ctx().labels, seriesEyebrow: 'Series · Part {part} of {total}', nextInSeries: 'Next in {series}', publishes: 'Publishes {date}', writtenBy: 'Written by {name}', moreFrom: 'More from {name}', postsCount: '{count} posts', readNext: 'Read next', onThisPage: 'On this page' }, ...c });

test('ArticleHeader: the title as h1, the lead, a byline only for a blog with several writers', async () => {
  const many = await render(ArticleHeader, {}, post());
  expect(many).toMatch(/<h1[^>]*>Post 2<\/h1>/);
  expect(many).toContain('The lead.');
  expect(many).toContain('Jane Doe');
  expect(many).toContain('href="/blog/category/guides"');
  const one = await render(ArticleHeader, {}, post({}, { authors: 'one' }));
  expect(one).not.toContain('Jane Doe');
  expect(one).toContain('2 Sept 2026');
});

test('ArticleBody renders the body, and a sidebar only when one is filled', async () => {
  const bare = await render(ArticleBody, {}, post());
  expect(bare).toContain('<p>First paragraph.</p>');
  expect(bare).not.toContain('<aside');
  const withAside = await render(ArticleBody, {}, post(), { aside: '<nav>toc</nav>' });
  expect(withAside).toContain('<aside');
  expect(withAside).toContain('<nav>toc</nav>');
});

test('SeriesBox: the part at the top, the next part or its date at the end, nothing outside a series', async () => {
  expect(await render(SeriesBox, {}, post())).not.toContain('parche-series-box');
  const series = { title: 'Variable fonts', part: 2, total: 5, href: '/blog/series/variable-fonts', prev: { title: 'Part one', href: '/one' }, next: { title: 'Axes', dateText: '1 October 2026' } };
  const top = await render(SeriesBox, {}, post({ series }));
  expect(top).toContain('Series · Part 2 of 5');
  expect(top).toContain('href="/one"');
  const next = await render(SeriesBox, { variant: 'next' }, post({ series }));
  expect(next).toContain('Next in Variable fonts');
  expect(next).toContain('Publishes 1 October 2026');
});

test('AuthorBox: "Written by" and one action for one writer; bio and "More from" for several', async () => {
  const one = await render(AuthorBox, { action: { text: 'Get the next one', href: '/subscribe' } }, post({}, { authors: 'one' }));
  expect(one).toContain('Written by Jane Doe');
  expect(one).toContain('href="/subscribe"');
  const many = await render(AuthorBox, {}, post());
  expect(many).toContain('Editor · 5 posts');
  expect(many).toContain('More from Jane Doe');
});

test('ReadNext lists the related posts, and nothing when there are none', async () => {
  expect(await render(ReadNext, {}, post())).toContain('href="/post-3"');
  expect(await render(ReadNext, {}, post({ related: [] }))).not.toContain('Read next');
});

test("TOC reads the post's outline; one section is not worth a table", async () => {
  expect(await render(TOC, {}, post())).toContain('href="#two"');
  expect(await render(TOC, {}, post({ toc: [{ text: 'One', slug: 'one' }] }))).not.toContain('href="#one"');
});

const series = { title: 'Variable fonts', description: 'Five essays.', status: 'ongoing' as const, published: 2, total: 3, parts: [
  { n: 1, title: 'One file', href: '/one', dateText: '2 Mar 2026', upcoming: false },
  { n: 2, title: 'Kerning', href: '/two', dateText: '30 May 2026', upcoming: false },
  { n: 3, title: 'Axes', dateText: 'October 2026', upcoming: true },
] };

test('a series page: how many parts are out, when the next is due, the parts in order', async () => {
  const labels = { seriesPublished: 'Series · {published} of {total} published', seriesDue: 'Ongoing · part {n} due {date}', seriesComplete: 'Complete' };
  const header = await render(PageHeader, { size: 'md' }, ctx({ view: 'series', series, labels }));
  expect(header).toContain('Series · 2 of 3 published');
  expect(header).toMatch(/<h1[^>]*>Variable fonts<\/h1>/);
  expect(header).toContain('Ongoing · part 3 due October 2026');
  expect(await render(PageHeader, {}, ctx({ view: 'series', series: { ...series, status: 'complete' }, labels }))).toContain('Complete');
  const parts = await render(SeriesParts, {}, ctx({ series }));
  expect(parts).toContain('href="/two"');
  expect(parts).not.toContain('href="/three"');
  expect(parts).toContain('October 2026');
});

test("AuthorProfile shows the page's author; Writers lists the others", async () => {
  const author = { name: 'Jane Doe', role: 'Editor', bio: 'Writes things.', links: [{ label: 'GitHub', href: 'https://github.com/jane' }], count: 5 };
  const profile = await render(AuthorProfile, {}, ctx({ view: 'author', author, labels: { postsCount: '{count} posts', authorLabel: 'Author' } }));
  expect(profile).toMatch(/<h1[^>]*>Jane Doe<\/h1>/);
  expect(profile).toContain('rel="me noopener"');
  expect(profile).toContain('5 posts');
  const writers = await render(Writers, {}, ctx({ author, writers: [
    { key: 'jane', name: 'Jane Doe', href: '/blog/author/jane', count: 5 },
    { key: 'mark', name: 'Mark Rivera', role: 'Engineer', href: '/blog/author/mark', count: 3 },
  ] }));
  expect(writers).toContain('Mark Rivera');
  expect(writers).not.toContain('href="/blog/author/jane"');
});

test('Archive: the year by month with counts, and the other years as links', async () => {
  const archive = { year: 2026, total: 12, years: [
    { year: 2026, count: 9, href: '/blog/archive', current: true },
    { year: 2025, count: 3, href: '/blog/archive/2025', current: false },
  ], months: [{ label: 'September 2026', count: 2, posts: [
    { title: 'Post 1', href: '/post-1', date: '2026-09-01T00:00:00.000Z', dateText: '1 Sept 2026' },
    { title: 'Post 2', href: '/post-2', date: '2026-09-02T00:00:00.000Z', dateText: '2 Sept 2026' },
  ] }] };
  const labels = { postsCount: '{count} posts', archiveEarlier: 'Earlier', archiveTitle: 'Archive', archiveSubtitle: 'Everything, by month. {total} posts in total.' };
  const html = await render(Archive, {}, ctx({ archive, labels }));
  expect(html).toContain('September 2026');
  expect(html).toContain('2 posts');
  expect(html).toContain('href="/blog/archive/2025"');
  expect(html).not.toContain('href="/blog/archive"');
  expect(await render(PageHeader, {}, ctx({ archive, labels }))).toContain('Everything, by month. 12 posts in total.');
});
