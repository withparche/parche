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
