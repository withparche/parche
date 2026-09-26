import { defineMiddleware } from 'astro:middleware';

// Astro requires a middleware file with `routing: 'manual'`; Parche adds its own.
export const onRequest = defineMiddleware((_, next) => next());
