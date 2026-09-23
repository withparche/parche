# Element conventions

An *element* is a foundational, token-driven building block widgets compose
from — a button, a card, a set of tabs. Elements live in `@parche/elements`
(`parches/elements`) and reach widgets through `parche:elements/<Name>`.
Static elements are plain `.astro` with zero client JavaScript; interactive
ones are **HTML web components**: the `.astro` renders complete, accessible
markup on the server, a small custom element upgrades it on the client.

## The folder

One folder per element under `src/`, named in kebab-case after the element:

```
src/tabs/
  Root.astro  List.astro  Tab.astro  Panel.astro   # parts (compound element)
  index.ts            named re-exports of the parts, relative imports
  tabs.props.ts       zod schema (+ parts.<Part>.schema) and meta
  tabs.element.ts     the custom element — interactive elements only
  tabs.css            only what utilities cannot express (rare)
  README.md           purpose, when to use, prose with :::example blocks
  examples/*.astro    real usages; rendered by the playground and the tests
  element.json        copy-readiness file list and dependencies
```

A single-part element has `<Name>.astro` instead of parts and no `index.ts`.

The contract test (`test/unit/contract.test.ts`) enforces all of this for
every folder: props and meta exports, README and at least one example,
`element.json` listing exactly the folder's files, `meta.parts` matching the
`data-part` values the `.astro` files emit, tokens that exist in
`semantic.css`, no raw palette class, and imports that stay inside the folder,
on the allow-list, or in a declared `registryDependencies` sibling.

## Props

`<name>.props.ts` exports `schema` (zod), `type Props`, and `meta` built with
`defineElement()`:

```ts
export const meta = defineElement({
  element: {
    label, description,
    a11y: { pattern: 'tabs', url },         // WAI-ARIA APG pattern
    tokens: ['color-surface', 'color-ring'],// --ds-* tokens consumed
    tag: { name: 'parche-tabs', entry: './tabs.element.ts' }, // interactive only
    keyboard: { 'ArrowRight': '…' },        // required with tag
    noJs: '…',                              // required with tag
    parts: [{ name: 'root', element: 'div', role, states }],
  },
});
```

In the `.astro`, `splitProps(schema, Astro.props)` returns the parsed known
props, the `class` to merge, and `rest` — every unknown attribute, which the
element spreads onto its root. That is what lets a consumer add `id`, `aria-*`
or `data-*`, and lets a composition rename a child's part
(`<Eyebrow data-part="tagline">` inside Heading).

## Styling API

Every part emits three hooks a theme or a project can target without touching
the source:

- class `parche-<name>` on the root and `parche-<name>-<part>` on parts;
- `data-part="<part>"`;
- `data-state` for the current state (`open`, `active`, `disabled`…), plus
  `data-variant`, `data-size`, `data-tone` where they apply.

Utilities inside a part use Tailwind's `data-[state=active]:` variant. Variant
axes are declared once with `defineVariants({ base, variants, compound,
defaults })`; the zod enum is the source of truth for the options.

**Tokens only.** No `bg-green-500`, no `text-white`, no `dark:` overrides:
`bg-surface`, `text-heading`, `border-border`, `outline-ring`, the status
roles `success`/`warning`/`danger` with `on-*` and `*-soft`, `primary-soft`,
`surface-hover`, `highlight`, `overlay`. Every one is defined for light and
dark in `packages/core/src/styles/semantic.css` at WCAG AA. The accessibility
gate found and fixed three of them on the way: dark `muted` (4.1 → 5.05:1),
dark `primary` (3.3 → 6.2:1, with `on-primary` going dark), light status text
(700 steps instead of 600).

## Accessibility is a gate

Roles and states are rendered on the server, so the no-JS state is correct
before any script runs. Every element has an example for every variant in
the playground (`parches/elements/playground`), and the browser suite runs
axe (WCAG 2.1 AA, light and dark, transitions frozen) over every page in
Chromium, Firefox and WebKit, plus a no-JavaScript pass and a reduced-motion
pass. An element that does not pass does not land.

## Interactive elements

`ParcheElement` (`@parche/elements/client`) is the base:

- `static define()` — registers the tag once; a no-op on the server and when
  a copy is already defined, so a package copy and an ejected copy coexist.
- `connectedCallback` is idempotent; all listeners share one `AbortController`
  and are removed on disconnect; `setup(signal)` runs once, `update()` on
  connect and on every observed attribute change. State lives in attributes,
  so a DOM morph (the builder, view transitions) re-syncs the element for free.
- `parts(name)` / `part(name)` find this instance's parts by `data-part`,
  excluding nested instances of the same tag.
- `emit('change')` dispatches `parche:change` (bubbling, cancelable);
  `emitted('change')` the non-cancelable `parche:changed` after.
- No shadow DOM, no templates, no framework runtime. Native first:
  `details`, `dialog` + invokers, `popover`, native inputs; JavaScript only
  for what the platform does not do.

The element module must be importable on Node and workerd: nothing touches
`window` or `document` at module scope (the test suite imports every module
without a DOM).

## Eject and copy

Widgets import `parche:elements/<Name>`; the virtual path is what makes one
Button swappable for another. Eject = copy the folder to `src/elements/<name>/`
and rewrite the imports in your own widgets to `@/elements/<name>`. For widgets
you cannot edit (installed from npm), redirect the virtual id instead:
`overrides: { 'elements:Button': './src/elements/button' }` — a directory
resolves to its `index.ts`, and a compound element must keep the original's
named exports (checked at load time).

The rules that keep a folder copyable are the contract test's: relative
imports inside the folder, `@parche/elements/utils`, `@parche/elements/client`,
`astro:*` or a declared npm dependency; other elements only through
`registryDependencies` (the copy brings the closure). `element.json` follows
shadcn's registry-item shape without `cssVars`, `tailwind` or `target`.
