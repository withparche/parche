---
summary: A full-width band with vertical rhythm; the outer box of a page section.
whenToUse:
  - Every top-level block of a page, so blocks share one vertical rhythm.
  - Alternating bands with `surface`.
whenNotToUse:
  - Inside another Section; nest a Container or a Stack instead.
related: [Container]
---

`Section` owns the vertical rhythm; `Container` owns the horizontal measure.
Together they are the outer two boxes of almost every widget.

```astro
---
import Section from 'parche:elements/Section';
import Container from 'parche:elements/Container';
---
<Section surface>
  <Container>…</Container>
</Section>
```

:::example basic
Small padding, plain and on the surface token.
:::

## Anatomy

One part, `root`. Hooks: class `parche-section`, `data-part="root"`,
`data-padding`, `data-state="surface"` when painted.

## Accessibility

A `<section>` is a region only when it has an accessible name; give it one with
`aria-labelledby` pointing at its heading when the section is a navigation
target, or use `as="div"` when it is purely visual.
