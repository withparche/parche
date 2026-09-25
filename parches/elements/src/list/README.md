---
summary: Rows between hairlines, for a changelog, a process, specs or a FAQ without disclosure.
whenToUse:
  - Dated or ordered rows beside a heading (Timeline, Steps rows).
  - Specs and facts that read top to bottom without a card each.
whenNotToUse:
  - Questions that open and close; use Accordion.
  - Items that need a surface of their own; use Card in a grid.
related: [Accordion, Card, Divider]
---

```astro
---
import List from 'parche:elements/List';
---
<List as="ol">
  {releases.map((r) => <li>{r.title}</li>)}
</List>
```

:::example basic
A divided ordered list of releases, and a plain list with small rows.
:::

## Anatomy

`root` — a `<ul>` or `<ol>`; every child element is a row and gets the
vertical padding. Hooks: class `parche-list`, `data-part`, `data-variant`.
Component tokens: `--ds-comp-list-padding-sm|md|lg`.

## Accessibility

A real list: screen readers announce the count. Use `as="ol"` when order
matters, and `label` when no heading names the list.
