---
summary: Slides in a scroll-snap track with previous / next controls and a slide picker.
whenToUse:
  - Testimonials, logos, a gallery — items the reader browses one screen at a time.
whenNotToUse:
  - Content the reader must not miss; lay it out in full.
related: [Card, Image]
apg: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
---

A compound element: `Carousel.Root` (the region, the track, the controls)
and `Carousel.Slide` (one slide, named "n of N"). Scrolling is native
scroll-snap, so touch, wheel and keyboard work with no script; the element
drives the buttons and keeps the picker in step. `perView` sets how many
slides show on wide screens; narrow screens always show one.

```astro
---
import * as Carousel from 'parche:elements/Carousel';
---
<Carousel.Root count={items.length} label="Testimonials" perView={3}>
  {items.map((item, i) => (
    <Carousel.Slide index={i} total={items.length}>…</Carousel.Slide>
  ))}
</Carousel.Root>
```

No autoplay: a carousel that moves on its own needs a pause control and
steals attention; the APG's advice is to avoid it unless it is essential.

:::example basic
Four cards, three per view on wide screens.
:::

## Anatomy

`root` (`region`, `aria-roledescription="carousel"`, `data-index`,
`data-per-view`) · `track` · `slide` (`data-state` active/inactive) ·
`controls` · `prev` · `next` · `dots` · `dot` (`aria-current`). Hooks: class
`parche-carousel-*`, `data-part`.

## Keyboard

| Key | Does |
| --- | --- |
| ArrowRight / ArrowLeft | Next / previous slide, on the focused track |
| Home / End | First / last slide |
| Tab | The track, then the picker and the buttons |

## Events

`parche:changed` (`detail.index`) after the visible slide changes, whatever
moved it. `element.go(index)` for scripts.

## Without JavaScript

The track scrolls and snaps natively with a visible scrollbar; the buttons
and the picker are hidden.

## Accessibility

Region and slide semantics from the APG, every slide named with its
position, controls with accessible names and a disabled state at the ends,
the track focusable and keyboard-scrollable.
