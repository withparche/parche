# Images

How Parche optimises pictures, why it is built this way, and the options a
site has. The element's own page is `parches/elements/src/image/README.md`.

## Four paths

The Image element sends every picture down the first path that applies
(`parches/elements/src/image/image-strategy.ts`):

1. **Local** (`@/assets/…`): Astro's image service (Sharp by default, or the
   adapter's). A `srcset` and `sizes` for the `layout`, modern formats.
2. **Remote on an image CDN** that transforms by URL: Unsplash, Cloudinary,
   Imgix, Shopify, Contentful, Sanity, Storyblok, Cloudflare, Netlify, Vercel
   and the rest [unpic](https://github.com/ascorbic/unpic) recognises by host
   or path. The element writes that CDN's URLs for each width. Nothing is
   downloaded at build time and the site's `dist` does not grow.
3. **Remote and allowed by Astro** (`image.domains`, `image.remotePatterns`):
   Astro downloads it at build time (on demand under SSR) and optimises it
   like a local one.
4. **Anything else**, and SVG: a plain `<img>` with its dimensions, so the
   page does not shift. A remote one is named in a build warning.

`priority` marks the page's main picture (a hero, a post's cover, the first
card of a listing with nothing featured above it): `loading="eager"` and
`fetchpriority="high"`, which is what moves LCP. Everything else is lazy.

## Options

In `parche({ images })` (types: `ParcheImagesConfig`):

| Option | Default | What it changes |
|---|---|---|
| `remote` | `'auto'` | `'auto'`: CDN, then Astro, then as is. `'cdn'`: CDN or as is. `'astro'`: Astro or as is. `'none'`: always as is. |
| `cdn.hosts` | any | Only these hosts take the CDN path (exact, `*.` or `**.`). |
| `cdn.providers` | — | Your own domain on a known CDN: `{ 'img.example.com': 'imgix' }`. |
| `cdn.fallback` | — | A provider for remote pictures unpic does not recognise, e.g. `'wsrv'` (a free image proxy): every remote picture optimised, nothing at build time. |
| `layout` | `'constrained'` | The default layout; also Astro's `image.layout` when astro.config sets none, so Markdown images get a `srcset` too. |
| `breakpoints` | Astro's | The widths a `srcset` may use. |
| `warnUnoptimized` | `true` | The build warning for pictures that go out as they are. |

Which paths a remote host can take is still Astro's decision
(`image.domains`, `image.remotePatterns`); Parche does not duplicate it.

| Scenario | Options |
|---|---|
| Astro only | `remote: 'astro'` |
| CDN when recognised, Astro for the rest (AstroWind's model) | nothing: `'auto'` |
| The CDN path for some hosts only | `cdn.hosts` |
| A CDN under your own domain | `cdn.providers` |
| Every remote picture through a proxy, no build cost | `cdn.fallback` |
| A host with no image processing | `remote: 'none'` and Astro's `passthroughImageService()` |

## How the pieces meet

- Content is data, so an image is a string (`@/assets/images/x.png`).
  `resolveAssets` (core) turns it into its built URL, which is what props
  carry everywhere, and registers Astro's metadata for that URL on a global
  keyed by `Symbol.for('parche.assets')`. The element looks the URL up there.
  A copied element without Parche finds no registry and treats the URL as a
  plain remote one.
- The options reach the element as the build constant
  `import.meta.env.PARCHE_IMAGES` (JSON), not through a `parche:*` import, so
  an element stays copy-ready; without it the defaults apply.
- Astro's responsive styles (`image.responsiveStyles`) stay off: they are
  unlayered and would beat Tailwind's layered utilities. The element sizes
  its picture with its own classes.

## Why unpic, and not @unpic/astro

State in September 2026:

- `unpic` 4.2.2 (MIT, no dependencies, 28 providers) is a pure function
  library: detect the provider, write its URL for a width. Its repository is
  quieter since February 2026, with fixes not yet released; it is isolated in
  one module (`image-strategy.ts`), so a fork or a replacement touches one
  file.
- `@unpic/astro` 1.0.2 declares Astro up to 5 only (Astro 6 support is an open
  pull request; Astro 7 unverified), and its image service is marked alpha
  and sends even recognised CDN URLs through the fallback provider.
- AstroWind (September 2026) uses the same split: `unpic` for recognised
  CDNs, Astro's native `<Image>` for everything else. Its CDN branch builds a
  `srcset` only when given `widths`, and writes no `sizes`; this one does
  both, with Astro's width rules per layout.
- `astro-imagetools` is unmaintained since 2023.

## Measured

The demo on a throttled phone (412 px wide at 2.6x, CPU ×4, Slow 4G), median
of three loads:

| Page | LCP before | LCP after |
|---|---|---|
| `/blog/` (a featured photo and three cards, Unsplash) | 8.4 s | 4.0 s |
| A post with an Unsplash cover | — | 2.0–2.4 s |
| Home, pricing (no photos) | 1.2 s | 1.2 s |

Before, the listing's main picture was the full Unsplash original (675 KB);
now it is the 1080 px version the phone needs (190 KB), fetched first. What
is left on `/blog/`: the connection to the CDN opens only when the picture
is found, and the cards below it share the bandwidth. A `preconnect` (or a
`preload` of the main picture) in the head would cut that; a component in
the body cannot write to the head, so that needs a page-level hint.
