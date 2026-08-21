# Backlog — template-driven findings

Empirical backlog: every item was surfaced by building a real template and hitting
a limit. Nothing here is speculative. Grouped by area; each traces to the template
that revealed it.

## From T1 — SaaS landing (`templates/saas-landing`)

Built a full Flowbase SaaS landing (announcement, hero, brands, features, content,
stats, steps, pricing, testimonials, FAQ, CTA) as SSR (`output: 'server'`).
The page renders end-to-end; these are where the system fought back.

### Widgets
- **[FIXED] Pricing couldn't express a "Custom / Contact us" tier.** It required
  both `price` and `period` and hardcoded `$`, silently dropping the tier. Fix:
  `period`/currency optional; a numeric price shows the currency, non-numeric
  doesn't. Added a plan **`type: 'custom'`** that renders a graceful contact-us
  card (modest `text-3xl` price + a `description` note) instead of jamming a word
  into the giant numeric slot. `Pricing.astro`, `Pricing.props.ts`.
- **[FIXED] Header logo had no text/wordmark option.** `{ text }` now works and
  the Header never renders a broken `<img>` (falls back to a text mark).
  `Header.astro`.
- **[FIXED] No in-page anchor navigation.** Confirmed it already works via
  `wrapper: { id }` (SectionWrapper renders the id + `scroll-mt`). The template now
  uses `#features/#how/#pricing/#faq`. (Caveat: no-wrapper widgets like Hero skip
  the wrapper.)
- **[FIXED] No design knobs for rhythm.** Confirmed `wrapper` already exposes
  `id/isDark/bg/classes/as`; added an ergonomic **`surface`** knob (tokenized
  `bg-surface` band) so sections can alternate without raw HTML. Template now
  alternates surface bands. `SectionWrapper.astro`, `DynamicRenderer.astro`.
- **[FIXED] Inline Button duplication + no focus-visible + icons ignored.** A
  shared `components/Action.astro` now centralizes variant styling, adds
  `focus-visible` rings, and renders the action `icon`. Wired into Hero, Hero2,
  HeroText, CallToAction. (Pricing keeps its own per-tier CTA style.)

### Core / SSR
- **[info] SSR catch-all now exercised.** Under `output: 'server'` the data-driven
  `[...slug]` renders on-demand per request (router warns it's dynamic) — the
  previously-untested path works. Per-request cost not yet measured (see the
  exploration's `buildSlugMap`×2 / JSON-LD hotspots). _(perf: later cycle.)_
- **[FIXED] Images nested in arrays weren't resolved.** `resolveProps` is now
  recursive (`resolveDeep`), resolving `@/assets/` at any depth (feature icons,
  testimonial avatars, galleries). Comment/alias mismatch also corrected.
  `DynamicRenderer.astro`. _(Local-assets-vs-remote docs still pending.)_

### Tokens / visual
- **[deferred-low] Default renders in dark mode.** No per-template control to pin
  a default theme. Fix later: a `defaultTheme` option.
- **[good] Primary-token fix works.** Primary blue renders consistently.

### A11y
- **[FIXED] focus-visible on CTAs** — added via the shared `Action` component
  (ring on keyboard focus). Primitive-level a11y (Button/Link/Tag) is still the
  primitives-cycle job.

### Design rhythm / variety
- **[FIXED-template] Every section read the same (centered heading + grid).** The
  page lacked rhythm. Insight: rhythm comes from the *template author* combining
  layouts, not from the widgets alone — the widgets already support asymmetric
  variants (Steps timeline+image, Content text+image, `isReversed`) plus `surface`
  bands. Fix: gave Content/Steps local placeholder images so they become
  asymmetric two-column sections. Templates should ship **local placeholder
  assets** (swappable), not remote URLs.
- **[widgets-v2, deferred] More layout variants per widget.** Bigger lever for
  variety: several widgets have only one layout. The widgets-v2 pass should add
  variant options (e.g. Features bento/split, testimonials masonry) so a page can
  vary rhythm without relying only on presence/absence of an image.

## From T2 — Personal portfolio (`templates/portfolio`)

Built a full developer/designer portfolio (hero, brands, about, skills, two
featured projects, experience timeline, stats, testimonials, contact CTA) as
static output, reusing existing widgets + the page-composition skill (asymmetric
sections, intentional subtle backgrounds). It renders well, but portfolio-shaped
content exposed real gaps:

### Widgets — the new territory
- **[high] No Projects / gallery grid widget.** A portfolio's core section is a
  grid of project *cards* (thumbnail + title + tags + link), and there is none.
  Worked around it with two `Content` blocks (asymmetric, one image each) for
  *featured* work — fine for 2–3 highlights, wrong for a grid of many. Need a
  `Projects`/`Gallery` widget: responsive card grid, image, title, blurb, tag
  chips, link. **The biggest T2 finding.**
- **[med] Steps can't choose its layout.** Steps renders a horizontal step grid
  when it has no image and a vertical timeline when it does. An **experience /
  work-history timeline** wants the *vertical* form but has no image — so today
  you can't get a vertical timeline without inventing an image. Need a `layout`/
  `variant` prop (timeline vs grid) independent of whether an image is present.
- **[low] Project metadata wants chips, not a list.** Role/Year/tech rendered as
  a plain items list; project meta reads better as `Tag`/`Badge` chips. No widget
  path for that yet.
- **[low] Repeated section tagline.** Two featured-work `Content` blocks each
  repeat the "Selected work" tagline (no single section header for a multi-item
  group) — a symptom of the missing Projects widget.

### Reuse that worked
- HeroText, Brands, Content (asymmetric about + featured work), Stats (metrics),
  Testimonials (recommendations), CallToAction (contact) all repurposed cleanly.
- The skill's rhythm held up: asymmetric About/work, subtle tints on Skills &
  Experience, a brand wash on Stats, a glow on the contact CTA.
