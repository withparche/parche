# AGENTS.md

Guidance for coding agents working in this repo. Keep changes small and verified.

## What this is

Parche: an Astro-based framework. Pages are data (`sections: [{ widget, props }]`) rendered
through a virtual-module registry. AstroWind is the reference materialization.

## Layout

- `packages/core` — engine (integration, virtual modules `parche:*`, schemas, renderer, routing, i18n, tokens).
- `packages/primitives` — foundational components, exposed as `parche:primitives/*`.
- `packages/ui` — widget library (`parche:widgets/*`).
- `apps/blog` — pluggable app (`@parche/blog`).
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
