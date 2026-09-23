---
summary: An on/off control — a native checkbox with the switch role.
whenToUse:
  - A setting that takes effect immediately or is submitted with a form.
whenNotToUse:
  - Choosing between several options; use radios or Tabs.
related: [Slider]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
---

```astro
---
import Switch from 'parche:elements/Switch';
---
<Switch name="newsletter" label="Email me the changelog" checked />
```

:::example basic
Off, on with a description, and disabled.
:::

## Anatomy

`root` (`label`) · `input` (the checkbox, visually hidden) · `track` · `thumb`
· `label` · `description`. Hooks: class `parche-switch-*`, `data-part`.

## Keyboard

| Key | Does |
| --- | --- |
| Space | Toggle |
| Tab | Focus the switch |

## Without JavaScript

Fully functional: it is a form control.

## Accessibility

`role="switch"` on a real checkbox: announced as a switch with its on/off
state, submitted with the form, focus ring on the track via `peer`.
