# Examples

Small, single-feature demos. Run any of them with:

```bash
pnpm --filter example-<name> dev
```

| Example | Shows |
| --- | --- |
| `blog` | The pluggable blog app: pages, posts, categories, tags, authors, RSS. |
| `i18n` | Two locales (`en` at `/`, `es` at `/es`) and the built-in locale switcher. |
| `themes` | The OKLCH theme system and the floating theme panel. |
| `custom-widget` | Registering a project-local widget via config and using it in content. |
| `markdown-pages` | Pages authored in Markdown — `sections` in frontmatter plus a prose body. |
| `ssr` | Per-request server rendering (`prerender = false`) on the Node adapter. |
| `import-widget` | Importing a widget directly into an `.astro` page via `parche:widgets/*`. |
| `react` | A React component registered as a Parche widget and used from JSON content. |
| `shadcn` | Real shadcn/ui components (Button, Card, Input, Badge) themed by Parche's token bridge. |
