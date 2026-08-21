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

- `wrapper: { bg: "<html>" }` — **the main rhythm tool.** A raw-HTML background
  layer authored right in the page JSON (a gradient div, a glow, an inline SVG
  pattern), rendered behind the content and clipped to the section. See
  *Backgrounds* below — there's a right and a wrong way to use it.
- `wrapper: { id: "pricing" }` — anchor target; the section gets the id (with
  sticky-header scroll offset), so nav links like `#pricing` work.
- `wrapper: { isDark: true }` — a dark band for emphasis (e.g. a CTA break).
- `wrapper: { classes: { container: "..." }, as: "aside" }` — spacing/tag overrides.

Note: full-bleed widgets (Hero, Announcement, Hero2, HeroText, Note) **skip the
wrapper**, so `wrapper` knobs (incl. `id`) don't apply to them.

## Backgrounds — intentional & subtle

`bg` is powerful and easy to abuse. Rules learned the hard way:

- **Reason, not decoration.** Every backgrounded section should have a *why*: a
  soft brand wash behind the metrics (they read as a highlight), a faint tint on
  the pricing band (a distinct "decision zone"), a glow rising into the final CTA
  (draws the eye to the action). If you can't say why, leave it plain.
- **Alternate plain / accented / plain.** Backgrounds are for rhythm, so most
  sections stay plain and only some carry an accent. Don't paint every section.
- **Use semi-transparent `rgba` overlays, not solid colors.** An overlay layers
  over whatever's behind it, so it works in **light and dark** without theming.
  `background: rgba(100,116,139,0.06)` (a whisper of slate) reads as a subtle band
  on white *and* a subtle lift on dark. Solid colors only work in one mode.
- **Soft gradients beat flat bands.** `linear-gradient(180deg, rgba(...0.06),
  transparent 60%)` or a `radial-gradient` wash looks refined; a flat block looks
  cheap.
- **Calibrate the alpha.** Too subtle (≈0.02) is invisible; too strong / flat is
  crude. Tints land around `0.05–0.08`, glows around `0.08–0.14`.

Example — a brand wash and a glow:
`"bg": "<div style='position:absolute;inset:0;background:radial-gradient(80% 120% at 50% 0%, rgba(59,110,246,0.07), transparent 70%)'></div>"`

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
  `color`, overriding an inherited `text-on-primary`/`text-heading` — a number on a
  colored chip, or a badge, goes low-contrast. Use plain text utilities (e.g.
  `text-xs font-semibold`) inside colored chips/badges, not `.type-label`.
- **Lopsided full-width bars.** A full-bleed bar (announcement, notice) with its
  content left-aligned leaves the whole right side empty and reads unbalanced.
  Center the content (badge + text + arrow) within a `max-w` row.
- **Backgrounds without reason / too crude.** See *Backgrounds*: no arbitrary
  patterns "just because", no flat cheap bands, no invisible-subtle or heavy tints.

## Assets

Templates ship **local placeholder images** the user swaps — put SVG/PNG mockups
in `src/assets/images/` and reference them as `@/assets/images/foo.svg`. Parche
resolves `@/assets/` paths to optimized imports at any depth (including inside
arrays). Prefer local placeholders over remote URLs in a shipped template.

## A serviceable SaaS-landing skeleton

`Announcement(centered) → Hero → Brands → Features(grid, faint tint) →
Content(asymmetric, image) → Stats(brand wash) → Steps(timeline, image) →
Pricing(id, faint tint) → Testimonials → FAQs(id) → CTA(glow)`. Plain sections
between the accented ones. Adapt per goal; the point is the alternation and the
*reason* for each accent, not this exact list.
