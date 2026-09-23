---
summary: Inline code, or a plain code block.
whenToUse:
  - A file name, a prop, a short command in running text.
  - A short block where highlighting is not needed.
whenNotToUse:
  - Highlighted source; use a code widget built on Astro's Shiki.
related: [Kbd]
---

```astro
---
import Code from 'parche:elements/Code';
---
<Code>parche.config.json</Code>
```

:::example basic
Inline, and a JSON block.
:::

## Anatomy

`root` — `<code>` inline or `<pre>` as a block. Hooks: class `parche-code`,
`data-part`, `data-lang`.

## Accessibility

Native semantics. A block scrolls horizontally rather than wrapping, so long
lines stay readable; keep blocks short in prose.
