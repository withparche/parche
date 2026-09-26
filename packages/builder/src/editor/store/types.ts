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

export interface Catalog {
  widgets: Record<string, CatalogWidget>;
  /** The site's widgets written in JSON (content/widgets): no slots; their props are a JSON Schema. */
  jsonWidgets: Record<string, Omit<CatalogWidget, 'slots' | 'ui' | 'hidden'>>;
  layouts: { id: string; locale: string; name: string; outlets: string[] }[];
  /** The page's own fields (title, description, urlSlug, metadata) as JSON Schema. */
  pageSettings: Record<string, unknown>;
  limits: { maxDepth: number; maxFilledSlots: number };
  tones: string[];
  defaultWrapper: string | null;
  unwrapped: string[];
  themes: { list: { label: string; value: string }[]; default: string | null };
  i18n: { locales: string[]; defaultLocale: string };
}
