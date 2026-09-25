---
summary: Captioned thumbnails that open in a lightbox with previous, next and a counter; or before and after pairs.
whenToUse:
  - Screens of a product, pieces of work, photos of jobs, a product's gallery.
  - Before and after, side by side, with what was done in the caption.
whenNotToUse:
  - One image beside text; that is an Image in a Content or Hero media slot.
  - Slides the reader steps through in place; that is Carousel.
related: [Image, Placeholder, Dialog, Carousel]
---

```astro
---
import Gallery from 'parche:elements/Gallery';
---
<Gallery items={[{ image: { src: '/work/1.jpg', alt: 'Release editor' }, caption: 'Release editor · 2026' }]} />
```

:::example basic
Three thumbnails that open in the lightbox (placeholders until there are
images), and two before and after pairs.
:::

## Anatomy

`root` (`parche-gallery`) · `item` (`figure`) · `trigger` (a link to the full
image) · `lightbox` (a native `dialog`) with `caption`, `count`, `previous`,
`next`, `close` and the `stage` where the image is shown.

## Accessibility

Each thumbnail is a link to its full image, so it works without script and
opens in a new tab with a modifier key. The lightbox is a modal dialog named
by `label`: focus moves to the close button and returns to the thumbnail,
the counter is announced, ←/→ wrap around, Escape and a click outside close
it.
