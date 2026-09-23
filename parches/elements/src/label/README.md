---
summary: The name of a form control.
whenToUse:
  - Naming a control Field does not wrap (a custom widget, an inline control).
whenNotToUse:
  - With Input, Textarea, Select, Checkbox or RadioGroup; they render their own.
related: [Field, Input]
---

```astro
---
import Label from 'parche:elements/Label';
---
<Label for="email" text="Email" required />
<input id="email" name="email" type="email" required />
```

:::example basic
Plain, and with the required mark.
:::

## Anatomy

`root` (`label`) · `required` (decorative mark). Hooks: class
`parche-label`, `data-part`.

## Accessibility

`for` ties it to the control. The mark is `aria-hidden`; `required` on the
control is what is announced.
