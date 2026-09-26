/**
 * A date as the site writes it. Frontmatter dates without a time are UTC
 * midnight, so they are formatted in UTC: formatted in the build machine's
 * zone, "2026-08-01" would read "31 Jul" west of Greenwich. A `timeZone` in
 * the site's `dateFormat` wins.
 */
export function formatDate(d: Date, locale: string, opts: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString(locale, { timeZone: 'UTC', ...opts });
}
