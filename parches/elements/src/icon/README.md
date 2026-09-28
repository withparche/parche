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

## Bundling

astro-icon bundles every set the site installs whole unless `include`
says which icons to keep, and Tabler alone is 2 MB of SVG: a static build
parses it once, a server on every cold start. Parche's widgets take their
icon names from content, which astro-icon cannot see by scanning code, so
core reads them for you:

```js
import { usedIcons } from '@parche/astro/icons';

const parches = [createElements(), createUI()];
export default defineConfig({
  integrations: [parche({ parches }), icon({ include: usedIcons(parches) })],
});
```

`usedIcons` scans the site's `src/` and the parches' sources for every
`<set>:<name>`, for the sets installed as `@iconify-json/<set>`. A name put
together at run time is not seen: add it with
`usedIcons(parches, { also: { tabler: ['arrow-right'] } })`.
