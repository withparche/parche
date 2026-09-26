---
publishDate: 2026-08-10T00:00:00Z
title: Elements and widgets
excerpt: How Parche separates the elements from the widget library, and why it matters.
image:
  src: https://placehold.co/1200x630/0ea5e9/ffffff?text=Elements
  alt: Elements and widgets
series:
  name: getting-started
  order: 2
category: Architecture
tags:
  - parche
  - design-system
authors:
  - jane
---

Parche keeps foundational building blocks in `@parche/elements` and the widget
library in `@parche/ui`. Both are consumed through virtual modules, so widgets
never import an element by package path.

## Why the split

It keeps the engine neutral, lets every widget share one consistent base, and
makes the element contract a public, swappable surface.

## What an element is

An element is one piece of interface with one job: a button, a table, a
dialog, a search field. It renders complete, accessible HTML on the server,
and when it needs behaviour it upgrades that HTML in the browser as a small
custom element: no framework runtime, and nothing breaks before the script
arrives. Its parts carry `data-part` names, so a theme can restyle it without
touching its markup.

## What a widget is

A widget is a section of a page, made of elements: a hero, a pricing table,
a list of posts. It is what content names, as data:

```json
{ "widget": "blog/PostList", "props": { "layout": "cards" } }
```

Widgets take props with a schema, so the builder can draw a form for them
and a build can refuse a typo. Because they reach elements through virtual
modules, a site can swap an element for its own and every widget that uses
it follows.

