---
name: changelog
description: Keep CHANGELOG.md honest and current, confirm-first. Use when something ships (a feature, a fix, a removal, a perf win) and when cutting a release. Entries go under [Unreleased] with a commit ref and state the effect, not the diff. Never edit CHANGELOG.md silently — propose and let the maintainer confirm. For plan/decision changes use the roadmap skill; for template-found limits use BACKLOG.md.
---

# Changelog upkeep

`CHANGELOG.md` is the record of what shipped, in order. It is the only file that
looks backwards — [`ROADMAP.md`](../../../ROADMAP.md) looks forward and
[`BACKLOG.md`](../../../BACKLOG.md) records limits found by building real templates.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [SemVer](https://semver.org/spec/v2.0.0.html). Parche is pre-1.0, so
minor versions may break the API and all `@parche/*` packages release together.

## When to add an entry

Add one when work **lands on `main` and works** — built, verified, committed:

- a capability a site author can now use
- a behaviour change they would notice (including renames and API changes)
- a bug fix, a removal, a deprecation
- a measurable performance or memory win

Do **not** add an entry for: refactors with no observable effect, typo/formatting
commits, WIP that does not yet work, or changes to the tracking files themselves.
When in doubt, ask: *would a user of `@parche/*` want to know?*

## Where it goes

Always under `## [Unreleased]`, in one of four groups — never invent a fifth:

| Group | For |
| --- | --- |
| `Added` | new capability that did not exist |
| `Changed` | existing behaviour now works differently (renames, API changes, perf) |
| `Fixed` | something that was broken now works |
| `Removed` | a capability or option that is gone |

Create the group heading only if it has entries.

## How to write an entry

1. **Lead with a bold claim**, then the detail. A reader scanning only the bold text
   should get the release.
2. **Cite the commit** in backticks so the entry stays verifiable: `` (`4dcb18a`) ``.
   Multiple commits for one coherent change are fine: `` (`fce0d60`, `9838ca5`) ``.
3. **State the effect, not the diff.** What can the user do now, or what stopped
   hurting? Name the mechanism only when it is the thing that changed.
4. **Numbers when you have them.** "layout server chunk ~2.3 MB → ~31 KB" beats
   "reduced memory". Take them from the commit body — they were measured there.
5. **Past tense, one entry per change.** Do not split one change across groups.

```markdown
✅ - **Lazy widget catalog** (`4dcb18a`). Vite code-splits each widget, so the SSR
     server holds only the chunks a page renders. Measured on the saas-landing SSR
     build: the layout server chunk went from **~2.3 MB to ~31 KB**.

❌ - Changed widgetMap to widgetLoaders in vite-plugin-parche.ts
     (no effect stated, no measurement, names the diff)
```

Source the wording from the commit body — this repo writes long, specific commit
messages, and they already contain the effect and the verification.

## Cutting a release

1. Rename `## [Unreleased]` to `## [X.Y.Z] — YYYY-MM-DD`, and add a fresh empty
   `## [Unreleased]` above it.
2. Write a one-line summary under the version heading when the release has a theme.
3. Bump every `@parche/*` package to the same version (they release together).
4. Update the compare links at the bottom of the file.
5. Tag the commit that was actually published: `git tag -a vX.Y.Z <sha>`. If the
   publish happened after the version-bump commit, tag the commit whose tree was
   packed — not simply `HEAD`.
6. Tick or drop the matching `ROADMAP.md` exit criteria.

## Reconstructing history

When work predates this repo or arrived squashed in a single commit, do not
fabricate a per-commit timeline. Read the commit's tree
(`git ls-tree -r --name-only <sha>`) and describe what demonstrably existed, with
file paths and counts as evidence, under a clearly labelled section that says it was
reconstructed. Unverifiable claims do not go in.

## Confirm-first

Draft the entry, **show it, and let the maintainer confirm before writing**. Never
edit `CHANGELOG.md` silently. If declined, drop it.
