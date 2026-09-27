# Pages from a collection

Provisional, like everything in `docs-wip/`. `collections` in the site
config gives every entry of a collection of plain data a page of its own,
laid out with Parche. The demo's store is the example: three products, each
at `/homes/store/<id>`.

## The idea

A collection holds only its data: a product's name, price, stock, specs. No
widgets, no page structure. The site gives it the schema it wants in
`content.config.ts`, as any Astro collection, and its entries can come from
files or from any Astro loader (a shop, a CMS, an API).

The page's structure is a widget's: a registered one, the site's own, or a
pattern (`pattern/product-page`), which lays the page out with widgets that
exist and takes the entry's fields as props.

```json
// src/parche.config.json
{
  "collections": {
    "products": { "path": "/homes/store/%slug%", "widget": "pattern/product-page", "layout": "corvo" }
  }
}
```

The name is the collection's, as `content.config.ts` declares it. This only
gives the collection pages: its entries and its schema stay where Astro keeps
them. It is plain data, so the builder's Site panel edits it as it edits the
rest of the site config.

```json
// src/content/products/moss-weekender.json: only the product
{ "name": "The Moss weekender", "price": "£248", "stock": { "label": "In stock", "state": "in" }, "summary": "…", "specs": [ … ] }
```

```json
// src/content/patterns/product-page.json: the page, built with Parche
{ "label": "Product page", "props": { … }, "tree": [
  { "widget": "Hero", "props": { "title": { "$prop": "name" }, "subtitle": { "$prop": "summary" }, … } },
  { "widget": "Callout", "props": { "title": "What it is made of", "rows": { "$prop": "specs" } } },
  { "widget": "FAQs", "props": { "title": "Care and repairs", "items": { "$prop": "care" } } }
] }
```

## Each collection

| Key | |
|---|---|
| `path` | Where each entry is served; `%slug%` is the entry's `slug` field, else its id without the locale folder. The locale prefix is added as for every page. |
| `widget` | What renders each entry: a widget or `pattern/<id>`. |
| `props` | Optional. Widget prop ← entry field (dotted path), for the props whose names differ: `{ "title": "name", "image": "photos.0" }`. |
| `layout` | The layout the pages use. Default `default`. |
| `metadata` | Optional. Which fields give the page's title, description and picture. Defaults: `title` or `name`, `description` or `summary`. |

A `path` without `%slug%`, an empty `widget` or an unknown key fails the
config. A name with no entries (a collection `content.config.ts` does not
declare, or an empty one) fails the build, and so does a collection an app
already serves (the blog's `posts`).

## What the widget is given

- The entry's fields the widget declares, by name, and the ones `props` maps.
- A field the widget does not declare is left out. The collection may
  describe its entries fully while a page shows a part of them.
- A field the widget requires and an entry lacks fails the build, naming the
  page's address, like any content issue.

A pattern cannot choose between widgets (it has no conditions), so an entry
says what it offers: the demo's products carry `cart` while they are in
stock and `restock` when they are not, and the pattern lists both as
actions. A placeholder with no value drops out.

## Links to the pages

Core knows each collection's addresses, as it knows those an app declares
(`urls` in its manifest), so an entry a `{ "$collection": "products" }` yields carries its
`href`. The store's list is one:

```json
{ "widget": "Products", "props": { "items": { "$collection": "products", "sort": "order" } } }
```

## How it works

- Core serves the pages from its page route through a resolver, as the
  blog's root-level posts are, registered only when the site names a
  collection: `getPaths` lists an address per entry, `resolve` finds the entry
  an address names.
- The page is its layout and one node, `{ widget, props }`, rendered with the
  layout's wrapper.
- Its metadata is resolved by core's `pageMetadata`, as an app page's is,
  with the entry's own `metadata` first.
- Translations are the same entry id in another locale folder. An entry with
  `draft: true` is shown in dev only.

## Why it is core and not a parche

It was a parche first (`@parche/astro-collections`). It moved into core
because it has no domain of its own: it is core's own idea of a page, an
entry rendered by widgets, opened to any collection, and its settings are
plain data. What stays out of core is an application with a domain and its
own rules, as the blog is (dates, authors, taxonomies, feeds); such apps
build on the same mechanisms.

## Not yet

- Listing pages with pagination for a collection (a list on a page works now
  with `$collection`).
- Editing a collection's entries in the builder.
