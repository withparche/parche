// Type declarations for parche:* virtual modules

// Config
declare module 'parche:config' {
  const config: import('../types/config.js').SiteConfig;
  export default config;
}

// Side-effect style import (injects global CSS)
declare module 'parche:config/styles' {}

// Generated maps
declare module 'parche:registry/widgets' {
  /** Lazy widget catalog: key → dynamic import of the component. */
  export const widgetLoaders: Record<
    string,
    () => Promise<{ default: import('astro').AstroComponentFactory }>
  >;
  /** Resolve the given widget keys (deduped) to their components. */
  export function loadWidgets(
    keys: string[],
  ): Promise<Record<string, import('astro').AstroComponentFactory>>;
}

declare module 'parche:registry/widgetSchemas' {
  /** Props as JSON Schema per widget (from z.toJSONSchema), for forms. */
  export const widgetSchemas: Record<string, Record<string, unknown>>;
  /** The widget's meta as the catalog carries it: label, slots, wrapper, groups… */
  export const widgetMeta: Record<
    string,
    {
      label: string;
      category: string;
      description: string;
      icon: string;
      defaultProps: Record<string, unknown>;
      defaultVariants: { props: Record<string, unknown> }[];
      slots: NonNullable<import('./types.js').WidgetMeta['slots']>;
      wrapper: boolean;
      hidden: boolean;
      ui: NonNullable<import('./types.js').WidgetMeta['ui']>;
    }
  >;
  /** The zod schema itself, to validate props as the widget will (refinements included). */
  export const widgetPropSchemas: Record<string, import('zod').ZodType>;
}

declare module 'parche:registry/templates' {
  export const templateMap: Record<string, import('astro').AstroComponentFactory>;
}

declare module 'parche:registry/resolvers' {
  export function resolveContent(
    slug: string,
    locale: string,
    opts?: { showDrafts?: boolean; siteUrl?: string; siteName?: string },
  ): Promise<{
    template: string;
    layout: string;
    collection: string;
    entryId: string;
    templateProps: Record<string, any>;
    metadata: Record<string, any>;
    extras: {
      sections: Array<{
        widget: string;
        props?: Record<string, any>;
      }>;
    };
  } | null>;
  export function getResolverPaths(
    locales: string[],
    defaultLocale: string,
    opts?: { showDrafts?: boolean },
  ): Promise<Array<{ params: Record<string, string | undefined>; props: Record<string, any> }>>;
}

declare module 'parche:config/i18n' {
  export const locales: string[];
  export const defaultLocale: string;
}

declare module 'parche:config/fonts' {
  /** The resolved font set: core's base, each parche's, then the site's. */
  export const fonts: Array<{ cssVariable: string; name: string; weights: number[]; fallbacks: string[]; preload?: boolean }>;
}

declare module 'parche:config/head' {
  /** `<link>` tags the parches add to every page's head (a blog's feed). */
  export const headLinks: Array<{ rel: string; href: string; type?: string; title?: string; hreflang?: string }>;
  /** The site's search address for the WebSite SearchAction, or null. */
  export const siteSearch: string | null;
}

declare module 'parche:config/themes' {
  export const themes: Array<{ label: string; value: string }>;
  export const showPanel: boolean;
  /** Theme rendered server-side on <html data-theme>, or null for the base look. */
  export const defaultTheme: string | null;
}

declare module 'parche:config/layout' {
  /** The widget a list's wrapper uses when it names none (`Section`), or null. */
  export const wrapper: string | null;
  /** Widgets whose meta declares `wrapper: false`: never wrapped, even as roots. */
  export const unwrapped: string[];
  /** Section tones the wrapper's `tone` prop accepts. */
  export const tones: Array<{ name: string; label: string }>;
}

// Layouts
declare module 'parche:layouts/BaseLayout' {
  const Component: typeof import('../layouts/BaseLayout.astro').default;
  export default Component;
}

// Components (core-owned; Header and Footer are widgets of the ui parche)
declare module 'parche:components/ThemeToggle' {
  const Component: typeof import('../components/common/ThemeToggle.astro').default;
  export default Component;
}

declare module 'parche:components/ThemeSelector' {
  const Component: typeof import('../components/common/ThemeSelector.astro').default;
  export default Component;
}

declare module 'parche:components/OptimizedImage' {
  const Component: typeof import('../components/common/OptimizedImage.astro').default;
  export default Component;
}

declare module 'parche:components/LocaleSwitcher' {
  const Component: typeof import('../components/common/LocaleSwitcher.astro').default;
  export default Component;
}

declare module 'parche:components/ThemePanel' {
  const Component: typeof import('../components/common/ThemePanel.astro').default;
  export default Component;
}

// Utils
declare module 'parche:utils/metadata' {
  export * from '../utils/metadata.js';
}

declare module 'parche:utils/i18n' {
  export * from '../utils/i18n.js';
}

// Templates — provided by parches; names aren't known to core, so declare
// the namespace generically.
declare module 'parche:templates/*' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Elements — provided by parches; names aren't known to core, so declare
// the namespace generically. A single-part element is a default export; a
// compound one (folder with an index.ts) exposes its parts as named exports:
//   import * as Tabs from 'parche:elements/Tabs';   → <Tabs.Root>, <Tabs.Tab>…
//   import Panel from 'parche:elements/Tabs/Panel'; → one part
declare module 'parche:elements/*' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:registry/elements' {
  type JsonSchema = Record<string, unknown>;
  /** JSON Schema per element: the root props and each part's props. */
  export const elementSchemas: Record<string, { root: JsonSchema; parts: Record<string, JsonSchema> }>;
  /** `ElementMeta.element` per element, plus its `ui` block. */
  export const elementMeta: Record<
    string,
    import('./types.js').ElementMeta['element'] & { ui: NonNullable<import('./types.js').ElementMeta['ui']> }
  >;
  /** Every registered element, in registration order. */
  export const elementIndex: Array<{
    name: string;
    parts: string[];
    interactive: boolean;
    from: string;
    dir: string;
    overridden: { original?: string; override: string } | null;
  }>;
}

// Widgets — provided by parches; names aren't known to core, so declare
// the namespace generically. Matches nested keys like widgets/hero/Hero.
declare module 'parche:widgets/*' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:NodeRenderer' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:LayoutRenderer' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:utils/assets' {
  /** Replace every `@/assets/…` string at any depth with its built asset URL. */
  export function resolveAssets<T>(value: T): Promise<T>;
}

declare module 'parche:utils/site' {
  /** Apply a locale's overrides to the site config. */
  export function localizeSiteConfig<T>(config: T, locale: string): T;
}

declare module 'parche:utils/layout' {
  import type { Node } from '@parche/astro/content';
  type WrapperSpec = false | { widget?: string; props?: Record<string, unknown> };
  export function resolveLayout(name: string, locale: string, defaultLocale: string): Promise<Node[]>;
  /** The wrapper a layout's outlet declares for its list, or false. */
  export function outletWrapper(layoutSections: Node[], name?: string): WrapperSpec;
}
