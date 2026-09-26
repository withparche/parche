# @parche/builder

The visual editor for a Parche site. It runs only under `astro dev`:

```bash
npx parche astro builder            # in the project
pnpm builder                        # in this repo: over demos/astrowind
```

`parche astro builder` starts the project's own Astro with this integration
added (Astro's programmatic `dev()`), so the project's `astro.config` never
names it, and no build can contain it: the integration throws under any other
command, and the repo's build checks assert it.

## What it edits

The files in `src/content`, as the content model describes them: pages (their
sections, the named slots their layout's outlets take, their settings),
with every widget's props as a form built from its schema, a node's wrapper,
and the rules a tree must keep (slots, `allow`, `max`, depth) enforced where
you place things. A save is checked on the server the way a build would
check the page, and written only if the file did not change underneath
(etag), keeping its indentation, its key order and, for Markdown, its body
and frontmatter comments. Ids the editor gives nodes never reach the file.

## The preview

The page you edit shows beside the editor as the site renders it, with your
unsaved changes: after each edit the editor sends its open documents as
drafts, and the page refreshes in place (Idiomorph), keeping scroll and
state. Pages are asked for under `/_parche/preview/<token>/…`; a middleware
of the dev server turns that into the page's own URL and handles it inside
a preview context (an AsyncLocalStorage core reads), where a stand-in for
`astro:content` returns the draft of a file instead of the file, and each
node leaves comments with its id around its output. Any other request — a
normal tab on the same server — sees the files. The editor injects its
preview client into the frame (same origin): it outlines the node under the
pointer, selects on click (Select mode) or lets the page behave (Browse),
and can show the page under another theme or colour scheme.

## Design

The Design panel edits the site's own token values, over the base look or
one theme, light or dark: every token with its base value, the value the
page uses now, and a reset. A change shows in the preview at once; Save
writes `src/parche.tokens.json`, which core turns into the site's last
stylesheet.

## How it is built

- `src/integration.ts` — the integration (dev only), built with tsup for the CLI.
- `src/routes/`, `src/server/` — the API under `/_parche/api/*`, run by the
  site's Vite. Every request needs the session token the editor page was given,
  a local host and a same-origin request.
- `src/editor/` — the editor, a React bundle prebuilt with Vite and served as
  static files, so saving content (which reloads Astro's pages) never reloads it.
- `src/shared/` — what the server and the editor both walk (a document's trees).
- `playground/` — the fixture site the browser tests edit, seeded fresh from
  `playground/seed` before each run.

```bash
pnpm --filter @parche/builder build          # integration + editor bundle
pnpm --filter @parche/builder test:browser   # Playwright, against the fixture
```
