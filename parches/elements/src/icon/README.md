---
summary: An SVG icon from the Iconify sets, decorative by default.
whenToUse:
  - Reinforcing a label, a list item or a button with a glyph.
  - Standing alone with `label`, when the glyph is the whole message.
whenNotToUse:
  - Illustrations or logos; use Image.
related: [Button]
---

`Icon` wraps `astro-icon`, so any Iconify set the site installs works. It is
static and takes the text colour of its parent (`currentColor`). Parche content
is data, so icon names arrive from JSON: on SSR sites scope the set with
`icon({ include })` to keep the bundle small.

```astro
---
import Icon from 'parche:elements/Icon';
---
<Icon name="tabler:arrow-right" size="sm" />
<Icon name="tabler:check" label="Included" />
```

:::example basic
Five sizes; a meaningful icon with `label`; a decorative one beside text.
:::

## Anatomy

One part, `root` — the inline `<svg>`. Hooks: class `parche-icon`,
`data-part="root"`, `data-size`.

## Accessibility

- Decorative by default: `aria-hidden="true"`, invisible to assistive tech.
- With `label`: `role="img"` and `aria-label`, announced as that name.
- Never the only focusable content: an icon that acts is a Button with an icon.
