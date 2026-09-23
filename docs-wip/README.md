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

## Status

Phases 0 to 5 of the plan are done: 47 elements, the playground, the SSR
examples' `/elements` page, and the gate — contract, SSR render, build-smoke,
browser a11y in five projects, SSR smoke on Node and workerd — all in
`pnpm test` and in CI. What remains is the second-level list in the plan
(Navigation Menu, Command palette, Toggle Group, Stepper, Table, Progress,
Marquee, Rating, Date picker, Tree, Image Compare), on demand.
