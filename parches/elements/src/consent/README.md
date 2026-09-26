---
summary: Asks once which categories the visitor accepts, remembers it, and lets anything that waits on it load.
whenToUse:
  - The site loads something that sets cookies or tracks: ads, embedded comments, analytics.
whenNotToUse:
  - Nothing optional loads: then there is nothing to ask.
related: [Banner]
---

```astro
---
import Consent from 'parche:elements/Consent';
---
<Consent text="…" categories={[{ key: 'ads', label: 'Advertising' }]} />
```

:::example basic
The panel, and a link that reopens it.
:::

## How others wait on it

```ts
import { whenConsented } from '@parche/elements/client';
whenConsented('ads', () => loadTheAdScript());
```

It runs now if the visitor agreed, or when they do; nothing is granted by
default. A site using a certified CMP instead (AdSense in the EEA, UK and
Switzerland requires a TCF v2.3 one) sets `<html data-consent="cmp">`: the
CMP gates the third party and `whenConsented` runs at once.

## Anatomy

`root` · `panel` · `choices` (a checkbox per category, hidden until
"Choose") · `option` · `accept` · `reject` · `customize` · `save`.

## Accessibility

A non-modal region at the foot of the screen: the page stays usable while
it is open. Accept all and Only necessary are equal buttons, side by side.
Reopened from "Cookie preferences", focus goes to Save.
