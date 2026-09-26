# The content model: nodes, slots, outlets

Provisional, like everything in `docs-wip/`. This is the model the
`experimental` branch renders; the official docs will be written from it.

## One shape for everything

A page, a layout and a pattern are all trees of **nodes**:

```json
{ "widget": "Hero", "props": { "title": "Pages are data" } }
```

A node is a widget with its props. A widget that declares **slots** in its
`.props.ts` can hold other nodes, by slot name:

```json
{
  "widget": "Hero",
  "props": { "title": "Get early access", "media": "right" },
  "slots": {
    "media": [ { "widget": "Form", "props": { "action": "/api/waitlist" } } ]
  }
}
```

The slot names are the widget's Astro slots: `slots.media` in the JSON lands
in `<slot name="media">` in the `.astro`, and `slots.default` in the unnamed
`<slot />`. A slot left empty keeps the widget's own fallback content. A tree
nests as deep as the site wants; a part that repeats is usually better kept
once, as a pattern (see *Patterns*).

The schema is `nodeSchema` in `@parche/astro/content`; `notes` is a free-text
field for whoever edits the page next and is never rendered; `id` is an
optional stable identifier an editor may write.

## Pages

```json
{
  "title": "Docs: Getting started",
  "layout": "sidebar",
  "sections": [ { "widget": "Prose", "props": { "body": "…" } } ],
  "slots": { "aside": [ { "widget": "Toc" } ] }
}
```

`sections` fills the layout's unnamed outlet; `slots[name]` fills a named one.
There is no `template` any more: what a template did is a layout, a widget or
a pattern.

JSON is the format of pages, layouts, patterns and menus: it is what the
builder reads and writes, what an AI is asked to produce and what the
schemas are checked against, so everything Parche ships and scaffolds is
JSON. The collections also accept YAML (and pages Markdown with front
matter) with the same schema, for someone who prefers to write a page by
hand; it renders the same page byte for byte. Nothing is YAML by default.

## The wrapper

Nothing is wrapped by default. A tree renders as written, and a node inside
a slot is never wrapped. A wrapper belongs to a **list**: the classic page is
a list of widgets that each want the same band around them (the measure, the
rhythm, sometimes an anchor), so the list says so once. Usually that is the
layout's outlet, which covers every page using the layout:

```json
{ "widget": "Outlet", "props": { "wrapper": { "widget": "Section", "props": { "spacing": "md" } } } }
```

Every item of that list is rendered inside `Section` with those props. A
page can wrap its own sections differently with `"wrapper": { … }` next to
`sections`, or `"wrapper": false` for none. `widget` may be left out when a
parche names a default (`ui` declares `wrapper: 'Section'` in its manifest),
but writing it keeps the JSON self-explanatory.

An item that needs other props says so on itself, with its own `wrapper`,
the same object a list declares:

```jsonc
// The list's wrapper widget (Section), with these props over the list's.
{ "widget": "Pricing", "wrapper": { "props": { "tone": "surface", "id": "pricing" } }, "props": { … } }

// Another wrapper widget, with only its own props.
{ "widget": "Features", "wrapper": { "widget": "Band", "props": { "angle": 3 } }, "props": { … } }

// No wrapper for this item.
{ "widget": "Gallery", "wrapper": false, "props": { … } }
```

The wrapper is decoration, not composition: it holds only that node. It
works in any list, a slot's too, and an explicit wrapper applies even to a
widget that is bare by default. The wrapper widget must be registered and
declare a `default` slot; a pattern has no slots, so it cannot be one. A
`$prop` inside a pattern's tree works in `wrapper.props` as in `props`.

Writing the wrapper as a node is still valid, and it is the form for a band
that holds several widgets:

```json
{
  "widget": "Section",
  "props": { "tone": "surface", "id": "pricing" },
  "slots": { "default": [ { "widget": "Pricing", "props": { … } }, { "widget": "Callout", "props": { … } } ] }
}
```

It is not wrapped again, and it takes the list's props as its defaults, so it
writes only what differs. A widget whose meta says `wrapper: false` (a
full-bleed Hero, the Header) is left bare in a wrapped list unless the item
asks. A wrapper that names an unknown widget, one with no default slot, or an
unregistered tone is a content issue with its path, like any other.

`Section`'s props: `tone`, `width` (`sm` … `full`), `spacing` (`none` …
`lg`), `id` (the anchor) and `label` (what navigation calls it).

## Tones

A tone is a name for the band's colour treatment. Core ships `default`,
`muted`, `dark` and `primary`; `dark` re-declares every colour role for dark
mode inside the band, `primary` puts the brand colour under everything. The
`ui` parche adds `glow`, `gradient` and `dots`. A parche adds a tone with
`tones: [{ name, label }]` in its manifest and a `.parche-section[data-tone="name"]`
rule in its styles; a site adds one the same way in its own CSS and config.
Nothing in the content is HTML.

## Layouts and outlets

A layout is a tree of nodes with **`Outlet`** nodes where the page goes:

```json
{
  "sections": [
    { "widget": "Header", "props": { … } },
    { "widget": "Outlet" },
    { "widget": "Footer", "props": { … } }
  ]
}
```

`{ "widget": "Outlet" }` is the unnamed outlet, the page's `sections`;
`{ "widget": "Outlet", "props": { "name": "aside" } }` takes the page's
`slots.aside`. An outlet may sit at any depth, inside a `Columns` for a docs
shell. Layout roots are chrome and are not wrapped.

## References

Content that lives once in a collection is pointed at from props, not copied
into them. There are two forms, and the renderer resolves both before a widget
sees its props, so widget schemas stay plain lists and objects and any widget
can take a reference:

```json
{ "$ref": "navigation/main" }
{ "$ref": "authors/marta#/name" }
{ "$collection": "posts", "sort": "-publishDate", "limit": 3, "filter": { "category": "guides" } }
```

- `$ref` names one entry, `<collection>/<id>`, looked up in the page locale
  first (`es/main`), then without one (`main`). It yields the entry's data,
  or the field an optional JSON Pointer after `#` names. A menu is the one
  exception: `navigation/<name>` yields the menu's `items`, the list a header
  or footer prop takes.
- `$collection` is a query: the page locale's entries when the collection is
  split by locale, drafts left out, then `filter` (equality, or membership
  for an array field), `sort` (a field, `-` for descending) and `limit`. It
  yields a list of the entries' data, each with its `id`.
- An object is a reference only when it has nothing else in it (`$ref`
  alone; `$collection` with only those three options). A reference that does
  not resolve renders empty and is a content issue with its path, which fails
  a build like the others.

### Menus

Menus are one such collection, `navigation`: one file per menu and locale,
`src/content/navigation/<locale>/<name>.json`, holding
`{ "label": "Main menu", "items": [ … ] }` with the items in the shape the
consuming prop takes. A layout then holds structure only:

```json
{ "widget": "Header", "props": { "links": { "$ref": "navigation/main" }, "actions": [ … ] } }
```

and an editor changes a link once for every layout that shows it.

## Props first, slots for the variation

A widget's props should be rich enough for most pages to need nothing else:
the default is a widget filled in with props. Slots exist for the variation
a widget cannot foresee, so it bends instead of multiplying: a form where a
hero's image goes, a row of reviews under its subtitle, a code block above a
features grid. They are not the way to build a section out of small pieces.

When a combination keeps coming back in slots, it is a prop the widget is
missing. The demo showed three: a Section around every block (now a node's
`wrapper`), a Switch over two copies of Pricing (now Pricing's `periods`),
and a Screenshot alone in a Hero's or Features' media slot, used as a
captioned placeholder (now their `image`, which takes Screenshot's options).
What stays in slots is what varies: numbers or a status line under a hero,
two different widgets side by side in Columns, a note after a widget in the
same band.

## Declaring slots in a widget

```ts
export const meta: WidgetMeta = {
  widget: { label: 'Hero', category: 'hero', wrapper: false },
  slots: {
    media: { label: 'Media', allow: ['Image', 'Video', 'Form'], max: 1 },
  },
};
```

`allow`, `min` and `max` are read by the builder and by the validator, not by
zod: the schema does not know the registry.

## Validation

`validateTree(nodes, ctx)` from `@parche/astro/content` checks a tree against
the catalog: unknown widgets, slots a widget does not declare, widgets a slot
does not allow, `min` and `max`, and a wrapper tone nobody registered. How
deep a tree nests is not checked: that is the site's call. In dev, the renderer runs it on every page and layout and prints
each issue with its path:

```
[parche] sections[2].slots.bogus: "Section" has no slot "bogus" (it declares: default)
[parche] sections[2]: tone "neon" is not registered (known: default, muted, dark, primary, glow, gradient, dots)
```

The uses of patterns are checked on the same pass: their props against the
pattern's schema, and the pattern's own tree (see *Patterns*).

In a build, a prerendered page with issues fails the build with the same
lines, which is the check CI runs; a page rendered on a server at request
time is not checked, so the catalog, which imports every widget's schema,
never loads on a request.

## Migrating content

`node scripts/migrate-nodes.mjs [paths]` rewrites the previous section model:
`wrapper` objects become explicit `Section` nodes (`bg` gradients become the
`glow`, `gradient` and `dots` tones, `classes.container` becomes `width` and
`spacing`), `wrapper: false` is dropped, `layout/Main` becomes `Outlet`, and
`template` is removed. Then every node's props move to the common vocabulary
below (`stats`, `testimonials`, `members`, `entries`, `projects`, `prices`,
`demos` → `items`; `callToAction` → `actions`; Features `style` → `layout`;
Pricing `hasRibbon`/`ribbonTitle` → `recommended`/`badge` and a plan's
`items` → `features`; form `action`/`button` → `endpoint`/`submit`; blog
`linkText`/`linkUrl`/`information` → `link`/`subtitle`). Renamed keys stay
where the author put them, and running the script twice changes nothing.
Front matter in Markdown pages is reported for hand editing.

## Patterns

A pattern is a composition of widgets kept once and used by name wherever
a widget goes. It serves two purposes with one shape:

- **Content shared as it is.** The same FAQ on several pages: the pattern
  holds the widgets with their values, and a change to it shows everywhere
  it is used.
- **An abstraction with props.** A product page, a tour step: the tree is
  fixed and each use gives only the values, which placeholders put where
  they belong (the title in the first widget, the description in the
  second…).

The two meet: a shared FAQ can declare a `title` prop with a default, and a
page that wants another title gives it while sharing the rest.

One file per pattern in the `patterns` collection; the id is the file's
path, and a page uses it as `pattern/<id>`:

```
src/content/patterns/tour-step.json        →   "widget": "pattern/tour-step"
src/content/patterns/en/faq-agencies.json  →   "widget": "pattern/faq-agencies"   (in an English page)
```

A pattern written per language lives in the locale's folder; the id is
looked up in the page's locale first (`en/faq-agencies`), then as written
(`faq-agencies`). A pattern whose text comes in through props usually lives
outside any locale folder and serves every language.

```json
{
  "label": "Tour step",
  "description": "One screen of a product tour beside what it does and one action.",
  "category": "content",
  "icon": "tabler:device-desktop",
  "props": {
    "type": "object",
    "properties": {
      "url": { "type": "string", "description": "The bar over the screen." },
      "ratio": { "type": "string", "enum": ["16/10", "16/9", "4/3"], "default": "16/10" },
      "title": { "type": "string", "minLength": 1 },
      "actions": { "type": "array", "items": { "type": "object", "properties": { "text": { "type": "string" }, "href": { "type": "string" } }, "required": ["text", "href"] } }
    },
    "required": ["url", "title"]
  },
  "tree": [
    { "widget": "Columns", "props": { "ratio": "equal", "align": "center" }, "slots": { "default": [
      { "widget": "Column", "slots": { "default": [
        { "widget": "Screenshot", "props": { "url": { "$prop": "url" }, "ratio": { "$prop": "ratio" } } }
      ] } },
      { "widget": "Column", "slots": { "default": [
        { "widget": "CallToAction", "props": { "layout": "stacked", "title": { "$prop": "title" }, "actions": { "$prop": "actions" } } }
      ] } }
    ] } }
  ]
}
```

```json
{ "widget": "pattern/tour-step", "props": { "url": "src/config.yaml · 1200×760", "title": "One file for the whole site" } }
{ "widget": "pattern/faq-agencies" }
```

The collection has to be exported by the site, like the others:

```ts
const { pages, layouts, patterns, navigation } = createCollections();
export const collections = { pages, layouts, patterns, navigation };
```

**The pattern**

- `label` (required), `description`, `category`, `icon`: what a palette shows,
  as in a widget's `meta.widget`.
- `props` (optional): the props a use takes, as **JSON Schema** (an object
  schema: `properties`, `required`, and per prop `type`, `enum`, `default`,
  `minLength`, `items`… and `description` for the help text). Core turns it
  into a zod schema with `z.fromJSONSchema`, the same zod the code widgets
  are written in. Unknown props are refused unless the schema sets
  `additionalProperties`; a pattern without `props` takes none.
- `tree`: the nodes it renders, one or more.

**Placeholders.** In the tree, a value `{ "$prop": "title" }` takes the
value of the prop. A dotted path reaches into an object prop:
`{ "$prop": "link.href" }`. A placeholder whose prop has no value drops its
key (or its array item), so the inner widget's own default applies. A
placeholder is a whole value; it is not interpolated inside a string.

**Where it is used.** A use stands for the pattern's roots. In a list they
are items of that list, each wrapped (or not) as if written there; the
use's own `wrapper`, when it has one, is theirs. In a slot that allows only
some widgets, a pattern goes when every root is one of those, and a slot's
`min` and `max` count its roots.

**Validation.** Every use, and the pattern itself, is checked with the rest
of the page (a warning in dev, a failed build when prerendered):

- each use's props against the pattern's schema, with the defaults applied,
  reported at the use's path in the page (`sections[1].slots.config[0].props.title`);
- the pattern against itself: every placeholder names a declared prop, and
  every declared prop is used;
- the tree like any tree (widgets exist, slots are declared and allowed,
  tones);
- the uses inside it, with the values the use gives them;
- a use that names no pattern, and a pattern that reaches itself (`a` uses
  `b` uses `a`), which is reported where the loop closes and not rendered;
- then each inner widget parses its own props when it renders, as always.

A pattern takes no slots of its own. References (`$ref`, `$collection`)
inside it are resolved like a page's.

**Pattern or Astro widget?**

| | A pattern | An Astro widget |
|---|---|---|
| What it is | Widgets that exist, arranged once, with or without props | New markup, style or behaviour |
| Parameters | Optional props, JSON Schema | Declared props, zod in `.props.ts` |
| Used as | `{ "widget": "pattern/tour-step", … }` | `{ "widget": "TourStep", … }` |
| Lives in | `src/content/patterns/` | `src/widgets/` + `overrides`, or a parche |
| Needs | Nothing | Code, and `zod` as a dependency |

Reach for a pattern when the thing is only an arrangement of widgets that
exist; write an Astro widget when it needs markup, CSS or script that no
widget has.

Not yet: filling a pattern's slots from the page (`{ "$slot": … }`).

## Widgets on the model

A widget is one purpose; differences of shape are a prop, structure is a
slot. `Hero` has `layout: center | split | text` and the slots `media` and
`proof`; `Features` has `layout: grid | cards | list | panels | tiles` and
a `media` slot; `Steps` has `layout: timeline | grid | numbered | rows` and a
`media` slot;
`Content` has a `media` slot; `CallToAction` has `layout: card | band |
inline`. The containers are `Columns` (two to four `Column`), `Column`, and
`Switch`, a segmented control with one slot per option: its meta declares
the slot `*`, which the validator reads as "any name, with this meta".

Content shapes shared by the widgets live in `parches/ui/src/_shared/content.ts`:
`action`, `image`, `sourcedNumber` (value, unit, label, source, date, href),
`verifiedQuote` (text, name, role, avatar, date, source, href),
`responseTime`, and `collectionRef`, a reference a widget may accept in place
of an inline list once the renderer resolves it.

## One vocabulary for props

The same idea has the same name in every widget, so an author learns it once
and the builder edits it with one form:

| Prop | Means | Shape |
|---|---|---|
| `tagline`, `title`, `subtitle`, `link`, `align` | The section's heading | `heading()` in `_shared/content.ts`, spread into the schema |
| `items` | The things a section lists: features, numbers, quotes, people, plans, demos, entries | an array of the widget's item shape |
| `actions` | Buttons, at any level, always a list | `action[]` (`variant`, `text`, `href`, `target`, `icon`) |
| `link` | One text link: beside a heading, under an item | `{ text, href }` |
| `description` | An item's body text | string, inline HTML allowed |
| `layout` | How the widget arranges its content | an enum per widget |
| `variant` | A visual flavour of the same arrangement | an enum per element |
| `endpoint`, `submit` | Where a form posts, the submit label | strings |
| `badge`, `note` | A short label on an edge; one line under the content | strings |

Every section widget opens with the heading, rendered by one component
(`SectionHeader`), and lists `headingGroup` first in its builder groups. A
widget sets the default alignment that suits it (`heading({ align: 'center' })`);
a few decide it from their layout when the content does not say (the Steps
grid and the FAQs accordion centre, their other layouts start).

## Inline Markdown in short texts

Headings, subtitles, item titles and descriptions, notes and quotes read a
small inline Markdown, so content never needs HTML to stress a word:
`**strong**`, `*em*` or `_em_`, `` `code` ``, `[link](/path)`,
`==highlight==` (the highlight role), and a newline for a line break. There
are no blocks: a text that needs paragraphs or lists is a Prose body. HTML
already in a text passes through, and Markdown is only read between tags,
so older content keeps working; `migrate-nodes.mjs` turns the common spans
(highlight, mono, semibold, `<br>`) into Markdown. Fields that accept it
carry `markdown: 'inline'` in their meta (`text()` in `_shared/content.ts`),
which the builder can read to offer formatting. The renderer is
`parches/ui/src/_shared/inline.ts`.

## Themes on the layering

`product` and `editorial` are the redesign's two directions on the same
markup. Each overrides sys roles and type styles, ref radii (and shadows,
for Editorial), and the conf knobs the Section element and the Container
read for rhythm and measure; neither touches an element. The Product theme
is the demo's default look.

## A site's own token values

A site can set token values of its own without writing a theme, in
`src/parche.tokens.json`, over the base look or over one theme, light and
dark:

```json
{
  "base": { "light": { "--ds-sys-color-primary": "oklch(0.52 0.15 150)" } },
  "themes": { "product": { "dark": { "--ds-sys-color-surface": "oklch(0.2 0.02 260)" } } }
}
```

Core serves it as the last stylesheet (`parche:config/token-overrides.css`),
with the selectors the tokens and themes use themselves, so a value wins
where it is scoped; in dev a change to the file reloads that CSS alone.
Names are checked against the generated catalog (any `--ds-comp-*` passes:
components declare their own) and values must stay values (no `;`, `{`,
`}` or `</`); what fails is left out with a warning. The visual builder's
Design panel writes this file.
