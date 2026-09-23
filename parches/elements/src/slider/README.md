---
summary: A single value in a range — a native range input.
whenToUse:
  - Volume, quality, a budget: one number the user drags.
whenNotToUse:
  - A precise number; use a number input.
related: [Switch]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/slider/
---

```astro
---
import Slider from 'parche:elements/Slider';
---
<Slider name="volume" label="Volume" value={40} unit="%" />
```

:::example basic
With a unit, with a small range, and disabled without the value.
:::

## Anatomy

`root` · `label` · `value` (`output`, aria-hidden) · `input` (`type="range"`).
Hooks: class `parche-slider-*`, `data-part`.

## Keyboard

| Key | Does |
| --- | --- |
| ArrowRight / ArrowUp | Increase by `step` |
| ArrowLeft / ArrowDown | Decrease by `step` |
| Home / End | Minimum / maximum |
| PageUp / PageDown | Larger steps |

## Without JavaScript

The control is fully functional: a native range input. The live readout is
an inline `oninput` handler, so without script it keeps the initial value.

## Accessibility

A native slider named by its `<label for>`; the value is announced by the
control itself. The label does not wrap the input on purpose: `<output>` is
labelable, and a wrapping label would name it instead of the slider.
