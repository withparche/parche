---
summary: A table of contents that follows the reader and never grows past its height.
whenToUse:
  - Long articles and docs pages with several headings.
  - A sidebar that also holds other things (an ad, a promotion) that must stay in view.
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

Each `slug` is a heading id on the page; items nest, and the caller decides
how deep. It behaves one way, and three things keep it short whatever the
page:

- **A cap.** The list scrolls inside a box of `min(22rem, 50vh)` (a theme or
  a page changes it with the `--ds-comp-toc-max-height` token); the edges
  fade where there is more to scroll, and the box scrolls itself, never the
  page, to keep the current link in view.
- **Folding.** A section's subsections open as the reader reaches it and
  close after.
- **Disclosure.** `layout="disclosure"` puts it behind a closed
  "On this page", for the top of an article on a narrow screen.

A track runs down the left; the indicator on it spans every section with
text on screen, and the one being read is current. `offset` is the sticky
header's height: the last heading that has scrolled past it is current (the
last of all once the page reaches the bottom).

:::example basic
A nested table of contents beside the headings it tracks.
:::

:::example long
Ten sections of three: capped at 16rem, folded, with something under it.
:::

## Anatomy

`root` (`parche-toc`) · `nav` · `disclosure` (the disclosure layout) ·
`title` · `viewport` (`data-fade` top/bottom/both) · `track` · `indicator` ·
`list` (`data-depth`) · `item` · `group` (`data-state` open/closed) · `link`
(`aria-current="true"`, `data-state` current/visible/idle). Hooks: class
`parche-toc-*`, `data-part`.

## Keyboard

Ordinary links: Tab and Enter. A closed group is inert, so Tab skips the
subsections of the sections not being read.

## Events

`parche:changed` (`detail.slug`) after the current heading changes.

## Without JavaScript

A nav of in-page links with every level open, capped at its height with its
own scroll; the tracking, folding and indicator need the element.

## Accessibility

A labelled `nav` with a heading (a `summary` in the disclosure layout); the
current link carries `aria-current="true"`, so the state is announced, not
only coloured. Motion (folding, the indicator, the box's scroll) is off
under `prefers-reduced-motion`.
