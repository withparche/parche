---
summary: A browser window drawn around a screenshot or a demo.
whenToUse:
  - A product screenshot that should read as the product running.
  - A status worth showing next to it: a load time, a score.
related: [Placeholder, Image]
---

```astro
---
import Frame from 'parche:elements/Frame';
---
<Frame url="localhost:4321" badge="LCP 0.4s"><img src="/shot.png" alt="The dashboard" /></Frame>
```

:::example basic
The frame around a placeholder, with an address and a green chip.
:::

## Anatomy

`root`; `bar` — the dots, the `url` and the `badge`; `body` — the slot.
Hooks: `parche-frame`, `parche-frame-bar`, `parche-frame-body`.

## Accessibility

The chrome is decoration. The dots are hidden; the address and the chip are
text. Name the content inside, not the frame.
