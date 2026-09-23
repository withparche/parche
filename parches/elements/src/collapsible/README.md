---
summary: A disclosure — a trigger that shows and hides its content.
whenToUse:
  - One expandable block: a "show more", a filter panel, a details section.
  - As the item of an Accordion.
whenNotToUse:
  - Several related panels; use Accordion so one closes the others.
related: [Accordion]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
---

`Collapsible` is a native `<details>`/`<summary>`. It opens and closes with
no script; the custom element adds the `data-state` hook, `parche:toggle`
(cancelable) and `parche:toggled` events, and `forceOpen`, a media query that
keeps it open — collapse on phones, always open on desktop.

```astro
---
import Collapsible from 'parche:elements/Collapsible';
---
<Collapsible title="Shipping" open>Free over 50 €.</Collapsible>
```

:::example basic
Three disclosures: closed, open by default, and forced open on wide screens.
:::

## Anatomy

`root` (`<parche-collapsible>` around a `<details>`) · `trigger` (`summary`)
· `indicator` (the chevron) · `content`. Hooks: class `parche-collapsible-*`,
`data-part`, `data-state="open|closed"` on the root.

## Keyboard

| Key | Does |
| --- | --- |
| Enter / Space | Toggle, on the trigger |
| Tab | Through the trigger and, when open, the content |

## Without JavaScript

Fully functional. Only `forceOpen` and the events need the script.

## Accessibility

- Native disclosure semantics: the `<summary>` is a button with the expanded
  state exposed by the browser.
- While `forceOpen` matches, the trigger is `aria-disabled` and clicks do
  nothing, so the content cannot be collapsed by accident.
- The content transition uses `::details-content` only where supported and
  never under `prefers-reduced-motion`.
