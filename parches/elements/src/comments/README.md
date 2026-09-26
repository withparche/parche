---
summary: The discussion under a post from GitHub Discussions (giscus), loaded late and only after consent.
whenToUse:
  - A blog whose readers have something to add, and someone to moderate it.
whenNotToUse:
  - Nobody will moderate: a comment section left alone is worse than none.
related: [Consent]
---

```astro
---
import Comments from 'parche:elements/Comments';
---
<Comments repo="owner/repo" repoId="…" category="Comments" categoryId="…" />
```

:::example basic
The button that loads the discussion, and its note.
:::

## Setting it up

Enable Discussions on the repository, install the giscus app on it, and
copy `repoId` and `categoryId` from giscus.app. Each page's thread is found
by its path (`mapping`).

## Loading

Nothing loads with the page. Once "comments" is allowed in the Consent
element (giscus loads from GitHub, which sets its own cookies), the element
loads giscus when the reader scrolls near it, or at once on the button.
`consent={false}` skips the wait, for a site that has asked elsewhere. The
theme follows the site's light or dark mode, also when it changes.

## Anatomy

`root` (`parche-comments`, waiting, ready or loaded) · `load` · `note` ·
`consent` (shown while the choice is missing, with a link to reopen it) ·
`frame`.
