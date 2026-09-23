---
summary: An optimised image — local files through astro:assets, remote URLs as-is.
whenToUse:
  - Any picture in a widget, so it is sized, lazy and optimised the same way.
whenNotToUse:
  - A person; use Avatar. An icon; use Icon.
related: [Avatar]
---

Content in Parche is data, so an image arrives as a string like
`@/assets/images/hero.jpg`. The widget must pass it through `resolveAssets`
first (see `parche:utils/assets`); `Image` then receives the resolved metadata
and optimises it. A remote URL is rendered directly with explicit dimensions.

```astro
---
import Image from 'parche:elements/Image';
---
<Image src={resolved.image} alt="The team at work" width={1200} ratio="16/9" loading="eager" />
```

:::example basic
The same remote picture cropped to three ratios.
:::

## Anatomy

`root` — the frame that carries the aspect ratio; `img` — the picture.
Hooks: class `parche-image`, `parche-image-img`, `data-part`, `data-ratio`.

## Accessibility

- `alt` is required. Pass `""` only for a purely decorative picture, which
  then disappears from the accessibility tree.
- Explicit `width`/`height` (or a `ratio`) reserve the space, so text does not
  jump while the picture loads.
