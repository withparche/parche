import type { MetadataEntry, PageEntry } from '../content/schemas.js';
import type { SiteConfig } from '../types/config.js';

// ---------------------------------------------------------------------------
// Resolved metadata — the fully merged result passed to BaseLayout
// ---------------------------------------------------------------------------

export interface ResolvedMetadata {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  noindex: boolean;
  nofollow: boolean;
  robots?: { maxSnippet?: number; maxImagePreview?: 'none' | 'standard' | 'large'; maxVideoPreview?: number };
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogType: string;
  twitterCard: string;
  article?: {
    author?: string;
    publishedDate?: string;
    modifiedDate?: string;
    section?: string;
    tags?: string[];
  };
  jsonLd?: unknown;
  siteName: string;
  locale: string;
  /**
   * The schema.org type of the page's WebPage node: 'CollectionPage' for a
   * list of posts, 'ProfilePage' for a person, 'SearchResultsPage'. Default
   * 'WebPage'.
   */
  pageType?: string;
}

/**
 * Merge page-level metadata with site-wide config defaults.
 * Resolution order: metadata field → page field → site config → hardcoded fallback.
 */
export function resolveMetadata(
  pageData: PageEntry,
  config: SiteConfig,
  options: { locale?: string } = {},
): ResolvedMetadata {
  const meta = pageData.metadata;
  const seo = config.metadata ?? {};

  const title = meta?.title ?? pageData.title;
  const description = meta?.description ?? pageData.description ?? '';

  return {
    title,
    description,
    canonical: meta?.canonical,
    keywords: meta?.keywords,
    noindex: meta?.noindex ?? false,
    nofollow: meta?.nofollow ?? false,
    robots: meta?.robots ?? seo.defaultRobots,
    ogTitle: meta?.ogTitle ?? title,
    ogDescription: meta?.ogDescription ?? description,
    ogImage: meta?.ogImage ?? config.metadata?.ogImage,
    ogType: meta?.ogType ?? seo.defaultOgType ?? 'website',
    twitterCard: meta?.twitterCard ?? seo.defaultTwitterCard ?? 'summary_large_image',
    article: meta?.article,
    jsonLd: meta?.jsonLd,
    siteName: config.brand.name,
    locale: options.locale ?? 'en',
  };
}

// ---------------------------------------------------------------------------
// Robots meta content builder
// ---------------------------------------------------------------------------

export function buildRobotsContent(resolved: ResolvedMetadata): string {
  const parts: string[] = [
    resolved.noindex ? 'noindex' : 'index',
    resolved.nofollow ? 'nofollow' : 'follow',
  ];

  const robots = resolved.robots;
  if (robots) {
    if (robots.maxSnippet != null) parts.push(`max-snippet:${robots.maxSnippet}`);
    if (robots.maxImagePreview) parts.push(`max-image-preview:${robots.maxImagePreview}`);
    if (robots.maxVideoPreview != null) parts.push(`max-video-preview:${robots.maxVideoPreview}`);
  }

  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// Breadcrumb helper
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbs(urlPath: string, siteUrl: string, pageTitle: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: 'Home', url: siteUrl }];
  const segments = urlPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  let accumulated = siteUrl.replace(/\/$/, '');
  for (let i = 0; i < segments.length; i++) {
    accumulated += `/${segments[i]}`;
    const name = i === segments.length - 1
      ? pageTitle
      : segments[i].charAt(0).toUpperCase() + segments[i].slice(1).replace(/-/g, ' ');
    items.push({ name, url: accumulated });
  }

  return items;
}

// ---------------------------------------------------------------------------
// JSON-LD generators — return plain objects for @graph composition
// ---------------------------------------------------------------------------

export interface JsonLdWebSite {
  name: string;
  url: string;
  description?: string;
  /** The site's search address, with `{search_term_string}` where the query goes. */
  search?: string;
}

export interface JsonLdWebPage {
  name: string;
  url: string;
  description?: string;
  isPartOf?: { name: string; url: string };
  type?: string;
}

export function generateJsonLdWebSite(site: JsonLdWebSite): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    ...(site.description && { description: site.description }),
    ...(site.search && {
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: site.search },
        'query-input': 'required name=search_term_string',
      },
    }),
  };
}

export function generateJsonLdWebPage(page: JsonLdWebPage): Record<string, unknown> {
  return {
    '@type': page.type ?? 'WebPage',
    name: page.name,
    url: page.url,
    ...(page.description && { description: page.description }),
    ...(page.isPartOf && {
      isPartOf: {
        '@type': 'WebSite',
        name: page.isPartOf.name,
        url: page.isPartOf.url,
      },
    }),
  };
}

export function generateJsonLdOrganization(config: SiteConfig): Record<string, unknown> | null {
  const org = config.metadata?.organization;
  if (!org) return null;

  const name = org.name ?? config.brand.name;
  if (!name) return null;

  return {
    '@type': org.type ?? 'Organization',
    name,
    ...(org.legalName && { legalName: org.legalName }),
    ...(org.url ?? config.site ? { url: org.url ?? config.site } : {}),
    ...(org.logo ?? config.brand.logo ? { logo: org.logo ?? config.brand.logo } : {}),
    ...(org.description && { description: org.description }),
    ...(org.foundingDate && { foundingDate: org.foundingDate }),
    ...(org.socialProfiles?.length && { sameAs: org.socialProfiles }),
    ...(org.address && {
      address: {
        '@type': 'PostalAddress',
        ...(org.address.street && { streetAddress: org.address.street }),
        ...(org.address.city && { addressLocality: org.address.city }),
        ...(org.address.region && { addressRegion: org.address.region }),
        ...(org.address.postalCode && { postalCode: org.address.postalCode }),
        ...(org.address.country && { addressCountry: org.address.country }),
      },
    }),
    ...(org.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...(org.contactPoint.telephone && { telephone: org.contactPoint.telephone }),
        ...(org.contactPoint.contactType && { contactType: org.contactPoint.contactType }),
        ...(org.contactPoint.email && { email: org.contactPoint.email }),
      },
    }),
  };
}

export function generateJsonLdBreadcrumbList(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateJsonLdArticle(
  resolved: ResolvedMetadata,
  pageUrl: string,
): Record<string, unknown> | null {
  if (resolved.ogType !== 'article' || !resolved.article) return null;

  const article = resolved.article;
  return {
    '@type': 'Article',
    headline: resolved.title,
    url: pageUrl,
    ...(resolved.description && { description: resolved.description }),
    ...(resolved.ogImage && { image: resolved.ogImage }),
    ...(article.author && {
      author: { '@type': 'Person', name: article.author },
    }),
    ...(article.publishedDate && { datePublished: article.publishedDate }),
    ...(article.modifiedDate && { dateModified: article.modifiedDate }),
    ...(article.section && { articleSection: article.section }),
    ...(article.tags?.length && { keywords: article.tags }),
  };
}

/**
 * Build the complete JSON-LD @graph for a page.
 */
export function buildJsonLdGraph(
  resolved: ResolvedMetadata,
  pageUrl: string,
  siteUrl: string,
  config: SiteConfig,
  breadcrumbs?: BreadcrumbItem[],
  siteSearch?: string,
): string {
  const graph: Record<string, unknown>[] = [];

  // WebSite
  graph.push(generateJsonLdWebSite({
    name: resolved.siteName,
    url: siteUrl,
    description: config.brand.description || undefined,
    // Absolute: the search a parche declares, on this site's origin.
    search: siteSearch ? new URL(siteSearch.replace('{search_term_string}', '__q__'), siteUrl).href.replace('__q__', '{search_term_string}') : undefined,
  }));

  // WebPage
  graph.push(generateJsonLdWebPage({
    name: resolved.title,
    url: pageUrl,
    description: resolved.description || undefined,
    isPartOf: { name: resolved.siteName, url: siteUrl },
    type: resolved.pageType,
  }));

  // Organization
  const org = generateJsonLdOrganization(config);
  if (org) graph.push(org);

  // A page's own structured data of a kind replaces what would be generated:
  // a blog's BlogPosting (or NewsArticle) and its own trail win over the
  // generic Article and the path's breadcrumbs, so nothing is described twice.
  const own = (Array.isArray(resolved.jsonLd) ? resolved.jsonLd : resolved.jsonLd ? [resolved.jsonLd] : []) as Record<string, unknown>[];
  const ownTypes = new Set(own.map((n) => n?.['@type']));
  const ARTICLES = ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle', 'ScholarlyArticle', 'Report'];

  // BreadcrumbList
  if (breadcrumbs && breadcrumbs.length > 1 && !ownTypes.has('BreadcrumbList')) {
    graph.push(generateJsonLdBreadcrumbList(breadcrumbs));
  }

  // Article
  const article = ARTICLES.some((t) => ownTypes.has(t)) ? null : generateJsonLdArticle(resolved, pageUrl);
  if (article) graph.push(article);

  // Custom JSON-LD escape hatch
  if (resolved.jsonLd) {
    if (Array.isArray(resolved.jsonLd)) {
      graph.push(...(resolved.jsonLd as Record<string, unknown>[]));
    } else {
      graph.push(resolved.jsonLd as Record<string, unknown>);
    }
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
