# Roadmap

Parche is pre-1.0: the architecture is settling and the public API is not yet
stable. This file tracks where it has been and where it's going. It is kept
current as work happens — see [How this is maintained](#how-this-is-maintained).

## Shipped

The first three months (much of it in the earlier `astrowind-v2` repo), iterated
and tested into what is now `withparche/parche` **v0.3.0**.

### Foundation
- OKLCH design system (`--ph-`/`--ds-` tokens) with `[data-theme]` overrides + a runtime theme switcher.
- Pages as data: `sections: [{ widget, props }]` rendered by `DynamicRenderer`.
- Virtual-module registry (`parche:*`) generated at build.
- i18n (manual routing, per-locale content), SEO (metadata, Open Graph, JSON-LD), sitemaps.
- Dual static / SSR output.
- Blog app (routes, collections, RSS, taxonomies); the widget library; a visual-builder prototype.

### Modernization
- Astro 7 + Tailwind 4 + Zod 4 upgrade.
- Central pnpm catalog for shared dependency versions.

### Parches architecture
- `@parche/core` is the **host** (the only non-parche); everything else is a **parche**.
- Unified config `parche({ parches: [...] })` with a `provides` / `requires` contract validated at setup.
- Chrome (Header/Footer/templates) extracted from core → the ui parche; core is a pure engine.
- Pluggable themes — a theme is a parche that contributes its CSS + switcher entry (`@parche/themes`: corporate / minimal / playful / startup / starter); a site bundles only the themes it imports.
- Data-driven fonts (`parcheFonts`); honest example output modes (SSR vs static).

### Tooling & DX
- `@parche/cli` — `parche astro new [template] [dir]` scaffolds projects (citty + @clack/prompts + giget + nypm).
- `create-parche` — the `npm create parche` entry.
- Template convention (`parche.template.json` + placeholders) and the `hello-parche` starter.
- Nine single-feature examples; CI building them all on every push.

## Now → v0.4

- First tests: the parches `provides/requires` contract, and the CLI's scaffolding (placeholder replacement, source resolution).
- **Publish `@parche/*` to npm** — unblocks the CLI end-to-end for real users (today generated projects only install inside the monorepo).
- V2 contract: **signature** validation (not just presence), reusing widgets' `.props.ts` Zod schemas.
- Primitives hardening: real accessibility (focus / ARIA / keyboard) and tokenizing hardcoded colors (e.g. Badge's `bg-green-500`) so themes reskin everything.

## Later (v0.5+)

- V2 widget spec (variants = separate components; the dual human/AI schema).
- Community templates repo (`withparche/templates`) + `parche astro add <widget|parche>`.
- A documentation site.

## Big bets

- Bring the visual builder (`@parche/builder`) into the repo + `parche astro builder`.
- Narrans / narrative-first AI generation → `parche astro generate <prompt>`.

## How this is maintained

When something roadmap-worthy happens in a working session — a shipped feature, a
significant architectural or product decision, a scope change, or a deferred idea
worth tracking — the assistant **proposes** an update here and the maintainer
confirms before it is written (never edited silently). See
[`.agents/skills/roadmap`](.agents/skills/roadmap/SKILL.md). Execution tracking
(GitHub Projects, Milestones, Issues) will layer on when the project goes
semi-public.
