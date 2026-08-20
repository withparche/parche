# Templates

Curated Parche project starters, consumed by the CLI:

```bash
parche astro new hello-parche my-app
# or
npm create parche@latest
```

## Convention

Each template may include a `parche.template.json` describing what the CLI asks
and adapts:

```jsonc
{
  "name": "Hello Parche",
  "type": "starter",
  "description": "...",
  "prompts": [
    { "key": "siteName", "message": "Site name", "default": "My Parche Site" },
    { "key": "packageName", "message": "Package name", "default": "my-parche-site" }
  ]
}
```

Template files use `{{siteName}}` / `{{packageName}}` placeholders. The CLI
prompts, replaces them, patches `package.json` name, deletes the manifest, and
installs — leaving a ready-to-run project.
