# AGENTS.md

Guidance for coding agents working in this repo. Keep changes small and verified.

## What this is

Parche: an Astro-based framework. A page can be data (`sections: [{ widget, props }]`)
rendered through a virtual-module registry — but that route is opt-in
(`routes: { pages: true }`), and ordinary `.astro` pages keep working beside it and win
by specificity. Core must never assume it owns routing. AstroWind is the reference
materialization.

## Layout

- `packages/core` — the host: engine (integration, virtual modules `parche:*`, schemas, renderer, routing, i18n, tokens). The only non-parche.
- `parches/*` — plugins ("parches"). Each provides primitives / widgets / routes and declares what it requires:
  - `parches/primitives` — foundational components, exposed as `parche:primitives/*`.
  - `parches/ui` — widget library (`parche:widgets/*`).
  - `parches/blog` — app parche: routes, collections, RSS (`@parche/blog`).
  - `parches/themes` — theme parches (`corporate`, `minimal`, …): each contributes its `[data-theme]` CSS + switcher entry, so a site bundles only the themes it imports.
- `packages/cli` — `@parche/cli`, the `parche` command (`parche astro new`). Built with tsup.
- `packages/create-parche` — the `npm create parche` entry (reuses the CLI's scaffolder).
- `templates/*` — project starters consumed by the CLI (each may have a `parche.template.json`).
- `examples/*` — small per-feature demos.
- `demos/*` — full sites, bigger than an example and not CLI-served. `demos/astrowind` is a bilingual port of AstroWind, built to find gaps a small example never would.

## Commands

```bash
pnpm install
pnpm dev                       # examples/blog
pnpm --filter <example> dev    # e.g. example-i18n
pnpm --filter <pkg> build
pnpm test                      # unit tests + a build over every project
```

Config lives in the registry, which is built once in `astro:config:setup` — so a
change to `astro.config.mjs`, `parche.config.ts` or the set of parches **needs a dev
server restart**, not a reload. Content changes are served from Astro's
`.astro/data-store.json`; if an edit does not show, delete `.astro/` and restart.

## Conventions

- Package manager: pnpm workspaces. Node ESM (`"type": "module"`). Install relies on `minimumReleaseAge: 0` (in `pnpm-workspace.yaml`) so Astro 7's fresh native markdown binary resolves on Apple Silicon.
- Components consume primitives via `parche:primitives/*`, never by importing `@parche/primitives` directly.
- Widgets are registered in `parches/ui/src/index.ts`; keep names stable (page content references them).
- Docs, comments, and identifiers in English. Be concise.
- Skills live in `.agents/skills/<name>/SKILL.md` (Agent Skills standard).

### Constraints that are easy to break

Each of these was a real bug before it was a rule.

- **The site config is data, all the way down.** It must survive a round trip through
  JSON, because `parche.config.json` is supported so a git-based CMS can edit it.
  Never put a function, an import or a class instance in it.
- **A config value has one home.** `site`, `base` and `i18n` exist in both
  `astro.config.mjs` and the Parche config. Declaring one in both is an error naming
  both places; Parche feeds its own to Astro when only Parche has it. Do not add a
  silent precedence.
- **`@/assets/…` is only resolved where something resolves it.** `DynamicRenderer`
  does it for section props; anything else — post frontmatter, listing cards, author
  avatars, layout chrome, the share image, JSON-LD — must call `resolveAssets` from
  `parche:utils/assets`. And call it *before* anything derives a URL from the value,
  or the site origin gets prefixed onto a raw path.
- **Core owns no design decisions.** No widget names, no fonts, no typeface. A theme
  parche declares its own fonts in its manifest; core provides only the CSS fallback
  chain.
- **Translations are data, not a runtime.** Blog UI strings come from
  `createBlog({ labels })`, site identity from `i18n.translations`. Do not add an i18n
  library.
- **A taxonomy term that is not declared keeps its previous behaviour.** If you change
  how a slug is built, change it in all three places at once — `getStaticPaths`, link
  generation, and the lookup that maps the URL back to the frontmatter value.
- **`.prefault`, not `.default`, for a Zod object with nested defaults.** A `.default`
  value is handed back unparsed, so an absent block and one written as `{}` would
  resolve differently.
- **Git:** commit locally with plain conventional messages, and never add AI co-author
  trailers. Do not `git push` unless the maintainer asks for it in that session. Branch
  for work that is exploratory or breaks compatibility; commit straight to `main` when
  closing out something already there — and say which you are doing.
- **Docs:** three files, one rule each, and never duplicate between them —
  [`CHANGELOG.md`](./CHANGELOG.md) for what shipped, [`ROADMAP.md`](./ROADMAP.md) for
  what is next, [`BACKLOG.md`](./BACKLOG.md) for limits a real site hit. Follow
  [`.agents/skills/changelog`](.agents/skills/changelog/SKILL.md) and
  [`.agents/skills/roadmap`](.agents/skills/roadmap/SKILL.md): **propose the entry and
  wait for the maintainer to confirm before writing**.

## Verify

`pnpm test` must pass: unit tests plus a build over every project, with the
build-smoke asserting the invariants (no client JS budget blown, no unresolved
widgets, the SSR chunk shape).

For anything user-facing, check the built output rather than trusting the build to be
green — that is how most of this cycle's bugs were found. Useful checks: no
`@/assets/` left in any HTML, every internal link resolving to a page that is not a
404 redirect, and `hreflang` present where a translation exists.
