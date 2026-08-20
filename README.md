# Parche

Parche turns [Astro](https://astro.build) into a framework you build on — not a template you fork.
Pages are data (`sections: [{ widget, props }]`) rendered through a virtual-module registry,
themed with an OKLCH token system, and extended with pluggable apps. AstroWind is its reference build.

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
