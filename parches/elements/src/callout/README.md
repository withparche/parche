---
summary: A notice set apart from the flow, a caveat, a guarantee, a tip, a trust line.
whenToUse:
  - Saying what you do not do, what is not built yet, who this is not for.
  - A guarantee or a refund policy beside the price.
  - A tip or a warning inside documentation.
  - A trust line or a live activity signal with its source.
whenNotToUse:
  - A site-wide announcement; that is Banner.
  - A call to action with buttons; that is CallToAction.
related: [Banner, Card]
---

```astro
---
import Callout from 'parche:elements/Callout';
---
<Callout tone="warning" label="What we turn down" items={['<strong>Rebrands without research.</strong> …']} />
```

:::example basic
A warning card with a list and a footer, a success card, a tip bar, and two
inline rows: an activity signal and a trust line.
:::

## Anatomy

`root` (`aside`, `data-state` = the tone, `data-layout`) · `label` · `title` ·
`description` · `items` · `footer`. Component tokens:
`--ds-comp-callout-radius`, `--ds-comp-callout-radius-lg`,
`--ds-comp-callout-padding`.

## Accessibility

An `aside`: complementary content that a reader can skip. The tone is never
the only signal; the label says what kind of notice it is.
