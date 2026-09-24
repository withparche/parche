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
    { "widget": "layout/Header", "props": { … } },
    { "widget": "Outlet" },
    { "widget": "layout/Footer", "props": { … } }
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

`allow`, `min` and `max` are read by the builder and by the build check, not by
zod: the schema does not know the registry.

## Migrating content

`node scripts/migrate-nodes.mjs [paths]` rewrites the previous section model:
`wrapper` objects become explicit `Section` nodes (`bg` gradients become the
`glow`, `gradient` and `dots` tones, `classes.container` becomes `width` and
`spacing`), `wrapper: false` is dropped, `layout/Main` becomes `Outlet`, and
`template` is removed. Front matter in Markdown pages is reported for hand
editing.
