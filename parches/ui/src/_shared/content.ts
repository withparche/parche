/**
 * Content shapes shared by the widgets, so thirty widgets speak one language
 * and the builder edits each shape with one form. Content references these
 * shapes, so they change slowly and only additively.
 */
import { z } from 'zod';

/** A call to action: what a button in content looks like. */
export const action = z.object({
  variant: z.enum(['primary', 'secondary', 'contrast', 'tertiary', 'link']).default('primary'),
  text: z.string().optional(),
  href: z.string().optional().meta({ placeholder: 'https://...' }),
  target: z.string().optional().meta({ placeholder: '_blank' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});
export type Action = z.infer<typeof action>;

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
