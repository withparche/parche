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
without a DOM), and the SSR smoke (`test/ssr-smoke.mjs`) renders every
element per request on both adapters through `/elements` in the SSR examples.

### Overlays: the platform owns them

Dialog, Sheet and Popover are the native `<dialog>` and `[popover]`, opened
declaratively:

- **Invokers, not wiring.** Any button anywhere with `command="show-modal"
  commandfor={id}` opens a Dialog or Sheet; `popovertarget={id}` toggles a
  Popover and becomes its anchor. Elements take an explicit `id` for that
  reason: the trigger and the surface are linked by the document, not by the
  element, so they work with no script and they survive a DOM morph.
- **Polyfills only where missing, loaded lazily.** `invokers-polyfill` and
  `@oddbird/popover-polyfill` are imported at run time after a feature check;
  evergreen browsers never download them. CSS anchor positioning has no
  polyfill: where it is absent the element positions the popover with
  `@floating-ui/dom`, also lazy. The build budget counts these chunks apart
  from the eager ones (`test/assert-dist.mjs`).
- **What the element adds** is small and the same everywhere: the
  `data-state` hook, `parche:open` / `parche:close` (cancelable) and their
  after-events, `aria-expanded` on popover invokers, and the `closedby`
  behaviour where the attribute is unknown. Focus trap, Escape, light dismiss
  and focus return are the platform's.
- **Transitions live in the element's `.css`** (`@starting-style`,
  `allow-discrete`), under `prefers-reduced-motion: no-preference`, and never
  carry function.

### Composites: the pattern on the server, the behaviour in the element

Tabs, Menu, Tooltip, Toast and Carousel are the elements with real script,
and each keeps it small by rendering the APG pattern complete on the server:

- **Tabs** is data-driven (`items`; a panel is a slot named after its tab's
  value, or `content` HTML). A compound `Tabs.Root / Tab / Panel` cannot
  know the selected value on the server: Astro has no component context, so
  every part would have to repeat it. Inactive panels are
  `hidden="until-found"`: find-in-page reaches them and a match selects the
  tab (`beforematch`); Tailwind's preflight also leaves that value alone,
  where its `[hidden]` rule (`!important` inside a layer) beats any unlayered
  override. Without script all panels show under headings and the list
  hides, through `@media (scripting: none)` so nothing flashes for users
  with script.
- **Menu** extends the Popover element: the trigger is a `popovertarget`
  button with `aria-haspopup="menu"`, the surface is `role="menu"`, items are
  data (`groups`) and an item with `checked` is a `menuitemradio`. Focus
  enters the list on open and goes back to the trigger on close from the
  element itself, because WebKit never focuses a clicked button and the
  platform's own focus return would land on `<body>`.
- **Tooltip** wraps its trigger and anchors a `popover="manual"`
  `role="tooltip"` to the wrapper; `aria-describedby` is set on upgrade.
  Without script, CSS shows it on `:hover` / `:focus-within`.
- **Toast** is one live region per page (`role="status"` around a list) plus
  a template the element clones. Anything notifies by dispatching
  `parche:toast` on `document`. Server-rendered `items` work with no script.
- **Carousel** is the one compound element (`Root` + `Slide`): scroll-snap
  does the scrolling, the element drives the buttons and the picker from an
  IntersectionObserver. No autoplay.

The placement grammar (`data-anchored` + `data-placement` / `data-align`)
lives once, in Popover's CSS; Menu and Tooltip emit the same attributes and
declare Popover as a registry dependency. `class` on an overlay styles its
surface: the root is `display: contents`.

### Forms: native controls inside a Field

Input, Textarea, Select, Checkbox, RadioGroup and Combobox are the platform's
controls with their label, help text and error attached:

- **Field** renders label, control, description and error. The control is
  slotted, so Field cannot reach its attributes; the ids follow a convention
  (`<id>-description`, `<id>-error`) and `fieldIds()` from
  `@parche/elements/utils` gives a control its `aria-describedby`. The
  library's controls do that themselves; a custom control inside a Field
  does it by hand.
- **No script** for all but Combobox: Select is the native picker with its
  arrow replaced, Textarea grows with `field-sizing: content`, RadioGroup is
  a `fieldset` whose legend names the group.
- **Combobox** is the APG list-autocomplete pattern: focus stays in the
  input, `aria-activedescendant` names the highlight, typing filters. What
  the form submits is the input's text; the option's value travels in
  `data-value` and `parche:select`. Without script a native `<datalist>`
  offers the same options, and the element detaches it on upgrade.

### Renaming a part

`splitProps` takes `data-part` out of the incoming props and returns it as
`part` (`'root'` by default); the root renders `data-part={part}`. A
composition renames a child's part that way (`<Eyebrow data-part="tagline">`
in Heading, `<Label data-part="label">` in Field). Rendering the static
attribute and spreading the rest would emit both, and a browser keeps the
first, which is how the gate found the duplicate.

### Content tier, and the ui parche without scripts

Toc (a scroll-spy: the last heading past the sticky offset is current,
`aria-current` on its link), Share (network links that need no script, plus
copy-link and the device share sheet where `navigator.share` exists), Stat
(the final figure in the markup, counted up on entry, skipped under reduced
motion, with a hidden twin so assistive tech never hears the intermediate
numbers) and Banner (dismissible, remembered under a key) close the list.

With them the ui parche carries no `<script>` at all: the Header's scroll
shadow is a scroll-driven animation (`animation-timeline: scroll()`), its
announcement is a Banner, Stats are Stat elements, the blog's table of
contents and share buttons are Toc and Share. The unit suite enforces it
(`parches/ui/test/no-inline-scripts.test.ts`): a `<script>` in a widget or
layout is a regression. Core keeps its own three (ThemeToggle, ThemeSelector,
ThemePanel), which apply the theme; the menus inside them are elements.

### Controls: wrap the real thing

Switch is `<input type="checkbox" role="switch">`, Slider is
`<input type="range">`, Accordion is Collapsibles sharing a native
`details name`. None has an element module: the browser owns the state, the
keyboard and the form submission. One lesson the gate taught: a `<label>`
that wraps both an `<output>` and an input names the output (the first
labelable descendant), so Slider uses `<label for>`.

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
