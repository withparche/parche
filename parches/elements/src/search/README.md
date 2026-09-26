---
summary: A search field over a static Pagefind index, with the query in the address and a way on when nothing matches.
whenToUse:
  - A blog or docs built statically: the index is written with the site, no server.
whenNotToUse:
  - Filtering a list already on the page: use Filter.
related: [Filter, Command]
---

```astro
---
import Search from 'parche:elements/Search';
---
<Search bundle="/pagefind/">
  <p>Nothing? <a href="/blog/archive">Browse the archive</a>.</p>
</Search>
```

:::example basic
A field, its results and what shows when nothing matches.
:::

## The index

Pagefind indexes the built HTML and writes `pagefind/` next to it. Mark what
to index with `data-pagefind-body` (only those pages are indexed then) and
give results a meta line with `data-pagefind-meta="category"` and
`data-pagefind-meta="date:…"`. The blog parche does both and builds the
index after the site.

## Behaviour

The index script is loaded on the first search, not with the page. The field
searches as the reader types, after a short pause, and on Enter; the query
goes into the address (`?q=`), so a search can be reloaded and shared.
Results show the meta line, the title and an excerpt with the matches
marked. When nothing matches, the default slot shows: topics, the archive.

## Anatomy

`root` (`parche-search`, `data-state` idle, loading, results or empty) ·
`form` (role search) · `input` · `clear` · `status` (a polite live region:
"2 results for “postgres”") · `results` · `empty` (the slot) · `nojs`.

## Without script

The form reloads the page with the query, and `nojs` says where to go
instead. It is hidden as soon as the element runs.
