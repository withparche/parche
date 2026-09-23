---
summary: Centres content at a chosen max width, with horizontal padding.
whenToUse:
  - Any block that should not run edge to edge — the inside of every Section.
  - A narrower measure for prose (`sm`) inside a wide page.
whenNotToUse:
  - Full-bleed backgrounds; put the Container inside the band, not around it.
related: [Section]
---

`Container` centres its children and caps their width. Five widths cover every
measure the widgets use; `full` removes the cap while keeping the padding.

```astro
---
import Container from 'parche:elements/Container';
---
<Container width="sm">
  <p>Prose at a comfortable measure.</p>
</Container>
```

:::example basic
The five widths.
:::

## Anatomy

One part, `root`. Hooks: class `parche-container`, `data-part="root"`,
`data-width`.

## Accessibility

Purely structural. Pick a landmark with `as` when the container *is* the
landmark (`main`, `nav`, `header`, `footer`), and keep one `main` per page.
