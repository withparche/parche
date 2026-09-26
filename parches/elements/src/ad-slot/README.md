---
summary: A labelled place for an ad, its height reserved, the network loaded only after consent and when near.
whenToUse:
  - A publication with ads: between sections, after a list's third item, in a sidebar, at the end of an article.
whenNotToUse:
  - Above the page's title or between it and the first paragraph: never.
related: [Consent]
---

```astro
---
import AdSlot from 'parche:elements/AdSlot';
---
<AdSlot size="large-rectangle" client="ca-pub-…" unit="1234567890" />
```

:::example basic
A reserved rectangle, filled by a network script once allowed.
:::

## Rules the element keeps

- **Height reserved.** The box has its size's height from the first paint:
  a late ad never moves the text (layout shift is a Core Web Vital).
- **Labelled.** "Advertisement" over every slot.
- **Consent first.** Nothing loads until the visitor agrees to "ads" in the
  Consent element. With a certified CMP (AdSense requires TCF v2.3 in the
  EEA, UK and Switzerland), `consent="cmp"`: the CMP gates the network.
- **Only when near.** The network loads when the slot comes within 400px of
  the viewport.

Where a slot may go (never above the title, never first in a list) is up to
whoever places it; the blog checks its views for that when it builds.

## Sizes

`leaderboard` 728×90, 320×100 on phones · `rectangle` 300×250 ·
`large-rectangle` 336×280 · `half-page` 300×600, sticky, from 1024px only.

## Anatomy

`root` (`parche-ad`, waiting or loaded) · `label` · `box`.
