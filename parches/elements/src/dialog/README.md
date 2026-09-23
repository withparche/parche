---
summary: A modal window on the native <dialog>, opened by invoker commands.
whenToUse:
  - A decision or a short form that must be answered before going on.
whenNotToUse:
  - Navigation or long content that slides in from an edge; use Sheet.
  - A small non-modal panel next to its trigger; use Popover.
related: [Sheet, Popover, Button]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
---

`Dialog` is the platform's `<dialog>` with the markup a modal needs already in
place. It is opened by **any** button with `command="show-modal"` and
`commandfor` pointing at its `id`, wherever that button lives; the close button
inside sends `command="close"`. That is the invoker commands API, so the whole
thing works with no script at all where the browser has it, and the element
loads the polyfill only where it does not.

```astro
---
import Dialog from 'parche:elements/Dialog';
import Button from 'parche:elements/Button';
---
<Button command="show-modal" commandfor="signup">Sign up</Button>

<Dialog id="signup" title="Create your account" description="Free, no card needed.">
  <form id="signup-form" method="dialog">…</form>
  <Button slot="footer" variant="ghost" command="close" commandfor="signup">Cancel</Button>
  <Button slot="footer" type="submit" form="signup-form">Create</Button>
</Dialog>
```

Anything with `slot="footer"` goes in the footer, several elements included.
A `trigger` slot exists too, for when you want the button rendered right
before the dialog; it is the same button, nothing more.

:::example basic
A confirm dialog with a footer, and a strict one that only its button closes.
:::

## Anatomy

`root` (`parche-dialog`, `data-state` open/closed) · `dialog` (the native
element, also the backdrop) · `panel` · `header` · `title` · `description` ·
`close` · `content` · `footer`. Hooks: class `parche-dialog-*`, `data-part`.

## Keyboard

| Key | Does |
| --- | --- |
| Escape | Closes, unless `closedBy="none"` |
| Tab / Shift+Tab | Cycles inside; the platform keeps focus in a modal |

Focus returns to the invoker on close: the platform does it for `showModal()`.

## Events

`parche:open` and `parche:close` fire before, cancelable (`preventDefault()`
keeps the current state); `parche:opened` and `parche:closed` after. The
`close` after-event carries `returnValue` from `<form method="dialog">`.

## Without JavaScript

Fully functional in browsers with invoker commands (Chrome 135, Safari 26,
Firefox 144). Elsewhere the element brings `invokers-polyfill` (12 KB, MIT,
loaded lazily), so the same markup works everywhere with script.

## Accessibility

Native modal semantics: `role="dialog"`, `aria-modal`, `aria-labelledby` on
the title and `aria-describedby` on the description, page content inert
behind it, page scroll locked. The close button has an accessible name
(`closeLabel`).
