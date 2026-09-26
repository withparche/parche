---
summary: An optimised, responsive image — local files through Astro, remote ones through their image CDN, or Astro when allowed.
whenToUse:
  - Any picture in a widget, so it is sized, lazy and optimised the same way.
whenNotToUse:
  - A person; use Avatar. An icon; use Icon.
related: [Avatar]
---

Content in Parche is data, so an image arrives as a string like
`@/assets/images/hero.jpg`. `resolveAssets` (see `parche:utils/assets`) turns
it into its built URL and registers the picture's metadata under that URL,
which is how `Image` finds it. Each picture takes the first path that applies:

1. **Local** (`src/assets`): Astro's image service, with a `srcset` and
   `sizes` for the `layout`.
2. **Remote on an image CDN** that transforms by URL (Unsplash, Cloudinary,
   Imgix, Shopify, Contentful, Sanity… detected by
   [unpic](https://unpic.pics)): a `srcset` of that CDN's URLs, nothing
   downloaded at build time.
3. **Remote and allowed by Astro** (`image.domains` / `image.remotePatterns`):
   downloaded and optimised by Astro at build time.
4. **Anything else**, and SVG: a plain `<img>` with its dimensions; a remote
   one is named in a build warning.

```astro
---
import Image from 'parche:elements/Image';
---
<Image src={resolved.image} alt="The team at work" width={1200} ratio="16/9" priority />
```

`priority` marks the page's main picture (a hero, a post's cover): loaded at
once and fetched first; one per page. `layout` picks the `srcset`:
`constrained` (up to `width`, the default), `full-width` or `fixed`; `sizes`
overrides the attribute when the image sits in a narrower column.

The site chooses the paths in `parche({ images })`:

```js
parche({
  images: {
    remote: 'auto',            // 'auto' | 'cdn' | 'astro' | 'none'
    cdn: {
      hosts: ['images.unsplash.com'],       // only these take the CDN path
      providers: { 'img.example.com': 'imgix' }, // your domain on a known CDN
      fallback: 'wsrv',        // a proxy for any other remote image
    },
    layout: 'constrained',     // also Astro's image.layout, for Markdown
    breakpoints: [640, 828, 1080, 1280, 1668, 2048],
    warnUnoptimized: true,
  },
});
```

`auto` (the default) tries the CDN, then Astro, then leaves the picture as
it is. Without `parche()` (a copied element) the defaults apply.

:::example basic
The same remote picture cropped to three ratios.
:::

## Anatomy

`root` — the frame that carries the aspect ratio; `img` — the picture.
Hooks: class `parche-image`, `parche-image-img`, `data-part`, `data-ratio`;
`data-path` on the `img` says which path it took (local, cdn, astro, plain).

## Accessibility

- `alt` is required. Pass `""` only for a purely decorative picture, which
  then disappears from the accessibility tree.
- Explicit `width`/`height` (or a `ratio`) reserve the space, so text does not
  jump while the picture loads.
