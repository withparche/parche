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

The cycle found **nineteen defects and fixed seventeen**; what was fixed is recorded
in [`CHANGELOG.md`](./CHANGELOG.md), not here. Two observations are worth keeping,
because they say something about where the gaps come from:

- **Most were not about translations.** An out-of-range page number served a
  duplicate of page one with a 200; a Markdown page lost its entire body unless it
  named a template; every hero in the repo sat flush against the viewport edge; a
  Zod default skipped its own nested defaults. All of those had been shipping.
- **A port finds what a design does not.** T1 and T2 were free to redesign around a
  limitation. With an original to match, a gap has to be closed.

What remains open is below.

### Still open

- **[low] `<html dir>` is derived, but nothing verifies RTL end to end.** The
  attribute is emitted now, so the `rtl:` utilities in the blog widgets can finally
  match — but no project in the repo uses a right-to-left locale, so the layout has
  never actually been seen in that direction. It is support that compiles, not
  support that is known to work.
- **[med] Two container widths coexist.** Chrome (header, footer) uses `max-w-6xl`
  while page sections use `max-w-7xl`, so a hero's headline is slightly wider than
  the logo above it. Heroes follow the section width deliberately, to line up with
  the Features and Content blocks beneath them. Whether the two should converge is a
  design decision, not a bug.
- **[low] Seven `--font-*` variables were removed, and nothing replaces them.**
  `--font-serif`, `--font-rounded`, `--font-tech` and friends had no provider and no
  consumer once fonts moved to themes. A theme that wants a second family declares
  its own variable alongside its font — but no theme does yet, so the pattern is
  untested.
- **[low] `parche.config.json` is supported but unused.** The JSON path is tested and
  produces byte-identical output to the TypeScript one, yet no project in the repo
  ships a JSON config, so the CMS story it exists for has never been exercised end
  to end.

### Widgets — the territory T3 did not close

- **[med] `Steps` still cannot choose its layout.** Carried over from T2: it renders a
  horizontal grid without an image and a vertical timeline with one, so a work-history
  timeline has to invent an image to get the shape it wants.
- **[med] Only four widgets use the shared `Action` component.** Hero, Hero2, HeroText
  and CallToAction route their CTAs through it and get the focus ring and icon
  handling; Content, Steps, Pricing and Projects hand-roll their own markup. The
  inconsistency shows up as buttons that look almost the same.
- **[low] `LegacyWrapper.astro` is imported by nothing.** Dead since chrome moved to
  the ui parche.

### Corrections to earlier entries

- **T2's `[high]` "No Projects / gallery grid widget" is resolved.** `Projects` exists,
  is registered at `parches/ui/src/index.ts:36` and the portfolio template uses it.
  The entry predates the portfolio widget suite.
- **T1's `[deferred-low]` "Default renders in dark mode / no `defaultTheme`" is
  resolved** by `themes.default`, which renders `data-theme` server-side.
