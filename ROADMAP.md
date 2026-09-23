# Roadmap

Where Parche is going. What has already shipped lives in
[CHANGELOG.md](./CHANGELOG.md); limits found by building real templates live in
[BACKLOG.md](./BACKLOG.md).

**Status:** `0.5.0` cut · pre-1.0, the public API is not stable · kept current,
confirm-first (see [How this is maintained](#how-this-is-maintained)).

## Where we are

The architecture has settled. `@parche/astro` is a pure engine — the host — and
everything else is a **parche** declaring what it provides and requires, composed
through a single `parche({ parches: [...] })` entry with preset/`extends` support.
Pages are data (`sections: [{ widget, props }]`) rendered through the virtual-module
registry, and the site config is JSON so a CMS can edit it.

The component layer has settled too. `@parche/elements` holds 48 elements built on
the platform — `<details>`, `<dialog>` and invoker commands, the Popover API, native
inputs — with a custom element only where there is interactivity, and
`@parche/ui` is composed from them and ships no script of its own. Accessibility is
a gate, not a goal: axe in three engines, light and dark, a no-JavaScript pass, a
reduced-motion pass, SSR render tests and an SSR smoke on Node and Cloudflare all
run in `pnpm test` and CI, next to 500 unit tests, the build-smoke over fourteen
projects and the starter scaffold-build.

What is *not* settled is the widget layer's variety — one layout per widget, the
V2 spec still pending — and the documentation, which is a playground and a
provisional folder until parche.dev exists.

## Next: v0.6 — trustworthy contracts, credible components

**Goal:** a site author can rely on the parche contract catching real mistakes, and
on the components being accessible and themeable.

**Exit criteria**

- [ ] `requires` validates widget **signatures**, not just presence — reusing each
      widget's `.props.ts` Zod schema, with a clear build-time error naming the parche.
- [x] Elements pass an accessibility pass — and keep passing: the gate runs axe,
      keyboard, no-JS and reduced-motion specs on every element (0.7.0).
- [x] No hardcoded colors in elements or widgets, so a theme parche reskins
      everything; the contract test refuses a raw palette class (0.7.0).
- [x] `0.5.0` published to npm, with the config migration documented in the
      changelog — it is the second breaking change to `parche.config.ts` in two
      releases, so the next one should be the last before the shape is frozen.

**Also in scope**

- [ ] `Steps` chooses its layout (`timeline` vs `grid`) independently of whether an
      image is present (BACKLOG T2/T3, med).
- [x] Every widget routes its CTA through one Button element (0.7.0).

## v0.7 — variety and reach

- Widget spec V2: variants as separate components, the dual human/AI schema, and more
  layout variants per widget so a page can vary rhythm without relying on the
  presence or absence of an image (BACKLOG, deferred).
- `parche astro add <widget|parche>` and `parche astro eject <element>`: the
  element folders already carry `element.json` and the copy rules the contract
  test enforces; the CLI is what is missing.
- The documentation site, parche.dev. The elements playground and `docs-wip/`
  hold what it will render: per-element READMEs, examples and the catalog.
- The second level of elements, on demand: Navigation Menu, Command palette,
  Toggle Group, Stepper, Table, Progress, Marquee, Rating, Date picker, Tree,
  Image Compare.
- The new tokens (state, `ring`, `overlay`) in the builder's token editor.
- Measure the per-request SSR cost now that the catch-all is exercised under
  `output: 'server'` (BACKLOG T1, info).

## v0.9 — splitting things out

Deferred on purpose, not forgotten. Each of these costs more the earlier it is
done, because it turns one change into two coordinated ones.

- **Community templates repo (`withparche/templates`).** The templates already
  install standalone, so the move itself is cheap — the cost is coordination.
  While the config surface is still changing shape (twice in two releases so
  far), a breaking change is one PR here and two once they live apart. CI would
  copy each template, point its dependencies at the local packages and build it,
  which is what `test/build-starter.mjs` already does for the starter, and
  `templates:check` becomes the guard against the two repos drifting.

## Big bets

Not scheduled; they change what Parche *is*, not how well it works.

- Bring the visual builder (`@parche/builder`) into the repo + `parche astro builder`.
- Narrans / narrative-first AI generation → `parche astro generate <prompt>`.

## Not doing (and why)

Decisions worth remembering, so they are not relitigated.

- **Background presets (`surface` / `band` / `pattern` variants).** Tried and reverted
  (`02a8961`). They were invented vocabulary rather than a real need: visual rhythm
  comes from the *template author* combining layouts, `surface` bands and `bg` HTML.
  Only the single tokenized `surface` knob survived.
- **Widget names in core.** Core hardcodes no widget name — full-bleed layout comes
  from the parche manifest and the blog resolver returns generic sections. Any feature
  needing core to know a widget by name needs a manifest capability instead.
- **Templates as monorepo fixtures.** portfolio and saas-landing used
  `workspace:*` and `catalog:`, so neither installed anywhere but here — a
  template that cannot be copied is not a template. They pin published ranges
  now, and `linkWorkspacePackages` keeps CI building them against local code.
- **Shadow DOM, a framework runtime, or `custom-elements.json` tooling for the
  elements.** Light DOM so tokens and Tailwind reach the markup and
  `aria-labelledby` can cross parts; a 60-line base class instead of Lit; docs
  come from each element's own README, examples and `.props.ts`, not from a
  manifest analyzer.
- **Compound Tabs (`Tabs.Root / Tab / Panel`).** Astro has no component context,
  so no part can know the selected value on the server without every part
  repeating it. Tabs is data-driven (`items`, a slot per panel); Carousel is the
  one compound element because its slides need no shared state.
- **Autoplay in Carousel, and an anchor-positioning polyfill.** A carousel that
  moves on its own needs a pause control and steals attention; the APG says
  avoid it. The 160 KB anchor polyfill lost to a 15 KB lazy floating-ui fallback
  that only browsers without anchors download.
- **`parche astro generate` as a template command.** `new` is template-based;
  `generate` is reserved for the AI/Narrans path and stays unimplemented until then.

## How this is maintained

Three files, one rule each:

| File | Answers | Written when | Skill |
| --- | --- | --- | --- |
| [CHANGELOG.md](./CHANGELOG.md) | What shipped, in order, in which version | Work lands; a release is cut | [`changelog`](.agents/skills/changelog/SKILL.md) |
| ROADMAP.md | Where we are and where we are going | The plan or a decision changes | [`roadmap`](.agents/skills/roadmap/SKILL.md) |
| [BACKLOG.md](./BACKLOG.md) | Which limits real templates hit | A template exposes a gap | [`roadmap`](.agents/skills/roadmap/SKILL.md) |

When something trackworthy happens in a working session — a shipped feature, a
significant architectural or product decision, a scope change, or a deferred idea
worth tracking — the assistant **proposes** the update and the maintainer confirms
before it is written. Never edited silently. Execution tracking
(GitHub Projects, Milestones, Issues) will layer on when the project goes semi-public.
