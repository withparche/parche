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
  export const widgetMap: Record<string, import('astro').AstroComponentFactory>;
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
        wrapper?: false | { classes?: Record<string, unknown>; [key: string]: unknown };
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

declare module 'parche:config/themes' {
  export const themes: Array<{ label: string; value: string }>;
  export const showPanel: boolean;
}

declare module 'parche:config/layout' {
  /** Widget keys that render full-bleed (skip the default SectionWrapper). */
  export const fullBleedWidgets: string[];
}

// Layouts
declare module 'parche:layouts/BaseLayout' {
  const Component: typeof import('../layouts/BaseLayout.astro').default;
  export default Component;
}

// Components (core-owned; Header/Footer now live in the ui parche as
// parche:widgets/layout/*)
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

// Primitives — provided by parches; names aren't known to core, so declare
// the namespace generically.
declare module 'parche:primitives/*' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — provided by parches; names aren't known to core, so declare
// the namespace generically. Matches nested keys like widgets/hero/Hero.
declare module 'parche:widgets/*' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:DynamicRenderer' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:LayoutRenderer' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:utils/layout' {
  interface Section {
    widget: string;
    props?: Record<string, unknown>;
    wrapper?: false | {
      id?: string;
      isDark?: boolean;
      bg?: string;
      classes?: Record<string, unknown>;
      as?: string;
    };
  }
  export function resolveLayout(name: string, locale: string, defaultLocale: string): Promise<Section[]>;
}
