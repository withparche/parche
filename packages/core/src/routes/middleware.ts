import { defineMiddleware } from 'astro:middleware';

/**
 * Parche middleware — required by Astro's `routing: 'manual'` i18n mode.
 * Enriches Astro.locals.parche with resolved locale info.
 * Users can override this via `routes.middleware` in parche config.
 */
export const onRequest = defineMiddleware((context, next) => {
  // Astro's i18n system sets currentLocale automatically even in manual mode
  // We expose it in locals for convenience in user components
  const locale = context.currentLocale || 'en';

  context.locals.parche = {
    locale,
  };

  return next();
});
