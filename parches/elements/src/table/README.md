---
summary: Rows and columns of facts, a comparison with quantities, a spec list, a matrix.
whenToUse:
  - Comparing plans, products or approaches with numbers instead of ticks.
  - A spec list, a data-safety table, a cost or audit breakdown.
  - Key and value lists between hairlines (hours, budgets), with frame="open".
whenNotToUse:
  - Layout; a grid of cards is Features or Card.
related: [List, Card]
---

```astro
---
import Table from 'parche:elements/Table';
---
<Table
  columns={[{ label: '' }, { label: 'Us', highlight: true }, { label: 'Them' }]}
  rows={[{ cells: ['Price', { text: 'Free, MIT', tone: 'success' }, '$49 once'] }]}
/>
```

:::example basic
A plan comparison with a highlighted column, a win and a known gap; an open
key and value list.
:::

## Values and tones

A plain value is quiet (400, muted) unless its column is `highlight`ed, where
it is stated (600, heading). A cell `{ text, tone }` or a row `tone` sets
`success`, `warning` ("they win this", a gap), `danger`, `primary` or `muted`.
There are no icons or ticks by design: say the quantity.

## Anatomy

`root` (the scrolling card) · `table` · `head` · `row` (`data-state` = the row
tone) · `foot` (a total row). Row labels are `<th scope="row">`. Component
tokens: `--ds-comp-table-radius`, `--ds-comp-table-radius-lg`.

## Accessibility

A real table with column and row headers. Below its minimum width it scrolls
inside its frame rather than stacking, so the reading order never changes;
`stickyFirst` keeps the row labels in view. Give it a `caption` when no
heading names it.
