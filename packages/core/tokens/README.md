# Design tokens

The source of truth for the design system. Three files in the
[W3C Design Tokens (DTCG)](https://tr.designtokens.org/format/) format; the CSS
under `src/styles/generated/` is built from them and never edited by hand.

```
pnpm tokens          # regenerate
pnpm tokens:check    # fail if the generated files are stale (CI)
```

## The four layers

| File | Prefix | What it holds | Who touches it |
|---|---|---|---|
| `ref.json` | `--ds-ref-*` | Reference: OKLCH ramps, radii, shadows, font stacks. Raw material. | A theme may replace a ramp. Elements never name one. |
| `sys.json` | `--ds-sys-*` | System: colour roles with light and dark values, font roles, composed type styles. | What elements and widgets are styled from. What a theme overrides. |
| `comp` | `--ds-comp-<element>-*` | Component: one element's own knobs, each defaulting to a sys token. Declared in the element's `.props.ts`, not here. | A theme that must move one element independently. |
| `conf.json` | `--ds-conf-*` | Configuration: radius scale, motion durations, measures, section rhythm. | A theme or a site. |

Only `--ds-*` is the system. The Tailwind names (`bg-surface`, `rounded-md`,
`bg-neutral-100`) are bridges generated next to the tokens, and the shadcn/ui
names in `shadcn-compat.css` are aliases on top.

## Writing a token

```json
"primary-soft": {
  "$value": "{ref.color.primary.50}",
  "$extensions": { "parche": { "dark": "oklch(0.200 0.060 260)" } },
  "$description": "Tinted surface under primary text."
}
```

- `$value` is the light value. A reference `{ref.color.primary.50}` resolves to
  `var(--ds-ref-color-primary-50)`, so a theme that replaces the ramp moves the
  role. Anything else is emitted verbatim: what is in the JSON is what is in the CSS.
- `$extensions.parche.dark` is the dark value, emitted under `.dark`. A role
  without one keeps its light value in both modes.
- `$type` is inherited from the group. `typography` values expand to four tokens,
  `-size`, `-weight`, `-tracking`, `-leading`, which `base.css` composes into
  `.type-<style>`. The styles are roles, not sizes: `h1`–`h3` and `title` /
  `title-sm` for headings down to an item's; `lead`, `body`, `body-sm`,
  `small`, `caption` for running text; `label` (the eyebrow) and `meta` (dates,
  sources, durations, in the mono face) for small print; `figure` and
  `figure-sm` for numbers that are the point. Widgets use the classes rather
  than fixed sizes, so a theme's scale reaches every section.
- Names are kebab-case and become the CSS name joined with `-`:
  `sys.color.on-primary` is `--ds-sys-color-on-primary`.

`generated/tokens.json` lists every token with its light and dark value;
`generated/tokens.d.ts` exports the names as a type for `.props.ts` `tokens`
lists and the contract test.
