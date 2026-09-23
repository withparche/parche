---
summary: A figure with its label, counting up when it comes into view.
whenToUse:
  - Numbers that make a point: users, uptime, downloads.
whenNotToUse:
  - Live or exact figures that must be read at once; render plain text.
related: [Heading]
---

```astro
---
import Stat from 'parche:elements/Stat';
---
<Stat value="10K+" label="Downloads" icon="tabler:download" />
```

The value is text: the number in the middle animates, a prefix (`$`) and a
suffix (`+`, `%`, `K`) stay. Decimals are kept.

:::example basic
Four figures; scroll them into view to see the count.
:::

## Anatomy

`root` (`parche-stat`) · `icon` · `value` · `label` · `description`. Hooks:
class `parche-stat-*`, `data-part`.

## Events

`parche:counted` when the count finishes.

## Without JavaScript

The final figure is rendered. Under reduced motion it is also left alone.

## Accessibility

While counting, the changing text is hidden from assistive tech and a
visually hidden twin announces the final figure, so nothing reads "0, 37,
412…".
