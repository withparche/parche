# App parches worth building

Provisional, like everything in `docs-wip/`. Ideas for app parches after the
blog, and the rule that decides whether something is one. Nothing here is
scheduled.

## What makes an app parche

An app parche is an application with a domain and rules of its own, as the
blog is (dates, authors, taxonomies, feeds). It builds on core's page kit
(`parche:Page`, `utils/paths.ts`, `urls`, resolvers) and never copies core.

Pages made from a collection of plain data are not an app: `collections` in
the site config and a pattern already give every entry a page
(`collections.md`). Case studies, a portfolio or team pages stay there.
Content that is only content (an FAQ, a price list) is widgets and patterns.

Parche sites are mostly static. What needs state on a server (free slots,
stock, payments) is left to a provider the business already uses: the app
shows what is offered and hands the booking, the order or the payment over.

## Site search, in core

Not an app: every site needs it, whatever its parches. The blog had a search
of its own (a Pagefind index over the built pages and a `/search` page) and it
was taken out, for two reasons: it found only posts, while the header's
search button promised the whole site; and it read the prerendered HTML, so
on a server-rendered site it found nothing.

What a site search has to be:

- **The whole site.** Pages, posts, collection entries, and whatever each
  parche has: the blog gives its posts, a shop its products, careers its
  openings, each with its own kind (to label and filter results) and without
  the search knowing their domains.
- **The same static or on a server.** The index is built from the content,
  not from the built HTML, so it does not depend on what is prerendered. Where
  content changes without a rebuild (a CMS publishing on its own), a
  server-side search over the same records.
- **No external service by default.** An index served with the site and
  searched in the browser (Pagefind's Node API takes records directly;
  MiniSearch or Orama over a JSON index are the alternatives), with a way to
  hand over to a hosted one (Algolia, Typesense) for large sites.
- **One entry point.** A header button and ⌘K, a results page whose address
  keeps the query, and the `SearchAction` in the site's structured data only
  when the search exists.

The Search element (`parches/elements/src/search`) is a starting point for the
interface. Study how today's sites do it before building, as with the blog.

## For companies

- **Careers** (`astro-careers`). Openings by department and location, closed
  ones gone on their own, `JobPosting` structured data for Google's job
  search, and openings read from the applicant-tracking system (Greenhouse,
  Lever, Ashby) instead of written twice.
- **Changelog** (`astro-changelog`). Entries by version and date, labelled
  new, improved or fixed, with a feed of their own and a "what's new" widget
  for the home page or the product.

Not docs: Starlight, maintained by the Astro team, already does it well. If
docs must look like the rest of a site, a bridge that gives Starlight
Parche's tokens, themes, header and footer costs far less than a rewrite.

## For small businesses

What a small business's site has to answer: when it is open, where it is,
what it offers, and how to book or order.

- **Locations and hours** (`astro-locations`). The weekly hours with their
  exceptions (holidays, closures), "open now", a map, a page per location
  when there are several, and `LocalBusiness` structured data. Nearly every
  business needs it, and the others build on it.
- **Booking** (`astro-booking`). One app for appointments and classes, which
  share a model: what is offered (services and classes, with duration, price
  and level), who gives it (staff and instructors, each with a page) and
  where (locations and rooms, from `astro-locations` when present). They
  differ in who picks the time:
  - appointments: the client picks a free slot for one person (a haircut, a
    consultation); a list of services, each with its booking;
  - classes: the business sets the sessions and people join until they are
    full (yoga on Mondays at six); a weekly timetable by day and room.

  A salon turns on appointments, a dance studio the timetable, a gym both,
  sharing its instructors and locations. The booking itself goes through the
  provider (Cal.com, Calendly, Square, Mindbody, Momence), with "add to
  calendar" and the structured data done by the app.
- **Menu** (`astro-menu`). Sections, dishes and prices, allergens and diets,
  specials of the day, menus by time of day, a version to print or open from
  a QR code, and `Menu` structured data.
- **Catalogue with direct orders** (`astro-catalog`). Products with pictures
  and prices, ordered by WhatsApp or through a payment link (Stripe,
  Mercado Pago) instead of a cart and a checkout: how many small shops sell,
  in Latin America most of all.

The demo's local-business home (Vela) is where these would be tried first.
