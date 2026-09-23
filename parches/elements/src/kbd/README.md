---
summary: A keyboard key, or a key combination.
whenToUse:
  - Documenting shortcuts in docs and tooltips.
related: [Code]
---

```astro
---
import Kbd from 'parche:elements/Kbd';
---
<Kbd keys={['⌘', 'K']} />
```

:::example basic
A single key and a combination.
:::

## Anatomy

`root` — the `<kbd>`; `key` — each key of a combination. Hooks: class
`parche-kbd`, `parche-kbd-key`, `data-part`.

## Accessibility

Native `<kbd>` semantics; a combination is `<kbd>` nested in `<kbd>`, as HTML
defines it.
