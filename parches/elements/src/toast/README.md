---
summary: Brief notifications in a live region, shown from script or rendered on the page.
whenToUse:
  - Confirming an action ("Saved"), reporting a background failure.
whenNotToUse:
  - Anything that needs a decision; use Dialog.
  - Persistent page-level messages; put them in the page.
related: [Dialog]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
---

One `<Toast />` per page, in the layout. It renders a `role="status"` region with a list
fixed to `position`, plus a template. Anything on the page then notifies by
dispatching `parche:toast` on `document`; no reference to the element needed.

```astro
---
import Toast from 'parche:elements/Toast';
---
<Toast position="bottom-right" />

<script>
  document.dispatchEvent(new CustomEvent('parche:toast', {
    detail: { title: 'Changes saved', description: 'The page is live.', tone: 'success' },
  }));
</script>
```

`items` renders toasts on the server, for a message that must be there on
first paint, such as the result of a form post.

:::example basic
Three tones from script, and one rendered on the server that stays.
:::

## Anatomy

`root` (`parche-toaster`, `data-position`) · `region` (`role="status"`) · `list` ·
`toast` (`data-tone`, `data-state` open/closing) · `icon` · `title` ·
`description` · `dismiss` · `template`. Hooks: class `parche-toast-*`,
`data-part`.

## Keyboard

| Key | Does |
| --- | --- |
| Tab | Reaches each toast's dismiss button |
| Enter / Space | Dismisses |

## API

`toaster.show({ title, description?, tone?, duration? })` returns a function
that dismisses the toast. `duration: 0` keeps it until dismissed. Five at
most; the oldest leaves first. `parche:dismissed` fires after one leaves.

## Without JavaScript

Server-rendered toasts show and stay. Script toasts need the element, by
definition.

## Accessibility

Additions to the `role="status"` list are announced politely, without
stealing focus. Auto-dismiss pauses while the pointer or focus is on a
toast. Every toast has a dismiss button with an accessible name.
