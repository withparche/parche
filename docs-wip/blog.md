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
| `tagIndexThreshold` | `3` | Tag pages with fewer posts are `noindex, follow`. |
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

## Content

- Posts: `featured: true` puts a post in `blog/Featured`; `issue: 142` numbers
  a newsletter issue ("#142 · Title").
- Series: a post joins with `series: { name, order }`. An optional
  `src/content/series/<key>.json` describes the series once (`title`,
  `description`, `status`, `upcoming` parts with their date).

## Not built yet

The author and series pages, archive, subscribe and search pages,
placements for ads and other elements, consent, comments, and structured
data per page. See the plan in the session notes; each lands in this file.
