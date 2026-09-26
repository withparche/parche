---
title: "Useful resources to create websites"
excerpt: "The references and tools we keep open while building a site, grouped by the question each one answers."
publishDate: "2026-05-28T00:00:00Z"
category: "Resources"
tags:
  - resources
  - front-end
authors:
  - jane
authorName: Jane Doe
featured: false
image:
  src: "https://images.unsplash.com/photo-1637144113536-9c6e917be447?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80"
  alt: "Useful resources to create websites"
---

Lists of "100 tools for web developers" are easy to find and hard to use. Most
of the links go stale, and none of them tell you when to reach for what. This
list is shorter. Every entry is something we open while building a site like
this one, and each section starts with the question it answers.

## Read the documentation of the tools you actually use

The best resource for a stack is its own documentation, read before a blog
post about it. Blog posts age; official docs are updated with each release.

- **[Astro docs](https://docs.astro.build)**. The guides on content
  collections, images and internationalization are the ones a content site
  leans on. This demo is built on Astro, with posts as Markdown files in a
  content collection.
- **[Tailwind CSS docs](https://tailwindcss.com/docs)**. Version 4 moved the
  configuration into CSS: theme values are declared with `@theme` instead of a
  `tailwind.config.js`. If a tutorial tells you to edit a JavaScript config
  file, check which version it was written for.
- **[MDN Web Docs](https://developer.mozilla.org)**. The reference for HTML,
  CSS and the browser APIs. When a framework's docs assume you know what an
  element or a property does, MDN is where you find out.

If you work on this template itself, the
[AstroWind repository](https://github.com/onwidget/astrowind) shows the
original, and the [Parche repository](https://github.com/withparche/parche)
holds the version this demo runs on, with a README for each package.

## Check what browsers support before you build on it

A CSS feature in a conference talk is not the same as a feature your readers
have. Two sites answer that question quickly.

- **[Can I use](https://caniuse.com)** gives support tables per feature and
  per browser version, with notes on partial support.
- **[web.dev](https://web.dev)** publishes Google's guidance on performance,
  accessibility and modern CSS, and tracks which features are part of Baseline,
  the set that works across the major browsers.

A good habit: before adding a fallback, check whether you still need it. Many
workarounds in older templates cover browsers nobody ships anymore.

## Measure speed with the tools search engines use

Speed is easy to argue about and easy to measure, so measure it. Three tools
cover most needs.

- **[PageSpeed Insights](https://pagespeed.web.dev)** runs Lighthouse on a
  public URL and, when there is enough traffic, adds field data from real
  Chrome users. The field data is what matters for search.
- **[Lighthouse](https://developer.chrome.com/docs/lighthouse)** is built into
  Chrome DevTools, so you can run it on a local build before you deploy.
- **[WebPageTest](https://www.webpagetest.org)** shows a request waterfall and a
  filmstrip of the page loading, which explains *why* a score is low.

Run them on a production build, not on the dev server. The dev server skips
the work a build does, such as bundling and image optimization, and its numbers
say little about the real site.

## Test accessibility with people in mind, and tools second

Automated checks find some problems, not all of them. They are still worth
running, because the problems they find are common and cheap to fix.

- **[WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/)** lists
  every success criterion with techniques and failures, filterable by level.
- **[WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)**
  tells you whether a text color passes against its background.
- **[axe](https://www.deque.com/axe/)** runs in the browser and in test suites,
  and flags missing labels, empty links and similar issues.

These references shape real decisions. This template underlines links inside
posts, because a link told apart only by its color fails WCAG success
criterion 1.4.1, and its primary color against body text is far too close to
rely on. The fix costs nothing and a contrast checker makes the case for it.

After the tools, use the keyboard. Tab through a page and check that every
control is reachable and the focus is always visible.

## Find images, icons and type you are allowed to use

Placeholder assets have a way of shipping. Start with ones you can keep.

| Need | Resource | Why this one |
| --- | --- | --- |
| Photos | [Unsplash](https://unsplash.com) | Free to use under its license; most post images in this demo come from it |
| Icons | [Tabler Icons](https://tabler.io/icons) | A large, consistent outline set; the demo uses it through Iconify |
| Icon search | [Iconify](https://icon-sets.iconify.design) | One search across many open icon sets |
| Fonts | [Google Fonts](https://fonts.google.com) | Open-licensed families, including Inter, the AstroWind theme's typeface |
| Self-hosted fonts | [Fontsource](https://fontsource.org) | The same families as npm packages you serve yourself |
| Compression | [Squoosh](https://squoosh.app) | Compare formats and quality side by side in the browser |

Astro optimizes images at build time, so Squoosh is less about the images on
your pages and more about the ones you hand to other tools: a social card, an
email header, a file in `public/` that no pipeline touches.

## Help search engines and social networks read your pages

A page can be fast and accessible and still be described badly when it is
shared or indexed. These references cover the markup that controls that.

- **[Google Search Central](https://developers.google.com/search/docs)** is the
  documentation for how Google crawls and indexes, straight from the source.
- **[Schema.org](https://schema.org)** defines the vocabulary for structured
  data. The blog in this demo describes each post as a `BlogPosting` and each
  listing as a `CollectionPage`.
- **[Rich Results Test](https://search.google.com/test/rich-results)** shows
  whether Google can read that structured data and which results it qualifies
  for.
- **[The Open Graph protocol](https://ogp.me)** defines the tags that decide the
  title, description and image a link shows when it is shared.

Two smaller tools round out the blog. **[Pagefind](https://pagefind.app)** builds
a static search index after the site is built, which is how the search page
here works without a server. **[giscus](https://giscus.app)** puts comments from
GitHub Discussions under a post, and it is what the blog's optional comments
use.

> A resource list is only useful if you go back to it. Bookmark the few you
> will use this month and ignore the rest.

That is the whole list. If you build one of your own, keep the same rule: link
to the source, and say what question each link answers.
