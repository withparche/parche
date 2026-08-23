# Changelog

Everything that has shipped in Parche, newest first. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/spec/v2.0.0.html).

Parche is pre-1.0: minor versions may break the public API. All `@parche/*`
packages are versioned and released together.

For where the project is going, see [ROADMAP.md](./ROADMAP.md).

## [Unreleased]

## [0.4.0] — 2026-08-23

The release that makes Parche verifiable. It adds the first regression net (51 unit
tests + build-smoke + a starter scaffold-build, all in CI), tightens the parche
contract with `requires` V2 and preset composition, and cuts SSR memory and
per-request work substantially. Two changes are **breaking** for anyone on
`0.3.0-alpha.0` — see [Migrating](#migrating-from-030-alpha0).

### Added

- **Test suite — the first regression net** (`f888c86`, `e541cd5`). Three layers on
  `node:test` + `tsx`: **51 unit tests** across `@parche/core` (registry/requires-V2,
  config/extends/presets, vite-plugin generators), `@parche/cli` (slug/titleCase,
  prompt defaults, placeholder replacement, binary + `node_modules` skip) and
  `@parche/blog` (post helpers, reading time, related-posts scoring); a
  **build-smoke** pass (`test/assert-dist.mjs`) asserting the 0-JS-to-client
  invariant, per-project client-JS budgets, no unresolved-widget markers and the
  SSR chunk shape over 11 built projects; and a **starter** check
  (`test/build-starter.mjs`) that scaffolds `hello-parche` through the CLI, links
  the local packages and builds it. CI runs all of it on every push/PR.
- **Preset composition** (`fce0d60`). `parchePreset(...)` + `extends` on the config.
  Presets deep-merge left-to-right (this config wins per leaf), `parches`
  concatenate. Unblocks shared bases and monorepos.
- **Contract V2 — `requires`** (`fce0d60`). Presence is checked for every capability
  (primitives, widgets, templates, themes, peer parches) and fails fast with
  attribution; peer parches are npm-range-checked (caret/tilde/`>=`/exact, 0.x
  pinning); widgets accept `{ name, props }` with structural prop presence checked
  against the generated schemas.
- **SaaS landing template** (T1, `5517469`) and **personal portfolio template**
  (T2, `8c60292`, `531ada8`) — built to find real limits, not as demos. Each shipped
  with its findings recorded in [`BACKLOG.md`](./BACKLOG.md).
- **Portfolio widget suite** (`531ada8`) — magicui-style widgets, later aligned to the
  standard wrapper pattern (`866ac6c`).
- **`surface` wrapper knob** (`e674e82`) — tokenized background band so sections can
  alternate rhythm without raw HTML.
- **Shared `Action` component** (`e674e82`) — centralizes button variants, adds
  `focus-visible` rings and renders action icons; wired into Hero, Hero2, HeroText
  and CallToAction.

### Changed

- **`defineParche` → `parche`** (`d91496e`), a single default export. The unified
  entry (`fce0d60`) carries integration options and site identity in one validated
  object, in either inline (`site: {...}`) or separate-file (`config: './parche.config.ts'`)
  style, and accepts a `(ctx) => config` function for env-based / multi-tenant setups.
- **Config lives at the project root** (`9838ca5`, `f3dcbe4`) — all 9 examples and the
  3 templates migrated; references and the default aligned to the convention.
- **Lazy widget catalog** (`4dcb18a`). The static `widgetMap` became `widgetLoaders`
  (`() => import()`) + `loadWidgets(keys)`, so Vite code-splits each widget and the SSR
  server holds only the chunks a page renders. Measured on the saas-landing SSR build:
  the layout server chunk went from **~2.3 MB to ~31 KB**.
- **Core decoupled from widget knowledge** (`5063974`). Full-bleed layout is declared
  by the parche manifest (`fullBleed`) and emitted as `parche:config/layout` instead of
  a hardcoded set in `DynamicRenderer`; the blog resolver returns a generic
  `extras.sections: Section[]` so core no longer dereferences blog widget names.
- **SSR/render hot path hardened** (`42bb415`). Blog resolver reuses the already
  filtered/sorted posts (~3 passes → 1 per request); `resolveDeep` reuses unchanged
  subtrees instead of deep-cloning; the image glob dropped `{ eager: true }` so unused
  images are never imported; `resolveLayout` memoizes an id→entry Map (up to 4 `.find()`
  scans → O(1)).
- **i18n slug resolution** (`566c9be`). `buildSlugMap` is memoized in production behind a
  `Map<slug, entry>` index — two calls per SSR request collapse to one, the resolve scan
  goes O(pages) → O(1), and the static build's O(N²) rebuild is gone. Dev stays uncached.
- **Failures are loud** (`0b8244f`). Unknown widget/template/layout emits a dev warning
  and a visible dev-only placeholder instead of rendering a silent blank.
- **`siteConfigSchema` is `.strict()`** (`e541cd5`) — stray or typo'd top-level keys now
  fail the build with a clear message instead of being silently dropped.
- **Backgrounds are authored, not preset** (`02a8961`, `d773f1f`). The invented
  surface/band/pattern presets were reverted; section rhythm comes from the template
  author combining layouts, `surface` bands and `bg` HTML.
- **`astro-icon` include scoped** to the SSR demos (`cf2fd34`).

### Fixed

- **Images nested in arrays weren't resolved** (`e674e82`) — `resolveProps` became
  recursive (`resolveDeep`), resolving `@/assets/` at any depth (feature icons,
  testimonial avatars, galleries).
- **Pricing couldn't express a "Custom / Contact us" tier** (`e674e82`) — `period` and
  currency are optional, and a `type: 'custom'` plan renders a contact card.
- **Header had no text wordmark** (`e674e82`) — `{ text }` works and the Header never
  renders a broken `<img>`.
- **`--ds-color-primary` in light mode** (`0b8244f`) was a near-black neutral; now the
  brand blue, matching dark.
- **`surface` was indistinguishable from `background`** (`7529a21`), making section
  rhythm invisible.
- **Announcement bar** centered and polished into a clickable banner (`78b3267`).
- **Steps/Content with no image** were unbalanced; step-number contrast fixed
  (`2e40191`).
- **Widget schema generation was a single point of failure** (`566c9be`) — namespace
  imports plus a per-widget `try/catch` around `z.toJSONSchema`, so one bad schema is
  skipped with a warning instead of killing the builder palette.
- **Registry state bleed** (`566c9be`) — `namedExportModules` is now instance-local from
  a frozen base; duplicate registrations report attribution instead of silent last-wins;
  parche paths are validated.
- **Stale virtual-module types** (`0b8244f`) — dangling Header/Footer decls dropped,
  enumerated lists replaced with wildcard declarations that track the parches.
- **`base.css` matched by realpath** (`0b8244f`) so pnpm symlinks can't cause a silent
  `@source` miss that drops every parche class.
- **CSS scanning when installed from npm** (`6ecb5f4`) — parche component classes are
  scanned from the published packages.

### Removed

- **Dead `theme: { darkMode: true }` key** (`e541cd5`) from all 9 example configs — it
  was consumed by nothing, silently stripped by Zod, and a TS error in the editor.
- **Stats section from the portfolio template** (`5fafa54`) and its redundant padding
  (`61728ad`) — the page read better without it.

### Migrating from 0.3.0-alpha.0

**1. The default config path moved to the project root.** It was `./src/config.ts`;
it is now `./parche.config.ts`. Either move the file, or keep yours where it is by
passing the path explicitly — an explicit `config:` has always won and still does:

```js
parche({ parches: [...], config: './src/config.ts' })
```

**2. Site config is `.strict()`.** Unknown top-level keys used to be dropped
silently; they now fail the build with a message naming the key. In practice this
means removing `theme: { darkMode: true }` if you copied it from an example — it was
consumed by nothing (dark mode is driven by theme parches and `[data-theme]`).

Nothing else in the public API changed shape. `parche()` is still the default export
of `@parche/core` and still accepts the `{ parches, config, routes }` form; 0.4.0 only
adds the option of passing `site` inline in the same object.

## [0.3.0-alpha.0] — 2026-08-21

First publish to npm (`@parche/core`, `@parche/primitives`, `@parche/ui`,
`@parche/blog`, `@parche/themes`, `@parche/cli`, `create-parche`). Everything below
landed in the repo's first day and became this release.

### Foundation (`a2e25f9` → `01b778f`)

- **Monorepo bootstrap** (`a2e25f9`) — see
  [Before the first commit](#before-the-first-commit) for what arrived in it.
- **Data-driven fonts** (`036112b`) — `BaseLayout` fonts declared as config, not code.
- **Tailwind `@source` paths fixed** in `base.css` (`a693a13`).
- **i18n example** (`d494454`), later extended with a Chinese locale (`64b9e36`).
- **Feature examples + `@parche/core/styles` export** (`24c073c`).
- **`dynamic-widgets` renamed to `import-widget`** (`01b778f`).

### Modernization (`20aeff8` → `291abd7`)

- **Astro 7 + Tailwind 4 + Zod 4 upgrade, and a central pnpm catalog** (`20aeff8`) for
  shared dependency versions.
- **`satteri` override dropped** (`befee16`) — the registry cooldown was the real cause.
- **React example became a real Parche widget, plus a shadcn example** (`291abd7`).

### Parches architecture (`12bbbb0` → `f5acb6c`)

- **`parches/` layout** (`12bbbb0`): plugins moved out of the host; `@parche/core`
  becomes the only non-parche.
- **Unified `parches: []` config with a provides/requires contract** (`f2fdd9a`).
  Everything that plugs into core is a parche with one manifest shape declaring what it
  provides (primitives / widgets / templates / routes / config) and what it requires.
  The config surface collapsed from separate slots to one ordered array where order is
  precedence — replacing the old widget-merge hack. Core validates the graph at setup
  and errors clearly when a required capability has no provider.
- **Chrome extracted to the ui parche** (`4af1d90`) — Header/Footer/templates left core,
  which became a pure engine.
- **Pluggable themes** (`f5acb6c`): a theme is a parche contributing its `[data-theme]`
  CSS plus its switcher entry, so a site bundles only the themes it imports. The
  manifest gained `styles[]` and `themes[]`; the registry aggregates them into
  `parche:config/styles`; the new `@parche/themes` parche ships corporate / minimal /
  playful / startup / starter. Verified: theme CSS appears only where imported.

### Tooling & DX (`ce16c94` → `970b80f`)

- **`@parche/cli`, `create-parche` and the `hello-parche` starter** (`ce16c94`).
  `parche astro new [template] [dir]` scaffolds from the repo, a GitHub repo or a local
  folder — resolving sources, running the template's prompts, replacing
  `{{placeholders}}`, patching `package.json` and installing. Stack: citty +
  `@clack/prompts` + picocolors + giget + nypm. `generate` stays reserved for AI/Narrans.
- **Honest example output modes** (`1d9c2e4`) — `ssr` is `output: 'server'`, the rest
  static.
- **CI workflow + versions aligned to 0.3.0** (`7330b9f`), with pnpm's version read from
  `packageManager` (`5c81609`).
- **`ROADMAP.md` + the AI-assisted roadmap-upkeep skill** (`2b00bf5`).
- **npm release prep** (`a96d96b`, `f849673`, `970b80f`): 7 packages made publishable
  (`private` dropped, `publishConfig.access=public`, MIT license, author, repository
  metadata, `files` whitelist, per-package README + LICENSE), the CLI's `dist` rebuilt on
  pack via `prepack`, and `hello-parche` pointed at the `next` dist-tag. Verified with
  real tarball installs into a fresh Astro app.

## Before the first commit

Roughly three months of work preceded this repository, in the earlier `astrowind-v2`
project. It arrived here squashed into the bootstrap commit (`a2e25f9`, 161 files),
so there is no per-commit history for it. The section below is **reconstructed from
that commit's tree** — everything listed demonstrably existed on day one, with paths
as evidence. It is what defines Parche; the repo's own history is the story of
turning it into a framework other people can install.

### Design system — three token layers, OKLCH throughout

`packages/core/src/styles/`. Layer 1 (`tokens.css`) holds primitive values as CSS
custom properties: full neutral and primary ramps (50→950) authored in **OKLCH** for
wide gamut and perceptual consistency, carrying AstroWind v1's hue-260 slate-blue and
vivid blue. Layer 2 (`semantic.css`) maps primitives to roles (`--ds-color-background`,
`-foreground`, `-surface`, `-primary`, `-on-primary`, `-muted`, `-border`, `-heading`)
and exposes them to Tailwind via `@theme inline`, so `bg-background` / `text-heading`
read CSS vars and a theme can override them. Layer 3 (`styles/themes/`) ships five
`[data-theme]` overrides — corporate, minimal, playful, starter, startup — with a
runtime switcher (`ThemeSelector`, `ThemeToggle`, `ThemePanel`) and a
`shadcn-compat.css` bridge.

### Pages as data

`content/schemas.ts` defines the contract: a **page** is `{ title, description,
urlSlug, template, layout, metadata, sections[] }` and a **section** is
`{ widget, props, wrapper }`, where `wrapper` carries `id / isDark / bg / classes / as`.
No page is a component — pages are JSON content entries. `DynamicRenderer.astro`
resolves each section's widget by name and renders it inside `SectionWrapper.astro`;
`LayoutRenderer.astro` does the same for layouts. A single catch-all route
(`routes/[...slug].astro`) plus `404.astro` and a middleware serve the whole site.

### Virtual-module registry

`integration/registry.ts` + `integration/vite-plugin-parche.ts` generate the
`parche:*` module graph at build: `parche:primitives/*`, `parche:widgets/*`,
`parche:templates/*`, `parche:registry/{widgets,templates,resolvers}`,
`parche:config/*` and `parche:app/*`. Consumers import capabilities by virtual
specifier, never by package path — the indirection that later made the parches
architecture possible.

### SEO, fully modelled

`utils/metadata.ts` + `metadataSchema`: canonical URLs, keywords, granular robots
(`noindex` / `nofollow` / `maxSnippet` / `maxImagePreview` / `maxVideoPreview`),
Open Graph (`ogTitle`/`ogDescription`/`ogImage`/`ogType`), Twitter cards, and article
metadata. On top of it a **JSON-LD graph builder** emitting WebSite, WebPage,
Organization, BreadcrumbList and Article, with breadcrumbs derived from the URL path.

### i18n

Per-locale content directories (`content/posts/en/…`, `authors/en/…`,
`layouts/en/…`), manual locale routing through the catch-all, `getAlternateUrls` for
hreflang alternates, a locale middleware and a `LocaleSwitcher`.

### The blog app

`apps/blog/` — the proof that an app could plug into the engine: paginated index,
post, tag, category, author and series routes plus `rss.xml`, its own content
schemas and resolver, a `blog-post` template, and utilities for querying, blog
metadata, post helpers, reading time, related posts, RSS and table of contents.

### Component library

**11 primitives** (`packages/primitives/src/atoms/`): Avatar, Badge, Button,
Container, Divider, Eyebrow, Icon, Image, Link, Section, Tag. **34 widgets**
(`packages/ui/src/widgets/`), each paired with a `.props.ts` Zod schema — 20
marketing widgets (Hero, Hero2, HeroText, Features, Features2, Features3, Content,
Steps, Steps2, Pricing, Testimonials, FAQs, Stats, Brands, CallToAction, Contact,
Note, Announcement, BlogLatestPosts, BlogHighlightedPosts) and 14 blog widgets
(BlogList, BlogPostCard, BlogPostCardGrid, BlogPostHeader, AuthorCard, RelatedPosts,
SeriesNav, CategoryNav, TagCloud, Breadcrumbs, Pagination, ShareButtons, TOC,
ToBlogLink). Chrome (Header, Footer, `OptimizedImage`) and `contact` / `content`
templates shipped in core, and were extracted to the ui parche later (`4af1d90`).

### Agentic scaffolding

`AGENTS.md`, the `CLAUDE.md` pointer and the `.agents/skills/` convention were part
of the bootstrap — this project was built to be worked on with coding agents from the
first commit.

[Unreleased]: https://github.com/withparche/parche/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/withparche/parche/compare/v0.3.0-alpha.0...v0.4.0
[0.3.0-alpha.0]: https://github.com/withparche/parche/releases/tag/v0.3.0-alpha.0
