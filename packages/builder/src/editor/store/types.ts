export interface CatalogWidget {
  label: string;
  category?: string;
  description?: string;
  icon?: string;
  hidden?: boolean;
  wrapper?: boolean;
  slots?: Record<string, { label?: string; help?: string; allow?: string[]; min?: number; max?: number }>;
  ui?: { groups?: { key: string; label: string; fields: string[] }[] };
  schema: unknown;
}

/** A pattern (content/patterns): no slots; its props are a JSON Schema; `roots` is what it stands for in a slot. */
export interface CatalogPattern {
  entry: string;
  label: string;
  description?: string;
  category?: string;
  icon?: string;
  schema: unknown;
  tree: import('@parche/astro/content/pure').Node[];
  roots: string[];
  /** The pages that use it, directly or through their layout. */
  usedBy: string[];
}

export interface BlogCatalog {
  preset: string;
  /** The resolved blog options: set in astro.config, shown read-only. */
  config: Record<string, unknown>;
  forms: { posts: Record<string, unknown>; authors: Record<string, unknown>; taxonomies: Record<string, unknown>; series: Record<string, unknown> };
  views: { name: string; overrides: string[]; preset: { sections: unknown[]; wrapper?: unknown } }[];
  postPaths: Record<string, string>;
  viewPaths: Record<string, string | null>;
}

export interface Catalog {
  widgets: Record<string, CatalogWidget>;
  /** The site's patterns, each once by its entry; `patternsIn` resolves `pattern/<id>` for a locale. */
  patterns: CatalogPattern[];
  layouts: { id: string; locale: string; name: string; outlets: string[]; usedBy: string[] }[];
  /** Each menu with where it is used; its items take the shape of the first prop that uses it. */
  navigation: { id: string; locale: string; name: string; usedBy: { doc: string; widget: string; prop: string }[]; itemsSchema: unknown }[];
  /** Each page's URL on the site, by page id. */
  pageUrls: Record<string, string>;
  /** The blog, when the site has it: its forms, its views, where posts and views are shown. */
  blog: BlogCatalog | null;
  /** The page's own fields (title, description, urlSlug, metadata) as JSON Schema. */
  pageSettings: Record<string, unknown>;
  limits: { maxFilledSlots: number };
  tones: string[];
  defaultWrapper: string | null;
  unwrapped: string[];
  themes: { list: { label: string; value: string }[]; default: string | null };
  i18n: { locales: string[]; defaultLocale: string };
}
