# Parche

Parche turns [Astro](https://astro.build) into a framework you build on — not a template you fork.
Pages are data (`sections: [{ widget, props }]`) rendered through a virtual-module registry,
themed with an OKLCH token system, and extended with pluggable apps. AstroWind is its reference build.

## Create a project

```bash
npm create parche@latest            # interactive
parche astro new hello-parche my-app
```

`parche astro new [template] [dir]` scaffolds from the repo's `templates/`/`examples/`,
a GitHub repo, or a local folder — adapting site/package names as it goes. See
[packages/cli](packages/cli). (`generate` is reserved for AI/Narrans generation.)

## Packages

| Package | Role |
| --- | --- |
| `@parche/core` | Engine: Astro integration, virtual modules, content schemas, renderer, routing, i18n, tokens. |
| `@parche/primitives` | Foundational building blocks (Button, Container, Icon…), consumed as `parche:primitives/*`. |
| `@parche/ui` | Widget library (section widgets + blog widgets). |
| `@parche/blog` | Pluggable blog app: routes, collections, RSS, taxonomies. |

`examples/` holds small single-feature demos — see [examples/README.md](examples/README.md).

## Develop

```bash
pnpm install
pnpm dev                    # runs examples/blog
pnpm --filter example-i18n dev
```

## License

MIT © Arthelokyo
