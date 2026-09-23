---
summary: A short description shown on hover and focus, anchored to its trigger.
whenToUse:
  - Naming an icon-only control, a hint that does not fit inline.
whenNotToUse:
  - Anything the user must read to proceed; put it in the page.
  - Content with controls; use Popover.
related: [Popover, Menu]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
---

`Tooltip` wraps its trigger. The `text` becomes a `role="tooltip"` surface,
a manual popover anchored to the wrapper, and the trigger is described by
it. Hover shows it after `delay`; focus shows it at once.

```astro
---
import Tooltip from 'parche:elements/Tooltip';
import Button from 'parche:elements/Button';
---
<Tooltip text="Copy link">
  <Button icon="tabler:link" label="Copy link" />
</Tooltip>
```

A tooltip supplements a name, it does not replace one: an icon-only button
still needs its `label`.

:::example basic
Top (the default), bottom, and right with no delay.
:::

## Anatomy

`root` (`parche-tooltip`, `data-state`, `data-placement`) · `surface`
(`role="tooltip"`). Hooks: class `parche-tooltip-*`, `data-part`.

## Keyboard

| Key | Does |
| --- | --- |
| Tab | Focusing the trigger shows it |
| Escape | Hides it |

## Without JavaScript

CSS shows it on `:hover` and `:focus-within`, positioned next to the trigger.
The `aria-describedby` link is set by the element.

## Accessibility

`role="tooltip"`, linked from the trigger with `aria-describedby`; shown on
focus as well as hover; dismissible with Escape; never receives focus.
