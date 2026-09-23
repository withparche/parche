---
summary: A bounded surface for a unit of content, with optional media, header and footer.
whenToUse:
  - Grids of items (features, testimonials, posts, pricing tiers).
  - A linked preview where the whole tile should be the target.
whenNotToUse:
  - Wrapping a whole section; use Section with `surface`.
related: [Section, Badge]
---

```astro
---
import Card from 'parche:elements/Card';
---
<Card href={post.url}>
  <Image slot="media" src={post.image} alt="" ratio="16/9" />
  <h3 class="type-h3">{post.title}</h3>
  <p class="text-muted">{post.excerpt}</p>
</Card>
```

:::example basic
Header and body; a linked card with media and footer; an article with large
padding and no shadow.
:::

## Anatomy

`root` (div, or `<a>` with `href`) · `media` · `body` · `header` · `footer`.
Hooks: class `parche-card` and `parche-card-<part>`, `data-part`,
`data-state="interactive"`.

## Accessibility

- A linked card is one `<a>`: its accessible name is all its text, so keep the
  heading first and avoid nested links inside.
- Focus ring on the whole card with the ring token.
