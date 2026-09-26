---
title: "Why page speed still matters"
excerpt: "Speed is rarely what wins a ranking or a sale, but a slow page quietly loses both, and most of the weight is a choice you can undo."
publishDate: "2026-03-11T00:00:00Z"
category: "Guides"
tags:
  - performance
  - seo
authors:
  - mark
authorName: Mark Rivera
featured: false
image:
  src: "@/assets/images/default.png"
  alt: "Why page speed still matters"
---

Connections are faster than they were ten years ago, and phones are more
powerful. It is tempting to conclude that page speed has solved itself. It
has not, because pages kept growing with the networks, and the visitor on a
mid-range phone with a weak signal still waits for all of it.

## What "fast" means now

"Fast" used to mean a load time in a lab test. Google's Core Web Vitals
replaced that with three measurements taken from real visits, each describing
something a person actually notices:

| Metric | What it measures | Good |
| --- | --- | --- |
| Largest Contentful Paint (LCP) | When the main content appears | 2.5 s or less |
| Interaction to Next Paint (INP) | How quickly the page responds to a tap or key | 200 ms or less |
| Cumulative Layout Shift (CLS) | How much the layout jumps while loading | 0.1 or less |

A page passes when at least 75% of visits meet each threshold. That detail
matters. The number that counts is not your laptop on office Wi-Fi. It is the
slower quarter of your real audience.

Lab tools like Lighthouse are still useful for finding problems, but they
cannot measure INP, because nobody is interacting with the page during the
test. Use the lab to debug and field data to judge.

## Speed and search: a tiebreaker, not a trump card

Google uses page experience signals, Core Web Vitals among them, in its
ranking systems. It also says plainly that relevance comes first: a fast page
with a weak answer will not outrank a slow page with a good one. Speed matters
most when several pages answer the query about equally well, which on a
competitive query is often the case.

The stronger argument is what happens after the click. A visitor who taps a
search result or an ad and sees a blank screen has no reason to wait. The
page has not made its case yet, so there is nothing to wait for. With paid
traffic the cost is direct: you paid for that click whether the page painted
in time or not. With a slow INP, the visitor who did stay taps a button,
nothing seems to happen, and they tap again or give up. You do the same on
other people's slow sites.

## Where the weight comes from

On most sites the bytes come from four places:

- **JavaScript**, which has to be downloaded, parsed and executed before
  anything it controls works. It is the most expensive byte on the page.
- **Images**, often served larger than they are displayed and without sizes,
  so the text jumps when they arrive.
- **Web fonts**, especially when a site loads several families and every
  weight "just in case".
- **Third-party tags**: analytics, chat, ads, embeds. Each one is someone
  else's code with its own requests, on your page.

None of these is a problem in itself. The problem is that each is easy to add
and nobody's job to remove.

## How the template keeps the defaults light

A starting point cannot make a site fast, but it can make the slow choices
the ones you have to opt into. AstroWind on Parche does that in four places.

### Script only where the page needs it

Astro renders pages to HTML at build time, and ships no JavaScript unless a
component asks for it. Parche's static elements are plain `.astro` with no
client script. The interactive ones, such as Tabs, Menu or Toast, render
complete markup on the server and upgrade with a small custom element, and
they lean on the platform first: native `<dialog>`, `popover` and `<details>`
do the work where they can. The ui widget library itself contains no
`<script>` at all, and the test suite fails if one appears.

The repository also checks a JavaScript budget against the built output. The eager
client script of this demo must stay under 59 KB. About 16 KB of that is
Astro's client router, and each element's script loads only on the pages that
use it. A regression shows up as a failed check, not as a slow month.

### Images with their size reserved

The Image element sends local images through Astro's optimiser, which resizes
them and serves modern formats. Every image, local or remote, gets explicit
dimensions or an aspect ratio, so the space is reserved before the picture
arrives. The hero image loads eagerly because it is usually the LCP element.
Everything else is lazy by default and loads as the reader scrolls toward it.

### Fonts as a deliberate choice

Core ships no web fonts. Without a theme, a site renders in the system font
stack and downloads nothing. A theme declares the families it needs, a site
can override them in `parche.config.json`, and only the family above the fold
should be preloaded:

```json
{
  "fonts": [
    { "name": "Inter", "cssVariable": "--font-sans", "weights": [400, 600], "preload": true }
  ]
}
```

Declaring fonts replaces the defaults rather than adding to them. A site that
uses one typeface does not ship eight.

### Third parties, late and only with consent

The blog's comments come from GitHub Discussions through giscus, and they load
only after the reader allows them and scrolls near them. Ad slots work the
same way, and they reserve their height from the first paint, so an ad that
arrives late never pushes the text down. Search runs on a Pagefind index that
is downloaded on the first search, not on every page.

## Keeping it fast after launch

Most sites are fast on launch day. They get slow one reasonable addition at a
time: a tag for a campaign, a heavier hero image, a chat widget someone
wanted to try. A few habits prevent that:

1. **Watch field data**, not only lab scores. Search Console's Core Web
   Vitals report groups your URLs by what real visitors experienced.
2. **Give every addition an owner and an end date.** A tag added for a
   campaign should leave with the campaign.
3. **Keep a budget in the build.** A number that fails the build is harder to
   ignore than a report nobody opens.
4. **Test on a real mid-range phone** now and then. It shows what the
   slowest quarter of your audience sees.

Page speed is not a project you finish. It is a default you protect, and it
is much cheaper to protect than to win back.
