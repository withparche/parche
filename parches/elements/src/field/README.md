---
summary: A form control with its label, help text and error, wired together.
whenToUse:
  - Wrapping a control the library does not ship (a colour picker, an editor).
whenNotToUse:
  - With Input, Textarea, Select, Checkbox, RadioGroup or Combobox; they use Field themselves.
related: [Label, Input]
---

`Field` renders the label, the help text and the error around a slotted
control. Because the control is slotted, Field cannot reach its attributes;
the ids follow a convention instead, and `fieldIds()` gives you the
`aria-describedby` value to put on the control.

```astro
---
import Field from 'parche:elements/Field';
import { fieldIds } from '@parche/elements/utils';
const { describedBy } = fieldIds('color', { description: 'Any CSS colour.' });
---
<Field id="color" label="Brand colour" description="Any CSS colour.">
  <input id="color" name="color" type="color" aria-describedby={describedBy} />
</Field>
```

:::example basic
A required field with help text and an error, the control marked invalid.
:::

## Anatomy

`root` (`data-state` valid/invalid) · `label` · `control` · `description`
(`<id>-description`) · `error` (`<id>-error`). Hooks: class
`parche-field-*`, `data-part`.

## Accessibility

The label is tied by `for`; the control lists the description and the error
in `aria-describedby` and sets `aria-invalid` when there is an error. A
required control carries `required` itself; the label's mark is decorative.
