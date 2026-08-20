# AGENTS.md

Guidance for coding agents working in this repo. Keep changes small and verified.

## What this is

Parche: an Astro-based framework. Pages are data (`sections: [{ widget, props }]`) rendered
through a virtual-module registry. AstroWind is the reference materialization.

## Layout

- `packages/core` — the host: engine (integration, virtual modules `parche:*`, schemas, renderer, routing, i18n, tokens). The only non-parche.
- `parches/*` — plugins ("parches"). Each provides primitives / widgets / routes and declares what it requires:
  - `parches/primitives` — foundational components, exposed as `parche:primitives/*`.
  - `parches/ui` — widget library (`parche:widgets/*`).
  - `parches/blog` — app parche: routes, collections, RSS (`@parche/blog`).
- `packages/cli` — `@parche/cli`, the `parche` command (`parche astro new`). Built with tsup.
- `packages/create-parche` — the `npm create parche` entry (reuses the CLI's scaffolder).
- `templates/*` — project starters consumed by the CLI (each may have a `parche.template.json`).
- `examples/*` — small per-feature demos.

## Commands

```bash
pnpm install
pnpm dev                       # examples/blog
pnpm --filter <example> dev    # e.g. example-i18n
pnpm --filter <pkg> build
```

## Conventions

- Package manager: pnpm workspaces. Node ESM (`"type": "module"`).
- Components consume primitives via `parche:primitives/*`, never by importing `@parche/primitives` directly.
- Widgets are registered in `packages/ui/src/index.ts`; keep names stable (page content references them).
- Docs, comments, and identifiers in English. Be concise.
- Skills live in `.agents/skills/<name>/SKILL.md` (Agent Skills standard).

## Verify

Run the relevant example with `pnpm --filter <example> dev` and confirm it renders without
virtual-module errors before committing.
