---
summary: A yes/no choice with its label — the native checkbox.
whenToUse:
  - Consent, opt-ins, any independent yes/no in a form.
whenNotToUse:
  - A setting that applies at once; use Switch.
  - One choice among several; use RadioGroup.
related: [Switch, RadioGroup]
---

```astro
---
import Checkbox from 'parche:elements/Checkbox';
---
<Checkbox name="terms" label='I agree to the <a href="/terms">terms</a>' required />
```

:::example basic
Required with a link in the label, checked with help text, invalid, disabled.
:::

## Anatomy

`root` (`data-state` valid/invalid) · `input` · `label` · `description` ·
`error`. Hooks: class `parche-checkbox-*`, `data-part`.

## Without JavaScript

A native checkbox: fully functional.

## Accessibility

Named by its label, described by the help text and the error,
`aria-invalid` when there is one, `required` on the control.
