---
summary: A stack of disclosures where opening one closes the others.
whenToUse:
  - FAQs, step-by-step help, settings groups — several related panels.
whenNotToUse:
  - A single expandable block; use Collapsible.
related: [Collapsible]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
---

`Accordion` renders one Collapsible per item and gives them the same native
`details name`, so the browser enforces "one open at a time" with no script.
`multiple` drops the name and lets every item open independently. An item's
`icon` sits before its title.

```astro
---
import Accordion from 'parche:elements/Accordion';
---
<Accordion items={faqs} forceOpen="(min-width: 64rem)" />
```

:::example basic
Exclusive (the default) with the first open; then `multiple`.
:::

## Anatomy

`root` · `item` (each Collapsible, with its own `trigger`, `indicator` and
`content` parts). Hooks: class `parche-accordion`, `data-part`,
`data-multiple`.

## Keyboard

Each item is a native disclosure: Enter / Space on the focused trigger,
Tab between triggers. No arrow-key roving: the APG lists it as optional for
accordions, and native semantics keep every trigger in the tab order.

## Without JavaScript

Fully functional, exclusivity included (`details name` is Baseline 2024).

## Accessibility

Titles are announced as disclosure buttons with their expanded state; the
content is real HTML in the document, readable and searchable even when
collapsed.
