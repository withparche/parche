---
summary: A text input that filters a list of options as you type.
whenToUse:
  - A long list (countries, cities, tags) picked by typing.
whenNotToUse:
  - A short list; use Select or RadioGroup.
  - Free text with no options; use Input.
related: [Select, Input, Menu]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
---

`Combobox` is the APG list-autocomplete pattern: focus stays in the input,
`aria-activedescendant` names the highlighted option, typing filters. What
the form submits is the input's text (the option's label); the option's
`value` travels in `data-value` on the input and in `parche:select`.

```astro
---
import Combobox from 'parche:elements/Combobox';
---
<Combobox name="country" label="Country" options={countries} placeholder="Start typing…" />

<script>
  document.addEventListener('parche:selected', (e) => console.log(e.detail.value));
</script>
```

:::example basic
Filter by typing, then one with a value already picked.
:::

## Anatomy

`root` (`parche-combobox`, `data-state`) · `wrapper` · `input`
(`role="combobox"`) · `indicator` · `datalist` (no-script only) · `listbox`
· `option` (`data-state` active/inactive) · `empty`. Hooks: class
`parche-combobox-*`, `data-part`, plus the Field's.

## Keyboard

| Key | Does |
| --- | --- |
| Type | Filters and opens |
| ArrowDown / ArrowUp | Highlight the next / previous match, wrapping |
| Enter | Pick the highlighted option |
| Escape | Close |
| Alt+ArrowDown | Open without filtering |
| Tab | Close and move on |

## Events

`parche:select` before a pick (cancelable, `detail.value` and `label`),
`parche:selected` after.

## Without JavaScript

A native `<datalist>` suggests the same options; the typed text is what
the form submits. The listbox and the option values need the element,
which detaches the datalist on upgrade.

## Accessibility

`role="combobox"` with `aria-autocomplete="list"`, `aria-expanded`,
`aria-controls` and `aria-activedescendant`; options are `role="option"`
with `aria-selected`; the label, help text and error come from Field. The
indicator is out of the tab order: the input is the control.
