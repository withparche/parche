---
summary: Previous/next and page numbers for a paginated list.
whenToUse:
  - Blog indexes, tag and category pages, any list split across URLs.
related: [Breadcrumb, Button]
---

Page URLs are derived from `base`: page 1 is `base` itself, page `n` is
`base/n` — the convention the blog's routes already use.

```astro
---
import Pagination from 'parche:elements/Pagination';
---
<Pagination current={page.currentPage} total={page.lastPage} base="/blog" />
```

:::example basic
First page, a middle page with ellipses, and the last page in prev/next-only
mode with custom labels.
:::

## Anatomy

`root` (`nav`) · `list` · `prev` · `next` · `page` · `ellipsis`. Hooks: class
`parche-pagination-*`, `data-part`, `data-state` (`current`, `disabled`).

## Accessibility

- A `<nav>` named by `label`; the current page has `aria-current="page"`.
- Prev/next carry `rel="prev"`/`rel="next"`; when unavailable they stay in
  place as `aria-disabled` spans, so nothing jumps between pages.
- Number links are named "Page n", not just "n".
