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

/** Capabilities a parche needs from the system (validated at setup). */
export interface ParcheRequires {
  /** Primitive names that must exist (parche:primitives/{name}) */
  primitives?: string[];
  /** Widget names that must exist (parche:widgets/{name}) */
  widgets?: string[];
}

/**
 * A parche (plugin). Contributes capabilities to the Parche host and declares
 * what it requires. Primitive-packs, widget-packs and apps are all parches —
 * they differ only in what they provide.
 */
export interface ParcheManifest {
  /** Unique identifier (e.g. 'primitives', 'ui', 'blog') */
  name: string;
  /** Primitives to register: name → absolute path (parche:primitives/{name}) */
  primitives?: Record<string, string>;
  /** Widgets to register: virtual ID suffix → absolute path (parche:widgets/{name}) */
  widgets?: Record<string, string>;
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
}

export interface ParcheSeoConfig {
  /** Allow AI crawlers (GPTBot, CCBot, anthropic-ai, ClaudeBot) in robots.txt. Default: true */
  allowAICrawlers?: boolean;
}

export interface ParcheUserConfig {
  /** Override any component using namespaced keys: 'widgets:hero:Hero', 'primitives:Button', etc.
   *  Values are paths to .astro component files. */
  overrides?: Record<string, string>;
  /** Path to user config file (default: './src/config.ts') */
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

export interface ResolvedRegistry {
  /** Map of virtual module ID → absolute file path */
  modules: Record<string, string>;
  /** Set of virtual IDs that use named exports (export *) instead of default */
  namedExportModules: Set<string>;
  /** Resolved i18n config */
  i18n: ParcheI18nConfig;
  /** Resolved themes config */
  themes: Array<{ label: string; value: string }>;
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
