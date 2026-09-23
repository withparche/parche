---
summary: One choice from a list — the native select, styled.
whenToUse:
  - A fixed list of more than five or so options.
whenNotToUse:
  - Few options that should all be visible; use RadioGroup.
  - A long list to search by typing; use Combobox.
related: [RadioGroup, Combobox, Field]
---

```astro
---
import Select from 'parche:elements/Select';
---
<Select name="plan" label="Plan" placeholder="Choose a plan" options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]} required />
```

Options may be grouped: `{ label: 'Europe', options: [...] }` renders an
`<optgroup>`.

:::example basic
With a placeholder and a disabled option, then grouped with a value set.
:::

## Anatomy

`root` (the Field) · `wrapper` · `select` · `indicator`. Hooks: class
`parche-select-*`, `data-part`, plus the Field's.

## Without JavaScript

The native picker: fully functional everywhere.

## Accessibility

Label, `aria-describedby`, `aria-invalid`, `required`; the platform's own
listbox and keyboard.
