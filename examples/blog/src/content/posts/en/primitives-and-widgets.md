---
publishDate: 2026-08-10T00:00:00Z
title: Primitives and widgets
excerpt: How Parche separates foundational primitives from the widget library, and why it matters.
image:
  src: https://placehold.co/1200x630/0ea5e9/ffffff?text=Primitives
  alt: Primitives and widgets
category: Architecture
tags:
  - parche
  - design-system
authors:
  - jane
---

Parche keeps foundational building blocks in `@parche/primitives` and the widget
library in `@parche/ui`. Both are consumed through virtual modules, so widgets
never import primitives directly.

## Why the split

It keeps the engine neutral, lets every widget share one consistent base, and
makes the primitive contract a public, swappable surface.
