---
summary: A panel that slides in from an edge — a modal <dialog> docked to a side.
whenToUse:
  - Mobile navigation, filters, a settings drawer, a cart.
whenNotToUse:
  - A short decision in the middle of the screen; use Dialog.
related: [Dialog, Popover]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
---

`Sheet` is Dialog docked to `side` (`right` by default). Same invokers, same
platform behaviour; see Dialog for the full story. `hideTitle` keeps the
title for assistive tech only, the usual case for a navigation drawer, and
following a link inside closes it (a same-page anchor would otherwise leave
the drawer over the content).

```astro
---
import Sheet from 'parche:elements/Sheet';
import Button from 'parche:elements/Button';
---
<Button command="show-modal" commandfor="menu" icon="tabler:menu-2" label="Open menu" />

<Sheet id="menu" title="Menu" hideTitle>
  <nav>…</nav>
</Sheet>
```

:::example basic
A navigation drawer from the right and a filters sheet from the bottom.
:::

## Anatomy

Same as Dialog, under `parche-sheet-*`, plus `data-side` on the root.

## Keyboard

Same as Dialog: Escape closes (unless `closedBy="none"`), Tab cycles inside.

## Without JavaScript

Same as Dialog: native where invoker commands exist, polyfilled elsewhere.

## Accessibility

Native modal semantics; the title names it even when `hideTitle` hides it
visually.
