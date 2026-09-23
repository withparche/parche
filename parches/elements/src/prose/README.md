---
summary: Typography for long-form content, from the tokens.
whenToUse:
  - A Markdown body, a post, a long description.
whenNotToUse:
  - Widget copy that already uses the type roles.
related: [Heading, Container]
---

```astro
---
import Prose from 'parche:elements/Prose';
---
<Prose html={renderedMarkdown} size="lg" />
```

:::example basic
Headings, a paragraph, a list and a quote inside the same measure.
:::

## Anatomy

One part, `root`. Hooks: class `parche-prose` (with `prose`), `data-part`,
`data-size`.

## Accessibility

Headings inside prose keep their levels; start at the level that follows the
page's last heading. Links are underlined by the `.prose` rules.
