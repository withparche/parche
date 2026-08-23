# Parche

Parche turns [Astro](https://astro.build) into a framework you build on — not a template you fork.

A page is data: `sections: [{ widget, props }]`, rendered through a virtual-module
registry. Everything that plugs in is a **parche** — widgets, themes, whole apps like
the blog — and a site bundles only what it imports. AstroWind is its reference build.

Ordinary `.astro` pages keep working alongside it: the data-driven route is opt-in,
so you can adopt as much or as little as you want.

## Create a project

```bash
npm create parche@latest              # interactive
parche astro new hello-parche my-app  # or name a starter directly
```

## Packages

| Package | Role |
| --- | --- |
| `@parche/core` | The engine: integration, virtual modules, schemas, renderer, routing, i18n, tokens. |
| `@parche/primitives` | Foundational building blocks, consumed as `parche:primitives/*`. |
| `@parche/ui` | Widget library — section widgets and blog widgets. |
| `@parche/blog` | Blog app: routes, collections, taxonomies, RSS. |
| `@parche/themes` | Theme parches. Each contributes its CSS, its fonts and a switcher entry. |
| `@parche/cli` | The `parche` command. |

## Configure

A site's identity lives in `parche.config.ts` — or `parche.config.json`, because it
is plain data all the way down and a git-based CMS should be able to edit it:

```ts
export default defineConfig({
  site: 'https://example.com',
  brand: { name: 'Acme', description: 'What this site is.' },
  metadata: { ogImage: '/og.png', twitterHandle: '@acme' },
  i18n: { translations: { es: { brand: { description: 'Qué es este sitio.' } } } },
});
```

`site`, `base` and `i18n` mirror Astro's own keys. Declare each in one place only —
Parche uses Astro's when only Astro has it, feeds its own to Astro when only Parche
does, and stops with an error when both do.

## Develop

```bash
pnpm install
pnpm dev                      # examples/blog
pnpm --filter example-i18n dev
pnpm test                     # unit tests + a build over every project
```

`examples/` are single-feature demos, `templates/` are project starters, and
`demos/` holds full sites — `demos/astrowind` is a bilingual port of AstroWind used
to find the gaps a small example never would.

## Contributing

Read [AGENTS.md](./AGENTS.md) first — it has the layout, the conventions and the
constraints that are easy to break without noticing. What shipped is in
[CHANGELOG.md](./CHANGELOG.md), what is next in [ROADMAP.md](./ROADMAP.md), and the
limits real sites have hit in [BACKLOG.md](./BACKLOG.md).

## License

MIT © Arthelokyo
