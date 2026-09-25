/**
 * Content shapes shared by the widgets, so thirty widgets speak one language
 * and the builder edits each shape with one form. Content references these
 * shapes, so they change slowly and only additively.
 */
import { z } from 'zod';

/** A call to action: what a button in content looks like. */
export const actionVariants = ['primary', 'secondary', 'contrast', 'tertiary', 'link'] as const;
export const action = z.object({
  variant: z.enum(actionVariants).default('primary'),
  text: z.string().optional(),
  href: z.string().optional().meta({ placeholder: 'https://...' }),
  target: z.string().optional().meta({ placeholder: '_blank' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});
export type Action = z.infer<typeof action>;

/**
 * A short text that accepts inline Markdown (see inline.ts): a title, a
 * subtitle, an item's description. The widget renders it with `inline()`.
 */
export const text = (meta: { input?: 'textarea' } = {}) => z.string().meta({ markdown: 'inline', ...meta });

/** A text link: the "All case studies →" beside a heading, the "Read more" under an item. */
export const link = z.object({
  text: z.string(),
  href: z.string().meta({ placeholder: '/path or https://...' }),
});
export type Link = z.infer<typeof link>;

/** Where a section's heading sits. */
export const align = z.enum(['start', 'center']);

/**
 * The heading every section widget opens with, spread into its schema so the
 * four fields mean the same everywhere and the builder draws one form:
 *
 *   export const schema = z.object({ ...heading(), items: … });
 *   export const schema = z.object({ ...heading({ align: 'center' }), … });
 *
 * The vocabulary around it (see docs-wip/content-model.md): the things a
 * section lists are `items`; buttons are `actions`, always a list; a text link
 * is `link`; the arrangement is `layout`, a visual flavour `variant`.
 */
export function heading(defaults: { align?: z.infer<typeof align> } = {}) {
  return {
    tagline: z.string().optional().meta({ help: 'The eyebrow above the title: a category, a count, a date.' }),
    title: text().optional().meta({ help: 'The section heading.' }),
    subtitle: text({ input: 'textarea' }).optional().meta({ help: 'One or two sentences under the title.' }),
    link: link.optional().meta({ help: 'A text link at the end of the heading row: where the full list lives.' }),
    align: align.default(defaults.align ?? 'start').meta({ help: 'Where the heading sits.' }),
  };
}

/** The builder group for the heading fields, first in every section widget. */
export const headingGroup = { key: 'heading', label: 'Heading', fields: ['tagline', 'title', 'subtitle', 'link', 'align'] };

/** An image by path (`@/assets/images/…` resolves at render) or URL. */
export const image = z.object({
  src: z.string().meta({ input: 'image' }),
  alt: z.string().default('').meta({ help: 'Empty when the image is decorative.' }),
});
export type Image = z.infer<typeof image>;

/** A number a sceptic can check: value, unit, and where and when it was measured. */
export const sourcedNumber = z.object({
  value: z.string().meta({ help: 'As displayed: "−64%", "1.2", "38".' }),
  unit: z.string().optional().meta({ help: '"s", "KB", "sessions".' }),
  label: z.string(),
  source: z.string().optional().meta({ help: 'Where the number comes from: "p75 · 41,200 sessions".' }),
  date: z.string().optional().meta({ help: 'When it was measured, ISO or free text.' }),
  href: z.string().optional().meta({ help: 'A link to the report.' }),
});
export type SourcedNumber = z.infer<typeof sourcedNumber>;

/** A quote that can be traced: who said it, in what role, when and where. */
export const verifiedQuote = z.object({
  text: z.string().meta({ input: 'textarea' }),
  name: z.string(),
  role: z.string().optional(),
  avatar: image.optional(),
  date: z.string().optional(),
  source: z.string().optional().meta({ help: 'Where it was said: "G2 review", "post-launch call".' }),
  href: z.string().optional().meta({ help: 'A link to the original.' }),
});
export type VerifiedQuote = z.infer<typeof verifiedQuote>;

/** A measured response time, for a support route or a contact door. */
export const responseTime = z.object({
  label: z.string().meta({ help: '"Median 3h 10m".' }),
  window: z.string().optional().meta({ help: '"30 days".' }),
});
export type ResponseTime = z.infer<typeof responseTime>;

/**
 * A reference to a content collection, for a widget that lists entries the
 * page should not repeat inline: `{ "$collection": "posts", "limit": 3 }`.
 * The renderer resolves it to the entries' data before the widget sees it.
 */
export const collectionRef = z.object({
  $collection: z.string().meta({ help: 'The collection name.' }),
  limit: z.number().int().positive().optional(),
  filter: z.record(z.string(), z.unknown()).optional().meta({ help: 'Field values entries must match.' }),
  sort: z.string().optional().meta({ help: 'A field, prefixed with - for descending: "-date".' }),
});
export type CollectionRef = z.infer<typeof collectionRef>;
