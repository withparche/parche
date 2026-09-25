# The content model: nodes, slots, outlets

Provisional, like everything in `docs-wip/`. This is the model the
`experimental` branch renders; the official docs will be written from it.

## One shape for everything

A page, a layout and a preset are all trees of **nodes**:

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
`<slot />`. A slot left empty keeps the widget's own fallback content. Trees
stop at three levels.

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
a preset.

## The wrapper

Every page root is rendered inside the **wrapper** widget, `Section`, with its
default props, unless the widget's meta says `wrapper: false` (a Hero, a
banner: anything that owns its own width and padding). To change the band a
root sits in, write the `Section` node yourself:

```json
{
  "widget": "Section",
  "props": { "tone": "muted", "id": "pricing", "label": "Pricing" },
  "slots": { "default": [ { "widget": "Pricing", "props": { … } } ] }
}
```

`Section` is a widget like any other, declared by the `ui` parche with
`wrapper: 'Section'` in its manifest. A site or parche may declare another
widget with a default slot as the wrapper. Core knows no widget names: with no
declaration, roots render bare.

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
does not allow, `min` and `max`, the depth limit, and a wrapper tone nobody
registered. In dev, the renderer runs it on every page and layout and prints
each issue with its path:

```
[parche] sections[2].slots.bogus: "Section" has no slot "bogus" (it declares: default)
[parche] sections[2]: tone "neon" is not registered (known: default, muted, dark, primary, glow, gradient, dots)
```

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

## Presets

A preset is a saved subtree with real values, in the `presets` collection
(`src/content/presets/<locale>/<name>.json`):

```json
{ "label": "Questions agencies ask", "tree": [ { "widget": "FAQs", "props": { … } } ] }
```

A page inserts it by name, and the renderer replaces the node by the tree
before validating and rendering, so a change to the preset shows everywhere
it is used:

```json
{ "widget": "Preset", "props": { "name": "faq-agencies" } }
```

An editor may instead copy the tree into the page, which is the same result
without the link. A preset may contain another; expansion stops three deep.
The locale's preset wins over the plain name.

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

## Themes on the layering

`product` and `editorial` are the redesign's two directions on the same
markup. Each overrides sys roles and type styles, ref radii (and shadows,
for Editorial), and the conf knobs the Section element and the Container
read for rhythm and measure; neither touches an element. The Product theme
is the demo's default look.
