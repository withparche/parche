---
summary: A row of toggles that shows only the items of a list carrying the chosen value.
whenToUse:
  - A changelog filtered by type, a catalogue by category, integrations by job.
whenNotToUse:
  - Switching between different content; that is Tabs.
  - Searching text; that is Combobox or a search page.
related: [Tabs, List]
---

```astro
---
import Filter from 'parche:elements/Filter';
---
<Filter options={[{ value: '', label: 'Everything' }, { value: 'new', label: 'New' }]}>
  <article data-filter="new fixed">…</article>
</Filter>
```

:::example basic
Releases filtered by type, with counts filled in from the items.
:::

## Anatomy

`root` (`parche-filter`) · `bar` with `option` buttons (`aria-pressed`,
`data-state` on/off, a `count`) · `items` (the slot; items carry
`data-filter`) · `empty` with `clear` · `status`.

## Accessibility

The options are toggle buttons in a named group; the result count is
announced through a status region. Without script the bar is hidden and every
item shows, so nothing is lost.
