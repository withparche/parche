---
summary: The time left until a launch or a live session, with the date itself always shown.
whenToUse:
  - A pre-launch page, a webinar registration, a cohort that starts on a date.
whenNotToUse:
  - Fake urgency: a count that restarts for every visitor. Only count to a real moment.
related: [Stats]
---

```astro
---
import Countdown from 'parche:elements/Countdown';
---
<Countdown to="2026-12-01T18:00:00+01:00" date="1 December · 18:00 CET" />
```

:::example basic
Days, hours and minutes to a date, over the date in words.
:::

## Anatomy

`root` (`parche-countdown`, `data-state` counting or done) · `units` · `unit`
(one per unit, with its `value`) · `date`.

## Accessibility

The date is ordinary text and always present. The count is not announced
(announcing every minute would drown the page); it is a visual summary of
the date beside it.
