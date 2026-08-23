# Templates

Curated Parche project starters.

```bash
npm create parche@latest              # interactive
parche astro new hello-parche my-app  # or name one directly
```

## Convention

**A template is a working project, not a stencil.** It ships real values — no
placeholders — so it builds as it stands, and the official Astro path works
without knowing anything about Parche:

```bash
npm create astro@latest -- --template withparche/parche/templates/hello-parche
```

That copies the template verbatim: you get a site called whatever the template is
called. `parche astro new` does the same and then renames it, which is the only
difference between the two.

The rename works by replacing the template's own identity, so a template must
keep **`package.json` `name` as the slug of its `brand.name`** — `hello-parche`
and `Hello Parche`. Nothing else is required, and nothing else is adapted.

Content should not repeat the site's name: it lives in `brand.name` and the
header reads it from there. Duplicating it into a page is what made placeholders
seem necessary in the first place.
