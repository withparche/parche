import { defineMiddleware } from 'astro:middleware';

// Astro asks for a middleware file of the site's own when i18n routing is
// 'manual', which Parche sets; Parche's own middleware does the work.
export const onRequest = defineMiddleware((_, next) => next());
