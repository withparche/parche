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
  tones: string[];
  defaultWrapper: string | null;
  unwrapped: string[];
  themes: { list: { label: string; value: string }[]; default: string | null };
  i18n: { locales: string[]; defaultLocale: string };
}
