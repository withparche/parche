---
summary: Share a page — network links that work with no script, a copy-link button, and the device's own share sheet.
whenToUse:
  - Under an article, on a product page.
whenNotToUse:
  - Sharing something other than a URL; use the Web Share API directly.
related: [Button]
---

```astro
---
import Share from 'parche:elements/Share';
---
<Share url={Astro.url.href} title={post.title} networks={['x', 'linkedin', 'mail', 'copy']} />
```

:::example basic
Every network, then a short list with a custom label.
:::

## Anatomy

`root` (`parche-share`, a labelled group) · `label` · `item` (one per
network, `data-network`) · `native` · `status`. Hooks: class
`parche-share-*`, `data-part`.

## Keyboard

Ordinary links and buttons: Tab, Enter, Space.

## Events

`parche:shared` (`detail.network`) after copying or after the share sheet.

## Without JavaScript

The network buttons are links to the share intents and just work. Copy
link and the share sheet are hidden until the element reveals them.

## Accessibility

A `group` named by `label`; every item has an accessible name; the copy
confirmation is announced through a `role="status"` region, not only shown.
