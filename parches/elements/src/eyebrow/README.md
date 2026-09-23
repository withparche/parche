---
summary: The small uppercase label above a heading.
whenToUse:
  - Naming a section above its heading, inside Heading.
whenNotToUse:
  - As a heading itself; it is not in the outline.
related: [Heading, Badge]
---

`Eyebrow` is the `type-label` role in one of three tones. `Heading` renders one
when given a `tagline`.

```astro
---
import Eyebrow from 'parche:elements/Eyebrow';
---
<Eyebrow>Features</Eyebrow>
```

:::example basic
The three tones.
:::

## Anatomy

One part, `root`. Hooks: class `parche-eyebrow`, `data-part="root"`, `data-tone`.

## Accessibility

Plain text; it does not create a heading level. Use `as="span"` inside a
heading element when the eyebrow should read as part of it.
