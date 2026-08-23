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

## From T3 — AstroWind port (`demos/astrowind`)

Rebuilt AstroWind end to end on Parche, bilingual (en/es): 20 pages, three layouts,
a blog with taxonomies and its own theme, 94 built URLs. The first bilingual site in
this repo, and the first port with an original to compare against — so a gap could
not be dodged by redesigning the section around it.

This cycle found nine defects and fixed seven of them; **what was fixed is recorded
in [`CHANGELOG.md`](./CHANGELOG.md)**, not here. Two of the seven had nothing to do
with translations and affected every user: an out-of-range page number silently
served a duplicate of page one, and a Markdown page lost its entire body unless it
named a template. What remains open is below.

### i18n — the gaps that survive

- **[high] The locale switcher is dead on every blog route.** `LocaleSwitcher`
  recovers the current page through `resolvePageFromSlug`, which only queries the
  `pages` collection. On `/blog`, a post, or any taxonomy page the lookup returns
  nothing, so every other locale renders as a disabled `<span aria-disabled="true">`.
  Verified in the built output. A visitor who lands on an article cannot switch
  language at all — which is most of the traffic a blog gets. Needs a fallback that
  swaps the locale segment of the current path when the pages lookup misses.
- **[high] No hreflang outside `pages`.** Emission is guarded by `mode === 'page'` in
  the catch-all, and the blog's own routes never import `getAlternateUrls`. Measured:
  one `<link rel="alternate">` on `/about`, zero on `/blog`, zero on a post. Search
  engines cannot pair the translations of any article, which is the one place the
  pairing matters most.
- **[med] Site metadata is not per-locale.** `site.description` in `parche.config.ts`
  is a single global string, so `/es/blog` serves the English description in its
  `<meta name="description">` and in the RSS channel. The same applies to `site.name`
  and the Open Graph defaults.
- **[low] Posts cannot be linked as translations.** A post's locale is positional (the
  first id segment) and there is no `translationKey`, so `en/hello.md` and
  `es/hola.md` are unrelated as far as the system is concerned. Pages solve this with
  `pageKey` + `urlSlug`; posts have no equivalent, which is also what blocks hreflang
  for articles above.
- **[low] `<html>` carries no `dir` attribute.** The blog widgets already ship RTL
  classes (`rtl:mr-0 rtl:ml-2`) that can never activate, so the support is decorative.

### Taxonomy and content

- **[med] Taxonomy slugs are raw lowercased names.** A tag "Diseño Web" produces
  `/blog/tag/diseño web`. It is internally consistent — `getStaticPaths`, the
  permalink resolver and the matcher all use the same raw value, so links resolve —
  but the URLs are ugly and encode badly. Fixing it means slugifying in all three
  places at once; changing only the permalink would break the match. Note the post
  permalink's own `%category%` was fixed this cycle and does transliterate.
- **[low] `dateFormat` is dead config.** Declared in three lines of
  `parches/blog/src/types.ts` and read by nothing. Either wire it or drop it; today
  passing it does nothing at all, silently.

### Corrections to earlier entries

- **T2's `[high]` "No Projects / gallery grid widget" is resolved.** `Projects` exists,
  is registered at `parches/ui/src/index.ts:36` and the portfolio template uses it.
  The entry above predates the portfolio widget suite.
- **T1's `[deferred-low]` "Default renders in dark mode / no `defaultTheme`" is
  resolved** by `themes.default`, which renders `data-theme` server-side.
