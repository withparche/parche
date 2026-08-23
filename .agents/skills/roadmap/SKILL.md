---
name: roadmap
description: Keep the project's three tracking files current, confirm-first — ROADMAP.md (plan), CHANGELOG.md (what shipped), BACKLOG.md (limits real templates hit). When something trackworthy happens in a session — a shipped feature, a significant architectural or product decision, a scope change, or a deferred idea — propose the update and ask the maintainer to confirm before writing. Never edit these files silently.
---

# Roadmap upkeep

Keep the project's tracking files an honest, current picture.

## Which file (route first)

| It is… | Goes to | Section |
| --- | --- | --- |
| Something that **shipped** (built + working) | `CHANGELOG.md` | `[Unreleased]` → Added / Changed / Fixed / Removed |
| A change to **the plan** or a **decision** | `ROADMAP.md` | the milestone, or `Not doing (and why)` |
| A **limit hit while building a real template** | `BACKLOG.md` | under that template's heading |

Never duplicate across files. Shipped work is *removed* from the roadmap milestone
when it lands in the changelog — the roadmap only looks forward. A backlog item
pulled into a milestone stays in `BACKLOG.md` (it is the evidence) and is referenced
from the roadmap.

## When to act (trackworthy)

Propose an update when, during the session, any of these happen:

- A feature or capability **ships** → hand off to the
  [`changelog`](../changelog/SKILL.md) skill for the entry, then tick or drop the
  matching roadmap item here.
- A **significant decision** is made — architecture, product direction, naming, a
  contract — worth remembering. If something was tried and rejected, it belongs in
  `Not doing (and why)` with the reason.
- **Scope changes**: something added, dropped, or re-prioritized in a milestone.
- A **deferred idea** worth tracking surfaces (a "later" / "someday").
- A **release is cut**: move `[Unreleased]` under a version heading with its date and
  compare links, and open a fresh `[Unreleased]`.

Do NOT propose updates for trivial changes (typos, small refactors, routine bug
fixes) or for things already captured.

## How to act (confirm-first)

1. Draft the entry: the smallest accurate line, in the right file and section,
   matching that file's phrasing and tense (past for shipped, imperative for planned).
2. **Show it and ask the maintainer to confirm before writing.** Propose — never
   edit these files silently.
3. On confirmation, edit. If declined, drop it.

## Structure

- **`CHANGELOG.md`** — not this skill's job. Use the
  [`changelog`](../changelog/SKILL.md) skill, which owns the format, the entry style
  and the release checklist.
- **`ROADMAP.md`** — forward-looking only: `Where we are`, the next milestone with a
  **goal** and checkable **exit criteria**, later milestones, `Big bets`,
  `Not doing (and why)`, `How this is maintained`. Terse; link `BACKLOG.md` items
  rather than restating them.
- **`BACKLOG.md`** — empirical only. Every item traces to the template that revealed
  it, tagged `[high] / [med] / [low] / [deferred] / [FIXED]`. Nothing speculative.
