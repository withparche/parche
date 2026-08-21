# Backlog — template-driven findings

Empirical backlog: every item was surfaced by building a real template and hitting
a limit. Nothing here is speculative. Grouped by area; each traces to the template
that revealed it.

## From T1 — SaaS landing (`templates/saas-landing`)

Built a full Flowbase SaaS landing (announcement, hero, brands, features, content,
stats, steps, pricing, testimonials, FAQ, CTA) as SSR (`output: 'server'`).
The page renders end-to-end; these are where the system fought back.

### Widgets
- **[high] Pricing can't express a "Custom / Contact us" tier.** `Pricing.astro`
  renders a plan only when it has **both** `price` and `period` (line ~14) and
  hardcodes a `$` prefix (line ~36). An Enterprise tier (`price: "Custom"`, no
  period) is **silently dropped**. Custom/enterprise pricing is a standard SaaS
  pattern. Fix: make `period` optional, drop the hardcoded `$` (or make currency
  a prop), allow a non-numeric price + an optional "contact" CTA.
- **[med] Header logo has no text/wordmark option.** Passing `logo: { text }`
  shows a broken `[Logo]` image — the Header only supports an image `src`. Every
  brand needs at least a wordmark. Fix: support a text/wordmark logo (and/or fall
  back to the site name).
- **[med] No in-page anchor navigation.** Nav links (`#features`, `#pricing`)
  don't scroll — widgets emit no matching `id`, and there's no easy way to anchor
  a section from page data. Fix: let a section set an `id` (via wrapper or a
  widget prop) so anchor nav and "jump to pricing" work.
- **[med] No design knobs for rhythm.** Couldn't alternate section
  backgrounds/tone/spacing — every section shares one flat background, so a long
  landing reads monotonous. Landings need alternating surfaces and spacing
  control. Fix: expose background/tone/spacing knobs (ties into design tokens).
- **[med] Inline Button duplication (confirmed in use).** Hero/CTA action buttons
  render duplicated inline classes instead of the Button primitive — so button
  styling can't be themed/standardized. Fix: route widget actions through the
  Button primitive.

### Core / SSR
- **[info] SSR catch-all now exercised.** Under `output: 'server'` the data-driven
  `[...slug]` renders on-demand per request (router warns it's dynamic) — the
  previously-untested path works. Per-request cost not yet measured (see the
  exploration's `buildSlugMap`×2 / JSON-LD hotspots).
- **[med] Images require a local assets pipeline.** Couldn't easily add hero /
  feature images without `@/assets` files; data-driven remote images are unclear.
  `resolveProps` also doesn't resolve images nested in arrays (feature icons,
  testimonial avatars). Fix: document/enable remote + array image handling.

### Tokens / visual
- **[low] Default renders in dark mode.** No obvious per-template control to pin a
  default theme (light vs dark vs a named theme). Fix: a `defaultTheme` option.
- **[good] Primary-token fix works.** The light-primary bug fix is visible —
  primary blue renders consistently in the hero span and buttons.

### A11y
- **[todo] Verify focus-visible on CTAs** — the exploration flagged missing
  `focus-visible` outside Header/Footer; confirm on this template's CTAs.

## From T2 — Personal portfolio (`templates/portfolio`)
_(pending — next template in this cycle)_
