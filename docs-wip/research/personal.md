# Personal blogs: how the best ones lay out their pages (September 2026)

Research for the redesign of a personal blog preset.

## Method

- Pages were loaded in a real browser at **1440×900**, then **1024×768** and **390×844** (phone). Values come from `getBoundingClientRect()` and `getComputedStyle()` on the live DOM. They are **measured** unless marked *(est.)*.
- **x** is the left edge of an element, **w** is its width, **y** is its offset from the top of the document, all in CSS px.
- **cpl** (characters per line) is the paragraph width divided by the average glyph width of that paragraph's own text in its own font, spaces included. It is a good estimate of real characters per line, usually within ±3.
- The browser was in **dark colour scheme**, so the recorded background colours tell us which sites follow the system theme.
- Sites studied:
  - the eight requested: joshwcomeau.com, overreacted.io, maggieappleton.com, paulstamatiou.com, leerob.com, rauno.me, brittanychiang.com, and paulgraham.com as the minimal counterpoint;
  - three added: **emilkowal.ski** (design-engineer blog with a strong reputation for craft), **gwern.net** (the reference for sidenotes and long-form typography), and **simonwillison.net**, added because it is the one high-traffic personal blog with real **tag pages**, which most of the others lack.

---

## 1. Per-site measurements

### 1.1 Josh W. Comeau: joshwcomeau.com
Interactive tutorials. Sans serif throughout: Wotfard.

**Index (home)**
- **Layout:** a max 1100px container with 32px padding, centred (x170 at 1440). A 2-column grid of **627px list + 313px sidebar**. The sidebar is sticky (`top:112px`) and holds "Browse by category" chips and a "Popular content" list of 10 titles.
- **Entries:** a list, not cards. Each entry has a title (22px/600), a 2–3 line excerpt (16px/24px) and a "Read more" link. **No date, no image, no reading time.** Entry height is 210px, the step between entries is 258px (48px gap), and there are 13 entries.
- **Header:** 48px tall, sticky. A decorative canvas hero about 520px tall sits above the list.
- **At 1024:** list 576px + sidebar 288px, still sticky.
- **Phone:** one column 358px with 16px gutters. The sidebar drops below the list (y≈4700).

**Post** (`/css/interactive-guide-to-flexbox/`)
- **Grid:** `170px 686px 350px 170px` at 1440. The text column is **686px**. The 350px track holds a **sticky TOC** (w250, `top:160px`, 33 links).
- **Title block:** left-aligned, h1 **36px/54px, weight 500**, letter-spacing normal. Below it: "Filed under CSS on …", then "Last updated on …". h1 top is y160; the first paragraph is at y500, so the title band takes about 340px, including a coloured header band.
- **Body:** **18px/27px (1.5)**, paragraph margin 22.5px (1.25em), **~83 cpl**.
- **Cover image:** none. Figures are interactive widgets inside the column.
- **Callouts:** asides (warnings, "Is it still relevant?") are 750px wide, bleeding about 32px outside the text column on each side.
- **End of post:** "Last updated" plus a like/hit counter. The only real newsletter form is in the footer (y≈36870 of 37055). **No share buttons, no comments, no author box.** Related content comes through the category and popular links in the footer.
- **At 1024:** grid `128px 704px 128px`, and the **TOC is removed with no fallback**.
- **Phone:** 358px column with 16px gutters, body still 18px, h1 still 36px, about 43 cpl.

**Category page** (`/css/`)
- h1 38px/600. A **2-column grid of text cards, 534px each with a 32px gap**, 30 items on one page, no images.
- Each card shows title 22px, excerpt 16px and "Read more".

**About page** (`/about-josh/`)
- Bespoke design. h1 64px. A large illustrated portrait (391×733) on the right, with photos scattered through the text.

**Dark mode:** a theme toggle *(from earlier visits, not re-verified this time)*.

**Distinctive:** interactive demos inside the text, a sticky TOC with the active section highlighted, and bleeding callouts.

---

### 1.2 Dan Abramov: overreacted.io
Essays. Serif body, geometric sans titles.

**Index**
- **Layout:** `body` has `max-width: 672px` (Tailwind `max-w-2xl`) and 20px padding, which gives a **632px column**, centred (x404).
- **Entries:** a single list of **all 59 posts on one page**, with no pagination and no featured post. Each entry has:
  - a title in Montserrat **28px/900**;
  - a date in 13px;
  - a one-line spoiler in Merriweather 16px.
- **Spacing:** entry height 144px, step 176px (32px gap). No images.
- **Header:** 32px tall, not sticky. No nav links besides the home link. **No about page, no tags.**

**Post** (`/a-social-filesystem/`)
- **Column:** 632px, centred.
- **Title:** h1 Montserrat **40px/44px weight 900**, left-aligned. The date (13px) sits just below the h1.
- **Body:** Merriweather **16px/28px (1.75)**, **~81 cpl**. Blocks are spaced by a 32px flex gap.
- **Headings:** h2 Merriweather 30px/700.
- **Media:** videos in the column at 632px, with varied ratios (1.2–1.7).
- **No TOC, no share, no newsletter, no author box, no related posts.**
- **End of post:** three quiet links: "Pay what you like", "Discuss on Bluesky", "Fork on Tangled".
- **Phone:** 350px column with 20px gutters. Font sizes are unchanged (16px body, 40px h1), about 45 cpl.

**Dark mode:** follows the system (background `rgb(40,44,53)`).

---

### 1.3 Maggie Appleton: maggieappleton.com
A digital garden: essays, notes, patterns, talks. Serif display type with a sans UI.

**Index** (`/garden`)
- **Title:** h1 "The Garden" in Canela Deck **81.8px**.
- **Filters:** type tabs (Essays, Notes, Patterns, Smidgeons, Talks, Podcasts, Library, Antilibrary) and about 20 topic chips.
- **Layout:** a **masonry of CSS columns: 3 at 1440** (`column-count:3; column-gap:8px`, total 1268px at x86), **2 at 1024** (874px), **1 on phone** (360px).
- **Entries:** 167 items, all on one page. They are **mixed cards**:
  - text-only for notes and essays: title in Canela Text 22px, a dek, and metadata in Lato 15px;
  - image cards for talks: image 404×226, **ratio 1.79 (≈16:9)**. 54 of the 167 cards have images.
- **Dates:** relative ("10 days ago").

**Post** (`/ai-enlightenment`)
- **Grid:** `324px 792px 324px`, a named-line grid used for breakouts. The text column is **792px**.
  - Paired images span almost the full width (two images of 682px each, x27 to x1414).
  - A sticky **TOC sits in the left margin** (w≈250–281, `top:16px`).
- **Title:** h1 Canela Deck **56px/61.6px, weight 600**, left-aligned in an 800px header block about 444px tall. Under it: the dek (subtitle) and relative "planted / tended" dates.
- **Body:** Canela Text **22px/44px (line-height 2.0)**, paragraph margin 33px, **~80 cpl**.
- **Headings:** h2 **44px weight 100** (a very light display cut), margin-top 66px.
- **End of post:**
  - "Mentions around the web": **webmentions** used as comments, showing the first few and then "Show 16 more";
  - "Want to stay up to date?", which offers **RSS only**.
- **No share buttons, no author box.**
- **At 1024:** grid `123px 778px 123px`, body 21.6px/43.2px, h1 54px, **TOC hidden**.
- **Phone:** text 360px with 15px gutters, body **20.2px/32.3px (1.6)**, h1 39.5px, about 40 cpl. The type is fluid and the line-height tightens from 2.0 to 1.6 on small screens.

**About page**
- h1 81.8px.
- Two columns: **text 671px** on the left, **portrait 515×960** on the right. Body 22px/35.2px.

**Dark mode:** follows the system (background `rgb(28,27,24)`, a warm near-black).

---

### 1.4 Paul Stamatiou: paulstamatiou.com
Long, image-heavy essays. Custom sans fonts ("PSC", "PSA").

**Home / index**
- **Intro:** a short bio with credential bullets.
- **"Recent gear":** a horizontal strip of **square 196×196 thumbnails**, 12 items.
- **Photo sections** follow.
- **"Posts" block:** 664px wide, centred (x388). A counter reads "10 of 1,224 posts" and pagination uses `?page=2`.
  - Each **row is 80px**: title, one-line subtitle, date. No thumbnails.
- **Archive** (`/posts`): a **600px column** (x420) with a search box and **all posts grouped by year** (about 470 rows, row step 44px). The page is about 52,000px tall.

**Post** (`/browse-no-more`)
- **Text column:** 704px, centred (x368).
- **Header rail:** a **vertical sticky nav on the left** (54px wide at x43, `top:152px`).
- **Title block:** left-aligned. h1 **28.8px/38.9px, weight 550, letter-spacing −0.432px (−0.015em)**. Then the subtitle (20.8px/500, −0.02em) and the date.
- **Cover image:** comes after the title block at **800px wide (breaking out 48px on each side), ratio 1.76 (≈16:9)**, at y908. Every later image is also 800px wide (ratios 1.34–1.77).
- **Body:** **19px/29.45px (1.55)**, paragraph margin 23.75px (1.25em), **~87 cpl**.
- **End of post:**
  - an **author box** (name, @handle, 2-line bio, "Read more »");
  - RSS;
  - **Next / Previous** with dates;
  - a "Recently" list of 5 titles with dates, plus "View all".
- **No TOC, share buttons, comments or newsletter form.**
- **At 1024:** text still 704px (x160), images 800px; the sticky side rail disappears.
- **Phone:** the paragraph box is the full 390px with **24px inner padding** (text 342px, about 42 cpl). **Images go full-bleed** at 390px. h1 stays at 28.8px.

**Dark mode:** a toggle. The dark theme is **tinted**, not grey: `oklch(0.185 0.1 120)`, a deep olive.

---

### 1.5 Lee Robinson: leerob.com
Short essays. Serif throughout: Iowan Old Style.

**Home (which is also the about page and the index)**
- **Layout:** a **600px column that is left-aligned** (x49 at 1440), not centred.
- **Bio:** a bio with a **"Default / Long" toggle**.
- **"Notes":** about 12 links to evergreen topic pages, which act as pinned content.
- **"Blogs":** 8 rows, each **53px tall**, laid out as a grid with the title on the left and the date ("July 2026", 14px, muted `rgb(170,165,158)`) on the right.
- h1 "@leerob" 42.4px/600; section h2 23.2px.

**Post** (`/agents`)
- **Column:** 600px, **centred** (x420).
- **Title:** h1 **30px/33px weight 600, letter-spacing −0.6px (−0.02em)**, followed by "December 2025 · Lee Robinson".
- **Body:** **17px/27.2px (1.6)**, paragraph margin 23.2px, **~78 cpl**.
- **Headings:** h2 23.2px/600 (−0.02em), margin-top 49.6px.
- **Images:** **break out to 1100px at 3:2** (x170).
- **No header, footer, TOC, share, author box or related posts.** The page ends with the last paragraph.
- **Phone:** text 350px with 20px gutters, about 46 cpl. Images **full-bleed at 390px**. h1 grows to 32px, which is odd.

**Dark mode:** follows the system (warm `rgb(27,26,25)`).

---

### 1.6 Rauno Freiberg: rauno.me
Interaction-design prototypes and a few essays. System-style sans: the "X" font stack.

- **Home:** a horizontally scrolling canvas of statements, not a blog index.
- **Index** (`/craft`):
  - **full-bleed masonry, 3 flex columns of 477px** with no outer margin;
  - about 80 **video or image tiles**, mostly **16:9 (1.78)** with some at 2.28;
  - each tile carries only a title and date in **13px** below it, plus a "View Prototype" or "Read Essay" label.

**Post** (`/craft/interaction-design`)
- **Container:** `main` has `max-width: 720px` and 24px padding, so the **text column is 672px**, centred.
- **Title:** h1 **16px/500**, the same size as the body. Hierarchy comes only from weight and space. h1 top is y160.
- **Body:** **16px/28px (1.75)**, **~97 cpl** (wide for a 16px sans).
- **Media:** in the column at 672px wide, 16:9 and 3:2.
- **TOC:** a **sticky list in the left margin** (139px wide at x124), 16 entries.
- **End of post:** acknowledgements, a resources list, then **Previous / Next**. No share, comments or newsletter.

**Dark mode:** dark (`rgb(22,22,22)`); whether it follows the system or is always dark was not verified.

---

### 1.7 Brittany Chiang: brittanychiang.com
A portfolio whose "Writing" section **links out to Medium**. It matters here as the reference **author/about layout**.

**Home (the about page)**
- **Layout at 1440:** a **split layout**.
  - Left: a **sticky 561px column** (x128, full viewport height) with the name at 48px/700 (letter-spacing −1.2px, −0.025em), a tagline, a **section nav with an active-section indicator**, and social icons.
  - Right: a **scrolling 607px column** (x705) with About, Experience, Projects and Writing.
- **Body:** Inter **16px/26px**.
- **Writing rows:** 79px tall on an 8-column subgrid. Each row has a **140×79 thumbnail (16:9)**, the year above, and the title. Rows are 127px apart.
- **At 1024:** the split holds (sticky 438px + 474px).
- **Phone:** it stacks. The header is static, 342px wide with 24px gutters. h1 is 36px. Thumbnails grow to 200×113 and sit above the text.

**Archive** (`/archive`)
- A **1184px table** with columns Year 64, Project 301, Made at 143, Built with 429, Link 247.
- Rows are 69px tall. h1 48px.

**Dark mode:** always dark (navy); no toggle.

---

### 1.8 Paul Graham: paulgraham.com (the minimal counterpoint)

**Post** (`/greatwork.html`)
- **Layout:** a 1990s table layout, left-aligned. A 69px image nav column, a 26px spacer, then a **435px text column** (x103).
- **Body:** **Verdana 13px**, line-height `normal` (≈16px, about 1.2, *est.*), **~66 cpl**.
- **Title:** a **GIF image**, 18px tall.
- **Notes:** footnotes as bracketed numbers (58 references) that jump to a "Notes" section at the end.
- **No viewport meta tag**, so phones render the desktop page zoomed out.
- No images, TOC, share buttons, comments or dark mode.

**Index** (`/articles.html`): a plain list of titles *(from prior knowledge; not measured this session)*.

---

### 1.9 Emil Kowalski: emilkowal.ski (added)
Design-engineering articles with live demos. Sans serif.

**Home / index**
- **Column:** about 644px of text inside a `max-width: 692px` container with 24px padding. Link rows are 668px (x386) because of a hover background.
- **Order:** Projects, then **Writing rows 72px tall (step 88px)**. Each row has a title and a one-line subtitle, with **no dates** and no images.

**Post** (`/ui/the-magic-of-clip-path`)
- **Column:** **644px**, centred.
- **Title:** h1 **16px/600**, the same size as the body, like Rauno. h2 is also 16px, at weight 550.
- **Body:** **16px/26.4px (1.65)**, paragraph margin 26px, **~90 cpl**.
- **Media:** 644px wide, ratios 16:9 to 1.91. Interactive demos sit in the column.
- **Header:** a sticky top bar spanning the full width.
- **End of post:** a course call to action ("Check out animations.dev"), then **Previous / Next**.
- **No TOC, share, comments or author box.**

**Dark mode:** a "Switch theme" toggle. It stayed **light** even though the system was set to dark.

---

### 1.10 Gwern Branwen: gwern.net (added)
Very long-form research essays. Serif: Source Serif 4.

**Post** (`/scaling-hypothesis`)
- **Container:** `main` has `max-width: 935px` and 20px padding, so the text column is **895px**.
- **Body:** **19px/31px (1.63), justified** (hyphenated), **~100 cpl at full width**. That is wide; it is made readable by justification and generous leading.
- **Title:** h1 **50px/57.5px weight 600, letter-spacing −1px (−0.02em), centred**. It is followed by a metadata block: tags, description, dates and a confidence rating.
- **TOC:** floated **left inside the text** (317px wide), not sticky. Paragraphs beside it narrow to 481px (about 60 cpl).
- **Notes:** 34 footnotes.
  - At **1920px** they render as **sidenotes in a 397px right column** (17px text).
  - At **1440px there is no room**, so they fall back to **popups on hover**.
  - Link previews also appear on hover.
- **Page chrome:** a fixed vertical toolbar on the right with theme, reader mode and similar controls.

---

### 1.11 Simon Willison: simonwillison.net (added for taxonomy)
A link blog plus essays. Helvetica Neue.

**Tag page** (`/tags/css/`)
- **Layout:** a **560px primary column + 280px secondary column** (x250 and x845). Not centred on the viewport.
- **Header:** "241 posts tagged 'css'" plus a **per-tag Atom feed** link.
- **Entries:** full entries, not excerpts, grouped under **year dividers**, each with a type label (TOOL, link, quote).
- **Sidebar:** "Related" tags **with counts** (javascript 765, html 98, …).
- **Pagination:** **30 per page**, "next »" and "last »»", 9 pages.
- **Body:** 14.4px/20.9px (1.45).
- **Other:** a sponsor banner at the top and a "Random" link.

---

## 2. What they all do (the conventions, with numbers)

| Site | Text column | Body size/leading | cpl | h1 (post) | Title align |
|---|---|---|---|---|---|
| Josh | 686 | 18/27 (1.50) sans | ~83 | 36/500 | left |
| overreacted | 632 | 16/28 (1.75) serif | ~81 | 40/900 | left |
| Maggie | 792 | 22/44 (2.00) serif | ~80 | 56/600 serif | left |
| Paul S. | 704 | 19/29.5 (1.55) sans | ~87 | 28.8/550, −0.015em | left |
| leerob | 600 | 17/27.2 (1.60) serif | ~78 | 30/600, −0.02em | left |
| Rauno | 672 | 16/28 (1.75) sans | ~97 | 16/500 | left |
| Emil | 644 | 16/26.4 (1.65) sans | ~90 | 16/600 | left |
| gwern | 895 | 19/31 (1.63) serif, justified | ~100 | 50/600, −0.02em | centre |
| PG | 435 | 13/≈16 Verdana | ~66 | GIF | left |

1. **A single reading column of 600–704px.** The median is about **660px**. Only Maggie (792px, with 22px type) and gwern (895px, justified) go wider. Every site keeps the column fixed from 1440 down to 1024 and simply moves it to the centre.
2. **The measure is about 80 characters, not the textbook 45–75.** Seven of the nine sites fall between **78 and 90 cpl** on desktop. Readability is held by leading: most sit at **1.55–1.75**. On phones everything falls to **40–48 cpl**.
3. **Body text is 16–19px on desktop** (median 17–18). **Nobody shrinks body text on phones** except Maggie (22 → 20px), and she scales fluidly.
4. **Titles are left-aligned** at the same left edge as the body (8 of 9; gwern is the exception). Title sizes span **28–56px** among sites with a visible hierarchy. Large titles get **negative tracking of −0.015 to −0.025em** (Paul, leerob, gwern, Brittany). Nobody uses positive tracking on display type.
5. **No cover image above the title.** None of the 9 post pages puts a hero image before the h1. When a lead image exists (Paul) it comes **after the title, subtitle and date**, at ≈16:9, and **breaks out wider than the text** (800 vs 704px).
6. **Images break out of the text column.** Paul goes from 704 to 800px, leerob from 600 to 1100px at 3:2, and Maggie from 792 to about 1380px for pairs. On phones, images go **full-bleed** (Paul, leerob). **16:9 is the dominant ratio** for thumbnails and video (Maggie 1.79, Rauno 1.78, Brittany 1.78, Paul's lead 1.76). 3:2 is second (leerob).
7. **Zero share buttons.** Not one of the 11 sites has share-intent links. The closest thing is overreacted's plain-text "Discuss on Bluesky".
8. **Few comments.** When they exist they are **off-site**: webmentions (Maggie) or a Bluesky thread (overreacted).
9. **The newsletter is rare and always at the end.** Josh has a form in the footer; Maggie offers "Want to stay up to date?" with RSS only. Everyone else offers RSS or nothing. **Nobody uses a mid-article or pop-up signup.**
10. **The end of a post is quiet.** The usual kit is **Previous / Next** (Paul, Rauno, Emil), a short "Recently" or related list of 3–5 titles (Paul), and a small **author box** (Paul only). Most sites have no author box because the whole site is the author.
11. **Index = a text list, not a card grid.**
    - 6 of the 8 blog indexes are lists: overreacted, Paul, leerob, Emil, Josh, and Simon for tags.
    - Each entry is **title, one-line dek, date**.
    - **Thumbnails appear only when the work is visual**: Maggie's talks, Rauno's prototypes, Paul's gear strip.
    - Row rhythm: **53px** (leerob, single line), **80–88px** (Paul, Emil, title and dek), **176px** (overreacted, large title), **258px** (Josh, with excerpt).
12. **All posts on one page is normal.** overreacted shows 59, Maggie 167, Paul's archive about 470 grouped by year, and Josh's category page 30. Pagination appears only on high-volume blogs: Paul's home at 10 per page and Simon at 30 per page.
13. **Dark mode is expected.**
    - **Follow the system:** overreacted, Maggie, leerob.
    - **Follow the system and add a toggle:** Paul, Josh.
    - **Toggle, light by default:** Emil.
    - **Always dark:** Brittany, Rauno.
    - **No dark mode:** only PG.
    - The good dark themes are **warm or tinted**, not neutral grey: Maggie `rgb(28,27,24)`, leerob `rgb(27,26,25)`, Paul's olive oklch.

## 3. Where they differ, and why (tied to the kind of writing)

- **Tutorials with interactive widgets (Josh, Emil, Rauno):** sans serif body, a 644–686px column, and a **sticky TOC** because the pieces are long references that readers jump around in. The page is built around demos, and callouts bleed out of the column. Emil and Rauno drop title hierarchy to 16px because their audience scans demos, not headlines. This works for a portfolio but hurts skimming.
- **Essays (overreacted, leerob, PG):** a serif body (or Verdana at PG), a 600–632px column, **no TOC, no images at the top**, and an index that is a plain chronological list. The writing carries the page, so the chrome is removed.
- **Garden or notes (Maggie):** mixed content types need **filters by type and topic** and a **masonry of mixed cards**: text cards for notes, 16:9 image cards for talks. Relative "planted / tended" dates replace publish dates because notes evolve. Her 22px/2.0 serif is a deliberate "book" feel for slow reading.
- **Visual essays (Paul S.):** wide 800px imagery, a lead image after the title, and a rail nav so the header does not compete with the photos. The archive is by year because there are more than 1,200 posts.
- **Research (gwern):** citations and asides are the content, so **sidenotes** appear at wide screens with a popup fallback, alongside metadata such as confidence and dates and a wide justified measure.
- **Portfolio or about-first (Brittany, leerob's home):** the "index" is really the author page. Brittany uses a sticky identity column with a scrolling proof column; leerob uses a single column with a bio-length toggle.
- **High-volume link blog (Simon):** the one site where **tag pages are central**: counts, related tags, per-tag feeds and pagination. The others either have no taxonomy (overreacted, leerob, Paul, Emil) or show it as chips (Josh, Maggie).

## 4. Best ideas worth adopting and weaknesses to avoid

### Best ideas
1. **A named-line breakout grid** (Josh, Maggie): `full | wide | content | wide | full`. Text stays at about 680px while figures, code and callouts step out to about 880px or full width. Callouts bleeding 32px past the text (Josh) read as asides without a sidebar.
2. **A sticky TOC in a margin rail** (Josh on the right at 250px, Maggie and Rauno on the left). It is only worth having on long posts and needs a fallback below the rail breakpoint (see weaknesses).
3. **Lead image after the title, wider than the text** (Paul: 800 over 704, 16:9). This keeps the headline above the fold and still gives the image weight.
4. **Full-bleed images on phones** (Paul, leerob). Readers get about 12% more image width while text keeps its 20–24px gutters.
5. **Fluid type with tighter leading on small screens** (Maggie: 22/2.0 on desktop, 20/1.6 on phone).
6. **An index row made of title, one-line dek and date**, 53–88px per row (leerob, Paul, Emil). The date sits right-aligned in a muted, smaller size (leerob: 14px, `rgb(170,165,158)`).
7. **Pinned or "start here" content as its own block, not a big featured card.** Examples: Josh's sticky "Popular content" sidebar, leerob's "Notes" list, Paul's "Recently".
8. **A year-grouped "all posts" archive with search** (Paul's `/posts`) alongside a short home list ("10 of 1,224", with a link to all posts).
9. **Tag page header with name, count and per-tag RSS; related tags with counts in the sidebar** (Simon).
10. **Split about layout** (Brittany): a sticky identity column on the left (name, tagline, section nav with an active indicator, socials) and scrolling proof on the right. It holds at 1024 and stacks below.
11. **A bio-length toggle** (leerob: "Default / Long") and a **portrait next to text** (Maggie: 671px text + 515px portrait).
12. **Quiet end matter:** Previous/Next, 3–5 recent titles, and a plain "Discuss on …" link instead of share widgets. Webmentions count as comments without hosting them.
13. **Sidenotes when there is room, popups when there isn't** (gwern: sidenotes at 1920, popups at 1440).
14. **Warm or tinted dark themes** instead of `#000` or neutral grey.

### Weaknesses to avoid
1. **The TOC disappears with no fallback between 1024 and 1280** (Josh, Maggie). Provide a collapsible "Contents" block at the top of the body instead.
2. **An h1 the same size as the body** (Rauno and Emil at 16px). It looks elegant but gives no hierarchy for skimming. Keep it as an optional style, not the default.
3. **No dates on the index** (Josh, Emil). Readers cannot judge freshness, which matters on technical posts. Show at least the month and year.
4. **Very wide measures:** 97–100 cpl (Rauno at 16px; gwern at 895px justified). Cap the text column so body type stays at 75–85 cpl or below.
5. **Extreme leading** (Maggie 2.0 at 22px) makes pages very long. 1.6–1.7 is the practical ceiling.
6. **No responsive viewport** (PG) and **13px body** text.
7. **Home and post columns in different places** (leerob: left-aligned home, centred posts). This is jarring when you click through.
8. **Writing hosted off-site** (Brittany links to Medium), which loses ownership and consistency.
9. **Hiding the only newsletter form in the footer below a 37,000px page** (Josh). If there is a signup, put one compact block right after the article's last paragraph.
10. **Loading 470+ rows on one page without year anchors or search** only works if the page has them, as Paul's does. Without them it is a wall.

## 5. Recommended layout spec for a personal blog preset

### 5.1 Tokens

| Token | Value |
|---|---|
| `--measure` (text column) | **680px** (about 38em at 18px; lands at about 75–82 cpl sans, 70–78 serif) |
| `--wide` (breakout) | **880px** (figures, code, callouts, lead image) |
| `--rail` (margin column) | **240px** (TOC or sidenotes), gap to text **48px** |
| `--page-max` | **1200px** for index, taxonomy and about grids |
| Gutters | **16px** below 640 · **24px** 640–1023 · **32px** from 1024 up |
| Body | **18px / 1.65**, from 1024 up · **17px / 1.6** below 640 (fluid clamp in between) |
| Small / meta | 14–15px, muted colour, tabular numerals for dates |
| h1 (post) | `clamp(2rem, 1.4rem + 2.4vw, 3rem)` → **32px phone … 48px desktop**, weight 650–700, line-height 1.1, **letter-spacing −0.02em** |
| Dek (subtitle) | 20–22px, line-height 1.4, muted |
| h2 | **26–28px** (1.5rem phone), weight 600, −0.01em, margin-top **2.5em**, margin-bottom 0.6em |
| h3 | 20–21px, weight 600, margin-top 2em |
| Paragraph spacing | **1.25em** |
| Radii / cards | 8–12px when cards are used; no shadows by default |
| Fonts | One serif and one sans. The default pairing is a **sans UI with a serif or sans body chosen per preset**. Both families are proven: Merriweather/Canela/Iowan/Source Serif for essays; Inter-like sans for tutorials. |
| Dark mode | Follow the system and add a toggle; warm near-black (about `#1c1b18`), not `#000` |

### 5.2 Post page

**Grid (named lines):**
```
[full-start] minmax(var(--gutter),1fr)
[wide-start] minmax(0,100px)
[content-start] min(var(--measure),100%) [content-end]
minmax(0,100px) [wide-end]
minmax(var(--gutter),1fr) [full-end]
```
From 1280 up, add a rail track on the right: content 680 + gap 48 + rail 240, with the pair centred.

**Order, top to bottom:**
1. **Header:** 56–64px, sticky optional. Gap to the title block: **64px** on desktop, **40px** on phone.
2. **Title block, left-aligned on the content line:**
   - eyebrow: category link, 14px uppercase or small caps, +0.04em;
   - **h1**;
   - dek;
   - meta row: date · reading time · "Updated …" when relevant, 14–15px muted.
   - Title block max width = `--wide` (880) so long titles don't wrap into 4 lines. Margin below: **40px**.
3. **Lead image (optional):** placed **after** the title block, at **`--wide` 880px, 16:9** (3:2 allowed), rounded 8px, optional caption 14px. **Full-bleed on phone.** Never above the h1.
4. **Body:** in `--measure`.
   - `figure`, `pre` and `.callout` span `wide`;
   - `.full` spans `full`;
   - callouts may bleed 24–32px past the text.
5. **TOC:** shown only when the post has **4 or more h2**.
   - **1280 and up:** sticky in the right rail (`top: 96px`), 14px, highlights the active section.
   - **Below 1280:** a collapsible "Contents" `<details>` block right after the lead image.
6. **Footnotes:** at the end with back-links, plus a hover or tap popover. Optional sidenote mode uses the rail at 1440 and up, when there is no TOC.
7. **End matter, in this order, each separated by 48px:**
   1. tags as small chips, and "Last updated";
   2. a quiet line: "Discuss on Bluesky / HN · Copy link" (**no share-button row**);
   3. **author box**: 56px round avatar, name, one-line bio, link to About;
   4. **one** compact subscribe block (email field and RSS) inside `--measure`;
   5. **Previous / Next**, as 2 columns from 640 up and stacked below;
   6. **Related:** 3 posts as text rows (title + date), not cards.
8. **Comments:** off by default. Offer webmentions or "Discuss on …" as the recommended option.

**Responsive summary:**
- **1440:** content 680 + rail 240, centred.
- **1024:** single centred 680 column; TOC collapses to the top; wide elements cap at `min(880px, 100% - 2×24px)`.
- **Phone:** 17px body, 16–20px gutters, h1 32px, lead image and figures full-bleed.

### 5.3 Blog index

**Layout:** a single column at **720px** (the measure plus room for right-aligned dates), centred on the same axis as posts. `--page-max` applies only to the header and footer.

**Top of page:** h1 "Writing" (or the site name) at 40–48px, a one-line intro of 18px muted, then an optional **"Start here" / pinned block** of 3–5 title-only links in a subtle box or a 2-column list. No big featured hero card.

**Default entry (list):**
- title 20–22px/600;
- dek of one line, 16px muted, clamped to 2 lines;
- date on the right (14px, tabular, muted) from 640 up, and above the title on phone;
- optional category chip.
- Row padding **16px** vertical with a 1px divider, which gives a step of about **80–88px**.
- No thumbnails by default.

**Variant "cards"** (for visual writers):
- a grid of **3 columns from 1024 up, 2 columns from 640 up, 1 on phone**, gap **24–32px**, on `--page-max`;
- **16:9** thumbnail on top (radius 8), then title 18–20px, dek 15px and date.
- Optional **masonry** variant when card types are mixed (Maggie: 3/2/1 columns, 8–16px gap).

**Volume:** up to about 100 posts, show all and group by **year headers** (24px, sticky optional). Above that, show 20 per page with "Newer / Older" and an "All posts" archive page (year-grouped, with search).

**Filters (optional):** a row of category chips under the intro, which link to taxonomy pages.

### 5.4 Taxonomy page (category or tag)
- **Header** in the index column:
  - eyebrow "Category" or "Tag";
  - h1 = name (40px);
  - **count** ("24 posts");
  - optional description (18px muted);
  - **RSS for this term**.
- **List:** the same entry component as the index, year-grouped.
- **1024 and up (optional):** a 240px sidebar of **related tags with counts** next to a 680–720px list (Simon's pattern), or the Josh variant: a 2-column grid of text cards (title + dek) on `--page-max`.
- **Pagination:** 20–30 per page, same as the index.
- **Phone:** a single column, with related tags moved below the list as chips.

### 5.5 Author / About page
There are two presets, chosen by content.

**Variant A: Split** (portfolio or developer, Brittany)
- **1024 and up:** a **sticky left column of about 40%** (max 480px) holding:
  - name h1 48–56px, −0.025em;
  - role;
  - one-sentence tagline;
  - **section nav with an active indicator**;
  - social icons.
- A **right column of about 55%** (max 620px) that scrolls, with sections for About, Now, Experience or Projects, and Writing (5 latest, rows with an optional **16:9 thumbnail at 140×79**).
- Below 1024 it stacks, with a static header and 24px gutters.

**Variant B: Editorial** (essayist, Maggie or leerob)
- h1 56–64px.
- **1024 and up:** a 2-column layout with **text at 680px** and a **portrait at 4:5 (or 2:3), about 400–480px wide**.
- Optional **"Short / Long bio" toggle**.
- Then "Now", links, and "Selected writing" (3–6 titles).
- Phone: the portrait goes above the text, full width minus gutters, 4:5.

**Both variants:** the same author box data is reused at the end of posts (avatar, name, one-line bio).

### 5.6 Quick reference: what goes where

| | Desktop ≥1280 | Tablet ~1024 | Phone ≤640 |
|---|---|---|---|
| Post text | 680 centred with a 240 rail | 680 centred, no rail | 100% − 2×16–20 |
| Figures | 880 (wide) / 100vw (full) | min(880, 100% − 48) | full-bleed |
| TOC | sticky rail, right | collapsible at top | collapsible at top |
| h1 / body | 48 / 18 | 40 / 18 | 32 / 17 |
| Index | 720 list, date right | same | date above title |
| Cards variant | 3 columns, 16:9 | 2 columns | 1 column |
| Taxonomy | list + 240 related sidebar | list only | list, then chips |
| About | split 40/55 or text + portrait | split holds (A) or stacks (B) | stacked, portrait first |
