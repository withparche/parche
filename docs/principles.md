# Principles

The ideas Parche is built on. When a design decision is in doubt, it should be checked
against these. They are also the public pitch: what makes Parche different, in the words
we use to explain it.

- **Pages are JSON.** A page is a list of sections and their content.

- **A widget package covers most of what a site needs**, on a flexible token system — so
  out of the box you get a page that is finished and working, not a stencil to fill in.

- **Those widgets are not a commitment.** Swap in a different widget package, or eject the
  ones you have and rewrite them however you want — by hand or with AI. The only rule is
  that a widget keeps its defined input schema. The contract is the schema, not our code.

- **Apps, not just components.** The blog is a real app: configurable, usable as-is. More
  apps follow.

- **i18n from the start**, because pages as JSON makes translation straightforward rather
  than a retrofit.

- **The door to CMSs.** Pages are JSON in the repo today, but nothing says they have to
  come from there — they can come from a remote. That is what makes real CMS support
  possible instead of a per-CMS integration.

- **Web components for the JavaScript side.**

See [astrowind-community-research.md](./astrowind-community-research.md) for the demand
these principles answer: two and a half years of what the AstroWind v1 community asked for.
