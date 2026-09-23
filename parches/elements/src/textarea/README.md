---
summary: A multi-line text field with its label, help text and error.
whenToUse:
  - Messages, descriptions, anything longer than a line.
whenNotToUse:
  - Short text; use Input.
related: [Input, Field]
---

```astro
---
import Textarea from 'parche:elements/Textarea';
---
<Textarea name="message" label="Message" rows={4} required />
```

`grow` (the default) lets the box follow its content through
`field-sizing: content`, no script; `rows` is then the minimum.

:::example basic
Growing with help text, and fixed with manual resize.
:::

## Anatomy

`root` (the Field) · `textarea`. Hooks: class `parche-textarea`,
`data-part`, plus the Field's.

## Without JavaScript

A native textarea: fully functional.

## Accessibility

Same as Input: label, `aria-describedby`, `aria-invalid`, `required`.
