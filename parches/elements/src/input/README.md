---
summary: A single-line text field with its label, help text and error.
whenToUse:
  - Any short text: names, emails, URLs, numbers, dates.
whenNotToUse:
  - Several lines; use Textarea.
  - A fixed set of choices; use Select or RadioGroup.
related: [Field, Textarea, Select, Combobox]
---

```astro
---
import Input from 'parche:elements/Input';
---
<Input name="email" label="Email" type="email" required description="We never share it." />
<Input name="handle" label="Handle" value="parche" error="That handle is taken." />
```

:::example basic
Required, with an icon and help text, invalid, read-only, disabled.
:::

## Anatomy

`root` (the Field) · `wrapper` · `icon` · `input`. Hooks: class
`parche-input-*`, `data-part`, plus the Field's.

## Without JavaScript

A native input: fully functional, including the browser's own validation.

## Accessibility

Named by its label, described by the help text and the error
(`aria-describedby`), `aria-invalid` when there is an error, `required`
on the control. The icon is decorative.
