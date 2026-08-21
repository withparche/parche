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

## From T2 — Personal portfolio (`templates/portfolio`)
_(pending — next template in this cycle)_
