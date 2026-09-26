# The blog

Provisional, like everything in `docs-wip/`. How the blog parche
(`@parche/astro-blog`) is configured and how its pages are composed. Written
as the redesign lands; the parts not built yet are marked.

## Two decisions, two places

The blog separates **structure** from **presentation**:

- **Structure is configuration**: which pages exist, how posts link to
  authors, how many related posts are looked up. It lives in
  `createBlog({ … })` and changes routes and data. Turned off, a page is not
  generated at all; nothing is hidden with CSS.
- **Presentation is a view**: a JSON tree of widgets per blog page type, the
  same shape as a page's body. It lives in content, so the builder and an
  assistant edit it like any page, without touching the config.

A **preset** fills both: the structure's defaults and a view for every page.

## Presets

```js
createBlog({ preset: 'personal' })
```

| | personal | company (default) | magazine | newsletter |
|---|---|---|---|---|
| Writers | one: no author pages, bylines link to `/about` | several, each with a page | several | one |
| Series pages | yes | no | yes | no |
| Related posts | 3 | 3 | 3 | 0 |
| Index view | heading, #tags, a list with a date column | heading, featured post, categories, cards | lead story and three, sections, compact rows | centred heading, latest issue, #tags, list |

A preset is a starting point, never a lock: any key given explicitly wins,
and any view can be replaced. The type of each publication comes from the
theme (a magazine reads best with the Editorial theme), not from the blog.

## Configuration

Every key is optional. Resolution: built-in defaults, then the preset, then
the keys given. Components read the resolved values, never `preset`.

| Key | Default | What it changes |
|---|---|---|
| `preset` | `'company'` | The defaults below, and the views. |
| `authors` | from the preset | `'one'`: no author pages; a byline links to `aboutPath`. `'many'`: a page per author. |
| `aboutPath` | `'/about'` | Where a single writer's name links. |
| `series` | from the preset | Series pages and part-of-a-series boxes. |
| `relatedPostsCount` | from the preset | Related posts after an article; `0` turns them off. |
| `postsPerPage` | `12` | Posts per listing page. |
| `tagIndexThreshold` | `3` | Tag pages (and archive years) with fewer posts are `noindex, follow`. |
| `archive` | `true` | The archive: the newest year by month at `/blog/archive`, earlier years at `/blog/archive/2025`. |
| `comments` | off | `{ repo, repoId, category, categoryId, mapping?, consent? }`: giscus comments under posts (see *Comments*). |
| `ads` | off | `{ provider?, client?, slots?, src?, html?, consent? }`: see *Ads and other placements*. |
| `search` | on | `true`, `false` or `{ path? }`: a Pagefind index built after the site and a search page at `path` (default `/search`, noindex). Needs the posts prerendered. |
| `subscribe` | off | `{ endpoint?, path? }`: a subscribe page at `path` (default `/subscribe`) and the forms the views place. `endpoint` is where the form posts; without one the send is simulated, for a demo. |
| `readingTime`, `wordsPerMinute` | `true`, `200` | Reading time, computed from the body. |
| `rss` | `true` | The feed, advertised in every page's head. |
| `permalinks` | `/blog/…` | URL patterns for posts, listing, tags, categories, authors, series, feed. |
| `dateFormat` | short month | `Intl.DateTimeFormat` options; the locale decides word order. |
| `labels` | English | UI strings per locale. |

The options are checked when `createBlog()` runs: an unknown key, a wrong
value or a permalink without a leading slash stops the build with its name.

## Views

Each blog page type renders a view: `index`, `taxonomy` (tag and category
pages), `author`, `post` (the article). More come with the series, archive,
subscribe and search pages.

A view is `{ "sections": [ …nodes ], "wrapper"?: … }`. The preset's ships
with the blog; a site replaces one by adding it to the `views` collection:

```
src/content/views/blog-index.json        every locale
src/content/views/es/blog-index.json     Spanish only
```

```json
{
  "sections": [
    {
      "widget": "Section",
      "slots": {
        "default": [
          { "widget": "blog/PageHeader", "props": { "title": "Notes on type and interfaces" } },
          { "widget": "blog/TaxonomyNav", "props": { "kind": "tags" } },
          { "widget": "blog/PostList", "props": { "layout": "list" } },
          { "widget": "blog/Pagination" }
        ]
      }
    }
  ]
}
```

The AstroWind demo does exactly this: it keeps the company preset and gives
its index a title and a lead of its own in
`demos/astrowind/src/content/views/blog-index.json`.

The site exports the collection with the others:

```ts
const { posts, authors, taxonomies, series, views } = createBlogCollections();
```

**Widgets read the page, views never wire data.** The route queries the
posts, the page, the terms and the author, and hands them to the view's
widgets as the blog context (`parches/ui/src/lib/blog-context.ts`). So
`{ "widget": "blog/PostList" }` already lists this page's posts. Props still
win: the same PostList shows a fixed list when given `posts`.

**Text.** A view carries no text unless it wants to. `{ "$label": "sectionsLabel" }`
is the blog label of that name in the page's language; a site's own view can
simply write its words.

A post the view already features on the first page (`blog/Featured`) is not
listed again under it.

**Load more** (`blog/Pagination` with `more: true`, the magazine's default) is
progressive enhancement on the real pages, never a replacement: the button is
a link to `/blog/2`, a complete page a crawler follows and a reader without
script gets. With script (the LoadMore element) it fetches that page, adds its
posts to the list, points itself at the next one and updates the address, so
a reload lands where the reader is. On the last page it goes away.

### The widgets

| Widget | What it shows | Main props |
|---|---|---|
| `blog/PageHeader` | The page's h1: the blog's title, the term with a trail and its count, the author | `title`, `subtitle`, `tagline`, `align`, `size` |
| `blog/Featured` | The posts marked `featured: true`, then the newest | `layout: one \| lead`, `label` |
| `blog/TaxonomyNav` | Tags or categories as chips, with All and the feed | `kind`, `label`, `limit`, `all`, `rss` |
| `blog/PostList` | The page's posts | `layout: list \| cards \| rows \| compact`, `density: airy \| compact`, `columns`, and toggles `date`, `excerpt`, `image`, `author`, `readingTime`, `category`, `tags` |
| `blog/Pagination` | Newer, numbers, older, "Page 1 of 7 · 38 posts"; or a "Load more" button | `numbers`, `summary`, `more` |

Bylines never show on a blog with one writer, and a category's own page does
not repeat the category on every card.

### The article

The post template renders the body once, reads its outline (h2 and h3, by
the ids the Markdown renderer gave them) and builds the article context: the
post, its authors with bio and post count, its place in its series, the
related posts. Then it renders the `post` view, the same on a prefixed
permalink and on a root-level one.

```json
{ "widget": "blog/ArticleBody", "slots": {
  "before": [{ "widget": "blog/SeriesBox" }],
  "after": [{ "widget": "blog/SeriesBox", "props": { "variant": "next" } }, { "widget": "blog/AuthorBox" }],
  "aside": [{ "widget": "blog/TOC" }]
} }
```

| Widget | What it shows | Main props |
|---|---|---|
| `blog/ArticleHeader` | Trail, h1, lead, byline (several writers only), date, reading time, copy link and share, then the image wider than the text. Nothing else before the first paragraph. | `image`, `share`, `breadcrumb` |
| `blog/ArticleBody` | The text at a reading measure; slots `before`, `after`, and `aside`, a sticky sidebar on wide screens, only when filled | — |
| `blog/SeriesBox` | "Series · Part 2 of 5" and the part before; or the next part, or its date when only announced | `variant: top \| next` |
| `blog/AuthorBox` | One writer: "Written by", bio, one next step. Several: role, post count, bio, "More from" | `action` |
| `blog/TOC` | "On this page", marking the section in view; nothing for fewer than two sections | `title` |
| `blog/ReadNext` | Three related posts under a rule; nothing when there are none | `title` |

Personal and newsletter articles are one column; company and magazine carry
the table of contents beside the text.

### Author and series pages

The `author` view puts the writer beside their posts: `blog/AuthorProfile`
(portrait, name, role, bio, links, post count) in one column, and
`blog/PostList` titled "Writing", the pagination and `blog/Writers` ("Other
writers") in the other. On a one-writer blog there are no author pages; the
About page (`aboutPath`) can show the same profile with
`{ "widget": "blog/AuthorProfile", "props": { "author": "jane" } }`.

The `series` view is `blog/PageHeader` ("Series · 2 of 3 published", the
title, the description and "Ongoing · part 3 due October 2026") over
`blog/SeriesParts`, the parts numbered with their dates; announced parts are
marked. Describe a series once in `src/content/series/<key>.json`:

```json
{ "title": "Getting started with Parche", "description": "…", "status": "ongoing",
  "upcoming": [{ "title": "Themes as tokens", "date": "2026-10-15" }] }
```

and join a post to it with `series: { name: getting-started, order: 2 }`.

The `archive` view is `blog/PageHeader` ("Archive", "Everything, by month.
12 posts in total.") over `blog/Archive`: the year's posts by month under a
heavy rule with the count, and the earlier years as links. Every year is a
real page, so nobody depends on scrolling to get back to March.

### Subscription

With `subscribe` set, the views place `blog/Subscribe`: a band after the
list (personal, company, magazine), the field alone under a newsletter's
heading, and the opening of the `subscribe` page beside `blog/IssuePreview`
(the latest post as it arrives in an inbox, "what will I actually get?").
The author box of a one-writer blog offers "Get the next one by email", and
an announced series part links to the page. Without `subscribe` none of this
renders and no page is built: a form that goes nowhere is not a subscription.

### Search

After the build the blog runs Pagefind over the built site (a parche
`astro:build:done` hook) and writes `pagefind/` next to it. Only articles are
indexed: the article body carries `data-pagefind-body`, and the title,
category and date are its metadata. The `search` view is the page header over
`blog/Search`, the Search element on that index: it loads the index on the
first search, searches as the reader types, keeps the query in the address
(`/search?q=postgres`, so a link to a search works), lists category · date,
title and an excerpt with the match marked, and, when nothing matches, offers
the most used topics, the archive and the subscription. Without script the
page says where to go instead.

### Ads and other placements

A placement is a place in a view where something that is not the blog's own
content goes: an ad, a subscribe box, a sponsor, a promotion of your own.
Most placements are simply nodes in a view: at the top of the index, in a
sidebar column, after the article, after "Read next". Put any widget there.
Two places cannot be expressed as a node in a list, so they are slots:

- `inArticle`, on `blog/ArticleBody`: after the first section of the text,
  never before it.
- `inFeed`, on `blog/PostList`: after `inFeedAfter` posts (default 3), never
  first, only when there is something after it, and not repeated by "load
  more".

**Ads** are `AdSlot` nodes naming a placement:

```json
{ "widget": "AdSlot", "props": { "slot": "inArticle", "size": "large-rectangle" } }
```

and the configuration gives each placement its unit:

```js
createBlog({
  ads: {
    provider: 'adsense',                 // or 'script' with `src` and `html`, for other networks
    client: 'ca-pub-1234567890',
    slots: { indexLeaderboard: '…', inFeed: '…', inArticle: '…', articleSidebar: '…', articleEnd: '…' },
    consent: 'builtin',                  // or 'cmp'
  },
})
```

An AdSlot reserves its size's height from the first paint (a late ad never
moves the text), is labelled "Advertisement", and loads the network only
after consent and when it comes near the viewport. Sizes: `leaderboard`
728×90 (320×100 on phones), `rectangle` 300×250, `large-rectangle` 336×280,
`half-page` 300×600, sticky, from 1024px. Without `ads`, or without a unit for
its placement, an AdSlot renders nothing: the magazine preset places slots
where the design puts them, and a site without ads sees none. With an AdSense
`client`, `/ads.txt` is built.

**Rules, checked when a view renders**: an AdSlot before the page's title,
or in ArticleBody's `before` (between the title and the first paragraph),
stops the build with the view and the place.

**Consent.** Place the `Consent` widget once in the layout, with the
categories the site uses (`ads`, `comments`). It asks on the first visit,
with "Accept all" and "Only necessary" side by side, remembers the choice,
and any link to `#cookie-preferences` reopens it. AdSlots (and comments)
wait for their category. AdSense in the EEA, UK and Switzerland requires a
certified CMP (TCF v2.3): use one, set `consent: 'cmp'`, and the slots leave
the gating to it.

**Picks** (`blog/Picks`) is the magazine front's short list: `from:
'featured'` (editor's picks), `from: 'posts'` (a hand-ordered list of keys),
or `from: 'counts'`, the most read, sorted by numbers the site provides from
its analytics (a `$ref` to a data file works). Nothing is counted by the
blog, and without numbers the list does not show.

### Comments

`blog/Comments` is the discussion under a post, from GitHub Discussions
through giscus (the magazine and newsletter presets place it after the
author box). Nothing loads with the page: once "comments" is allowed in the
Consent widget (giscus comes from GitHub), it loads when the reader scrolls
near it, or at once on "Load the comments"; until then it says why and links
to the cookie choices. It follows the light or dark mode, also when it
changes, and a note beside it says it is moderated and the email never
shown. Set it up with the ids from giscus.app:

```js
createBlog({ comments: { repo: 'owner/repo', repoId: 'R_…', category: 'Comments', categoryId: 'DIC_…' } })
```

Without `comments` the widget renders nothing.

### Structured data

Every blog page says what it is:

| Page | schema.org |
|---|---|
| Index, tag, category, archive, series | `CollectionPage` with an `ItemList` of the page's posts (or the series' parts) in order |
| Author | `ProfilePage` with a `Person` (role, bio, portrait, profiles as `sameAs`) and the posts |
| Article | `BlogPosting`, or `NewsArticle` for the magazine preset, with the author and their page, and one `BreadcrumbList` |
| Search | `SearchResultsPage`, noindex |

The site's `WebSite` node advertises the search as a `SearchAction`
(`/search?q={search_term_string}`). Two generic pieces of core make this
work for any parche: a route's metadata may set `pageType` for the WebPage
node, and a page's own structured data of a kind (an article, a trail)
replaces the one core would generate, so nothing is described twice.

Dates without a time (every frontmatter date) are UTC midnight and are
formatted in UTC, so a post dated 2026-08-01 reads 1 August wherever the site
is built; a `timeZone` in `dateFormat` wins.

## Content

- Posts: `featured: true` puts a post in `blog/Featured`; `issue: 142` numbers
  a newsletter issue ("#142 · Title").
- Series: a post joins with `series: { name, order }`. An optional
  `src/content/series/<key>.json` describes the series once (`title`,
  `description`, `status`, `upcoming` parts with their date).

## How it is checked

- `test/blog-routes.mjs` walks the built blog sites: every internal link
  resolves, the listing, its pages, the archive, search and feed exist, the
  feed is in every head, each post has its lead, "Read next", its table of
  contents when the preset has one, and one article and one trail in its
  structured data.
- `test/blog-presets.mjs` builds `examples/blog` once per preset
  (`BLOG_PRESET=magazine`) and checks the pages each structure says exist and
  the ones it says do not: author pages, series pages, the article type,
  "Read next", the table of contents.
- The widgets are rendered with a sample context in
  `parches/ui/test/ssr/blog.test.ts`; the elements (LoadMore, Search,
  Consent, AdSlot, Comments) run in the browser suite, the network ones
  against stand-ins.

