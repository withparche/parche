---
publishDate: 2026-08-10T00:00:00Z
title: Elements and widgets
excerpt: How Parche separates the elements from the widget library, and why it matters.
image:
  src: https://placehold.co/1200x630/0ea5e9/ffffff?text=Elements
  alt: Elements and widgets
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
