---
summary: Before and after in one frame, split by a divider the reader drags.
whenToUse:
  - A redesign, a speed fix, a renovation: the same view, changed.
whenNotToUse:
  - Two different things; that is two images side by side (Gallery pairs).
related: [Gallery, Image]
---

```astro
---
import Compare from 'parche:elements/Compare';
---
<Compare before={{ src: '/old.png', label: 'before' }} after={{ src: '/new.png', label: 'after', tone: 'success' }} />
```

:::example basic
A before and after with placeholders, the better side in the success tone.
:::

## Anatomy

`root` (`parche-compare`, `--pos`) · `frame` · `after` · `before` (clipped at
the divider) · `chip` (one per side) · `range`.

## Accessibility

The divider is a native range input with a name, so arrows, Home, End and
touch all work. Both images keep their alt text; the chips name each side.
