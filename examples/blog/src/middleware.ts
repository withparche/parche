import { defineMiddleware } from 'astro:middleware';

// Required by Astro's `routing: 'manual'` i18n mode.
// Parche's integration middleware handles locale resolution.
export const onRequest = defineMiddleware((_, next) => next());
