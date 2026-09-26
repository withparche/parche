---
summary: A bar that follows the reader with the page's one action once the hero is behind them.
whenToUse:
  - A landing page with one action and a long argument.
  - A product page whose buy button scrolls away.
whenNotToUse:
  - Pages with several equal actions; it would pick one for the reader.
related: [Banner, Button]
---

```astro
---
import StickyBar from 'parche:elements/StickyBar';
---
<StickyBar label="Get the checklist">
  <strong>Get the landing page checklist</strong>
  <a href="#get">Send it to me</a>
</StickyBar>
```

:::example basic
A bar that appears after the first screen and steps aside at the footer.
:::

## Anatomy

`root` (`parche-sticky-bar`, `data-state` hidden or shown) · `bar` (a named
region holding the slot).

## Accessibility

A named region. While hidden it is `inert`, so its links are not in the tab
order and screen readers skip it. It moves with a short transform that
reduced motion turns off, and it never covers the footer.
