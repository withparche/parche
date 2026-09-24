---
summary: A striped stand-in for an image that does not exist yet.
whenToUse:
  - Mock-ups and templates, where the real image is the client's to supply.
  - Stating the size an image should be delivered at.
whenNotToUse:
  - As decoration on a shipped page: replace it with the real image.
related: [Image, AspectRatio]
---

```astro
---
import Placeholder from 'parche:elements/Placeholder';
---
<Placeholder caption="hero screenshot · 1200×900" ratio="4/3" />
```

:::example basic
A 4:3 box with its caption.
:::

## Anatomy

`root` — the striped box, `role="img"` named by the caption; `caption` — the
mono chip. Hooks: `parche-placeholder`, `parche-placeholder-caption`.

## Tokens

The two stripe colours are component tokens, `--ds-comp-placeholder-stripe-a`
and `-b`, defaulting to the second surface and a mix towards the border.
