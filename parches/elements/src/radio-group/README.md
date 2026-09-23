---
summary: One choice among a few, all visible — native radios in a fieldset.
whenToUse:
  - Two to five options the user should see at once.
whenNotToUse:
  - Many options; use Select or Combobox.
  - Independent yes/no choices; use Checkbox.
related: [Select, Checkbox]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
---

```astro
---
import RadioGroup from 'parche:elements/RadioGroup';
---
<RadioGroup name="billing" label="Billing" value="monthly"
  options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly', description: 'Two months free.' }]} />
```

:::example basic
Vertical with descriptions and a disabled option; horizontal with an error.
:::

## Anatomy

`root` (`fieldset`, `data-state`, `data-orientation`) · `legend` · `option`
· `input` · `label` · `description` · `error`. Hooks: class
`parche-radio-group-*`, `data-part`.

## Keyboard

| Key | Does |
| --- | --- |
| Tab | Into the group (the checked radio, or the first) |
| Arrows | Move and select |

Native behaviour; nothing to script.

## Without JavaScript

Fully functional.

## Accessibility

The `legend` names the group; the help text and the error describe it
(`aria-describedby` on the fieldset); each radio has its own label.
