---
summary: One panel at a time, chosen from a tab list.
whenToUse:
  - Views of the same thing (monthly / yearly, code in several languages).
whenNotToUse:
  - Sequential steps; use a Stepper.
  - Navigation between pages; use links.
related: [Accordion, Collapsible]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
---

`Tabs` takes `items` and renders the whole APG pattern on the server. A panel
is the slot named after its tab's `value`, or `items[].content` as HTML for
data-driven widgets. `syncKey` keeps the selection in the URL (`?billing=yearly`),
so a link can open a page on a given tab.

```astro
---
import Tabs from 'parche:elements/Tabs';
---
<Tabs items={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]} label="Billing" syncKey="billing">
  <div slot="monthly">…</div>
  <div slot="yearly">…</div>
</Tabs>
```

:::example basic
A line tab list with a disabled tab and URL sync, then vertical pills with
HTML content.
:::

## Anatomy

`root` (`parche-tabs`, `data-value`, `data-orientation`) · `list` (`tablist`)
· `tab` (`role="tab"`, `data-state` active/inactive) · `panel` (`tabpanel`) ·
`heading` (visible without script only). Hooks: class `parche-tabs-*`,
`data-part`, `data-variant` through the `variant` prop.

## Keyboard

| Key | Does |
| --- | --- |
| ArrowRight / ArrowLeft | Next / previous tab; the panel follows (ArrowDown / ArrowUp when vertical) |
| Home / End | First / last tab |
| Tab | From the selected tab into the panel's content |

## Events

`parche:change` before (cancelable, `detail.value`), `parche:changed` after.
`element.select(value)` and `element.value` for scripts.

## Without JavaScript

Every panel shows, stacked, under a heading with its tab's label; the tab
list is hidden. Done through `@media (scripting: none)`, so there is no
flash of stacked panels for users with script.

## Accessibility

Roles and states are server-rendered: `aria-selected`, `aria-controls`,
`aria-labelledby`, `hidden="until-found"` on inactive panels, so find-in-page
still reaches their text and a match selects that tab. A panel is tabbable
only when it holds nothing focusable.
