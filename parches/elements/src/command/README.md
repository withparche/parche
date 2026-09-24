---
summary: One shell command, with a button that copies it.
whenToUse:
  - An install or scaffold command a visitor will paste into a terminal.
whenNotToUse:
  - Several lines of code: use Code as a block.
related: [Code, Kbd]
---

```astro
---
import Command from 'parche:elements/Command';
---
<Command command="npm create astro@latest -- --template arthelokyo/astrowind" />
```

:::example basic
The command with its prompt and the copy button.
:::

## Anatomy

`root` — `<parche-command>`; `prompt`; `text` — the `<code>`, truncated with
an ellipsis when it does not fit; `copy` — the button; `status` — the live
region. Hooks: `parche-command`, `data-part`.

## Accessibility

The copy button is a native button. After copying, its text becomes the
copied label for 1.4 seconds and the status region announces it. The prompt
is hidden from assistive technology so a screen reader reads the command
alone.

## Without script

The command is selectable text. The copy button stays hidden.
