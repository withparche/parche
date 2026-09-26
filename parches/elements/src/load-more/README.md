---
summary: A link to the next page that, with script, adds that page to the list instead.
whenToUse:
  - A long list a reader scans, like a magazine front, where page numbers interrupt.
whenNotToUse:
  - An archive a reader navigates: numbered pages say where things are.
  - Infinite scroll: never, the footer and older pages become unreachable.
related: [Pagination]
---

```astro
---
import LoadMore from 'parche:elements/LoadMore';
---
<ul data-load-more-list>…</ul>
<LoadMore href="/blog/2" />
```

:::example basic
A list and the link to its next page.
:::

## How it degrades

Without script it is a link to the next page, which is a complete page: a
crawler and a reader without script get every post. With script it fetches
that page, finds the list matching `list` there, appends its items here,
points the link at the page after and updates the address with
`replaceState`. On the last page the link goes away. If anything fails it
follows the link.

## Anatomy

`root` (`parche-load-more`, `data-state` idle, loading or done) · `link` ·
`status` (a polite live region: "6 more loaded").

## Accessibility

The new items are announced by count, and focus moves to the first new
item's link, so a keyboard reader carries on from where the list grew.
