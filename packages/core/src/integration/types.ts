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
}

/** Group definition for organising fields in the builder form */
export interface FieldGroup {
  key: string;
  label: string;
  fields: string[];
}

/** Widget-level metadata — classification + builder UI config */
export interface WidgetMeta {
  widget: {
    label: string;
    description?: string;
    category?: string;
    icon?: string;
    thumbnail?: string;
    tags?: string[];
  };
  ui?: {
    groups?: FieldGroup[];
  };
}

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
  /** Primitive names that must exist (parche:primitives/{name}) */
  primitives?: string[];
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
 * what it requires. Primitive-packs, widget-packs and apps are all parches —
 * they differ only in what they provide.
 */
export interface ParcheManifest {
  /** Unique identifier (e.g. 'primitives', 'ui', 'blog') */
  name: string;
  /** Semver of this parche, used to satisfy peers' `requires.parches` ranges. */
  version?: string;
  /** Primitives to register: name → absolute path (parche:primitives/{name}) */
  primitives?: Record<string, string>;
  /** Widgets to register: virtual ID suffix → absolute path (parche:widgets/{name}) */
  widgets?: Record<string, string>;
  /**
   * Widget keys (as registered in `widgets`) that render full-bleed and manage
   * their own padding — DynamicRenderer skips the default SectionWrapper for them
   * unless a section sets `wrapper` explicitly. Declared here (statically) rather
   * than in each widget's `.props.ts` so the render path never imports schemas.
   * Core no longer hardcodes any widget names.
   */
  fullBleed?: string[];
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
  /** Override the injected 404 page entrypoint */
  notFoundRoute?: string;
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
  /** Override any component using namespaced keys: 'widgets:hero:Hero', 'primitives:Button', etc.
   *  Values are paths to .astro component files. */
  overrides?: Record<string, string>;
  /** Path to user config file (default: './parche.config.ts', at project root) */
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
}

/**
 * A reusable, partial Parche config that others `extends`. Every field is
 * optional; whatever it sets becomes the base an extending config overrides.
 * (`extends` itself doesn't nest — resolve a chain by extending the preset that
 * already extends its own base.)
 */
export type ParchePreset = Omit<ParcheUserConfig, 'extends'>;

export interface ResolvedRegistry {
  /** Map of virtual module ID → absolute file path */
  modules: Record<string, string>;
  /** Set of virtual IDs that use named exports (export *) instead of default */
  namedExportModules: Set<string>;
  /** Widget keys that render full-bleed (skip the default SectionWrapper) */
  fullBleedWidgets: string[];
  /** Structural widget requirements: prop names a requiring parche expects the
   *  provider to expose. Checked against the generated schemas (builder-time). */
  widgetPropRequirements: Array<{ from: string; name: string; props: string[] }>;
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
