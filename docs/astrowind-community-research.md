# AstroWind community research: discussion #392 and the full history

**Source:** `arthelokyo/astrowind` — discussion #392, 164 discussions, 215 issues (3 open).
**Date of analysis:** 2026-09-22. Raw dumps were pulled with the GitHub GraphQL and REST
APIs; the numbers below come from them.

This is the record of what the AstroWind v1 community asked for over two and a half
years. It is the evidence behind AstroWind v2 being a rebuild on Parche, and the
ranking below is the demand signal Parche's roadmap should be checked against.

---

## 1. Discussion #392 at a glance

| Field | Value |
|---|---|
| Title | *Shape the Future of AstroWind 2.0: Your Feedback is Key to make AstroWind better!* |
| Author | @prototypa |
| Opened | 2024-03-21 |
| Category | Announcements |
| Upvotes | 19 |
| Comments | 47 (+ 67 replies = **114 contributions**) |
| Unique participants | 62 |
| State | **Locked** — must be unlocked to comment |
| Last maintainer comment | 2026-09-05 (v1 frozen, v2 in October 2026) |

**The thread in three phases:**

1. **Mar–Oct 2024 — productive.** Substantive, well-argued requests. The maintainer
   answered actively and shipped things mid-thread (per-environment config, tokens moved
   to `CustomStyles.astro`, scroll animations via `tailwindcss-intersect`, the CJK URL fix).
2. **Oct 2024 – Aug 2025 — silence.** Comments become mostly "any release date?".
3. **Aug 2025 – Jul 2026 — erosion of trust.** `"Should we assume it's dead?"`,
   `"OnWidget died lol"`, and finally the thread is used as a job board. It ends with the
   maintainer's comment of 2026-09-05.

**An uncomfortable but useful number:** the largest block of upvotes in the thread is not
a feature. The *"status / date?"* comments (@equilento ▲19, @XinwenCheng ▲17,
@crsmoore ▲17, @Andreasgdp ▲9, @AdamHarte ▲8, @yaohengkai ▲7 and others) **add up to
~84 upvotes**, more than any single technical request. The community asked for features,
but it voted for communication.

---

## 2. The signal across the whole repository

- **105 of 164 discussions (64%) are Q&A**, not ideas. Most are *"how do I do X"* about
  things the template already did.
- Only 32 discussions are *Ideas*.
- The most frequent term in the whole corpus is **documentation** (33 records mention it
  explicitly).

**Conclusion:** the real number-one request of AstroWind v1 was not a feature — it was
**documentation**. Many "feature requests" are existing features nobody found
(`showRssFeed`, `astrowind:config`, the `Image` component, colour tokens, collections).

---

## 3. What the community asked for, ranked

Ordering: upvotes in #392 + frequency across issues and discussions + persistence over
time (2022→2026) + how many different people raised it.

### Tier 1 — adoption blockers

**1. i18n / multilingual** — *the most repeated and longest-lived request in the project*
Evidence: #392 (@AlexRMuc ▲27, @TheMikeyRoss ▲11, @spokospace ▲6, @ibousfiha ▲6,
+@amarnaud2 @Chalkin @frauber84 @easypronunciation @Minifab) · discussions #508 ▲9,
#49 ▲5, #219 ▲3, #328, #386, #642, #283 · issues #18, #37, #218, #236, #247, #304, #384,
#696, **#735 (open today)**. From 2022 to 2026, without interruption.
The concrete scope they asked for (@Chalkin specified it best):
- UI string translation (JSON or YAML locale files, Vitesse-style)
- translated URLs (`/blog/my-post` → `/blog/mein-beitrag`)
- default language without prefix, the rest prefixed
- multilingual content collections (the hard part: @spokospace)
- language switcher in the header
- @vitonsky (#696) also proposed automating the translation of locale files

**2. SSR / full `output` support** — ▲24, the 2nd most upvoted comment
@widgeter added the complete case: v1 only works well in `static`/`hybrid`. Consolidated
evidence: discussions #346, #194, #188, #647 · issues #31, #192, #260, #349, #577, #582,
#694. Recurring across the whole life of v1.

**3. Updatability: decouple the base code from the user's project** — ▲13 (the
maintainer's own proposal, ▲13 + 9 🚀)
The problem that appears most often in different forms: #241, #23, #129, #139, #184,
#447, issue #2, issue #403. @KiritoKing asked for it as a "shadcn/ui-style CLI". @djfdat
detailed the flow (empty project → add routes → add sections → clean orphaned
components). @unders-core, in 2026, summarised it as **"decouple code and content"**:
today a content edit that touches an adjacent punctuation character can break the site —
the model is too fragile.
Sub-requests: seeds/variants (empty, blog, portfolio, landing, full), widgets installable
on demand, and **a minimal version with no example pages** (@RelativeSure).

**4. Documentation** — no single star comment, but the #1 topic by volume
33 records ask for it. Representative cases: #527/#494 (undocumented template
variables), #281, #570 (*"why does AstroWind have its own image optimisation?"* ▲7),
#457/#458 (`astrowind:config`), #624/#626 (*"how do you create a project with this?"*),
#634 (*"how do you create a post?"*). @jovica-me and @unders-core asked for it explicitly
alongside their proposals.

**5. CMS integration** — ▲4 but with the longest reply chain in the thread (9)
Candidates cited: Sanity, Decap, TinaCMS, PagesCMS, Directus, WordPress,
editable.website. @tomByrer proposed an ORM-like abstraction layer with adapters — the
maintainer confirmed a layer over Content Collections already exists and pointed out the
two real complexities (static vs server, and CMSs that also render). @KiritoKing noted
the Content Layer API solves much of it. Also #168, issue #533.

### Tier 2 — high demand

**6. Design token system / theming**
@jovica-me (▲4) made the most technical proposal in the thread: Material 3 / shadcn-style
tokens (`primary`, `on-primary`, containers), move colour from `config.yaml` to CSS,
eliminate the `text-secondary dark:text-blue-200` mix. **This request already changed
the code during the thread.** Related issues: #558, #599, #411, **#732 (open)**.

**7. Finish the landing pages and examples** — ▲13 (@AdamGEmerson)
There are links to landing templates that only contain a hero. @unders-core:
*"templates, examples, and more complete documentation would be ideal"*.

**8. More widgets / blocks**
Mega menu dropdown (@AlexRMuc), advanced Flowbite-style tables with sort/filter/pagination
(@AlexRMuc), gallery/carousel/lightbox (@Coolxer ▲5, @vimalhari ▲5, @kirso, #275, #272,
issue #667, #698), team page (#276, #271), video section (#167, #166), accordion/FAQ
(#459), tooltips (#381), back-to-top (#278, #277), reading progress bar (#47),
dashboards and charts (@djfdat), command bar.

**9. Forms**
A form widget with validation (@AlexRMuc; @djfdat suggests Formsnap/Superforms). Also a
constant source of issues: #238, #299, #370, #394, #662, #239.

**10. Blog capabilities**
- Multiple collections / content types on different routes (@CVirus ▲4; #318, #322,
  #132, #315, #243)
- Authors + E-E-A-T: author at the top, "about the author" block at the bottom, author
  page (@lsolesen)
- Table of contents (#566, #426, #350, issue #548)
- Search (#503 ▲3, #52, #27, issue #493)
- Social share button (#48 ▲5, issue #44)
- Full-content RSS (#170, issue #159)
- Tag and category pages (#439, #526, #638, issue #517)
- Related posts (#130)

**11. The `Image` component — review and documentation** — ▲11 (@tambuildsthings) + #570 ▲7
Complaint: it keeps the originals in `/dist` and inflates the build. The maintainer's
answer (use `unpic` for remote CDNs, use the same `getImage`) is correct but **was not
documented, and that is exactly the problem**. Related: issues #473 (optimise `/public`),
#530 (remote), #466, #515, #141, #528/#516 (local image in frontmatter), and
@longkluong's request for `srcset`/max width on images embedded in `.md`.

### Tier 3 — medium, well-defined demand

12. **Site-wide search** — #503, #52, #27, issue #493 (Pagefind is the natural candidate)
13. **Comments** — giscus (@saadjavaid ▲6) or self-hosted open source (@Sloopdog ▲5)
14. **Alternative, privacy-respecting analytics** — Matomo (#355, issue #352),
    Plausible/Umami (@djfdat), and GDPR/cookie widgets (@RelativeSure). Note: GA is
    already off by default — another documentation case, not a code one.
15. **Animations and scrollspy** — @jboothe ▲4, @Coolxer ▲5, #291. **Partially
    delivered** in October 2024 via `tailwindcss-intersect`.
16. **Structured SEO** — schema.org / JSON-LD (issues #581, #351, #356, #337), OG images
    (#612, #308, #298, #471, #84), sitemap (#158), robots (#524)
17. **Auth + backend** — login/register/reset pages (@djfdat), Astro DB (@Ndrewndrew
    ▲18), Supabase/Pocketbase. **Note:** the Astro DB/Auth comment got 2 👎 — the
    community is split on whether this belongs in a marketing template.
18. **Newsletter / mailing** — Resend, Mailgun (@djfdat); 13 records in the corpus
19. **CJK support** — Chinese URLs and tags (@zipziz, issues #397, #490, #373, #20,
    #304). **Already fixed** in April 2024.
20. **Per-environment config** (`config.development|staging|production.yaml`) —
    @lionelduriez. **Already delivered** in April 2024.
21. **CI, tests, lint** — @GrantBirki ▲4, @JuliusBairaktaris. **Already delivered**
    (eslint and astro check clean, confirmed by the maintainer in Oct 2024).
22. **Dev toolbar** — named outlines per component (@djfdat), Webflow-style breakpoint
    switcher (@Coolxer)
23. **Tailwind v4 / Astro 5+** — #586 ▲6, issue #585, #595, #564, #652. **Already
    delivered** (the current release moves to Astro v7 + Tailwind v4).

### Tier 4 — low signal or rejected by the community

24. Hugo-style shortcodes — 2 👎; @tomByrer: *"that is what MDX is for"*
25. "Easy WordPress PnP" — 4 👎, the worst-received comment in the thread
26. Adblock detection / ad zones (#699, issue #641)
27. E-commerce / cart (very low signal)
28. "Click to copy" on code blocks — already solved by third parties (Expressive Code)
29. Commercial CMS marketplace proposal (@hoyere, 2026) — out of scope

---

## 4. What was already solved (useful for the close)

| Request | Status |
|---|---|
| Per-environment config | ✅ Apr 2024, `astrowind({ config: process.env.CONFIG_PATH })` |
| Colour tokens out of `config.yaml` | ✅ Apr 2024, moved to `CustomStyles.astro` |
| CJK URLs | ✅ Apr 2024, commit f234e63 |
| Scroll animations | ✅ Oct 2024, `tailwindcss-intersect` |
| eslint / astro check errors | ✅ Oct 2024 |
| Astro 5 → 7, Tailwind 4 | ✅ current release |
| SSR, i18n, shadcn tokens, widgets, updates | 🔜 v2 (announced 2026-09-05) |

---

## 5. Recommendations for closing #392

1. **Name the communication problem explicitly.** It is the most upvoted thing in the
   thread. Acknowledging it costs a paragraph and buys credibility for the v2 announcement.
2. **Give each person their traceability.** The thread has 62 participants; many wrote
   long proposals. Linking their numbers and citing their names in the request→v2 mapping
   is what turns a close into a satisfying close.
3. **Honestly separate three buckets:** what v2 brings, what stays out of scope, and what
   already existed in v1 and only needed documenting. The third bucket is bigger than it
   looks.
4. **Point to a single destination.** The thread closes, but there must be somewhere to
   go: the v2 thread.
5. **Leave it locked and closed after commenting**, so it is not used as a job board again.
