---
summary: A small panel next to its trigger — the Popover API plus CSS anchor positioning.
whenToUse:
  - A short form, a share sheet, a colour picker, help text that needs controls.
whenNotToUse:
  - A choice among commands; use Menu.
  - Text-only help on hover; use Tooltip.
  - Anything the user must answer first; use Dialog.
related: [Dialog, Menu, Tooltip]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
---

`Popover` is `popover="auto"` with the trigger's `popovertarget` doing the
work: the platform opens, closes, light-dismisses on Escape and outside click,
and anchors the panel to the invoker with CSS anchor positioning. `placement`
and `align` pick the side; the panel flips when it would overflow.

```astro
---
import Popover from 'parche:elements/Popover';
import Button from 'parche:elements/Button';
---
<Button popovertarget="share">Share</Button>

<Popover id="share" title="Share this page" placement="bottom" align="end">
  …
</Popover>
```

:::example basic
Below and centred, then above with a title and a button that hides it.
:::

`anchor` hangs the panel from another element instead of the invoker (a
header bar for a full-width menu); that element declares
`style="anchor-name: --<id>"`. `openOnHover` also opens it on hover, on devices
that hover. `class` styles the surface.

## Anatomy

`root` (`parche-popover`, `data-state`, `data-placement`, `data-align`) ·
`surface` (`[popover]`) · `title` · `content`. Hooks: class
`parche-popover-*`, `data-part`.

## Keyboard

| Key | Does |
| --- | --- |
| Escape | Closes |
| Tab | Through the panel's controls, then on through the page |

Focus is not trapped: a popover is non-modal.

## Events

`parche:open` (cancelable) and `parche:opened`; `parche:close` and
`parche:closed`. The element also mirrors `aria-expanded` on every invoker.

## Without JavaScript

Toggling and light dismiss are native (Baseline 2024). Placement next to the
trigger needs CSS anchor positioning (Chrome 125, Safari 26); the element
positions it with `@floating-ui/dom` (lazy) elsewhere, and with no script at
all the panel appears in flow after its trigger.

## Accessibility

With `title` the panel is a non-modal `role="dialog"` named by it; without,
it is plain content. Invokers get `aria-expanded`.
