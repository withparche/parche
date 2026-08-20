---
name: roadmap
description: Keep ROADMAP.md current, confirm-first. When something roadmap-worthy happens in a session — a shipped feature, a significant architectural or product decision, a scope change, or a deferred idea worth tracking — propose a ROADMAP.md update and ask the maintainer to confirm before writing. Never edit ROADMAP.md silently.
---

# Roadmap upkeep

Keep `ROADMAP.md` an honest, current picture of the project.

## When to act (roadmap-worthy)

Propose an update when, during the session, any of these happen:

- A feature or capability **ships** (built + working) → add/move it under **Shipped**.
- A **significant decision** is made — architecture, product direction, naming, a contract — worth remembering.
- **Scope changes**: something added, dropped, or re-prioritized in Now / Later / Big bets.
- A **deferred idea** worth tracking surfaces (a "later" / "someday").

Do NOT propose updates for trivial changes (typos, small refactors, routine bug
fixes) or for things already captured.

## How to act (confirm-first)

1. Draft the entry: the smallest accurate line, in the right section, matching the
   file's phrasing and tense (past for shipped, imperative for planned).
2. **Show it and ask the maintainer to confirm before writing.** Propose — never
   edit `ROADMAP.md` silently.
3. On confirmation, edit `ROADMAP.md`. If declined, drop it.

## Structure

Sections: **Shipped** (phased), **Now → vX**, **Later**, **Big bets**, **How this
is maintained**. Entries are terse — one line each; link code paths only when it
clarifies.
