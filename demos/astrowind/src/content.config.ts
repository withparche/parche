import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { createCollections } from '@parche/astro/content';
import { createBlogCollections } from '@parche/astro-blog/content';

const { pages, layouts, patterns, navigation } = createCollections();
const { posts, authors, taxonomies, views } = createBlogCollections();

// The store's products: plain data, no widgets. Each gets a page at
// /homes/store/<id>, rendered by the product-page pattern (astro.config.mjs),
// and the store's list reads them with { "$collection": "products" }.
const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    /** Where it sits in the store's list. */
    order: z.number().default(0),
    price: z.string(),
    compareAt: z.string().optional(),
    badge: z.string().optional(),
    stock: z.object({ label: z.string(), state: z.enum(['in', 'low', 'out']).default('in') }),
    rating: z.object({ value: z.number().min(0).max(5), count: z.number().int().optional() }).optional(),
    /** The list's card, until there is a photo. */
    placeholder: z.string().optional(),
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    photo: z.object({ src: z.string().optional(), alt: z.string().default(''), caption: z.string().optional(), ratio: z.string().optional() }),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    care: z.array(z.object({ title: z.string(), description: z.string() })).default([]),
    /** What the page offers: the basket while it is in stock, a restock alert when it is not. */
    cart: z.object({ text: z.string(), href: z.string() }).optional(),
    restock: z.object({ text: z.string(), href: z.string() }).optional(),
  }),
});

export const collections = { pages, layouts, patterns, navigation, posts, authors, taxonomies, views, products };
