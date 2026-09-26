import { getProviderForUrl, transformUrl } from 'unpic';
import type { ImageCdn } from 'unpic';

/**
 * Which path an image takes, and the srcset for the CDN one. Pure: the Image
 * element passes in the options and Astro's allow-list, so this runs (and is
 * tested) without Astro.
 *
 * 1. local (Astro metadata): Astro's image service, responsive;
 * 2. remote on an image CDN that transforms by URL: a srcset of CDN URLs;
 * 3. remote and allowed by Astro (image.domains / remotePatterns): Astro;
 * 4. anything else: a plain <img>.
 */

export type ImageLayout = 'constrained' | 'full-width' | 'fixed';

export interface ImagesOptions {
  remote?: 'auto' | 'cdn' | 'astro' | 'none';
  cdn?: { hosts?: string[]; providers?: Record<string, string>; fallback?: string };
  layout?: ImageLayout;
  breakpoints?: number[];
  warnUnoptimized?: boolean;
}

/** Astro's defaults for a service that generates only the sizes asked for. */
export const REMOTE_BREAKPOINTS = [640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048, 2560, 3200, 3840, 4480, 5120, 6016];

/** The options `parche({ images })` set at build, or the defaults. */
export function readImagesOptions(raw: string | undefined): ImagesOptions {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ImagesOptions;
  } catch {
    return {};
  }
}

/** A host pattern as Astro writes them: exact, '*.' one level, '**.' any depth. */
export function hostMatches(host: string, pattern: string): boolean {
  if (pattern.startsWith('**.')) return host.endsWith(pattern.slice(2));
  if (pattern.startsWith('*.')) {
    const rest = pattern.slice(1);
    return host.endsWith(rest) && !host.slice(0, -rest.length).includes('.');
  }
  return host === pattern;
}

export type RemotePath = { path: 'cdn'; provider: ImageCdn } | { path: 'astro' } | { path: 'plain' };

/** Where a remote URL goes, under these options and Astro's allow-list. */
export function remotePath(url: string, options: ImagesOptions, astroAllows: (url: string) => boolean): RemotePath {
  const mode = options.remote ?? 'auto';
  if (mode === 'none') return { path: 'plain' };
  if (mode === 'auto' || mode === 'cdn') {
    const provider = cdnProvider(url, options);
    if (provider) return { path: 'cdn', provider };
  }
  if ((mode === 'auto' || mode === 'astro') && astroAllows(url)) return { path: 'astro' };
  return { path: 'plain' };
}

function cdnProvider(url: string, options: ImagesOptions): ImageCdn | undefined {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return undefined;
  }
  const { hosts, providers = {}, fallback } = options.cdn ?? {};
  if (hosts && !hosts.some((p) => hostMatches(host, p))) return undefined;
  const named = Object.entries(providers).find(([p]) => hostMatches(host, p))?.[1];
  // getProviderForUrl answers `false`, not undefined, for a host it does not know.
  return ((named as ImageCdn | undefined) || getProviderForUrl(url) || (fallback as ImageCdn | undefined)) || undefined;
}

/** The widths a srcset offers for a layout, as Astro picks them. */
export function widthsFor(layout: ImageLayout, width: number, breakpoints: number[]): number[] {
  if (layout === 'fixed') return [width, width * 2];
  if (layout === 'full-width') return [...breakpoints];
  // constrained: the breakpoints up to twice the width (sharp on a 2x screen), and the width itself.
  return [...new Set([...breakpoints.filter((b) => b < width * 2), width, width * 2])].sort((a, b) => a - b);
}

export function sizesFor(layout: ImageLayout, width: number): string {
  if (layout === 'fixed') return `${width}px`;
  if (layout === 'full-width') return '100vw';
  return `(min-width: ${width}px) ${width}px, 100vw`;
}

/** src, srcset and sizes of an image served by a CDN, cropped to `height` when given. */
export function cdnSources(
  url: string,
  provider: ImageCdn,
  { width, height, layout, breakpoints, sizes }: { width: number; height?: number; layout: ImageLayout; breakpoints: number[]; sizes?: string },
): { src: string; srcset: string; sizes: string } | undefined {
  const ratio = height ? height / width : undefined;
  const at = (w: number) => transformUrl({ url, provider, width: w, ...(ratio ? { height: Math.round(w * ratio) } : {}) });
  const src = at(width);
  if (!src) return undefined;
  const srcset = widthsFor(layout, width, breakpoints)
    .map((w) => {
      const u = at(w);
      return u ? `${u} ${w}w` : '';
    })
    .filter(Boolean)
    .join(', ');
  return { src, srcset, sizes: sizes ?? sizesFor(layout, width) };
}
