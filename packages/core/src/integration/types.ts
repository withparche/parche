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

export interface ParcheApp {
  /** Unique identifier (e.g. 'blog') */
  name: string;
  /** Widgets to register: virtual ID suffix → absolute path */
  widgets?: Record<string, string>;
  /** Templates to register: virtual ID suffix → absolute path */
  templates?: Record<string, string>;
  /** Routes to inject */
  routes?: Array<{ pattern: string; entrypoint: string }>;
  /** App config exposed via virtual module parche:app/{name} */
  config?: Record<string, unknown>;
  /** Module IDs that use named exports (export *) instead of default */
  namedExportModules?: string[];
  /**
   * Content resolver for root-level routes.
   * When an app's routes would conflict with the catch-all (e.g. /%slug%),
   * the app registers a resolver instead. The catch-all calls it before
   * trying to resolve as a page.
   *
   * The entrypoint must export:
   *   resolve(slug, locale, opts) → { template, collection, entryId, props, metadata } | null
   *   getPaths(locales, defaultLocale, opts) → Array<{ params, props }>
   */
  resolver?: {
    entrypoint: string;
  };
}

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
   * Path to a CSS file that gets imported by injected routes.
   * Use this to load theme CSS files and any project-wide styles.
   * Default: loads all built-in themes.
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
  /** Primitives: foundational building blocks, registered as parche:primitives/* (name → path) */
  primitives?: Record<string, string>;
  /** UI library providing widgets (registered as parche:widgets/*) */
  ui?: UIRegistry;
  /** Pluggable apps (e.g. blog) — each app can register widgets, templates, routes, and config */
  apps?: ParcheApp[];
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
  /** Registered apps */
  apps: ParcheApp[];
  /** App resolvers — modules that export resolve() and getPaths() */
  resolvers: Array<{ appName: string; entrypoint: string }>;
}
