# docs-wip — provisional, unofficial

Working notes for the element library while it is being built. Nothing here is
published or linked; it exists so the conventions can be reviewed by reading
before they move to their final home (parche.dev, likely its own repository).

Per-element documentation lives **next to each element**, as the durable source
the future site will render: `parches/elements/src/<name>/README.md`, with its
`examples/*.astro` and the facts in `<name>.props.ts` (`meta.element`). Do not
duplicate it here.

- [conventions.md](./conventions.md) — the per-element contract, the styling API,
  the `ParcheElement` base, eject and copy-readiness.
- [images.md](./images.md) — how pictures are optimised: local, image CDNs
  (unpic), Astro for remote ones, or as they are; the `parche({ images })` options.
- [content-model.md](./content-model.md) — nodes, slots, outlets, the wrapper,
  references, patterns and validation.
- [builder.md](./builder.md) — the visual builder: running it, what it edits,
  how the preview works, and its known gaps.
- [collections.md](./collections.md) — pages from a collection of plain data,
  rendered by a widget or a pattern (`collections` in the site config).
- [app-ideas.md](./app-ideas.md) — what comes after the blog: a site-wide
  search in core, and app parches worth building (careers, changelog; for
  small businesses locations and hours, booking, menu, a catalogue with
  direct orders), with what makes something an app.
- [research/](./research/) — how today's blogs lay out their pages, measured
  on live sites at 1440, 1024 and phone width, for the redesign of the blog
  presets: [personal](./research/personal.md), [magazine](./research/magazine.md),
  [company](./research/company.md), [newsletter](./research/newsletter.md).

## Status

Phases 0 to 5 of the plan are done: 45 elements, the playground, the SSR
examples' `/elements` page, and the gate — contract, SSR render, build-smoke,
browser a11y in five projects, SSR smoke on Node and workerd — all in
`pnpm test` and in CI. What remains is the second-level list in the plan
(Navigation Menu, Command palette, Toggle Group, Stepper, Table, Progress,
Marquee, Rating, Date picker, Tree, Image Compare), on demand.
