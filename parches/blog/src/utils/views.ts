/**
 * Which view a blog page renders: the site's own, else its preset's.
 *
 * A view is a JSON tree of widgets (`{ sections, wrapper? }`) for one page
 * type: index, taxonomy, author… The site overrides one by adding
 * `src/content/views/blog-<name>.json` (per locale under `<locale>/`); the
 * preset's ships with the blog. In a view, `{ "$label": "sectionsLabel" }`
 * is the blog label of that name in the page's language, so a view carries no
 * text of its own unless it wants to.
 */
import { getEntry } from 'astro:content';
import { presetViews } from '../views/index.js';
import { checkPlacements } from './placements.js';

export interface BlogView {
  sections: any[];
  wrapper?: any;
}

function substituteLabels(value: unknown, labels: Record<string, string>): unknown {
  if (Array.isArray(value)) return value.map((v) => substituteLabels(v, labels));
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 1 && typeof (value as any).$label === 'string') return labels[(value as any).$label] ?? (value as any).$label;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, substituteLabels(v, labels)]));
  }
  return value;
}

export async function resolveView(
  name: string,
  opts: { locale: string; preset: string; labels: Record<string, string> },
): Promise<BlogView> {
  let entry: any = null;
  try {
    entry = (await getEntry('views' as any, `${opts.locale}/blog-${name}`)) ?? (await getEntry('views' as any, `blog-${name}`));
  } catch {
    // No views collection: the preset's view.
  }
  const view = (entry?.data as BlogView | undefined) ?? (presetViews[opts.preset]?.[name] as BlogView | undefined) ?? { sections: [] };
  const problems = checkPlacements(view);
  if (problems.length) throw new Error(`[parche] blog view "${name}":\n  ${problems.join('\n  ')}`);
  return substituteLabels(view, opts.labels) as BlogView;
}
