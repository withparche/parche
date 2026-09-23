---
summary: A taxonomy chip — a category, a tag, a filter.
whenToUse:
  - Post tags and categories linking to their index pages.
  - A row of filters with one `active`.
whenNotToUse:
  - A status; use Badge.
related: [Badge]
---

```astro
---
import Tag from 'parche:elements/Tag';
---
<Tag href="/tag/astro" active>Astro</Tag>
```

:::example basic
A filter row with the active one, and a plain tag.
:::

## Anatomy

One part, `root` — `<a>` with `href`, `<span>` otherwise. Hooks: class
`parche-tag`, `data-part="root"`, `data-state="active"`.

## Accessibility

An active linked tag carries `aria-current="true"`, so the selected filter is
announced, not just coloured.
