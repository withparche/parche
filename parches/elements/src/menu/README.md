---
summary: A list of commands or links under a button — the APG menu button on the Popover API.
whenToUse:
  - Site navigation dropdowns, "more" actions, a language or theme picker.
whenNotToUse:
  - A form or rich content next to a trigger; use Popover.
  - Panels of content chosen by a tab; use Tabs.
related: [Popover, Tooltip]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
---

`Menu` renders a trigger (`label` and/or `icon`) and a `popover="auto"`
surface with `role="menu"`. Items come as `groups`: a link item navigates, a
button item emits `parche:select`, and an item with `checked` set becomes a
`menuitemradio` for single-choice pickers. Fill the `trigger` slot with your
own button (`popovertarget={id} aria-haspopup="menu"`) when the default look
does not fit.

```astro
---
import Menu from 'parche:elements/Menu';
---
<Menu id="lang" icon="tabler:world" triggerLabel="Language" align="end"
  groups={[{ items: [{ label: 'English', value: 'en', checked: true }, { label: 'Español', value: 'es', checked: false }] }]} />

<script>
  document.addEventListener('parche:select', (e) => console.log(e.detail.value));
</script>
```

:::example basic
A navigation menu with groups and descriptions, then a radio-style picker
behind an icon trigger.
:::

## Anatomy

`root` (`parche-menu`, `data-state`) · `trigger` · `surface` (`role="menu"`)
· `group` · `title` · `item` (`menuitem` or `menuitemradio`, `data-value`).
Hooks: class `parche-menu-*`, `data-part`, `data-placement`, `data-align`.

## Keyboard

| Key | Does |
| --- | --- |
| Enter / Space / ArrowDown | Open from the trigger, focus the first item (ArrowUp: the last) |
| ArrowDown / ArrowUp | Next / previous item, wrapping |
| Home / End | First / last item |
| A–Z | Next item starting with that letter |
| Enter / Space | Activate |
| Escape | Close, focus back on the trigger |
| Tab | Close and move on |

## Events

`parche:select` (`detail.value`, `detail.label`) when an item is activated,
plus Popover's `parche:open` / `parche:close` pairs.

## Without JavaScript

The trigger opens and closes the list (Popover API), and the items are
ordinary links and buttons in the tab order. Arrow keys and typeahead need
the element.

## Accessibility

`aria-haspopup="menu"` and `aria-expanded` on the trigger, `role="menu"`
labelled by it, `role="group"` with titles, `aria-checked` on radio items,
`aria-current` on the current one, `aria-disabled` on disabled ones. Focus
enters the list on open and returns to the trigger on close.
