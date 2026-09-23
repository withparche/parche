---
summary: A horizontal separator between blocks.
whenToUse:
  - Separating groups inside a card, a menu or a form ("or").
whenNotToUse:
  - Between page sections; Section's rhythm and `surface` bands do that.
related: [Section]
---

```astro
---
import Divider from 'parche:elements/Divider';
---
<Divider label="or" />
```

:::example basic
Line, dots, gradient, and a labelled line.
:::

## Anatomy

`root` — an `<hr>` (line) or a `role="separator"` div; `label` — the optional
centred text. Hooks: class `parche-divider`, `data-part`, `data-variant`.

## Accessibility

Every variant is a separator to assistive tech. A `label` becomes the
separator's name; the flanking lines are hidden.
