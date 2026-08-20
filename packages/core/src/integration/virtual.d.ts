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
      seriesNav?: { seriesName: string; posts: any[]; currentOrder: number };
      relatedPosts?: any[];
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

// Layouts
declare module 'parche:layouts/BaseLayout' {
  const Component: typeof import('../layouts/BaseLayout.astro').default;
  export default Component;
}

// Components
declare module 'parche:components/Header' {
  const Component: typeof import('../components/common/Header.astro').default;
  export default Component;
}

declare module 'parche:components/Footer' {
  const Component: typeof import('../components/common/Footer.astro').default;
  export default Component;
}

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

// Templates
declare module 'parche:templates/contact' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:templates/content' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Atoms
declare module 'parche:primitives/Button' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Container' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Section' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Icon' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Badge' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Eyebrow' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Avatar' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Divider' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Tag' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Link' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:primitives/Image' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Hero
declare module 'parche:widgets/hero/Hero' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:widgets/hero/HeroFullscreen' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Features
declare module 'parche:widgets/features/Features' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:widgets/features/FeaturesList' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:widgets/features/FeaturesBento' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Stats
declare module 'parche:widgets/stats/Stats' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Steps
declare module 'parche:widgets/steps/Steps' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:widgets/steps/StepsHorizontal' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Content
declare module 'parche:widgets/content/Content' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Pricing
declare module 'parche:widgets/pricing/Pricing' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:widgets/pricing/PricingTable' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Testimonials
declare module 'parche:widgets/testimonials/Testimonials' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:widgets/testimonials/TestimonialsCarousel' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:widgets/testimonials/TestimonialsMasonry' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Brands / Logos
declare module 'parche:widgets/brands/Brands' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

declare module 'parche:widgets/brands/LogoWallMarquee' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — FAQ
declare module 'parche:widgets/faq/FAQs' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Call to Action
declare module 'parche:widgets/call-to-action/CallToAction' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Team
declare module 'parche:widgets/team/Team' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Contact
declare module 'parche:widgets/contact/Contact' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Subscribe
declare module 'parche:widgets/subscribe/Subscribe' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Gallery
declare module 'parche:widgets/gallery/Gallery' {
  const Component: import('astro').AstroComponentFactory;
  export default Component;
}

// Widgets — Announce
declare module 'parche:widgets/announce/Announce' {
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
