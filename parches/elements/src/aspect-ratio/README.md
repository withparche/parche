---
summary: A box that keeps a width-to-height ratio, and fills its child to it.
whenToUse:
  - Images, video, iframes and maps that must hold their shape before and after loading.
whenNotToUse:
  - An image with known dimensions; Image sets width and height itself.
related: [Image, Video, Card]
---

```astro
---
import AspectRatio from 'parche:elements/AspectRatio';
---
<AspectRatio ratio="16/9">
  <iframe src="…" title="…"></iframe>
</AspectRatio>
```

The first child stretches to fill the box; images and videos cover it.

:::example basic
A photo at 16/9 and cropped square.
:::

:::example embed
A map embed at a cinematic 21/9, with no layout shift while it loads.
:::

## Anatomy

`root` (`data-ratio`). Hooks: class `parche-aspect-ratio`, `data-part`.

## Without JavaScript

CSS only.

## Accessibility

Nothing of its own: the child carries the `alt` or `title`.
