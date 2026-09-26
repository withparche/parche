---
title: "Get started with AstroWind to create a website using Astro and Tailwind CSS"
excerpt: "Run AstroWind on your machine, learn where each thing lives, change the words without touching markup, and ship a static build."
publishDate: "2026-08-12T00:00:00Z"
category: "Tutorials"
tags:
  - astro
  - tailwind-css
authors:
  - jane
authorName: Jane Doe
featured: true
image:
  src: "https://images.unsplash.com/photo-1516996087931-5ae405802f9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  alt: "Get started with AstroWind to create a website using Astro and Tailwind CSS"
---

This guide takes you from an empty folder to a running copy of AstroWind, then
through the first three changes almost everyone makes: the site's name, the home
page and a new page. It ends with a production build. You do not need to know
Astro to follow it, although you will want to learn it once you start writing
components of your own.

## What you need before you start

- **Node.js 22.12 or later.** That is the minimum Astro 7 accepts. Check with
  `node --version`.
- **pnpm.** The repository is a pnpm workspace and pins its version in
  `package.json`, so enabling Corepack (`corepack enable`) is enough.
- **Git and an editor** that understands JSON and `.astro` files. Most of the
  work in this guide is editing JSON, so an editor that flags a missing comma
  saves time.

## Run the site on your machine

This version of AstroWind is built on Parche, a layer over Astro that renders
pages from data. It lives in the Parche repository as `demos/astrowind`, and its
dependencies point at the packages next to it, so it runs from inside that
repository:

```bash
git clone https://github.com/withparche/parche.git
cd parche
pnpm install
pnpm --filter demo-astrowind dev
```

Astro's dev server starts on `http://localhost:4321`. Leave it running: every
file you save from here on shows up in the browser without a restart.

If you would rather start a project of your own than work inside the demo,
`npm create parche@latest` scaffolds one from a starter. It is smaller than
AstroWind, but it has the same shape, so everything below applies to it too.

## Where everything lives

The first surprise for anyone who knows the original AstroWind is how little is
in `src`. There is no `components` folder and no `pages` folder: the widgets come
from packages, and pages are content.

| Path | What it holds |
| --- | --- |
| `astro.config.mjs` | The integrations: Parche and its parches, icons, Tailwind's Vite plugin |
| `src/parche.config.json` | The site's identity: its URL, name, description and social metadata |
| `src/content/pages/en/` | One file per page; the file's path is the page's URL |
| `src/content/layouts/en/` | The header, the footer, and where a page goes between them |
| `src/content/navigation/en/` | Menus, one file each |
| `src/content/posts/en/` | Blog posts, in Markdown |
| `src/content/authors/en/` | The writers, one JSON file each |

The `en` in each path is the locale. A second language is a second folder, not a
second copy of the site.

## Change the words, not the markup

### Rename the site

Open `src/parche.config.json`. The site's name and description live under
`brand`, and `site` is the address it will be served from:

```json
{
  "site": "https://astrowind.example.com",
  "brand": {
    "name": "AstroWind",
    "description": "Free template for creating websites with Astro + Tailwind CSS."
  }
}
```

The file is plain JSON on purpose. Nothing in it can be a function or an
import, which means a Git-based CMS can edit it, and a mistake in it stops the
build with a message rather than producing a broken site. The logo text in the
header is a prop of the layout, so change it in `src/content/layouts/en/default.json`
as well.

### Edit the home page

`src/content/pages/en/home.json` is the page at `/`. Its body is a list called
`sections`, and each entry names a widget and gives it props:

```json
{
  "widget": "Hero",
  "props": {
    "layout": "split",
    "title": "Ship the website.\nSkip the setup.",
    "actions": [
      { "text": "Get the template →", "href": "#get", "variant": "primary" }
    ]
  }
}
```

Change the `title`, save, and the browser updates. That is the whole editing
loop. You never open a component to change a sentence, and the component never
has to guess which of its strings are content.

### Add a page

Create `src/content/pages/en/team.json` and it is served at `/team`:

```json
{
  "title": "Team",
  "description": "Who builds this and how to reach us.",
  "sections": [
    {
      "widget": "Hero",
      "props": { "layout": "text", "size": "md", "title": "The people behind the site" }
    },
    {
      "widget": "Features",
      "props": {
        "title": "What we do",
        "items": [
          { "title": "Design", "description": "Layouts, type and the details in between." },
          { "title": "Engineering", "description": "The build, the content model and the deploys." }
        ]
      }
    }
  ]
}
```

A page with no `layout` uses the `default` one, so it gets the same header and
footer as the rest of the site. A page that should look different, like the
landing pages under `landing/`, names another layout.

If you misspell a widget, the dev server prints the problem with its path, as
`[parche] sections[1]: unknown widget "Featurs"`, and a production build refuses
to finish until it is fixed.

## Where Tailwind CSS fits

Tailwind CSS v4 is wired in through its Vite plugin, in one line of
`astro.config.mjs`:

```js
vite: { plugins: [tailwindcss()] },
```

There is no `tailwind.config.js`. Version 4 is configured in CSS, and Parche's
base stylesheet is the Tailwind entry point: it imports Tailwind, then the
design tokens. At build time Parche also tells Tailwind where each installed
package keeps its components, so classes used inside widgets that live in
`node_modules` are generated like your own.

The tokens are what make this useful. Colours such as `primary`, `muted`,
`surface` and `border` are Tailwind colours whose values are CSS variables, and
each theme sets those variables. A component you write with them follows the
active theme without knowing which one it is. This is from the custom widget
example in the Parche repository:

```astro
---
import Icon from 'parche:elements/Icon';
const { title, text, icon = 'tabler:info-circle' } = Astro.props;
---

<div class="mx-auto flex max-w-3xl gap-4 rounded-xl border border-border bg-surface p-6">
  <Icon name={icon} class="mt-0.5 h-6 w-6 shrink-0 text-primary" />
  <div>
    {title && <p class="font-semibold text-heading">{title}</p>}
    <p class="text-muted">{text}</p>
  </div>
</div>
```

Write `bg-blue-600` instead of `bg-primary` and the box stays blue whatever the
theme says. Reach for a fixed colour only when you mean it.

## Build it and put it online

Stop the dev server and run the build from the demo's folder:

```bash
cd demos/astrowind
pnpm build
```

The output in `dist/` is static HTML, CSS and a little JavaScript. After the
pages are written, the blog runs Pagefind over them and adds a `pagefind/`
folder, which is what the search page reads. There is no server to run, so any
static host will do: upload `dist/`, point your domain at it, and set `site` in
`parche.config.json` to that domain so canonical URLs and the RSS feed use it.

From here, the fastest way to learn the template is to change something on
purpose and watch what happens. Swap a widget's `layout`, move a section, give a
page a different layout. The data will tell you quickly when you have asked for
something it cannot do.
