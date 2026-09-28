# Changelog

Everything that has shipped in Parche, newest first. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/spec/v2.0.0.html).

Parche is pre-1.0: minor versions may break the public API. All `@parche/*`
packages are versioned and released together.

For where the project is going, see [ROADMAP.md](./ROADMAP.md).

## [Unreleased]

### Added

- **`usedIcons()`, for astro-icon's `include`.** `import { usedIcons } from
  '@parche/astro/icons'` and `icon({ include: usedIcons(parches) })` in
  `astro.config`: the icons the site's content and its parches name, by
  set, for the sets the project installs. Without `include`, astro-icon
  bundles whole sets (Tabler is 2 MB of SVG) into a server build and the
  server loads them on every cold start; Parche's widgets take icon names
  from content, which astro-icon cannot see by scanning code. A name put
  together at run time is added with `also`. The demo, the templates and
  the server examples use it.

- **`Parche.*` types for the site's own TypeScript.** The integration
  writes `parche.d.ts` into the site's types on every start (Astro's
  `injectTypes`): `Parche.Widget`, `Template`, `Element`, `Locale`, `Theme`
  and `App`, the unions of what the site's parches provide, for a custom
  route picking a widget by key or a script naming a locale.

- **The site config file is watched in dev**: a change to
  `parche.config.json` restarts the dev server, from core, for every site;
  the builder no longer has to.

- **Two parches setting one font variable with different families are
  warned about**, naming both and the family that applies; set `fonts` in
  the site config to choose. The same family twice is one font, silently.

- **`transitions: false`** in `parche({ … })` leaves Astro's ClientRouter
  (view transitions, about 16 KB of script on every page) out. Default:
  on, as before.

- **A `$collection` without `limit` over a large collection is warned
  about**, once per collection: every page carrying it renders the whole
  collection (a thousand cards on one page, measured on the bench's own
  mistake). Add `limit` to the query.

- **`bench/`, `PARCHE_PROFILE=1` and `PARCHE_DEBUG_FREEZE=1`.** A site of
  any size generated from the demo (pages, posts, products, locales,
  sections per page) and the scripts that measure a build, a server's
  latency and what it loads on a cold start, so a change to core is judged
  by numbers. With `PARCHE_PROFILE=1` a build prints where its time went,
  by phase; with `PARCHE_DEBUG_FREEZE=1` (on in the test builds) the
  content pages share is frozen, so a widget that mutates what it is given
  fails the build instead of changing the next page.

- **The visual builder, `@parche/builder`, and `parche astro builder`.** An
  editor for a site's content over the site's own render, in development
  only: the CLI adds it through Astro's programmatic `dev()`, it refuses any
  other command, and no build carries it. Pages with their slots and
  wrappers, layouts and their outlets, menus (with the form of the prop that
  uses them), patterns, the blog (posts with their Markdown text, views
  customised from the preset's, authors, series, taxonomies), the design
  tokens (the base look or a theme, light
  or dark, into `src/parche.tokens.json`) and the site config (the dev server
  restarts to read it). The preview is the real page with the unsaved edits
  in place, updated without a reload, with hover and selection outlines; a
  layout, menu or pattern previews through a page that uses it. Every edit
  is checked as the renderer checks it, and a save writes the file keeping
  its indentation and order, or stops if the file changed on disk. Side
  panels can be pinned beside the preview or float over it. Private while
  on `experimental`; see `docs-wip/builder.md`.

- **The blog's presets redone from a measured study of today's blogs**
  (`docs-wip/research/`). A post's text has its own type style
  (`type.reading`: 20px, 18 on a phone) in `font.reading`, the site's serif
  when one is declared (`ref.font.serif`), else the sans. The index views:
  personal, a reading column by year with the date on the right; company, a
  large post and two beside it over cards at 1.91:1; magazine, one section
  with the lead story, ads and a river with a rail; newsletter, a reading
  column with the form, the latest issue, the list and a subscribe card. New
  options: `Featured` `trio`, `PostList` `ratio`, `dateSide` and `groupBy`,
  `ArticleHeader` `imageWidth` and `imageRatio`, `Share` `native`, and the
  1.91:1 ratio in `Image`. ShareBar shows buttons to X, LinkedIn, Facebook,
  WhatsApp, email and copy link.

- **A wide article layout** (`layout: 'wide'` on `blog/ArticleHeader` and
  `blog/ArticleBody`). From 1280px the post is laid out in three columns
  across the page: a `start` rail (the new `blog/ShareBar`, the share buttons
  aligned against the text), the text at its 680px measure, and a 300px
  sidebar, wide enough for a standard 300×250 ad. The image goes edge to edge
  under a centred title, cropped to 21:9 (16:9 on smaller screens); the
  centred layout's image is cropped to 16:9. Centred stays the default.

- **Blog widgets for a feed with a sidebar:** `blog/PostList`
  `thumbnail: 'wide'` (a 200px thumbnail at 3:2 in rows), `blog/Subscribe`
  `layout: 'stack'` (a card for a sidebar). The demo's blog shows them: the
  index leads with the featured post across the page, then the posts as rows
  (an ad placeholder first) beside the categories and the subscription; each
  post uses the wide layout, with ad placeholders in the sidebar and after
  the article.

- **Pages from a collection, `collections` in the site config.** A
  collection of plain data (products, courses, places) named in
  `parche.config.json` gets a page for every entry at a `path`, rendered by a
  widget or a pattern that takes the entry's fields as props: the ones it
  declares by name, the others through a `props` map, the rest left out. The
  collection keeps only its data and its own schema in `content.config.ts`;
  the page's structure is the pattern's. Entries carry their address as
  `href` in a `$collection`, so lists link to the pages. A name with no
  entries, or one an app already serves, fails the build. The builder's Site
  panel edits it like the rest of the site config. The demo store's three
  products are the example (`docs-wip/collections.md`).

- **Patterns** (`src/content/patterns/`). A composition of widgets kept once
  and used wherever a widget goes, as `{ "widget": "pattern/<id>" }`. Without
  props it is content shared as it is (the same FAQ on several pages); with
  props, declared as JSON Schema, each use gives only the values, which
  `{ "$prop": "title" }` placeholders put where they belong. The id is looked
  up in the page's locale first; a use stands for its root widgets in the
  list it sits in and in a slot's `allow` and counts; a pattern that reaches
  itself is reported and not rendered. Export the `patterns` collection from
  `createCollections()`.

- **The node model** (`ba3e5b1`, `b831257`, `a83328d`, `7a0115d`). A page, a
  layout and a pattern are one shape, a tree of nodes `{ widget, props,
  slots, wrapper, notes, id }`. A widget that declares slots in its
  `.props.ts` takes nodes by slot name into its Astro slots; `*` accepts any
  name. Layouts place `Outlet` nodes at any depth: the page's `sections`
  fill the unnamed one and `slots[name]` the named ones. Nothing is wrapped
  unless a list declares it (an Outlet's `wrapper`, or the page's), and a
  node may say how it is wrapped itself: `{ props }` over the list's
  wrapper, `{ widget, props }` another widget, `false` none. Section is
  ui's wrapper widget, with tones, widths, rhythm and an anchor; Columns,
  Column and Switch are the containers. See `docs-wip/content-model.md`.

- **Content is checked against the catalog** (`1e73cae`, `dbc1a88`). Unknown
  widgets, slots a widget does not declare, widgets a slot does not allow,
  `min` and `max`, wrappers and tones nobody registered, broken references
  and patterns, each reported with its path: a warning in dev, and a failed
  build for a prerendered page, which makes `astro build` the CI check.

- **References in props** (`20f3ab2`, `b6afd6b`). `{ "$ref":
  "<collection>/<id>[#/pointer]" }` names one entry, looked up in the page's
  locale first; `{ "$collection": name, filter, sort, limit }` is a query.
  Both are resolved before a widget sees its props. Menus live in the
  `navigation` collection and are referenced this way, so Header and Footer
  keep plain list props.

- **Pages in YAML** (`b9cb266`), alongside JSON, with the same schema. JSON
  stays the format everything ships and scaffolds in.

- **Tokens from a DTCG source, in layers** (`ce2642c`, `79050cc`, `42aef7b`,
  `1416d9d`, `bc6c5c4`). `packages/core/tokens/{ref,sys,conf}.json` in the
  W3C Design Tokens format generate the CSS, the Tailwind bridges, a flat
  catalog and a type: `--ds-ref-*` primitives, `--ds-sys-*` roles and type
  styles, `--ds-conf-*` knobs (radius scale, section rhythm, measures,
  gutter) and `--ds-comp-*` per element. New roles `surface-2`,
  `border-soft`, `link`, `primary-hover`, and the type roles `lead`,
  `title`, `title-sm`, `body-sm`, `small`, `meta`, `figure`, `figure-sm` as
  `.type-*` classes. CI fails when the generated CSS is stale.

- **Two themes, Product and Editorial** (`3fa64a2`, `3cdacc6`). The
  redesign's two directions on the same markup, overriding only roles, type
  styles, radii, shadows and the conf knobs.

- **New elements** (`0f136c9`, `bc6c5c4`, `ec5d94d`, `f9657a1`, `b74593a`,
  `3a37a6e`, `48a621c`, `4857705`, `1f758b2`, `766d362`, `4eb610a`,
  `a95d21b`): Command, Frame, Placeholder, List, Table, Callout, Form (in-place
  validation and sending states on a real form), Gallery (a lightbox over
  links), Filter, Calculator, Countdown, Compare, StickyBar, LoadMore, Search
  (Pagefind), Consent, AdSlot and Comments (giscus, after consent). Each works
  without script in a documented form.

- **New and reworked ui widgets** (`1aec631`, `749beac`, `4187629`, `b16f0c6`,
  `d85e0b3`, `63c5077`, `d7deaa6`, `4857705`, `d4a130e`, `54d3936`). One Hero
  (center, split, text, side, overlay layouts; media and proof slots), one
  Features (grid, cards, list, panels, tiles, rows, gallery), one Steps
  (timeline, grid, numbered, rows, columns), CallToAction layouts, Pricing
  with billing periods, Stats on sourced numbers, Testimonials on verified
  quotes; and Section, Columns, Column, Switch, Screenshot, Command,
  Showcase, Cases, Team, Timeline, Newsletter, Table, Callout, Gallery,
  Releases, Products, Prose, Heading, PageHeader, SideNav, Code, OnThisPage,
  PrevNext, Calculator, Countdown, Compare, StickyBar, Consent and AdSlot.
  Every section widget shares one heading (tagline, title, subtitle, link,
  align) and one vocabulary (`items`, `actions`, `link`, `layout`), and
  short texts read inline Markdown (`501784e`).

- **Images on their best path** (`e342e6e`). The Image element sends each
  picture through Astro's image service when local, as a srcset of an image
  CDN's URLs when remote on one (detected by unpic), through Astro when its
  domain is allowed, and as a plain `<img>` with a build warning otherwise.
  `parche({ images })` chooses: `remote`, `cdn.hosts`, `cdn.providers`,
  `cdn.fallback`, `layout`, `breakpoints`, `warnUnoptimized`. `priority`
  marks a page's main picture. See `docs-wip/images.md`.

- **The blog, rebuilt on views** (`1c4047e`, `54edc60`, `839069b`, `ac01bc0`,
  `0149928`, `1e9d6c5`, `766d362`, `4eb610a`, `a95d21b`, `8da6bcb`,
  `1f758b2`, `e004882`, `bddda59`). `createBlog({ preset })` picks the
  structure: `personal`, `company` (default), `magazine` or `newsletter`,
  with options validated when the config loads. Listings, terms, authors,
  series, the archive and the article each render a JSON view a site can
  replace (`src/content/views/blog-<name>.json`), with widgets that read the
  route's data. New: series and issues, author and series pages, an archive
  by month, a subscribe page and forms, ad slots and placements behind
  consent, comments from GitHub Discussions, load more, a table of contents
  as a setting (`toc`), and structured data for every blog page, with no page
  described twice. See `docs-wip/blog.md`.

- **For parches** (`6ca9e88`, `766d362`, `8da6bcb`): head links
  (`head.links`), `hooks['astro:build:done']`, `siteSearch` for the
  WebSite's SearchAction, a route's `pageType` for its WebPage node,
  `dev`, a module development tools reach through `parche:registry/dev`, and
  `urls`, where a routed collection's entries are served: an entry a
  `$collection` or `$ref` yields then carries its `href` (`56e67fa`). Apps
  render their pages through core's `parche:Page` and build addresses with
  core's rules (`localizePath`, `pagePath`, `slugify` in
  `@parche/astro/content/pure`).

- **Design-system pages in the playground** (`/design`). The three token layers
  read from the real stylesheets: every colour role with its light and dark
  value and which elements consume it, the contrast of the pairs the elements
  rely on measured live in the browser for the chosen theme and mode, the
  primitive ramps, the six type styles as specimens, radii, shadows and
  measures, and per theme exactly what it overrides. Under the same gate as the
  element pages, and the fixture for reviewing the tokens before they reach
  the public documentation.

### Changed

- **The integration speaks through Astro's logger and follows `srcDir`.**
  What does not stop a build (a duplicate registration, a bad path, a font
  set twice, a token override left out, a translation for a locale Astro
  does not list) is said as `[parche]` through Astro's logger, where the
  rest of a build's messages are. A site that moves Astro's `srcDir` keeps
  its config, its tokens, its images and its icons there: nothing in core
  assumes `src/` any more.

- **A server loads on a cold start only what a request needs.** The apps'
  templates load on demand (`loadTemplate(name)` in
  `parche:registry/templates` replaces the eager `templateMap`), a page
  from a collection reads its widget's prop names from that widget's
  `.props.ts` alone (`parche:registry/widgetProps`) instead of the whole
  catalog, and the theme panel is loaded only when it is on. The page
  route's closure goes from 103 files to 41.

- **A server finds an app's page the way a build does.** A request to an
  address that is not a page asked every app's resolver in turn, each with
  the address itself; a built page had asked the one resolver that listed
  it, with the key and locale it listed. The server now reads the same
  lists once (`routeFor` in `parche:registry/resolvers`) and makes one
  lookup, so the resolver gets what it listed: a post at a dated permalink
  (`/2026/03/my-post`) is found on a server too, where before the date
  segments reached the lookup and it answered 404. An address no resolver
  lists is still offered to each with the address, so a resolver that
  answers beyond its list keeps working. A server build's content check
  also fails on a page and an entry at the same address, as a static build
  did.

- **Related posts are declared.** A post names them in its frontmatter,
  `related: [key, key]`, by the file name that pairs a post with its
  translations, and they show in that order, each in the page's language.
  A post that names none shows the latest posts of its category, then the
  latest of the blog. The
  scoring of every post by shared category, tags, series and author is
  gone: it read the whole blog for every post, and nobody could tell why
  a post was there.

- **The posts are read and indexed once per build or server.** The blog
  looked a post up by reading, filtering and sorting the whole collection,
  and did it four or five times per post (its translations, the related
  posts, the categories' counts, the latest posts on a page), so a post
  cost more the more posts the site had, and a build cost the square. Now
  `parche:utils/entries` reads a collection once and keeps what is derived
  from it, and the blog's index answers by lookup: a post by its address,
  its translations by its key, a locale's posts sorted once, the terms
  counted once; `BlogLatestPosts` and `BlogHighlightedPosts` share the
  sorted list. Measured on a 2,000-post site in two languages: the static
  build 89 → 36 s, a post on a server 12 → 3.5 ms, a missing address 3.6 →
  1.6 ms; at 10,000 post files a post costs 5.8 ms where it cost 30. The
  pages of a collection (`collections`) and a page's translations are
  found the same way: a 5,000-product site builds in 14.7 s instead of
  20.2. In development nothing is kept, so an edit shows at once.

These break content written for 0.7. `node scripts/migrate-nodes.mjs [paths]`
rewrites pages, layouts and views in place (idempotent), and
`node scripts/codemod-tokens.mjs [paths]` renames tokens in CSS and components.

- **Page templates, `wrapper` objects and section backgrounds are gone**
  (`ba3e5b1`): what they did is a layout, a Section node or a node's
  `wrapper`; `layout/Main` becomes `Outlet`.
- **One widget per purpose** (`1aec631`, `749beac`, `4187629`): Hero2 and
  HeroText become Hero layouts, Features2 and Features3 Features layouts,
  Steps2 a Steps layout; Header and Footer drop the `layout/` prefix.
- **One prop vocabulary** (`0fb2dc8`, `b16f0c6`, `b74593a`): `stats`,
  `testimonials`, `members`, `entries`, `projects`, `prices`, `demos` →
  `items`; `callToAction` → `actions`; Features `style` → `layout`; Pricing
  `hasRibbon`/`ribbonTitle` → `recommended`/`badge`; forms post to `endpoint`
  with a `submit` label and one `fields` list.
- **Token names** (`79050cc`): `--color-<family>-<step>` →
  `--ds-ref-color-<family>-<step>`, `--ds-color-<role>` →
  `--ds-sys-color-<role>`, type and font roles under `--ds-sys-type-*` and
  `--ds-sys-font-*`; `tokens.css` and `semantic.css` are replaced by the
  generated layers.
- **Blog widgets** (`54edc60`, `839069b`, `e004882`): BlogList, BlogPostCard,
  BlogPostHeader, CategoryNav, TagCloud, RelatedPosts, SeriesNav,
  ShareButtons, ToBlogLink, AuthorCard and blog/TOC give way to the views and
  the `blog/*` widgets.

### Fixed

- **A missing address answers 404 on a server build.** It redirected to
  `/404`, which the same route caught again (a loop without a 404 page);
  now the site's 404 page renders with a 404 status. Pages are looked up
  before the apps' resolvers, as in a static build.

- **Server builds check their content.** Nothing checked it before: an
  unknown widget or a wrong slot rendered as nothing. Every page is checked
  once at build time, and an issue fails the build.

- **Structured data can't be broken by content**: a `</script>` in a title
  no longer closes the JSON-LD tag.

- **A page and an app's entry at the same address fail the build**, instead
  of one of them winning silently.

- **Options that were ignored now work or say why:** inline `collections`
  and `fonts`; `base` (not supported yet, now an error); page-route options
  or resolvers without `routes.pages`; `ads.txt` once, at the root.

- **Breadcrumbs name the site and real pages.** The trail in the structured
  data started with "Home" in every language and made a crumb of every URL
  segment, the locale included ("Es › Servicios › Diseño"), pointing at
  addresses that were not pages. It now starts with the site's name at the
  language's home, lists the pages above the page (by key, with their
  titles, only those that exist in that language) and ends with the page;
  the home has no trail. A post keeps the blog's own trail (the blog, the
  category, the post), now starting with the site's name too.

- **No site needs an empty `src/middleware.ts` any more.** Parche set
  Astro's i18n routing to `manual`, and Astro then demands a middleware
  file from the site, so every demo, example and template carried an empty
  one. Astro's own routing at its defaults does nothing Parche minds (it
  only refuses a default-locale prefix such as `/en/about`, which Parche
  never serves), so Parche hands it those defaults instead — spelled out,
  because a config an integration hands over gets none filled in. The
  empty files are gone from every site here; delete yours, and drop
  `routing: 'manual'` from `astro.config` if you set it.

- **A post without a locale folder belongs to the site's default locale.**
  The lookup assumed `en`, so on a site whose default locale is another
  language such a post was not found at its address.

- Smaller: the middleware's default locale, `x-default` only when it
  exists, blocked storage no longer breaks the theme switch, references in
  `wrapper.props`, images in any extension case and in the site's `srcDir`,
  deduplicated tones, overridden widgets' wrapper, `themes.available`
  meeting requirements.

- **A featured post's picture overflowed its column** in a narrow container
  and covered the text.

- **A post's text started lower than the columns beside it.** When only the
  table of contents' narrow-screen disclosure sat above the text, its hidden
  block still pushed the text 36px down on wide screens.

- **Links inside `.prose` are underlined.** They relied on colour alone, at
  1.3:1 against the surrounding muted text, which the new contrast page and
  axe's link-in-text-block rule both flagged.

- **Blog pages carry the site's metadata** (`c1ff324`). They built theirs by
  hand: `og:site_name` was empty on every one, a post without a picture had
  no `og:image` even when the site sets a default, and the site's robots and
  Twitter card were ignored. They now resolve it as pages do. A post at a
  prefixed permalink (`/blog/%slug%`, the default) resolves its `@/assets`
  pictures in `og:image` and its structured data, as a root-level one did.

- **Local images are optimised** (`e342e6e`). A `@/assets/…` path became a
  URL before the Image element saw it, so it was treated as remote and
  never went through Astro's image service.

- **No empty prose block at the end of JSON pages** (`69a2412`): the route
  rendered an empty Markdown body for them, 64px of blank space.

- **Blog** (`6ca9e88`, `ac01bc0`, `bddda59`): category pages are built at the
  slug their links use; a post without a description shows its excerpt as
  the lead; related posts link to the listing on both post paths; prefixed
  permalinks emit their hreflang alternates; the feed carries rendered HTML;
  frontmatter dates read as written in every time zone; a paragraph after a
  code block or a list is spaced.

## [0.7.0] — 2026-09-23

The component layer: `@parche/elements`, 45 elements built on the platform with
accessibility as a gate, and `@parche/ui` composed from them with no script of its
own. Breaking three times over — the package names, `primitives` → `elements`,
and the ui internals — see [Migrating](#migrating-from-060).

### Added

- **`@parche/elements`: 45 building blocks, a custom element only where there is
  interactivity** (`d995344`, `6a52656`, `f554106`, `5b98ea8`, `5c595fa`,
  `436a3bc`, `0954e06`). Markup is rendered complete on the server with the
  WAI-ARIA APG roles and states already in place; tokens only; every part carries
  `data-part`, `data-state` and a `parche-<name>-*` class, so a theme restyles an
  element without touching it. Native first: Collapsible and Accordion on
  `<details name>`, Dialog and Sheet on `<dialog>` and invoker commands, Popover,
  Menu and Tooltip on the Popover API with CSS anchor positioning, Switch, Slider
  and the form tier (Field, Label, Input, Textarea, Select, Checkbox, RadioGroup,
  Combobox) on real inputs; Tabs, Carousel, Toast, Toc, Share, Stat, Banner and
  AspectRatio complete the set. Polyfills and the positioning fallback load
  lazily and only where a browser lacks the feature, and every interactive
  element works without JavaScript in a documented form. Widgets import them as
  `parche:elements/<Name>`; a project ejects one by copying its folder and
  redirects the virtual id with `overrides` for widgets it cannot edit. Each
  element folder holds its README, examples and `element.json`, the unit a
  future `parche astro add` copies.

- **The accessibility gate** (`d995344`, `f554106`). `pnpm test` and CI now run,
  after the unit tests and the build-smoke: SSR render tests of every element,
  axe WCAG 2.1 AA over every page of the elements playground in Chromium, Firefox
  and WebKit, in light and dark, plus a no-JavaScript pass and a reduced-motion
  pass with per-element keyboard specs, and an SSR smoke that starts the Node
  example and `wrangler dev` for the Cloudflare one and renders every element per
  request. An element that does not pass does not land; the gate found six real
  defects on the way.

- **Design tokens for state, focus and overlays** (`d995344`). `success`,
  `warning` and `danger` with their `on-*` and `*-soft` pairs, `on-surface`,
  `surface-hover`, `ring` and `overlay`, bridged to Tailwind as `bg-danger-soft`,
  `outline-ring` and the rest, and `highlight` bridged at last. The dark palette
  was corrected where the gate measured it short: muted text, primary on
  primary-soft, highlight.

- **An elements playground** (`d995344`, `0954e06`, `ce406a3`). `pnpm --filter
  @parche/elements playground`: one page per element laid out as documentation —
  summary and when to use it from the element's README, every example as a
  Preview / Code pair, anatomy, keyboard, no-JS behaviour, props and tokens from
  the `parche:registry/elements` catalog — in a fixed palette; the theme controls
  change what is inside each Preview. It is the fixture the gate runs against.
  Official documentation is a later step, on parche.dev.

- **An SSR example on Cloudflare** (`410f761`, `f2f72d2`). `examples/ssr-cloudflare`
  beside `examples/ssr-node`, each the smallest thing that proves the adapter:
  one JSON page, one `.astro` page that imports a widget from the virtual module,
  and `/elements`, which renders every element for the SSR smoke.

- **`Testimonials` and `Brands` take `layout: "carousel"`** (`5b98ea8`), on the
  Carousel element; the grid and the wrapped row stay the defaults.

### Changed

- **The site config is JSON, at `src/parche.config.json`** (`366bd5d`). Shipping it
  as `.ts` was the mistake. The site identity lives in its own file for exactly one
  reason — so a git-based CMS can edit it, which is why nothing in it may be a
  function, an import or a class instance — and a CMS cannot edit TypeScript. It
  was data dressed as code. It did not work either: core reads the file during
  `astro:config:setup`, and for anyone who installed Parche from npm the import
  threw and was swallowed, so `site` never reached Astro and the failure surfaced
  three steps away as a broken RSS feed. A `.ts` config is refused now, with the
  file named, as is a copy in both `src/` and the project root. The schema still
  validates.

- **`@parche/core` is `@parche/astro`, and `@parche/blog` is `@parche/astro-blog`**
  (`3d2d86c`). Breaking. The names say what they are: the Astro integration and
  the blog for it, leaving room for other hosts. The old packages are unpublished;
  see [Migrating](#migrating-from-060).

- **`primitives` is `elements`, everywhere** (`d995344`). Breaking. The manifest
  key, `requires.elements`, the `parche:elements/*` virtual path, the
  `elements:<Name>` override key and the `parche:registry/elements` catalog. One
  word for one concept, chosen because the things are HTML elements, upgraded.

- **`@parche/ui` is built on the elements and ships no script of its own**
  (`6a52656`, `f554106`, `5b98ea8`, `436a3bc`, `2b67272`). Breaking for anyone
  who imported its internals. The Header's navigation is Menus and a Popover, its
  mobile menu a Sheet, its announcement a Banner and its scroll shadow a
  scroll-driven animation; FAQs is an Accordion, Stats are Stat elements, Contact
  and the contact template use Input, Textarea and Checkbox, the blog's table of
  contents and share buttons are Toc and Share, and core's LocaleSwitcher,
  ThemeSelector and ThemePanel are Menus and a Popover. `components/Action.astro`,
  `LegacyHeadline.astro`, `LegacyWrapper.astro`, `scripts/parche-counter.ts` and
  the hand-rolled dropdown, menu and share scripts are gone; a unit test refuses
  any `<script>` in the ui parche. The client budget of a site with the Header
  grows by the elements it carries, about 11 KB over Astro's router.

### Fixed

- **`overrides` now counts toward a parche's `requires`** (`1fd6c71`). A component
  registered through `overrides` resolves the same virtual module a parche would
  provide, but the requirement check only counted what parches contributed — and
  ran before overrides were applied. So a project could not satisfy a contract
  with its own components: registering `Container`, `Section` and the eight
  `blog/*` widgets `@parche/astro-blog` requires still failed the build claiming they
  were missing, and the only way through was to wrap them in a `ParcheManifest` —
  a distribution format — purely to pass a check. Overrides are still applied
  last, so precedence is unchanged; only the tallying moves earlier.

- **`robots.txt` no longer advertises a sitemap that does not exist**
  (`94dd1d2`). The `Sitemap: <site>/sitemap-index.xml` line was written whenever
  `site` was set, with no check that anything produced the file — a project
  without `@astrojs/sitemap` sent search engines to a 404. Core now reads the
  resolved integration list in `astro:config:setup` and emits the line only when
  the integration is configured. `buildAutoGeneratedRobots` is exported, and
  `robots.txt` gets its first unit tests.

- **An author's `slug` no longer overwrites its entry id** (`b953c29`). `slug` is
  reserved: Astro's glob loader takes a top-level one from an entry's data and
  uses it as that entry's id. `authorSchema` declared it as an ordinary optional
  field, so an author at `authors/en/jane.json` with `"slug": "jane"` got the id
  `jane` instead of `en/jane`, and the locale-prefixed lookup missed — while an
  author *without* one tripped the getter Astro installs on absent `slug`
  properties, which logs at ERROR. Every project in the repo hit one side or the
  other. The field is now `urlSlug`, matching `postSchema`, which had avoided the
  reservation all along; that inconsistency is what hid this.

- **What a pass by hand over the playground found, on top of the gate**
  (`eec8784`, `fbd13f2`). A part is scoped to its nearest `parche-*` element, so
  a Tabs no longer hides a Dialog's panel inside its own; hidden tab panels leave
  the tab order; a carousel with several slides per view has only the reachable
  positions, no longer widens the whole page, and shows no controls when
  everything fits; the combobox list sits under its input; popovers opened by
  hover or from script anchor to their trigger, and a click on the trigger of a
  hover-opened menu keeps it open.

### Removed

- **The injected `404` route, and `routes.notFoundRoute`** (`a726ef9`). Injecting
  it was the mistake. Astro has a way to do this — a file at `src/pages/404.astro`
  — and a framework built on Astro uses Astro's way instead of growing its own.
  Core claims to own no routing and no design decisions; this owned both, and the
  damage followed from that rather than the other way round. A static route cannot
  be defined twice, so a project doing it the documented way collided with us on
  every build. The page core shipped was hardcoded Tailwind and hardcoded English
  that no translation mechanism could reach, so a bilingual site served "Page not
  found" in both languages, and core could not fix that without inventing a labels
  system that is not its job either. `routes.notFoundRoute` only ever pointed the
  injection elsewhere and had no users; the `routes` schema is `.strict()`, so
  passing it now fails the build naming the key. A site with no 404 of its own gets
  the host's, which is what a plain Astro project does.

### Migrating from 0.6.0

**Packages.** `@parche/core` is `@parche/astro` and `@parche/blog` is
`@parche/astro-blog`: change the dependency and every import, including
`@parche/astro/types`. The old names are unpublished.

**`primitives` → `elements`.** In a manifest, `primitives:` is `elements:` and
`requires.primitives` is `requires.elements`; in a widget, `parche:primitives/X`
is `parche:elements/X`; in `overrides`, the key `primitives:X` is `elements:X`.

**`@parche/ui` internals.** `components/Action.astro` and `LegacyHeadline.astro`
no longer exist: use `parche:elements/Button` (`tertiary` is `secondary`) and
`parche:elements/Heading`. The ui widgets keep their schemas, so JSON pages need
no change; `Testimonials` and `Brands` gain an optional `layout`.

## [0.6.0] — 2026-08-23

A template is a working project now, not a stencil. Only `@parche/cli` and
`create-parche` changed, but the change is **breaking for anyone who wrote a
template following the previous convention** — see
[Migrating](#migrating-from-051).

Most of this cycle's work is not in this release at all: the templates
themselves are private, so their fixes reach people through GitHub rather than
npm.

### Changed

- **Templates are adapted by renaming, not by substitution** (`66c4714`).
  `{{placeholders}}` and `parche.template.json` are gone. A template ships real
  values and builds as it stands, which is what makes the official Astro path
  work — `npm create astro@latest -- --template <repo>/templates/<name>` copies
  it verbatim and produces a running site. `parche astro new` does the same and
  then renames it, and if the rename fails the project is still usable.

  The rename replaces the template's own identity, read from its package.json:
  `name` is the old slug and its title-cased form the old display name. Matching
  structure instead — a regex for `name:\s*'…'` — would have to guess where in a
  config the site name lives and would break whenever that shape moved.

### Fixed

- **Templates that could not be installed anywhere but here** (`6c0ccd2`).
  `portfolio` and `saas-landing` declared `workspace:*` and `catalog:`, protocols
  only pnpm understands inside a workspace, so `npm install` failed with
  EUNSUPPORTEDPROTOCOL before reading a file. Not published — a template is
  private — but it is what a user downloading one hits.

### Migrating from 0.5.1

Only affects you if you maintain your own Parche template.

**Drop `parche.template.json` and the `{{placeholders}}`.** Put real values in
their place: the site name in `brand.name`, the package name in `package.json`.
The CLI renames a project by replacing those two strings, so the only convention
left is that **`package.json` `name` is the slug of `brand.name`** — `my-template`
and `My Template`.

Content should not repeat the site's name. It lives in `brand.name` and the
header reads it from there; duplicating it into a page is what made substitution
look necessary in the first place.

## [0.5.1] — 2026-08-23

Found by installing 0.5.0 from npm as a new user would, which is the one thing the
test suite cannot do for itself.

### Fixed

- **The scaffolder reported success when nothing had been scaffolded** (`5ce6c99`).
  Getting the template name wrong — easy, since the first positional argument is the
  template and the second the directory — left an empty project and still printed
  "Done! Happy building with Parche.". giget resolves the repository rather than the
  subdirectory, so a path that does not exist downloads the tarball, extracts nothing
  and reports success; `npm install` then failed for the missing `package.json` and
  the run still ended green. The fetch now checks the target actually received files,
  and when every source fails it lists what it tried and reminds the reader that the
  template comes first.
- **"Next steps" suggested `npm dev`** (`5ce6c99`), which is not a command. It uses
  `npm run dev` for npm and the bare form for the others, and puts the install step
  back in the list when that was what failed.
- **A failed install still ended in "Done!"** (`5ce6c99`). It now says one step is
  left.

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

**3. Remove `fonts: parcheFonts` and its import.** `@parche/astro/fonts` no longer
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
  `node:test` + `tsx`: **51 unit tests** across `@parche/astro` (registry/requires-V2,
  config/extends/presets, vite-plugin generators), `@parche/cli` (slug/titleCase,
  prompt defaults, placeholder replacement, binary + `node_modules` skip) and
  `@parche/astro-blog` (post helpers, reading time, related-posts scoring); a
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
of `@parche/astro` and still accepts the `{ parches, config, routes }` form; 0.4.0 only
adds the option of passing `site` inline in the same object.

## [0.3.0-alpha.0] — 2026-08-21

First publish to npm (`@parche/astro`, `@parche/elements`, `@parche/ui`,
`@parche/astro-blog`, `@parche/themes`, `@parche/cli`, `create-parche`). Everything below
landed in the repo's first day and became this release.

### Foundation (`a2e25f9` → `01b778f`)

- **Monorepo bootstrap** (`a2e25f9`) — see
  [Before the first commit](#before-the-first-commit) for what arrived in it.
- **Data-driven fonts** (`036112b`) — `BaseLayout` fonts declared as config, not code.
- **Tailwind `@source` paths fixed** in `base.css` (`a693a13`).
- **i18n example** (`d494454`), later extended with a Chinese locale (`64b9e36`).
- **Feature examples + `@parche/astro/styles` export** (`24c073c`).
- **`dynamic-widgets` renamed to `import-widget`** (`01b778f`).

### Modernization (`20aeff8` → `291abd7`)

- **Astro 7 + Tailwind 4 + Zod 4 upgrade, and a central pnpm catalog** (`20aeff8`) for
  shared dependency versions.
- **`satteri` override dropped** (`befee16`) — the registry cooldown was the real cause.
- **React example became a real Parche widget, plus a shadcn example** (`291abd7`).

### Parches architecture (`12bbbb0` → `f5acb6c`)

- **`parches/` layout** (`12bbbb0`): plugins moved out of the host; `@parche/astro`
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
`parche:*` module graph at build: `parche:elements/*`, `parche:widgets/*`,
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

[Unreleased]: https://github.com/withparche/parche/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/withparche/parche/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/withparche/parche/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/withparche/parche/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/withparche/parche/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/withparche/parche/compare/v0.3.0-alpha.0...v0.4.0
[0.3.0-alpha.0]: https://github.com/withparche/parche/releases/tag/v0.3.0-alpha.0
