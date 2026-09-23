---
summary: A section headline — eyebrow, title and subtitle, at a heading level.
whenToUse:
  - The top of every section widget, so headlines share one rhythm and outline logic.
whenNotToUse:
  - A page title inside prose; use Prose or a bare h1.
related: [Eyebrow, Prose]
---

`Heading` is what `LegacyHeadline` was, with the outline made explicit: pick the
`level` that fits the page (sections are `2`), and the type scale follows.
`title` and `subtitle` are rendered as HTML so content can highlight a word.

```astro
---
import Heading from 'parche:elements/Heading';
---
<Heading tagline="Pricing" title="Simple, honest plans" subtitle="No surprises." />
```

:::example basic
Centred at level 2 with a highlighted word; then a compact, left-aligned level 3.
:::

## Anatomy

`root` · `tagline` (an Eyebrow) · `title` (h1–h4) · `subtitle`. Hooks: class
`parche-heading`, `data-part`, `data-align`.

## Accessibility

- `level` is the document outline, not a size: choose it for structure, and let
  the type role carry the size.
- Inline HTML in `title`/`subtitle` comes from content you control; it is not
  sanitised here.
