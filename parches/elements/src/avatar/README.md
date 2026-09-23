---
summary: A person — their picture, or their initials when there is none.
whenToUse:
  - Authors, testimonials, team lists, comment threads.
whenNotToUse:
  - Logos or product images; use Image.
related: [Image]
---

```astro
---
import Avatar from 'parche:elements/Avatar';
---
<Avatar name="Ada Lovelace" src={author.picture} size="lg" />
```

:::example basic
Initials at every size, a picture, and the unknown-person fallback.
:::

## Anatomy

One part, `root` — an `<img>` with a picture, an initials disc without.
Hooks: class `parche-avatar`, `data-part="root"`, `data-size`.

## Accessibility

- The picture's `alt` is the person's name (or `alt`).
- The initials disc is `role="img"` named after the person; the letters
  themselves are hidden, so "AL" is never read out.
