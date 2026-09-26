---
summary: A few numbers the reader sets and the results a formula makes of them, with a link that keeps the answer.
whenToUse:
  - The cost of not buying, seats times price, hours saved per month.
whenNotToUse:
  - A price that needs a quote; show the bands in a Table instead.
related: [Table, Stats]
---

```astro
---
import Calculator from 'parche:elements/Calculator';
---
<Calculator
  inputs={[{ name: 'seats', label: 'People', value: 3 }]}
  results={[{ label: 'Per month', formula: 'seats * 9', prefix: '$' }]}
/>
```

:::example basic
Calls per month and hours each, the hours given back, and a link to share.
:::

## Formulas

Plain arithmetic on the input names: `+ - * / ( )`, and `min`, `max`,
`round`, `floor`, `ceil`. No other code runs; a formula that names something
else fails the build.

## Anatomy

`root` (`parche-calculator`) · `input` rows with `decrement`/`increment` or a
slider · `result` rows with their `value` · `share`.

## Accessibility

Real number and range inputs with labels; the results sit in a polite live
region, so a change is announced once. Without script the results for the
starting values are already on the page.
