---
title: Markdown pages
description: Author pages in Markdown — sections in frontmatter, prose in the body.
sections:
  - widget: Hero
    props:
      tagline: Authoring
      title: "Pages in <span class='text-primary'>Markdown</span>"
      subtitle: "This page is a .md file. The sections below come from its frontmatter, exactly like a JSON page — but the body can also carry prose."
  - widget: Note
    props:
      title: "Frontmatter sections + Markdown body"
      description: "Mix structured widgets with long-form content in one file."
---

## Why Markdown pages

JSON is great for structured, widget-driven pages. Markdown is better when a page
is mostly prose — docs, guides, changelogs. Parche loads both from the same
collection, so you pick per page.

- Same `sections` schema as JSON pages.
- Plus a Markdown body for long-form content.
- Rendered through the same pipeline.
