export interface UIRegistry {
  atoms: Record<string, string>;
  widgets: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Widget props system (Zod v4 + meta)
// ---------------------------------------------------------------------------

/** Field-level metadata passed via z.string().meta({ ... }) */
export interface FieldMeta {
  /** Override the auto-generated label */
  label?: string;
  /** Help text shown below the field */
  help?: string;
  /** Placeholder for text/textarea inputs */
  placeholder?: string;
  /** Force a specific input type: 'textarea', 'icon', 'color', 'url' */
  input?: string;
  /**
   * The text accepts inline Markdown (**strong**, *em*, `code`, [link](url),
   * ==highlight==, a newline as a break): the builder can offer a formatting
   * bar and show the rendered text.
   */
  markdown?: 'inline';
}

/** Group definition for organising fields in the builder form */
export interface FieldGroup {
  key: string;
  label: string;
  fields: string[];
}

/** What a widget's slot accepts. Declared in the widget's `.props.ts`; the
 *  build checks slot contents against it, the builder offers it as a drop zone. */
export interface SlotMeta {
  label?: string;
  help?: string;
  /** Widget names allowed here; every widget when omitted. */
  allow?: string[];
  min?: number;
  max?: number;
}

/** Widget-level metadata — classification, slots, builder UI config */
export interface WidgetMeta {
  widget: {
    label: string;
    description?: string;
    category?: string;
    icon?: string;
    thumbnail?: string;
    tags?: string[];
    /** `false` when the widget renders full-bleed and is left bare in a list
     *  that wraps its items (a Hero, a banner). */
    wrapper?: false;
    /** `true` for chrome (Header, Footer): in the catalog, so the validator
     *  knows it, but not offered in the builder palette. */
    hidden?: true;
  };
  /** The slots this widget renders (`<slot name="media">`), by name. `default`
   *  is the unnamed slot. A widget without this entry is a leaf. */
  slots?: Record<string, SlotMeta>;
  ui?: {
    groups?: FieldGroup[];
  };
}

// ---------------------------------------------------------------------------
// Element props system (Zod v4 + meta) — parallel to widgets, sharing FieldMeta
// ---------------------------------------------------------------------------

/** One part of an element's anatomy: what the .astro renders for it. */
export interface ElementPart {
  /** `data-part` value; also the class-hook suffix `parche-<name>-<part>`. */
  name: string;
  /** Element rendered by default: 'button' | 'div' | 'dialog' | 'parche-tabs' … */
  element: string;
  /** ARIA role rendered statically on the server, if any. */
  role?: string;
  /** `data-state` values this part can take (docs + stylers). */
  states?: string[];
  description?: string;
}

/**
 * Element-level metadata. The facts a doc page, the builder and `check` need:
 * anatomy, tokens consumed, keyboard map, no-JS behaviour, the custom element.
 */
export interface ElementMeta {
  element: {
    label: string;
    description: string;
    /** WAI-ARIA APG pattern this follows, e.g. { pattern: 'tabs', url } */
    a11y?: { pattern: string; url?: string };
    /** Design tokens consumed. A bare name is a sys token ('color-surface' → --ds-sys-color-surface);
     *  other layers carry their prefix ('ref-radius-md', 'comp-button-radius', 'conf-motion-base'). */
    tokens: string[];
    /** Custom element tag + client entry — interactive elements only. `entry` is relative to the folder. */
    tag?: { name: `parche-${string}`; entry: string };
    /** Key → behaviour. Required when `tag` is set. */
    keyboard?: Record<string, string>;
    /** What the server-rendered markup does with JS disabled. Required when `tag` is set. */
    noJs?: string;
    /** Compound anatomy; single-part elements list exactly one part. */
    parts: ElementPart[];
    tags?: string[];
  };
  ui?: {
    groups?: FieldGroup[];
  };
}

/**
 * An element registered by a parche. A bare string is the .astro path
 * (single part). The object form registers a folder element: `entry` is the
 * module the virtual id re-exports (an `.astro` with a default export, or an
 * `index.ts` with named parts), `parts` gives each part its own virtual id
 * (`parche:elements/<Name>/<Part>`), `props` is the `.props.ts` (defaults to
 * `<dir>/<kebab>.props.ts`) and `style` an optional CSS file added to the
 * styles entry.
 */
export interface ElementEntry {
  entry: string;
  parts?: Record<string, string>;
  props?: string;
  style?: string;
}

/** A resolved element as the registry sees it. */
export interface ResolvedElement {
  name: string;
  /** Parche that registered it (or 'override'). */
  from: string;
  /** Absolute path of the entry module. */
  entry: string;
  /** Absolute folder containing the element. */
  dir: string;
  /** Part name → absolute .astro path. */
  parts: Record<string, string>;
  /** Absolute path to the .props.ts, if it exists. */
  props?: string;
  style?: string;
  /** True when `entry` is not an .astro (named parts via index.ts). */
  compound: boolean;
}

/** A required element: a bare name checks presence; the object form also
 *  asserts the provider exposes the named parts. */
export type ElementRequirement = string | { name: string; parts?: string[] };

/** A required widget: a bare name checks presence; the object form also asserts
 *  the provider exposes the named props (structural, checked where schemas exist). */
export type WidgetRequirement = string | { name: string; props?: string[] };

/** A required peer parche, optionally constrained to a version range
 *  (exact `1.2.3`, caret `^1.2.0`, tilde `~1.2.0`, or `>=1.2.0`; `*`/omitted = any). */
export interface ParcheRequirement {
  name: string;
  version?: string;
}

/**
 * Capabilities a parche needs from the system, validated at setup (V2). Presence
 * of every named capability is checked and fails the build with attribution;
 * peer-parche versions are range-checked; widget prop requirements are checked
 * structurally where the schemas are available.
 */
export interface ParcheRequires {
  /** Elements that must exist — bare name, or { name, parts } for a structural check */
  elements?: ElementRequirement[];
  /** Widgets that must exist — bare name, or { name, props } for a structural check */
  widgets?: WidgetRequirement[];
  /** Template names that must exist (parche:templates/{name}) */
  templates?: string[];
  /** Theme values that must be present in the switcher */
  themes?: string[];
  /** Peer parches that must be imported, optionally within a version range */
  parches?: ParcheRequirement[];
}

/**
 * A parche (plugin). Contributes capabilities to the Parche host and declares
 * what it requires. Element-packs, widget-packs and apps are all parches —
 * they differ only in what they provide.
 */
export interface ParcheManifest {
  /** Unique identifier (e.g. 'elements', 'ui', 'blog') */
  name: string;
  /** Semver of this parche, used to satisfy peers' `requires.parches` ranges. */
  version?: string;
  /** Elements to register: name → absolute .astro path, or a folder entry (parche:elements/{name}) */
  elements?: Record<string, string | ElementEntry>;
  /** Widgets to register: virtual ID suffix → absolute path (parche:widgets/{name}) */
  widgets?: Record<string, string>;
  /**
   * The widget a list's wrapper uses when it names none (`Section`): a widget
   * with a default slot, registered in `widgets` by this or another parche.
   * It wraps nothing by itself: a layout's Outlet or a page declares
   * `wrapper: {}` to wrap its items (content/wrapper.ts). The last parche to
   * declare one wins.
   */
  wrapper?: string;
  /**
   * Section tones this parche adds: names the wrapper's `tone` prop accepts,
   * each backed by a `[data-tone="<name>"]` rule in this parche's styles.
   * Core ships `default`, `muted`, `dark` and `primary`.
   */
  tones?: Array<{ name: string; label: string }>;
  /** Templates to register: virtual ID suffix → absolute path */
  templates?: Record<string, string>;
  /**
   * CSS files this parche contributes (absolute paths). Aggregated into the
   * styles entry so a site bundles only the CSS of the parches it imports.
   * A theme is just a parche that contributes its override CSS here.
   */
  styles?: string[];
  /**
   * Theme entries this parche adds to the switcher: { label, value }. The
   * `value` is the `data-theme` attribute the theme's CSS is scoped to.
   */
  themes?: Array<{ label: string; value: string }>;
  /**
   * Fonts this parche asks the site to load (typically a theme's typeface).
   * Deduped by `cssVariable`; the site config wins.
   */
  fonts?: import('../config/font-variables.js').ParcheFontDef[];
  /**
   * `<link>` tags this parche adds to every page's head: a blog's feed
   * (`{ rel: 'alternate', type: 'application/rss+xml', href: '/rss.xml' }`),
   * a web manifest. Rendered in declaration order; the same rel and href twice
   * is kept once.
   */
  head?: { links?: HeadLink[] };
  /**
   * The site's search address, with `{search_term_string}` where the query
   * goes ('/search?q={search_term_string}'): the WebSite structured data
   * advertises it as a SearchAction. The last parche that declares one wins.
   */
  siteSearch?: string;
  /**
   * Work a parche does at a point of the build, with what Astro gives that
   * hook. `astro:build:done` runs after core's own (robots.txt), in parche
   * order: a blog builds its search index over the built pages there.
   */
  hooks?: {
    'astro:build:done'?: (ctx: { dir: URL; logger: { info(msg: string): void; warn(msg: string): void } }) => void | Promise<void>;
  };
  /**
   * Absolute globs of this parche's own component files, so Tailwind scans them
   * and generates the utility classes they use. A parche must contribute these
   * for its classes to survive being installed from npm (relative `@source`
   * paths can't reach sibling packages once published). Typically:
   *   content: [path.resolve(dir, '**\/*.astro')]
   */
  content?: string[];
  /** Routes to inject */
  routes?: Array<{ pattern: string; entrypoint: string }>;
  /** App config exposed via virtual module parche:app/{name} */
  config?: Record<string, unknown>;
  /** Module IDs that use named exports (export *) instead of default */
  namedExportModules?: string[];
  /**
   * Content resolver for root-level routes.
   * When routes would conflict with the catch-all (e.g. /%slug%), the parche
   * registers a resolver instead; the catch-all calls it before treating a
   * slug as a page. The entrypoint must export:
   *   resolve(slug, locale, opts) → { template, collection, entryId, props, metadata } | null
   *   getPaths(locales, defaultLocale, opts) → Array<{ params, props }>
   */
  resolver?: {
    entrypoint: string;
  };
  /** What this parche needs the system to provide. */
  requires?: ParcheRequires;
}

/** @deprecated Use ParcheManifest. Kept as an alias for existing app factories. */
export type ParcheApp = ParcheManifest;

export interface ParcheI18nConfig {
  /** Supported locales (e.g. ['en', 'es']) */
  locales: string[];
  /** Default locale — served without URL prefix (e.g. 'en') */
  defaultLocale: string;
}

export interface ParcheRoutesConfig {
  /**
   * Enable the built-in catch-all page route ([...slug].astro).
   * This route renders pages from your JSON content collections using DynamicRenderer.
   * Must be explicitly set to true to enable.
   */
  pages: boolean;
  /** Additional templates: { templateName: './src/templates/MyTemplate.astro' } */
  templates?: Record<string, string>;
  /** Additional layouts: { layoutName: './src/layouts/MyLayout.astro' } */
  layouts?: Record<string, string>;
  /** Override the injected catch-all route entrypoint */
  catchAllRoute?: string;
  /** Override the injected middleware entrypoint */
  middleware?: string;
}

export interface ParcheStylesConfig {
  /**
   * Path to an extra CSS file imported by injected routes, on top of any CSS
   * the parches contribute. Use it for project-wide styles.
   * Default: nothing beyond what the imported parches (e.g. themes) provide.
   */
  entry?: string;
}

export interface ParcheThemesConfig {
  /** Available themes for ThemeSelector. Each entry: { label, value } */
  available?: Array<{ label: string; value: string }>;
  /** Show the floating theme panel. Default: true when multiple themes are available */
  showPanel?: boolean;
  /**
   * Theme applied on first paint, as the `data-theme` attribute rendered on
   * `<html>` by the server. Without it a first-time visitor always sees the base
   * look, because the switcher only reads localStorage on the client. A visitor's
   * own stored choice still wins. Default: none (base look).
   */
  default?: string;
}

/**
 * How images are optimised, read by the Image element. Every image takes the
 * first path that applies:
 * 1. local (`src/assets`): Astro's image service, responsive;
 * 2. remote on an image CDN that transforms by URL (detected by unpic, or
 *    named in `cdn.providers`): a srcset of CDN URLs, nothing at build time;
 * 3. remote and allowed by Astro's `image.domains` / `image.remotePatterns`:
 *    downloaded and optimised by Astro at build time;
 * 4. anything else: a plain <img> with its dimensions, and a warning.
 */
export interface ParcheImagesConfig {
  /**
   * Which paths remote images may take. 'auto': CDN, then Astro, then as is.
   * 'cdn': CDN or as is. 'astro': Astro or as is. 'none': always as is.
   * Default: 'auto'.
   */
  remote?: 'auto' | 'cdn' | 'astro' | 'none';
  cdn?: {
    /**
     * Only these hosts take the CDN path (exact, or '*.' / '**.' for
     * subdomains). Default: any host unpic recognises or `providers` names.
     */
    hosts?: string[];
    /** A host that is a known CDN under your own domain: host → provider ('imgix', 'cloudinary'…). */
    providers?: Record<string, string>;
    /** A provider for remote images unpic does not recognise, e.g. 'wsrv' (a free image proxy). Default: none. */
    fallback?: string;
  };
  /**
   * The default responsive layout: 'constrained' (up to its width), 'full-width'
   * or 'fixed'. Also Astro's `image.layout` when astro.config sets none, so
   * Markdown images get a srcset too. Default: 'constrained'.
   */
  layout?: 'constrained' | 'full-width' | 'fixed';
  /** Widths a srcset may use. Default: Astro's (image.breakpoints). */
  breakpoints?: number[];
  /** Warn at build about each remote image that goes out unoptimised. Default: true. */
  warnUnoptimized?: boolean;
}

export interface ParcheSeoConfig {
  /** Allow AI crawlers (GPTBot, CCBot, anthropic-ai, ClaudeBot) in robots.txt. Default: true */
  allowAICrawlers?: boolean;
}

export interface ParcheUserConfig {
  /**
   * Inherit from one or more shared presets (a company base, a monorepo root).
   * Presets are deep-merged left-to-right, then this config is merged on top —
   * this config wins on every leaf. `parches` are the exception: they are
   * concatenated (preset parches first, so a local parche can override them,
   * since later-in-the-array wins). Build presets with `parchePreset(...)`.
   */
  extends?: ParchePreset | ParchePreset[];
  /** Override any component using namespaced keys: 'widgets:hero:Hero', 'elements:Button', etc.
   *  Values are paths to .astro component files. */
  overrides?: Record<string, string>;
  /** Path to the site config file (default: './src/parche.config.json'). JSON only. */
  config?: string;
  /** Parches (plugins): primitive-packs, widget-packs and apps. Order = precedence. */
  parches?: ParcheManifest[];
  /** Route injection config */
  routes?: ParcheRoutesConfig;
  /** Theme config */
  themes?: ParcheThemesConfig;
  /** Styles config */
  styles?: ParcheStylesConfig;
  /** SEO build-time config (robots.txt generation, etc.) */
  seo?: ParcheSeoConfig;
  /** Image optimisation: local, image CDNs, Astro for remote, or as is. */
  images?: ParcheImagesConfig;
}

/**
 * A reusable, partial Parche config that others `extends`. Every field is
 * optional; whatever it sets becomes the base an extending config overrides.
 * (`extends` itself doesn't nest — resolve a chain by extending the preset that
 * already extends its own base.)
 */
export type ParchePreset = Omit<ParcheUserConfig, 'extends'>;

export interface ResolvedRegistry {
  /** The site's own token values (`src/parche.tokens.json`), which may not exist yet. */
  tokenOverridesPath: string;
  /** Map of virtual module ID → absolute file path */
  modules: Record<string, string>;
  /** Set of virtual IDs that use named exports (export *) instead of default */
  namedExportModules: Set<string>;
  /** The widget a list's wrapper uses when it names none, or null. */
  wrapper: string | null;
  /** Section tones: core's four plus every parche's. */
  tones: Array<{ name: string; label: string }>;
  /** Widgets whose `.props.ts` meta says `wrapper: false` (full-bleed roots). */
  unwrapped: string[];
  /** Structural widget requirements: prop names a requiring parche expects the
   *  provider to expose. Checked against the generated schemas (builder-time). */
  widgetPropRequirements: Array<{ from: string; name: string; props: string[] }>;
  /** Resolved elements by name — folder, parts, props, style. */
  elements: Record<string, ResolvedElement>;
  /** Virtual ids replaced through `overrides`: original path → override path. */
  overridden: Record<string, { original?: string; override: string }>;
  /** Inline site config (parche({ site })); when set, the plugin serves it as
   *  parche:config instead of re-exporting a user config file. */
  inlineSiteConfig?: import('../types/config.js').SiteConfig;
  /** Resolved i18n config */
  i18n: ParcheI18nConfig;
  /** Resolved themes config */
  themes: Array<{ label: string; value: string }>;
  /** Theme rendered server-side on <html data-theme>, before any client script. */
  defaultTheme?: string;
  /** Resolved font set: core's base, plus each parche's, plus the site's. */
  fonts: import('../config/font-variables.js').ParcheFontDef[];
  /** `<link>` tags the parches add to every page's head. */
  headLinks: HeadLink[];
  /** The site's search address for the WebSite SearchAction, if a parche has one. */
  siteSearch?: string;
  /** The parches' build-done hooks, in parche order, with the parche's name. */
  buildDone: { name: string; run: NonNullable<NonNullable<ParcheManifest['hooks']>['astro:build:done']> }[];
  /** Whether to show the floating theme panel */
  showPanel: boolean;
  /** Absolute CSS paths to import via parche:config/styles (parche-contributed + user entry) */
  styleEntries: string[];
  /** Absolute globs of parche component files for Tailwind to scan (@source) */
  contentGlobs: string[];
  /** Registered apps */
  apps: ParcheApp[];
  /** App resolvers — modules that export resolve() and getPaths() */
  resolvers: Array<{ appName: string; entrypoint: string }>;
}

/** A `<link>` a parche adds to every page's head. */
export interface HeadLink {
  rel: string;
  href: string;
  type?: string;
  title?: string;
  /** Adds `hreflang`, for a link that only applies to one language. */
  hreflang?: string;
}
