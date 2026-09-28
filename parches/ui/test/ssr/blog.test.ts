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
import ShareBar from '../../src/widgets/blog/ShareBar.astro';
import ArticleBody from '../../src/widgets/blog/ArticleBody.astro';
import SeriesBox from '../../src/widgets/blog/SeriesBox.astro';
import AuthorBox from '../../src/widgets/blog/AuthorBox.astro';
import ReadNext from '../../src/widgets/blog/ReadNext.astro';
import SeriesParts from '../../src/widgets/blog/SeriesParts.astro';
import AuthorProfile from '../../src/widgets/blog/AuthorProfile.astro';
import Writers from '../../src/widgets/blog/Writers.astro';
import Archive from '../../src/widgets/blog/Archive.astro';
import Subscribe from '../../src/widgets/blog/Subscribe.astro';
import IssuePreview from '../../src/widgets/blog/IssuePreview.astro';
import AdSlot from '../../src/widgets/AdSlot.astro';
import BlogComments from '../../src/widgets/blog/Comments.astro';
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
  const trio = await render(Featured, { layout: 'trio' }, ctx({ featured: [card(1), card(2), card(3), card(4)] }));
  expect(trio).toContain('data-layout="trio"');
  expect(trio).toContain('Post 3');
  expect(trio).not.toContain('Post 4');
});

test('PostList list: the date on the right, and a heading for each year', async () => {
  const posts = [card(1), card(2), card(3, { date: '2025-12-03T00:00:00.000Z' })];
  const html = await render(PostList, { layout: 'list', dateSide: 'end', groupBy: 'year' }, ctx({ posts }));
  expect(html).toContain('sm:order-last');
  expect(html.match(/<h2[^>]*>(2026|2025)<\/h2>/g)).toEqual([expect.stringContaining('2026'), expect.stringContaining('2025')]);
  const plain = await render(PostList, { layout: 'list' }, ctx({ posts }));
  expect(plain).toContain('sm:grid-cols-[140px_minmax(0,1fr)]');
  expect(plain).not.toMatch(/<h2[^>]*>2026<\/h2>/);
});

test('PostList cards take the shape of their pictures', async () => {
  // The test posts have no picture: the placeholder keeps the shape.
  expect(await render(PostList, { layout: 'cards' }, ctx())).toContain('aspect-ratio: 16/10');
  expect(await render(PostList, { layout: 'cards', ratio: '1.91/1' }, ctx())).toContain('aspect-ratio: 1.91/1');
});

test('PostList rows: a square thumbnail, or a wide one at 3:2 for a feed', async () => {
  expect(await render(PostList, { layout: 'rows' }, ctx())).toContain('sm:grid-cols-[minmax(0,1fr)_120px]');
  const wide = await render(PostList, { layout: 'rows', thumbnail: 'wide' }, ctx());
  expect(wide).toContain('sm:grid-cols-[minmax(0,1fr)_200px]');
  expect(wide).not.toContain('_120px]');
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
  const noToc = { toc: [] };
  const bare = await render(ArticleBody, {}, post(noToc));
  expect(bare).toContain('<p>First paragraph.</p>');
  expect(bare).not.toContain('<aside');
  expect(await render(ArticleBody, {}, post(noToc), { aside: '  <!-- nothing -->  ' })).not.toContain('<aside');
  const withAside = await render(ArticleBody, {}, post(noToc), { aside: '<nav>toc</nav>' });
  expect(withAside).toContain('<aside');
  expect(withAside).toContain('<nav>toc</nav>');
});

test('wide: the title centred, a 300px sidebar, and the start rail in three columns only when it is filled', async () => {
  expect(await render(ArticleHeader, { layout: 'wide' }, post())).toContain('class="mx-auto max-w-[760px]"');
  const body = await render(ArticleBody, { layout: 'wide' }, post());
  expect(body).toContain('lg:grid-cols-[minmax(0,680px)_300px]');
  expect(body).not.toContain('max-w-[1040px]');
  expect(body).not.toContain('xl:grid-cols-');
  const railed = await render(ArticleBody, { layout: 'wide' }, post(), { start: '<div>SHARE</div>' });
  expect(railed).toContain('xl:grid-cols-[160px_minmax(0,680px)_300px]');
  expect(railed).toMatch(/data-placement="start"[\s\S]*SHARE[\s\S]*class="prose/);
  // The rail is for the wide layout only.
  expect(await render(ArticleBody, {}, post(), { start: '<div>SHARE</div>' })).not.toContain('SHARE');
  expect(await render(ArticleBody, {}, post())).toContain('lg:grid-cols-[minmax(0,680px)_220px]');
});

test('ArticleBody: with only the table above the text, the block hides on wide screens, so the text starts level with the columns', async () => {
  expect(await render(ArticleBody, {}, post())).toContain('class="mb-9 flex flex-col gap-4 lg:hidden"');
  expect(await render(ArticleBody, {}, post(), { before: '  <!-- no series -->  ' })).toContain('lg:hidden"');
  const series = await render(ArticleBody, {}, post(), { before: '<div>SERIES</div>' });
  expect(series).toContain('class="mb-9 flex flex-col gap-4"');
  expect(series).toContain('SERIES');
});

test('ArticleHeader: the cover at 960px or across the page, in the shape asked for', async () => {
  const pic = post({ post: { ...card(2), excerpt: 'The lead.', image: { src: 'https://example.com/cover.jpg', alt: '' } } as any });
  const wide = await render(ArticleHeader, { layout: 'wide', imageWidth: 'wide', imageRatio: '1.91/1' }, pic);
  expect(wide).toContain('mx-auto max-w-[1100px]');
  expect(wide).toContain('aspect-[1.91/1]');
  expect(wide).not.toContain('lg:aspect-[21/9]');
  // Wide with no options keeps the cover across the page, 21:9 on a wide screen.
  expect(await render(ArticleHeader, { layout: 'wide' }, pic)).toContain('lg:aspect-[21/9]');
  expect(await render(ArticleHeader, {}, pic)).toContain('max-w-[1040px]');
});

test('ShareBar: the post\'s share buttons in a column, the networks asked for', async () => {
  const html = await render(ShareBar, { networks: ['x', 'copy'] }, post());
  expect(html).toContain('parche-share-bar');
  expect(html).toContain('url="https://example.com/post-2"');
  expect(html).toContain('data-network="x"');
  expect(html).not.toContain('data-network="linkedin"');
  // By default: direct buttons to the networks and copy link, no device share sheet.
  const plain = await render(ShareBar, {}, post());
  for (const n of ['x', 'linkedin', 'facebook', 'whatsapp', 'mail', 'copy']) expect(plain).toContain(`data-network="${n}"`);
  expect(plain).not.toContain('data-part="native"');
  expect(await render(ShareBar, {}, ctx())).not.toContain('parche-share');
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

test("ArticleBody draws the table of contents from the outline: in the aside, and as a disclosure for narrow screens", async () => {
  const html = await render(ArticleBody, {}, post());
  expect(html.match(/<parche-toc/g)?.length).toBe(2);
  expect(html).toMatch(/<aside[\s\S]*<parche-toc[\s\S]*href="#two"/);
  expect(html).toMatch(/<parche-toc[^>]*class="[^"]*lg:hidden[\s\S]*<details/);
  // One section is not worth a table, and no outline (the blog's toc off) is none.
  expect(await render(ArticleBody, {}, post({ toc: [{ text: 'One', slug: 'one' }] }))).not.toContain('<parche-toc');
  const off = await render(ArticleBody, {}, post({ toc: [] }));
  expect(off).not.toContain('<parche-toc');
  expect(off).not.toContain('<aside');
  // What the view puts in the aside goes under the table.
  expect(await render(ArticleBody, {}, post(), { aside: '<div>AD</div>' })).toMatch(/<parche-toc[\s\S]*<\/parche-toc>[\s\S]*<div>AD<\/div>/);
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

test('Subscribe renders nothing without a subscription, and posts to its endpoint with one', async () => {
  expect(await render(Subscribe, {}, ctx())).not.toContain('parche-subscribe');
  const sub = ctx({ subscribe: { href: '/subscribe', endpoint: 'https://example.com/api/subscribe' }, labels: { subscribeTitle: 'Get new posts by email', subscribeButton: 'Subscribe' } });
  const band = await render(Subscribe, {}, sub);
  expect(band).toContain('data-layout="band"');
  expect(band).toContain('Get new posts by email');
  expect(band).toContain('https://example.com/api/subscribe');
  const hero = await render(Subscribe, { layout: 'hero', eyebrow: 'Every Tuesday', points: ['One idea per issue'] }, sub);
  expect(hero).toMatch(/<h1[^>]*>Get new posts by email<\/h1>/);
  expect(hero).toContain('One idea per issue');
  expect(await render(Subscribe, { layout: 'field' }, sub)).not.toContain('Get new posts by email');
  const stack = await render(Subscribe, { layout: 'stack' }, sub);
  expect(stack).toContain('data-layout="stack"');
  expect(stack).toMatch(/<h2[^>]*>Get new posts by email<\/h2>/);
});

test("IssuePreview shows the latest post as an email from the site; AuthorBox's one step is the subscription", async () => {
  const preview = await render(IssuePreview, {}, ctx({ brand: 'Field Notes', posts: [card(2, { issue: 142 })] }));
  expect(preview).toContain('Field Notes');
  expect(preview).toContain('#142 · Post 2');
  expect(preview).toContain('href="/post-2"');
  const box = await render(AuthorBox, {}, post({}, { authors: 'one', subscribe: { href: '/subscribe' }, labels: { ...post().labels, subscribeNext: 'Get the next one by email' } }));
  expect(box).toMatch(/href="\/subscribe"[^>]*>Get the next one by email/);
});

const ads = { provider: 'adsense' as const, client: 'ca-pub-1', slots: { inArticle: '42' }, consent: 'builtin' as const };

test('AdSlot renders nothing without ads or a unit for its placement; reserves and labels it otherwise', async () => {
  expect(await render(AdSlot, { slot: 'inArticle' }, ctx())).not.toContain('parche-ad');
  expect(await render(AdSlot, { slot: 'articleEnd' }, ctx({ ads }))).not.toContain('parche-ad');
  const html = await render(AdSlot, { slot: 'inArticle', size: 'large-rectangle' }, ctx({ ads }));
  expect(html).toContain('<parche-ad');
  expect(html).toContain('unit="42"');
  expect(html).toContain('h-[280px]');
  expect(html).toContain('Advertisement');
});

test('inArticle goes after the first section, and not at all in a single-section post', async () => {
  const two = post({ html: '<p>Intro.</p><h2 id="a">A</h2><p>A text.</p><h2 id="b">B</h2><p>B text.</p>' });
  const html = await render(ArticleBody, {}, two, { inArticle: '<div>AD</div>' });
  expect(html.indexOf('AD')).toBeGreaterThan(html.indexOf('Intro.'));
  expect(html.indexOf('AD')).toBeLessThan(html.indexOf('id="a"'));
  const fromHeading = post({ html: '<h2 id="a">A</h2><p>A text.</p><h2 id="b">B</h2>' });
  const h = await render(ArticleBody, {}, fromHeading, { inArticle: '<div>AD</div>' });
  expect(h.indexOf('AD')).toBeGreaterThan(h.indexOf('A text.'));
  expect(h.indexOf('AD')).toBeLessThan(h.indexOf('id="b"'));
  const one = post({ html: '<h2 id="a">A</h2><p>Only.</p>' });
  expect(await render(ArticleBody, {}, one, { inArticle: '<div>AD</div>' })).not.toContain('AD');
});

test('inFeed goes after inFeedAfter posts, never first, and only when there is something after it', async () => {
  const list = await render(PostList, { inFeedAfter: 2 }, ctx(), { inFeed: '<div>FEED</div>' });
  expect(list.indexOf('FEED')).toBeGreaterThan(list.indexOf('Post 2'));
  expect(list.indexOf('FEED')).toBeLessThan(list.indexOf('Post 3'));
  expect(list).toContain('data-placement="inFeed"');
  expect(await render(PostList, { inFeedAfter: 3 }, ctx(), { inFeed: '<div>FEED</div>' })).not.toContain('FEED');
});

test('Comments renders nothing until configured, then the giscus loader with the blog settings', async () => {
  expect(await render(BlogComments, {}, post())).not.toContain('parche-comments');
  const comments = { provider: 'giscus' as const, repo: 'owner/repo', repoId: 'R_1', category: 'Comments', categoryId: 'DIC_1', mapping: 'pathname' as const, consent: true };
  const html = await render(BlogComments, {}, post({}, { comments, labels: { ...post().labels, commentsTitle: 'Comments', commentsNote: 'Moderated' } }));
  expect(html).toContain('<parche-comments');
  expect(html).toContain('repo="owner/repo"');
  expect(html).toContain('consent="required"');
  expect(html).toContain('Moderated');
});
