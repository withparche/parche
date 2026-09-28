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

/**
 * A widget's main picture, as the design draws it: a plain image by default,
 * a placeholder captioned with what goes there until there is one, and the
 * browser window or phone around it when asked. The frame options are the
 * Screenshot widget's, which draws every case but the plain image.
 */
export const picture = z.object({
  src: z.string().optional().meta({ input: 'image', help: 'Without one, a striped placeholder captioned with what goes there.' }),
  alt: z.string().default('').meta({ help: 'Empty when the image is decorative.' }),
  caption: z.string().optional().meta({ help: 'Until there is an image: what goes there and its size ("hero screenshot · 1200×900").' }),
  ratio: z.string().optional().meta({ help: 'Width/height, "16/9"; the layout\'s own when omitted.' }),
  frame: z.boolean().default(false).meta({ help: 'Draw a browser window around it.' }),
  device: z.enum(['none', 'phone']).default('none').meta({ help: 'phone: a phone bezel, for an app screen.' }),
  url: z.string().optional().meta({ help: 'The address in the window bar (with `frame`).' }),
  badge: z.string().optional().meta({ help: 'A chip in the window bar: "LCP 0.4s".' }),
  badgeTone: z.enum(['success', 'warning', 'primary', 'muted']).default('success'),
});
export type Picture = z.infer<typeof picture>;

/** True when a picture is just an image: the widget draws it itself. */
export const plainPicture = (p: Picture): p is Picture & { src: string } => Boolean(p.src) && !p.frame && p.device === 'none';

const IMAGE_RATIOS = ['1/1', '4/3', '16/9', '3/2', '21/9', '16/10', '1.91/1', '4/5', '3/4', '9/16'];
/**
 * The Image element's size for a picture at `width`: its ratio when the
 * element knows it (a crop), else the height the ratio gives, else nothing.
 */
export const pictureBox = (width: number, ratio?: string): { width: number; ratio?: any; height?: number } => {
  if (!ratio) return { width };
  if (IMAGE_RATIOS.includes(ratio)) return { width, ratio };
  const [w, h] = ratio.split('/').map(Number);
  return w > 0 && h > 0 ? { width, height: Math.round((width * h) / w) } : { width };
};

/** The Screenshot props that draw a picture that is not plain. */
export const screenshotOf = (p: Picture, ratio: string) => ({
  ...(p.src ? { image: { src: p.src, alt: p.alt } } : {}),
  caption: p.caption ?? 'image',
  ratio: p.ratio ?? ratio,
  frame: p.frame,
  device: p.device,
  url: p.url,
  badge: p.badge,
  badgeTone: p.badgeTone,
});

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
 * A query on a content collection, for a widget that lists entries the page
 * should not repeat inline: `{ "$collection": "posts", "limit": 3 }`. The
 * renderer resolves it to the entries' data (each with its `id`) before the
 * widget sees it, so a widget's schema names the item shape, not this one;
 * this shape is for the builder, to offer a query where a list goes. A
 * single entry is `{ "$ref": "<collection>/<id>" }` (core content/refs.ts).
 */
export const collectionRef = z.object({
  $collection: z.string().meta({ help: 'The collection name.' }),
  limit: z.number().int().positive().optional(),
  filter: z.record(z.string(), z.unknown()).optional().meta({ help: 'Field values entries must match.' }),
  sort: z.string().optional().meta({ help: 'A field, prefixed with - for descending: "-date".' }),
});
export type CollectionRef = z.infer<typeof collectionRef>;
