---
summary: A table of contents that follows the reader — the visible heading's link is current.
whenToUse:
  - Long articles and docs pages with several headings.
whenNotToUse:
  - Short pages; the scrollbar is enough.
related: [Link]
---

```astro
---
import Toc from 'parche:elements/Toc';
---
<Toc items={[{ text: 'Install', slug: 'install' }, { text: 'Configure', slug: 'configure', children: [...] }]} />
```

Items nest without limit; each `slug` is a heading id on the page.
`offset` is the sticky header's height: the last heading that has scrolled
past it is current (the last of all once the page reaches the bottom).

:::example basic
A nested table of contents beside the headings it tracks.
:::

## Anatomy

`root` (`parche-toc`) · `nav` · `title` · `list` (`data-depth`) · `item` ·
`link` (`aria-current="true"`, `data-state` current/idle). Hooks: class
`parche-toc-*`, `data-part`.

## Keyboard

Ordinary links: Tab and Enter.

## Events

`parche:changed` (`detail.slug`) after the current heading changes.

## Without JavaScript

A nav of in-page links; only the tracking needs the element.

## Accessibility

A labelled `nav` with a heading; the current link carries
`aria-current="true"`, so the state is announced, not only coloured.
