---
summary: A placeholder shape shown while content loads.
whenToUse:
  - The builder's preview and any island that fills in after the first paint.
whenNotToUse:
  - Server-rendered pages that are complete on arrival; nothing loads later.
related: [Card]
---

```astro
---
import Skeleton from 'parche:elements/Skeleton';
---
<div aria-busy="true"><Skeleton lines={3} /></div>
```

:::example basic
A circle, a rect and three text lines in a card layout.
:::

## Anatomy

`root`; `line` for each text line. Hooks: class `parche-skeleton`,
`parche-skeleton-line`, `data-part`, `data-variant`.

## Accessibility

- Hidden from assistive tech; mark the loading region `aria-busy="true"` so
  the state is announced instead.
- The pulse respects `prefers-reduced-motion`.
