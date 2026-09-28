import { defineMiddleware } from 'astro:middleware';
import { defaultLocale } from 'parche:config/i18n';

/**
 * Parche's middleware, added by the integration: puts the request's locale
 * in Astro.locals.parche for the components. Users can replace it through
 * `routes.middleware` in the Parche config.
 */
export const onRequest = defineMiddleware((context, next) => {
  // Astro's i18n system sets currentLocale automatically even in manual mode
  // We expose it in locals for convenience in user components
  const locale = context.currentLocale || defaultLocale;

  context.locals.parche = {
    locale,
  };

  return next();
});
