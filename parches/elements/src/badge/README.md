---
summary: A small status pill — a state, a category, a count.
whenToUse:
  - Marking state (passing, deprecated, new) or a small category next to a title.
whenNotToUse:
  - A clickable filter chip; use Tag.
related: [Tag, Eyebrow]
---

```astro
---
import Badge from 'parche:elements/Badge';
---
<Badge variant="success" icon="tabler:check">Passing</Badge>
```

:::example basic
The six variants and the small size.
:::

## Anatomy

One part, `root`. Hooks: class `parche-badge`, `data-part="root"`,
`data-variant`, `data-size`.

## Accessibility

Text carries the meaning; the icon is decorative. Colour alone never encodes
the state — each status variant also has a distinct label.
