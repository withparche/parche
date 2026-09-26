---
title: "How to customize AstroWind to your brand"
excerpt: "Your name, your colors and your typeface each live in one place, so a rebrand never has to touch a component."
publishDate: "2026-07-02T00:00:00Z"
category: "Tutorials"
tags:
  - design
  - tailwind-css
authors:
  - mark
authorName: Mark Rivera
featured: false
image:
  src: "https://images.unsplash.com/photo-1546984575-757f4f7c13cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  alt: "How to customize AstroWind to your brand"
---

A template becomes yours in four places: the name and metadata, the header and
footer, the typeface, and the colors. None of them is inside a component. This
walkthrough takes them in that order, from the change that takes a minute to the
one that takes an afternoon.

## Start with the name and the metadata

The first things people see of a brand are not its colors. They are the name in
the browser tab, the description under a search result and the image that appears
when someone shares a link. In this build all of them live in
`src/parche.config.json`:

```json
{
  "site": "https://acme.example.com",
  "brand": {
    "name": "Acme",
    "description": "Bookkeeping for small studios, done in an afternoon."
  },
  "metadata": {
    "ogImage": "@/assets/images/og.png",
    "twitterHandle": "@acme",
    "organization": {
      "type": "Organization",
      "name": "Acme",
      "logo": "@/assets/images/logo.png"
    }
  }
}
```

The file is plain JSON on purpose. Nothing in it can be a function or an import,
so a git-based CMS can edit it, and it is validated at build time. A stray
top-level key, such as an old `theme` or `header` field, fails the build with a
message instead of being ignored.

The wordmark is not in this file. The header and footer are content, stored in
`src/content/layouts/en/`. Most pages use `default.json`, whose `Header` takes a
`logo` in one of three shapes: a string used as a text wordmark, an image
(`{ "src": "/logo.svg", "alt": "Acme" }`), or text with a square of the brand
color before it (`{ "text": "Acme", "mark": true }`). The menus the header and
footer show are in `src/content/navigation/en/`, referenced with
`{ "$ref": "navigation/main" }`, so you edit a link once and every layout that
uses the menu picks it up.

## Choose the theme closest to your brand

The demo imports three themes and renders one on the server:

```js
// astro.config.mjs
parches: [createElements(), createUI(), createBlog({ /* … */ }), astrowind(), product(), editorial()],
themes: { default: 'product', showPanel: false },
```

| Theme | What it sets |
| --- | --- |
| `astrowind` | The original look: a vivid blue, Inter throughout, pill-shaped buttons, a deep navy dark mode. |
| `product` | A near-white canvas, one accent blue, Space Grotesk for headings, IBM Plex Sans for text, flat cards. |
| `editorial` | A serif display face (Source Serif 4), near-square corners, no shadows. |

`@parche/themes` also ships `corporate`, `minimal`, `playful`, `startup` and
`starter`. `themes.default` renders the `data-theme` attribute on `<html>`, so the
first paint is already in that theme. A visitor who picked another theme keeps
their choice. `showPanel: false` hides the floating theme switcher. If the default
names a theme you did not import, the build stops and lists the ones you did.

A theme you do not import is not shipped: its CSS and its fonts stay out of the
build. Once you settle on a direction, remove the imports you will not offer.

## Swap the typeface without writing CSS

If a theme is close and only the typeface is wrong, declare the font in
`parche.config.json`. A theme asks for fonts through CSS variables, and a font the
site declares for the same variable wins. This replaces IBM Plex Sans in the
Product theme and keeps its display and mono faces:

```json
"fonts": [
  {
    "name": "Inter",
    "cssVariable": "--font-sans",
    "weights": [400, 500, 600, 700],
    "preload": true
  }
]
```

Parche turns this data into Astro's `fonts` option, with Google Fonts as the
provider, the only one wired today. If `astro.config.mjs` sets `fonts` itself,
that wins and Parche stays out of the way. Preload only the family visible above
the fold: every preloaded file competes with the hero image for the first
connection.

## Write your colors as a theme

When the colors must be your own, write a theme. It is one CSS file that
overrides the system roles under its own `data-theme`, for light and for dark:

```css
/* src/styles/acme.css */
:root[data-theme="acme"] {
  --ds-sys-color-primary:       oklch(0.52 0.15 150);
  --ds-sys-color-primary-hover: oklch(0.46 0.15 150);
  --ds-sys-color-primary-soft:  oklch(0.96 0.03 150);
  --ds-sys-color-on-primary:    oklch(0.99 0 0);
  --ds-conf-radius-scale: 0.5;
}

:root[data-theme="acme"].dark {
  --ds-sys-color-primary:       oklch(0.74 0.14 150);
  --ds-sys-color-primary-hover: oklch(0.80 0.12 150);
  --ds-sys-color-primary-soft:  oklch(0.26 0.05 150);
  --ds-sys-color-on-primary:    oklch(0.17 0.03 150);
}
```

A few things are worth knowing before you fill it in:

- Only one `data-theme` is active at a time, so this theme starts from the base
  system, not from Product. To start from Product, copy
  `parches/themes/src/product.css` and change what differs.
- `link` and `ring` point at `primary`, so they follow it. `primary-hover` and
  `primary-soft` point into the base blue ramp, so set them too, or you get a
  green button that turns blue under the pointer.
- In dark mode, `on-primary` is dark. A lighter primary on a dark page cannot
  carry white text at a readable contrast, which is why the base system does the
  same.
- `--ds-conf-radius-scale` multiplies every radius. `0` gives square corners, as
  the Corporate theme uses.

## Register the theme and make it the default

A theme is a parche like any other: a plain object that names its CSS, its entry
in the switcher and the fonts it needs. It can live in `astro.config.mjs`:

```js
import { fileURLToPath } from 'node:url';

const acme = {
  name: 'theme-acme',
  styles: [fileURLToPath(new URL('./src/styles/acme.css', import.meta.url))],
  themes: [{ label: 'Acme', value: 'acme' }],
  fonts: [
    {
      cssVariable: '--font-sans',
      name: 'Inter',
      weights: [400, 600, 700],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      preload: true,
    },
  ],
};

// in parche({ … })
parches: [createElements(), createUI(), createBlog({ /* … */ }), acme],
themes: { default: 'acme', showPanel: false },
```

The `styles` paths must be absolute, which is what the `fileURLToPath` line does.

## Leave the components alone

Every element and widget is styled from the roles: `bg-surface`, `text-heading`,
`border-border`, never a raw palette class or a `dark:` override. That is why one
file reaches the blog, the forms and the pricing tables at once. When a role is
not enough, go one step at a time:

1. **A component token.** Some elements expose their own knobs, such as
   `--ds-comp-button-radius` or `--ds-comp-field-radius`. Product sets both.
2. **A section tone.** Sections accept a `tone` (`muted`, `dark`, `surface`,
   `ink` and others) that re-declares the roles inside that band.
3. **An override.** `overrides` in `parche()` replaces a component with your own
   file, for example `'elements:Button'`. It works, but from then on its updates
   are yours to merge.

Before you ship, look at the home page, pricing, a blog post and the contact form
in both modes, including any `dark` or `ink` section. Check that text on your
primary color reaches 4.5:1, the WCAG AA minimum for body text. Then share a link
in a chat app to see the image and description you set at the start.
