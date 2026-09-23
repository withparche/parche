---
summary: The trail from the home page to here.
whenToUse:
  - Any page more than one level deep: posts, docs, catalog entries.
related: [Link, Pagination]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
---

```astro
---
import Breadcrumb from 'parche:elements/Breadcrumb';
---
<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />
```

:::example basic
Three levels; the last is the current page.
:::

## Anatomy

`root` (`nav`) · `list` (`ol`) · `item` · `link` · `separator`. Hooks: class
`parche-breadcrumb-*`, `data-part`, `data-state="current"` on the last item.

## Accessibility

- A `<nav>` named by `label`, so several navigations on a page stay distinct.
- The current page carries `aria-current="page"` and is not a link.
- Separators are decorative icons, hidden from assistive tech.
