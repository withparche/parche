# `experimental` against `main`: what changed, what it cost

The branch rebuilds four things on top of 0.7.0: the design tokens as
layered, generated data; the content model as one recursive tree of nodes;
the widgets on that model; and presets. This note is the comparison the
branch was cut for. Numbers are from the AstroWind demo unless said
otherwise, measured on 2026-09-23 at the branch head.

## Numbers

| | `main` (0.7.0) | `experimental` |
|---|---|---|
| Core source, lines (`packages/core/src`, without generated) | 5 132 | 4 935 |
| Widgets in `ui` (`.astro`, incl. blog and chrome) | 41 | 40 |
| Widgets merged into one | — | Hero ×3, Features ×3, Steps ×2 |
| Containers | — | Section, Columns, Column, Switch |
| Raw HTML strings in demo content | 46 | 0 |
| Demo content, pages + layouts, same JSON formatting | 156.6 KB | 171.8 KB |
| Widget nodes in that content | 160 | 234 |
| Client JS budget of a ui site | 34 KB | 38 KB |
| Tests: unit / elements SSR / ui SSR / browser | 501 / 80 / — / 408 | 505 / 84 / 15 / 408 |

## What the model gained

- **One shape.** A page, a layout and a preset are trees of
  `{ widget, props, slots }`. One schema, one renderer, one validator. Core
  lost the section wrapper, the full-bleed list, `layout/Main`, page
  templates and the raw-HTML background, and got smaller doing it.
- **Widgets contain widgets.** Slots in the JSON are the widget's Astro
  slots. A Hero takes a form or a switcher where its image was; a docs shell
  is two columns with an outlet in each. No composite language was needed.
- **The wrapper is a widget.** `Section` is declared by `ui` and read by
  core by name. A site can declare another. Tones replace 46 raw gradients
  with seven names, each a rule on tokens.
- **Themes move more.** Product and Editorial retune colour, type, radius,
  shadow, rhythm and measure from one file each, because Section and
  Container read the conf tokens.
- **Everything the builder needs is data.** Slots, wrapper and hidden
  flags in the catalog; tones and the wrapper in `parche:config/layout`; a
  pure validator; presets as files; an optional node id.
- **Errors say where.** `sections[2].slots.bogus: "Section" has no slot
  "bogus"` in dev, from the same function a CLI check will use.

## What it cost

- **Content is about 10 % larger and has 74 more nodes.** Every root that
  had an anchor or a background is now an explicit `Section` node around the
  widget. That was the decision to start without a `wrapper` shorthand; the
  cost is now measured, and the shorthand can be added later if it matters
  (it cannot be removed once content uses it).
- **Every consumer of the old names changed.** Tokens (21 files, a codemod),
  section fields (48 content files, a script), five widget names, the chrome
  prefix, the `template` page field. Both scripts stay in `scripts/` for
  sites outside the repo.
- **Astro cannot take a slot name from a loop variable.** The renderer and
  the Switch widget forward slots by position, six at most. Hidden in core,
  but a limit to document.
- **4 KB more client JS in the budget** of a ui site: the Tabs element
  script now ships with every ui build because Switch may use it, loaded
  only by pages that render a Switch.

## What is still a promise

- A widget cannot yet take a collection reference in a prop; the shape is
  declared, the renderer does not resolve it.
- Markdown pages have no leaf widget tag. Plain remark cannot render an
  Astro component; the honest path is MDX, or splitting the body around
  widget nodes. Not started.
- Validation runs in dev only. A `check` command for CI needs to evaluate
  `.props.ts` outside Astro; not started.
- Component tokens have a mechanism and a rule but no first case.
- The redesign's remaining widgets and elements (SubNav, Comparison,
  Changelog, Team, Lightbox, CommandPalette, Countdown…) are leaves and
  arrive one by one, on either branch.

## Recommendation

The model holds: the two fixture pages from the redesign are written as
plain JSON with nothing invented, and every gate is green. The costs are the
content growth, which is a one-line decision to revisit, and the migration,
which is scripted. The builder migration is the remaining piece and lives
in its own repository; it reads the catalog this branch already emits.
