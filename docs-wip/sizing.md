# What a site costs at each size

Provisional, like everything in `docs-wip/`. What a Parche site costs to
build and to serve as it grows, measured with `bench/` on generated sites of
known shape, and the rule that follows from the numbers. Every figure here
comes from one laptop (9 GB of RAM); yours will differ, the shape of the
curve will not. `bench/README.md` says how to measure your own.

## The shape of the cost

A page costs what it costs to render its own widgets. Nothing a page needs
grows with the size of the site: a post is found by its address, its
translations by its key, a listing reads a list sorted once, the terms are
counted once. So the build grows with the number of pages, not faster, and
a request on a server costs the same with 40 posts or 10,000.

What does grow with the site is what a **server build** carries: Astro
bundles every collection into the server, and the server loads that bundle
on every cold start. That is the one cost to plan around.

## Static builds

| Site | Pages | Build | Peak memory |
|---|---|---|---|
| 300 pages, 2,000 posts, 300 products, two languages | 6,629 | 36 s | 2.1 GB |
| 5,000 products with their pages, two languages | 5,353 | 15 s | 1.2 GB |
| 1,000 pages of 15–20 widgets, 2,000 posts, two languages | 4,600 | 57 s | 1.7 GB |
| 100 pages, 5,000 posts, two languages | 15,377 | 1 m 44 s | 2.1 GB |

About 5–7 ms per page, most of it Astro rendering the widgets. The peak
memory is the bundler's and Astro's, not the content's: a build of 15,000
pages fits in 2 GB, and the same build completes with the JavaScript heap
capped at 1.2 GB. Past that, on a machine short of memory, the build needs
swap space on disk: a full disk is what killed our 23,000-page attempt,
not the page count.

## Server builds

| Content | Server bundle | Cold start | First request |
|---|---|---|---|
| 4,000 post files (2,000 in two languages) | 30 MB (18 MB of it content) | 0.5 s | 0.4 s |
| 10,000 post files | 83 MB | 42 s | 42 s |
| 20,000 post files | 279 MB (133 MB of it content) | 120 s | 120 s |

The bundle holds the content (Astro's data layer) and the server evaluates
it before answering anything, so the cold start grows with the content, and
faster than linearly once it no longer fits in memory comfortably. Nothing
in Parche changes this: it is how Astro serves local collections.

Once the server is warm, a request costs the page and nothing else, at any
size. On the 4,000-post site, one request at a time: a page 3 ms, a post
3.5 ms, a product's page 1.9 ms, a missing address 1.6 ms; eight at a time,
20, 27, 14 and 12 ms. On the 10,000-post site a post costs 5.8 ms, the
difference being a heavier page, not the count.

What the server loads on a cold start besides the content: the page route's
closure is 718 KB in 37 files, without the widget catalog, the templates,
the theme panel or the icon set — each loads when a request first needs it,
and the icon set only holds the icons the site names (`usedIcons()`, see
the Icon element's README).

## The rule

- **A static build handles any size** a machine can hold: 15,000 pages in
  under two minutes and 2 GB. Prefer it whenever the pages can be built
  ahead; a site of pages and posts almost always can.
- **A server build with local collections is for a site of up to a few
  thousand entries** — a cold start under a second and a bundle of tens of
  megabytes. Beyond that, the cold start is the cost of loading all the
  content into the server, and no request-time work will bring it back.
- **A larger site served on a server reads a live source**: a database or a
  CMS queried per request, holding the content outside the bundle. The
  blog's index is the seam for it; `docs-wip/live-sources.md` is the
  design.
- **Hybrid is the middle way** Astro offers: prerender the posts and pages
  at build time and keep on-demand rendering for what must be dynamic. The
  content then travels with the built pages, not with the server.

## What else to watch

- A `$collection` without `limit` puts the whole collection on every page
  that carries it: a thousand cards on one page, on the bench's own copy of
  a product list. The build warns once per collection; add `limit`.
- Icons: without `include`, astro-icon bundles whole sets (Tabler is 2 MB
  of SVG). `usedIcons()` lists the ones the site names.
- Memory on a large static build comes from the bundler and the renderer;
  the content itself is small. Give the machine disk for swap before
  giving Node a bigger heap.
