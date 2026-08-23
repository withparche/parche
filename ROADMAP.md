# Roadmap

Where Parche is going. What has already shipped lives in
[CHANGELOG.md](./CHANGELOG.md); limits found by building real templates live in
[BACKLOG.md](./BACKLOG.md).

**Status:** `0.4.0` cut · pre-1.0, the public API is not stable · kept current,
confirm-first (see [How this is maintained](#how-this-is-maintained)).

## Where we are

The architecture has settled. `@parche/core` is a pure engine — the host — and
everything else is a **parche** declaring what it provides and requires, composed
through a single `parche({ parches: [...] })` entry with preset/`extends` support.
Pages are data (`sections: [{ widget, props }]`) rendered through the virtual-module
registry. All seven packages are versioned together at `0.4.0`, three templates and
nine examples build in CI, and there is now a regression net (51 unit tests +
build-smoke + a starter scaffold-build).

What is *not* settled: the widget layer. Two templates built end-to-end (SaaS
landing, portfolio) showed the engine holds and the widget library is what runs out
of road first — which is what v0.5 goes after.

## Next: v0.5 — trustworthy contracts, credible components

**Goal:** a site author can rely on the parche contract catching real mistakes, and
on the components being accessible and themeable.

**Exit criteria**

- [ ] `requires` validates widget **signatures**, not just presence — reusing each
      widget's `.props.ts` Zod schema, with a clear build-time error naming the parche.
- [ ] Primitives pass an accessibility pass: focus management, ARIA, keyboard
      interaction — no primitive relies on the shared `Action` wrapper for its a11y.
- [ ] No hardcoded colors in primitives or widgets (e.g. Badge's `bg-green-500`), so
      a theme parche reskins everything.
- [ ] `0.4.0` published to npm — including `@parche/cli`, which still serves `0.0.1`
      there while every other package shipped `0.3.0-alpha.0`.

**Also in scope**

- [ ] A `Projects` / `Gallery` widget: responsive card grid with image, title, blurb,
      tag chips and link — the largest gap the portfolio template exposed
      (BACKLOG T2, high).
- [ ] `Steps` chooses its layout (`timeline` vs `grid`) independently of whether an
      image is present (BACKLOG T2, med).

## v0.6 — variety and reach

- Widget spec V2: variants as separate components, the dual human/AI schema, and more
  layout variants per widget so a page can vary rhythm without relying on the
  presence or absence of an image (BACKLOG, deferred).
- `parche astro add <widget|parche>`.
- Community templates repo (`withparche/templates`).
- A documentation site.
- `defaultTheme` per site/template — today a page renders in dark mode with no way to
  pin a default (BACKLOG T1, deferred-low).
- Measure the per-request SSR cost now that the catch-all is exercised under
  `output: 'server'` (BACKLOG T1, info).

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
