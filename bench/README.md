# bench — measuring Parche

A site built from `demos/astrowind` at any size, and the scripts that measure
it, so a change to core is judged by numbers before and after, not by feel.
It is a workspace package with no `build` script on purpose: CI's
`pnpm -r build` leaves it alone, and it runs only when someone measures.

The generated content (pages, posts, products, and the demo's layouts, menus,
patterns and assets copied beside them) is gitignored; only this skeleton and
the scripts are kept.

## Use

```bash
cd bench
node generate.mjs --pages 1000 --posts 1000 --entries 0 --locales en,es --seed 1
node generate.mjs --pages 1000 --posts 5000 --entries 1000 --locales en,es --seed 1 --sections 15-20   # heavy pages
node build.mjs --label n1000                  # static build: time, memory, per page
PARCHE_PROFILE=1 node build.mjs               # and where the time went, by phase
PARCHE_DEBUG_FREEZE=1 node build.mjs          # content frozen: a widget mutating its props fails the build
BENCH_OUTPUT=server node build.mjs            # server build, then:
node ssr.mjs --label n1000                    # cold start and latency per kind of address
node chunks.mjs                               # what the server loads on a cold start
node compare.mjs results/<before>.json results/<after>.json
node build.mjs --project demos/astrowind      # any other project, from the repo root
```

Results go to `results/` (gitignored) as JSON; a change's numbers go in its
commit message. `node ../test/page-css.mjs <project>` and
`node ../test/page-js.mjs <project>` report what each built page downloads.

## What to read

- **Time per page against size.** Generate the same shape at 100, 1000 and
  5000 pages: if milliseconds per page rise with the size, something grows
  faster than the site (a lookup that scans every page for every page).
- **The profile.** `PARCHE_PROFILE=1` times each phase of a page in core
  (paths, resolvers, references, patterns, widgets, assets, checks, layout),
  summed over the build.
- **SSR.** A page, a translated page, a post, a product and an address that
  does not exist, one request at a time and eight at a time; the miss shows
  its status.
- **Cold start.** `chunks.mjs` sizes the server build and the static import
  closure of core's catch-all page, and says whether it evaluates the widgets'
  JSON Schemas, which no request needs.
