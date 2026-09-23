---
summary: The action element — a button, or a link that looks like one.
whenToUse:
  - Any call to action, form submit, or trigger for an overlay.
  - A link that should read as an action rather than as inline text.
whenNotToUse:
  - Navigation inside running prose; use Link.
  - A toggle with on/off state; use Switch or Toggle.
related: [Link, Icon]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/button/
---

`Button` renders a `<button>` by default and an `<a>` when `href` is set. It is
static: no client script. Every colour is a token, so a theme reskins it without
touching the source.

```astro
---
import Button from 'parche:elements/Button';
---
<Button href="/start" icon="tabler:arrow-right" iconPosition="end">Get started</Button>
```

:::example basic
Variants, sizes and the danger tone. A disabled link keeps its place in the tab
order with `aria-disabled` and drops its `href`.
:::

:::example icons
Icons at either end; an icon-only button needs `label`, which becomes its
accessible name.
:::

## Anatomy

One part, `root` — the `<button>` or `<a>` itself. Hooks: class `parche-button`,
`data-part="root"`, `data-variant`, `data-size`, `data-tone` (only when not
`default`), `data-state="disabled"`.

## Accessibility

- Real `<button>` / `<a>` elements: native focus, activation with Enter and Space
  (button) or Enter (link), and announced roles.
- `type` defaults to `button`, so a Button inside a form never submits by accident.
- `target="_blank"` adds `rel="noopener noreferrer"`.
- Focus ring: `focus-visible:outline-ring`, two pixels, offset — visible on every
  background the tokens define.
- Icons are `aria-hidden`; an icon-only Button must pass `label`.
