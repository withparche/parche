---
name: page-composition
description: Compose a Parche page (landing, marketing, product, portfolio) from widgets so it has rhythm and doesn't read repetitive or boring. Use when authoring or reviewing a page's `sections` in content JSON — choosing which widgets, in what order, with what layout variety. Encodes design principles and anti-patterns discovered while building real templates.
---

# Composing a Parche page

A Parche page is data: `sections: [{ widget, props, wrapper? }]` rendered by
`DynamicRenderer`. Good pages aren't about any single widget — they're about
**rhythm**: how sections vary in layout, density and background as you scroll.

This is a **living** skill. When building a real page surfaces a new principle or
anti-pattern, add it here (keep entries short, concrete, and tied to what was
observed).

## The one rule: vary the rhythm

The most common failure is **every section in the same mold** — "centered heading
+ a grid" repeated 8 times. It looks tidy in isolation and monotonous as a page.
A strong page alternates between a small set of layout *families*:

- **Grid** — a centered heading over a 2–4 column grid (Features, FAQs, a
  many-item Content). Good for scannable lists.
- **Asymmetric two-column** — text/items on one side, a visual on the other
  (Content or Steps *with an image*). Use `isReversed` to flip which side the
  image is on, and alternate it between successive asymmetric sections.
- **Timeline** — Steps *with an image* renders a vertical numbered timeline beside
  the visual; Steps *without* an image renders a balanced horizontal step grid.
- **Row / band** — a single row of figures (Stats), a logo strip (Brands).
- **Full-bleed** — Hero / Announcement / CTA span edge to edge (no wrapper).

Alternate families as you go. A landing that reads
`Hero → logos → grid → asymmetric → row → timeline → pricing → quotes → faq → CTA`
has rhythm; one that reads `grid → grid → grid` does not.

## The `wrapper` toolkit (per-section knobs)

Any wrapped section takes a `wrapper` object — this is how you add rhythm without
touching widgets:

- `wrapper: { surface: true }` — a subtle tokenized `bg-surface` band. Alternate
  plain / surface bands down the page so sections don't blur together.
  **Caveat:** cards (Pricing, Testimonials, CTA) also use `bg-surface`, so a card
  on a `surface` band shares its color and only its border/shadow separates it.
  Put `surface` on card-less sections (Brands, Content, FAQ, Stats); keep
  card-heavy sections on the plain background so the cards pop. (A proper
  page / band / elevated-card 3-level scale is a design-token-cycle item.)
- `wrapper: { isDark: true }` — a dark band for emphasis (e.g. a testimonials or
  CTA break).
- `wrapper: { id: "pricing" }` — anchor target; the section gets the id (with
  sticky-header scroll offset), so nav links like `#pricing` work.
- `wrapper: { bg: "<html>" }` — a raw-HTML background layer (gradients/patterns).
- `wrapper: { classes: { container: "..." }, as: "aside" }` — spacing/tag overrides.

Note: full-bleed widgets (Hero, Announcement, Hero2, HeroText, Note) **skip the
wrapper**, so `wrapper` knobs (incl. `id`) don't apply to them.

## Widget-specific guidance

- **Hero / CTA**: keep copy tight; 1 primary + 1 secondary action. Actions render
  through the shared `Action` component (variants primary/secondary/tertiary/link,
  focus rings, and an optional `icon`).
- **Pricing**: for an enterprise/contact tier, set the plan `type: "custom"` — it
  renders a graceful contact card (modest price + a `description` note), never a
  giant word in the numeric slot. Numeric prices show the currency; non-numeric
  don't. `period` is optional.
- **Content / Steps**: give them an `image` when you want an asymmetric section;
  omit it for a centered grid / horizontal steps. Set `columns: "1"` when there's
  an image (items sit beside it), a higher count when full-width.
- **Features**: pick `columns` to fit the item count (6 items → 3 cols, 4 → 2).

## Anti-patterns (observed — avoid)

- **Same mold everywhere.** See "the one rule".
- **Orphaned CTA.** A lone "See the product tour" link with no video/image beside
  it looks incomplete. Either give the section a visual, or drop the CTA.
- **Two-column widget with no visual.** A widget built for text+image (Content,
  Steps) with no image leaves an empty half. Either add an image, or rely on the
  no-image layout the widget provides (full-width grid / horizontal steps).
- **Forcing non-numeric into a numeric slot.** Don't put "Custom" where a price
  goes at display size — use `type: "custom"`.
- **Composed type classes over inherited color.** `.type-*` classes set their own
  `color`, overriding an inherited `text-on-primary` — a number on a colored chip
  goes low-contrast. Use plain text utilities inside colored chips.

## Assets

Templates ship **local placeholder images** the user swaps — put SVG/PNG mockups
in `src/assets/images/` and reference them as `@/assets/images/foo.svg`. Parche
resolves `@/assets/` paths to optimized imports at any depth (including inside
arrays). Prefer local placeholders over remote URLs in a shipped template.

## A serviceable SaaS-landing skeleton

`Announcement → Hero → Brands(surface) → Features(grid) → Content(asymmetric,
image) → Stats → Steps(timeline, image) → Pricing(id) → Testimonials(surface) →
FAQs(id) → CTA`. Adapt per goal; the point is the alternation, not this exact list.
