---
summary: An inline text link, with an optional trailing arrow.
whenToUse:
  - Navigation inside running text.
  - A "read more" that should read as a link, not a button.
whenNotToUse:
  - A call to action; use Button with `href`.
related: [Button, Icon]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/link/
---

`Link` is a real `<a>` with three looks. `external` opens a new tab safely.

```astro
---
import Link from 'parche:elements/Link';
---
<Link href="/docs" variant="arrow">Read the docs</Link>
```

:::example basic
The three variants inline, and an external link.
:::

## Anatomy

`root` — the `<a>`; `arrow` — the decorative icon of the arrow variant.
Hooks: class `parche-link`, `data-part`, `data-variant`.

## Accessibility

- The link text is the accessible name; the arrow is `aria-hidden`.
- Underlined by default in prose, so a link is not colour alone.
- Focus ring on `focus-visible` with the ring token.
