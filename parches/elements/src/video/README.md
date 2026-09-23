---
summary: An embedded YouTube or Vimeo player, or a native video file.
whenToUse:
  - A product tour, a talk, a demo inside a section.
whenNotToUse:
  - Autoplaying background video; that is a design decision for a widget.
related: [Image]
---

Give it the page URL you would share and it does the rest: YouTube through
`youtube-nocookie`, Vimeo with `dnt=1`, lazy-loaded; a file URL becomes a
native player with controls.

```astro
---
import Video from 'parche:elements/Video';
---
<Video src="https://youtu.be/dQw4w9WgXcQ" title="Product tour" />
```

:::example basic
A YouTube embed and a native file with a poster.
:::

## Anatomy

`root` — the frame; `player` — the `<iframe>` or `<video>`. Hooks: class
`parche-video`, `data-part`, `data-ratio`, `data-provider`.

## Accessibility

- `title` is required: it names the player for screen readers.
- Native controls; no autoplay, no muted background loops here.
