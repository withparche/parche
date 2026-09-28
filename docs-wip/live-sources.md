# Live sources

A design note, no code yet. How a Parche site served on a server would read
its content from a database or a CMS per request instead of carrying it in
the server bundle, and why the blog is already shaped for it.

## Why

A server build bundles every local collection and evaluates the bundle
before the first answer: 0.5 s with 4,000 post files, 42 s with 10,000,
120 s with 20,000 (`docs-wip/sizing.md`). A large site on a server cannot
carry its content; it has to ask for it. Astro's answer is a **live
collection**: a loader defined in `src/live.config.ts` that fetches entries
at request time, read with `getLiveCollection()` and `getLiveEntry()`, with
filters the loader understands. That is the mechanism. What Parche needs to
decide is what its apps ask of a source, so that the local index and a live
one answer the same questions.

## The seam: what the blog asks

Since the post index (`parches/blog/src/utils/post-index.ts`), nothing in
the blog scans a list. The resolver, the routes and the views ask five
things:

| Question | Today (local index) | Live |
|---|---|---|
| `bySlug(slug, locale)` — the post at an address | a map lookup | one query by address, or by `urlSlug` then key |
| `translations(key)` — the same post in other locales | a map lookup | one query by key |
| `published(locale)` — a locale's posts, newest first | a sorted array | a paged query: the listing asks for a page, the widgets for the first few |
| `terms(locale)` — tags, categories, series with counts | counted once | an aggregate query, or the CMS's own taxonomy endpoint |
| `all` — every published post (feeds, sitemaps, static paths) | the array | a paged walk, only where a build or a feed needs everything |

Plus what the article page adds: the post's rendered body, its authors
(entries of another collection), its series' parts, and the related posts
(the keys it declares, else the latest of its category: two more lookups).
The pages of a collection (`collections` in the site config) ask the same
three things of theirs — an entry by id or by address, and its
translations by key (`indexEntries` in `packages/core/src/content/collections.ts`).

So a live-backed blog implements one interface, and the rest of the blog
does not change: not the views, not the widgets, not the templates, not the
routes. The interface is the index's.

## What would change in Parche

- **A source in place of the index.** `postIndex()` becomes the local
  implementation of a `PostSource`; the blog's options gain `source`, the
  local index by default. Same for collections (`EntrySource`). A static
  build always uses the local index: there is nothing to gain from a live
  source when every page is built once.
- **Paging as a first-class question.** `published(locale)` returns the
  whole list today; a source answers a page (`offset`, `limit`) and a count,
  and the listing routes ask for their page. The local index answers by
  slicing; nothing observable changes.
- **The body.** A local post renders through Astro's `render(entry)` from
  Markdown. A live entry carries what its source gives: HTML from a CMS, or
  Markdown rendered by the source loader. The template receives HTML either
  way; `articleContext` already takes the rendered body as a string.
- **Drafts and previews.** `showDrafts` becomes a source option: a CMS's
  preview token, a database flag.
- **Feeds and sitemaps** walk `all` in pages, or read a feed the source
  keeps.

## What does not change

The content model, the views, the widgets, the templates, the routes, the
resolver's contract with core (`resolve`, `getPaths`, `routeFor`), the
static build. A site switches source in its config and keeps its pages.

## Open questions

- Which questions a source must answer in one round trip for a post page
  not to cost several sequential queries (the post, its translations, its
  authors, the related ones, the terms): a source may answer the article
  page as one document.
- `getPaths()` for a server's lookup table (`routeFor`) walks every address
  on the first request; with a live source, either the source lists
  addresses cheaply or the server resolves by address without a table.
- Caching per request, and across requests for what changes rarely (terms,
  the latest posts), with the source saying how long.
- The bench scenario: a fake CMS (an HTTP JSON server over the generated
  content, with the same five questions as endpoints) to measure a
  live-backed blog against the local index at each size, and to catch a
  question that turned into a scan.

## When

After the config redesign (Phase 4 of the core plan), since `source` is an
app option and the shape of app options is what that phase settles. The
seam is in place now; a site that needs it sooner can implement `PostSource`
against the index's interface and ask.
