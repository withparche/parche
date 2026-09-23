---
summary: A slim message bar across the page, dismissible.
whenToUse:
  - A release, a promotion, a notice at the top of the site.
whenNotToUse:
  - Feedback on an action; use Toast.
  - A message inside content; use Note or Card.
related: [Toast]
---

```astro
---
import Banner from 'parche:elements/Banner';
---
<Banner text="<strong>0.7</strong> is out." href="/changelog" icon="tabler:speakerphone" remember="release-0.7" />
```

`remember` keeps a dismissed banner hidden on later visits, under that key.

:::example basic
A linked, dismissible bar with an aside; then a plain one on the surface tone.
:::

## Anatomy

`root` (`parche-banner`, `data-state` open/closing) · `dismiss` · `message`
· `aside`. Hooks: class `parche-banner-*`, `data-part`.

## Keyboard

Ordinary link and button.

## Events

`parche:dismiss` before (cancelable), `parche:dismissed` after.

## Without JavaScript

The bar shows and stays.

## Accessibility

The dismiss button has an accessible name; the aside is decorative
repetition and hidden on narrow screens; icons are decorative.
