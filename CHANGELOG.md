# Changelog

Everything that has shipped in Parche, newest first. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/spec/v2.0.0.html).

Parche is pre-1.0: minor versions may break the public API. All `@parche/*`
packages are versioned and released together.

For where the project is going, see [ROADMAP.md](./ROADMAP.md).

## [Unreleased]

## [0.5.0] — 2026-08-23

The release that came out of rebuilding AstroWind on Parche as a real bilingual
site. Porting something with an original to compare against turned out to be a
much harsher test than designing a template freely: it found nineteen defects,
several of which had nothing to do with translations and had been shipping since
before 0.4.0.

The config surface is **reshaped and breaking** — it now mirrors Astro where
Astro already has an opinion, and holds only serialisable data so a git-based CMS
can edit it. See [Migrating](#migrating-from-040).

### Added

- **`themes.default`** (`e58102c`) — the theme rendered on `<html data-theme>` by the
  server. Until now a theme was only applied from `localStorage`, so a first-time
  visitor never saw the site's own theme. Validated at config time against the themes
  the imported parches provide; a visitor's stored choice still wins.
- **`createBlog({ labels })`** (`e58102c`) — blog UI strings as data, keyed by locale,
  falling back to the default locale and then to English. Mirrors the contact
  template's `formLabels`; no translation runtime. Around forty strings that were
  baked into routes and widgets are now translatable, including the route-level ones
  (page titles, breadcrumbs, "Tag: X") that a site previously could not reach at all.
- **The `astrowind` theme** (`45b542d`) — AstroWind's identity as a theme parche: its
  blue, near-black ink on white and deep navy dark mode, converted from
  `CustomStyles.astro`'s rgb values to OKLCH, plus Inter and pill-shaped controls.
- **`demos/astrowind`** (`45b542d`, `12ba031`) — AstroWind rebuilt on Parche, bilingual
  (en/es): 20 pages, three layouts, a blog with taxonomies, 94 built URLs. The repo
  gains a `demos/` workspace glob for full sites that are bigger than an example and
  are not CLI-served starters.
- **A `taxonomies` collection** (`785ca8d`) — one entry per locale where a category or
  tag can declare its title, slug, description and image. A term that is *not*
  declared behaves exactly as before, so adding the collection changes nothing until
  something is declared.
- **`i18n.translations`** (`7a1bf3f`, `ef2ef6e`) — per-locale overrides of the site's
  own identity and metadata. Astro's i18n is routing only; its documentation puts
  translating metadata on the developer, and this is that half. Until now a Spanish
  blog listing served the English site description.
- **`parche.config.json`** (`fe3f331`) — the site config can be JSON, probed for
  alongside `.ts`/`.mjs`/`.js`, read and validated at setup. This is what makes the
  config editable by a git-based CMS, and it is why nothing in it may be a function.
- **`fonts` on a parche manifest and in the site config** (`3ff3d46`) — web fonts as
  data. A theme declares the typeface its design calls for; a site can add or replace
  any of them.
- **`dateFormat` as `Intl.DateTimeFormatOptions`** (`4db1052`) — the option existed and
  was read by nothing. Rather than implement the token template it advertised, it now
  takes Intl options: the option picks the style, the locale picks the word order.
- **`dir` on `<html>`** (`ee3cdc7`), derived from the locale with `Intl`. The blog
  widgets already carried `rtl:` utilities that could never activate.
- **A `position` prop on `layout/Header`** (`3486ef6`) — `'left' | 'center' | 'right'`,
  default unchanged. A short menu centred in a wide bar reads as stranded on a landing.

### Changed

- **The site config mirrors Astro where Astro has an opinion** (`ef2ef6e`). `site` is
  now the origin — same name and type as Astro's — `base` joins it, the identity moved
  to `brand`, and `metadata` absorbed the old `seo` block and the top-level
  `organization`. `metadata` is deliberately the same name a page uses, because it is
  the same thing one level up: the defaults a page inherits.
- **A config value has one home** (`7a1bf3f`, `a6cb404`). The site URL and the i18n
  setup can each be declared in astro.config or in the Parche config; declaring one in
  both is now an error naming both places, and a Parche-only declaration is fed to
  Astro. Previously Astro's silently won.
- **Blog permalink resolvers take a locale** (`e58102c`). `resolvePostPermalink` and
  `resolveTaxonomyPermalink` gained optional `locale`/`defaultLocale` parameters and
  prefix through a new exported `localizePath`. Existing calls keep working unchanged.
- **Core ships no web fonts** (`3ff3d46`, `093441f`). It provided a fixed set every
  project imported by hand, so each site downloaded the same eight families whatever it
  looked like — sixteen files, filling nine CSS variables of which core's own
  stylesheets read two. A typeface belongs to a visual identity, so themes carry it
  now. Core provides the fallback chain instead, which costs no download. Measured:
  projects with a theme download two files, projects without one download none.
- **The language switcher keeps one order** (`a997535`). It pinned the current locale to
  the top, so the list reordered itself depending on the page you were on.

### Fixed

- **Blog links dropped the locale prefix** (`e58102c`). Post, tag, category and author
  hrefs, pagination base URLs, the post template's links, RSS item links and JSON-LD
  breadcrumbs all pointed at the default locale, so a translated visitor was returned
  to the default language on the first click. Breadcrumb "Home" no longer links to the
  default locale's homepage from a translated page either.
- **An out-of-range page served a duplicate** (`45b542d`). `paginateArray` clamps the
  requested page back into range, so `/blog/99` returned page 1 with a 200 — indexable
  duplicate content, with or without translations. Listing and taxonomy routes now
  compare the requested page against the last one and 404 instead.
- **Locale-absent listings rendered empty and indexable** (`e58102c`). `getStaticPaths`
  takes the union across locales because Astro caches it per component and every locale
  shares the entrypoint; pages and taxonomies with nothing in the current locale now
  404 rather than rendering an empty page with `noindex: false`.
- **`BlogLatestPosts` and `BlogHighlightedPosts` ignored locale and permalinks**
  (`e58102c`). Both queried the whole posts collection unfiltered and hardcoded
  `/${slug}` hrefs, so every link was a 404 under the default `/blog/%slug%` pattern.
  No example or template used them, which is why it went unnoticed.
- **Posts 404'd outside the default locale with a root-level permalink** (`e58102c`).
  `resolver.getPaths` received `locales` and `defaultLocale` and referenced neither,
  emitting unprefixed paths deduped by key — so a shared slug made only the default
  locale reachable. Paths are now built through the permalink resolver, and the
  catch-all peels the locale prefix off the slug in both static and SSR.
- **Markdown page bodies were silently dropped** (`12ba031`) unless the page also named
  a template, because `LayoutRenderer` only rendered them inside a template component.
  This also repairs `examples/markdown-pages`, whose own body advertises the feature
  while its built HTML contained none of it.
- **Post dates always formatted as `en-US`** (`e58102c`) in the three post widgets.
- **`slugify` deleted accented characters** (`e58102c`) rather than transliterating
  them — `\w` is ASCII-only, so a category "Guías Prácticas" became `guas-prcticas`.
- **Series and related-post labels leaked English** (`45b542d`) on translated posts
  served through the resolver: the extras were pushed by widget name with no strings
  attached, and the catch-all cannot know they hold user-facing text.
- **`@/assets/…` only resolved inside the section renderer** (`33133e8`, `785ca8d`).
  Post images rendered as the literal path and 404'd, while the related-posts
  thumbnails on the same page resolved — because those travel through DynamicRenderer
  and frontmatter does not. The resolution is now a shared utility called at every
  boundary content enters the render tree: post data, listing cards, author avatars,
  the two homepage blog widgets, the layout chrome (a logo or mega-menu image was as
  broken) and the share image. Ordering matters in the resolver: JSON-LD prefixes the
  site origin onto `image.src`, after which the path is unrecognisable.
- **Full-bleed widgets had no horizontal container** (`aa1f0bf`). Hero, Hero2 and
  HeroText set vertical padding only, and skipping SectionWrapper is what supplied the
  rest — so their copy sat flush against the viewport edge in every project in the
  repo. Centred copy read as "wide"; Hero2's left-aligned copy made it obvious.
- **Translated posts were invisible to each other** (`3486ef6`). Two posts pair by file
  name once the locale directory is stripped, exactly as pages pair by `pageKey`, and
  the machinery already existed — nothing used it. Posts now emit hreflang and the
  language switcher works on blog routes, where it had been greyed out on every page.
- **Author links pointed at pages that were never built** (`785ca8d`). The post template
  derived them from the display name (`jane-doe`) while the author route generates
  paths from the entry key (`jane`).
- **A Zod `.default({})` skipped its own nested defaults** (`fe3f331`). An absent
  `metadata.defaultRobots` stayed empty while one written as `{}` was filled in, so the
  same site emitted `index, follow` or the full directive set depending on whether a
  key happened to be present. `.prefault` parses the default.
- **Every site emitted a schema.org Organization node** (`fe3f331`) built from the brand
  name, declared or not, because its default was truthy. It is opt-in now.
- **Both themes named a font that was never loaded** (`093441f`). `astrowind.css` read
  `var(--font-inter)` and `corporate.css` named `"Inter"` as a literal, and neither was
  in the font set — so the typeface each theme was designed around silently fell back
  to a system font.

### Migrating from 0.4.0

**1. The site config changed shape.** What was one `site` object is now four keys:

```ts
// before
export default defineConfig({
  site: { name: 'Acme', description: '…', url: 'https://acme.com', defaultLanguage: 'en' },
  metadata: { ogImage: '/og.png', twitterHandle: '@acme' },
  seo: { preconnect: ['https://fonts.gstatic.com'] },
  organization: { type: 'Organization', name: 'Acme' },
});

// after
export default defineConfig({
  site: 'https://acme.com',
  brand: { name: 'Acme', description: '…' },
  metadata: {
    ogImage: '/og.png',
    twitterHandle: '@acme',
    preconnect: ['https://fonts.gstatic.com'],
    organization: { type: 'Organization', name: 'Acme' },
  },
});
```

`defaultLanguage` is gone — Astro already calls it `i18n.defaultLocale`, and it is
read from there.

**2. Declare the site URL and i18n in one place, not two.** If `astro.config` sets
`site` and the Parche config sets `site`, the build now stops with an error naming
both. Keep whichever you prefer: Parche reads Astro's when only Astro has it, and
feeds its own to Astro when only Parche does.

**3. Remove `fonts: parcheFonts` and its import.** `@parche/core/fonts` no longer
exists. A project with no theme now renders in the system font stack and downloads
nothing; to keep a web font, import a theme that declares one or declare it yourself:

```ts
// parche.config.ts
fonts: [{ name: 'Inter', cssVariable: '--font-sans', weights: [400, 700], preload: true }],
```

**4. If you passed `dateFormat`, change its type.** It took a token string that
nothing read; it now takes `Intl.DateTimeFormatOptions`
(`{ year: 'numeric', month: 'long', day: 'numeric' }`).

**5. Declared taxonomy terms change URL.** Only if you add the new `taxonomies`
collection — an undeclared term keeps the URL it had.

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

[Unreleased]: https://github.com/withparche/parche/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/withparche/parche/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/withparche/parche/compare/v0.3.0-alpha.0...v0.4.0
[0.3.0-alpha.0]: https://github.com/withparche/parche/releases/tag/v0.3.0-alpha.0
