# Company blogs in 2026: measured layout study

Research for the "company" preset: a blog with several writers, categories that map to teams, and a mix of guides and announcements.

**Method.** On 27 Sep 2026 each page was loaded in a real browser at an emulated 1440×900 viewport, and at 1024×768 and 390×844 where noted, and measured with `getBoundingClientRect` and computed styles in JavaScript. All figures are CSS px at 1440 unless stated. "x" is the left edge; "w" is the width. Values marked *(est.)* were inferred from structure rather than measured directly. "ch/line" is characters per line, measured on real paragraphs (text length ÷ rendered lines).

Sites: Stripe (stripe.com/blog plus stripe.dev/blog), Vercel, Linear (/now), Cloudflare, GitHub, Figma (Shortcut), Anthropic (/news and /engineering), Supabase, and Resend, plus Cursor (cursor.com/blog) as the extra widely praised reference.

---

## 1. Per site

### 1.1 Stripe: stripe.com/blog (corporate/product) and stripe.dev/blog (engineering)

**Index (1440)**
- White background. Container 1080 (x180), with Stripe's decorative vertical guide lines in the gutters.
- Featured post: a single card of 1080×580 on a 4-column grid (258 px each). Text on the left (category 15px in accent #635bff, title 38/48 w500, excerpt 18/28 w300, two author cards with 48 px avatars) and a 524×548 illustration on the right. The illustration is a custom data graphic.
- Filter: a segmented control (All · Corporate · Engineering · Industry · Product), 1080×32, placed *below* the featured post.
- Entries are rows, not a grid. Each is 1080 wide: category, title 38/48 and excerpt in the left 540; date and author cards at the top right; a **540×540 square** image below them. One entry is 700–800 px tall, so about one post per screen.
- Bottom: "View all posts" leads to `/blog/page/1`. Then an email subscribe form (305 px input).
- **Phone (390):** 16 px gutters. Titles stay at 38 px and images are 358 square, so each entry is **850–1110 px tall**.

**Category (/blog/product)**
- Title "Product" 26/36 plus a 15/24 description (w682), the same row list, and **numbered pagination** (`/page/2…7` plus Next).
- `/blog/engineering` redirects to stripe.dev, so engineering has its own site.

**Post: announcement ("New currency capabilities…")**
- Grid: a 270 left rail (author card: 48 avatar, name, **job title**, e.g. "Head of Product, Payouts…") and an **810 main column** (x450).
- h1 56/67 w425, left-aligned, above the date (15px).
- Cover 810×366 (2.2:1): a custom product illustration at text width. Inline images and video also stay at 810.
- Body: Söhne 18/28, **w300**, colour #425466. Measure **69–87 ch/line**, which is too long.
- h2 34/48 w500 with a 48 px top margin. One callout card (1 px border) for a customer quote.
- No TOC, no share tools, no reading time.
- End: a full-width band with a newsletter form (540 px), "Like this post? Join our team" (careers) and a feedback prompt. No related posts.
- Author names link to LinkedIn. **There are no author pages.**
- **At 1024:** the rail shrinks to 248, text is 744, gutters 16.
- **At 390:** h1 42/50, body 15/24 (~39 ch). Author cards move below the title.

**stripe.dev post ("Building a data plane…")**
- Dark navy (#011627) terminal aesthetic with mono navigation.
- h1 is **101 px** and spans the full 1239 px.
- Sticky left "METADATA" panel (354 px, top 60): date, authors, reading time, categories, **"Copy for LLM" / "View as Markdown"**, and X/LinkedIn share.
- Text 708 (x425), body 18/**23.4** (lh 1.3, too tight). h2 48/48 w300. Images 674 with a 4 px radius.
- "About the authors" bios at the end.
- stripe.dev index: a dense table of date + title rows (47 px each), all 119 posts on one page, with a left sidebar of topic filters that show counts ("AI (21)").

### 1.2 Vercel: vercel.com/blog

**Index (1440)**
- Black background (#000), Geist. Full-width container 1392 (24 px margins) on a 12-column grid with 24 px gaps.
- h1 "Blog" 48/56.
- Filter row: pill tabs (All, Engineering, Community, Company News, Customers, v0, Security, Changelog, Press), each 36 px tall. On the right, a search input (138) and an RSS icon.
- "Featured articles": three **text-only** cards of 448×420. Each has date 14, category (grey), title 32/40, excerpt 14/20, and 16 px overlapping avatars with "A, B, and 1 other".
- "Blog posts": a 3-column grid of text-only cards (448×216, title 24/32). Card background #0a0a0a, radius 2, padding 24/24/32.
- **No thumbnails anywhere.** A "Show more posts" button at the end.
- Customer stories (`/customers/...`) are mixed into the feed.

**Category (/blog/category/engineering):** the same template. h1 becomes the category name, and the category gets its own featured row.

**Post: technical ("How we migrated the database…")**
- **Centred 684 text column** (x378, exactly centred), with a breadcrumb (Blog › Engineering) above.
- h1 48/56 w450, left-aligned in the column. Author names with avatars sit under the h1.
- A right aside at x1204 (w212, not sticky): date, "9 min read" and a **"Copy" menu** (markdown/LLM).
- **No cover image.**
- Body Geist 18/28, 73–82 ch/line. h2 32/35, with a "Copy link to heading" anchor.
- Images break out to **784** (+50 per side).
- Code blocks 680 wide: bg #0a0a0a, radius 8, Geist Mono 13/20, padding 16.
- End: a "Contributors" list, then a full-width product CTA ("Ready to deploy?" with two buttons).
- Authors link to X. **There are no author pages.**
- **At 1024:** text 559, aside 226 on the right, images 719.
- **At 390:** 24 px gutters, h1 40/48, body 16/24 (~44 ch). The aside becomes an inline meta row above the body.
- **Index at 390:** the category tabs collapse to an "All ▾" dropdown and search to an icon. The three featured cards stay 416 px tall each, so there is about 1,300 px of featured content before the list.

### 1.3 Linear: linear.app/now (the blog is now called "Now")

**Index (1440)**
- #08090a background, Inter Variable (w510/590). Container 1280 (x80).
- h1 "Now" 48/48.
- Text tabs (All · Changelog · Product launches · From the team · From the community · Press), 16 px. The active tab is white; the rest are grey #8a8f98.
- Right: a ⌘K-style search button (280×40) and RSS.
- Grid: **3 × 384 columns with 64 gutters** and 64 row gaps. Cards have a **16:9 image (384×216, radius 5)**, title 20/26.6 w510, 2–3 line excerpt, and "Author · date".
- There is no separate featured slot.
- The page interleaves blocks: a Changelog strip (4 × 272), a Press strip, then an **"Archive" list of rows 56 px tall (title … author · date)**, then "Load more".
- **At 1024:** 2 × 460, 36 margins.
- **At 390:** 1 column of 342, 24 gutters. The tabs become a horizontally scrolling row.

**Category (/now/team):** the same header with the tab active, 6 cards, archive rows and Load more.

**Post: technical ("Rebuilding Linear's delta sync read path")**
- Breadcrumb "Now › From the team" centred.
- **h1 centred**, 48/48 w590, max 900.
- Cover **976×480 (2.03:1, radius 16)**, wider than the text by 352.
- Then a centred byline, "Peter Travers · August 18, 2026" (15px grey).
- Body: **text 624** centred (x408), Inter 17/27.2 (1.6), #d0d6e0, 69–76 ch.
- Section headings are h3 24/32 w590 with a 56 px top margin.
- **Every inline image breaks out to 976** (radius 8), and so do SVG diagrams.
- No TOC, no reading time.
- End: the author name plus a "Copy link" button. There is no related-posts block.
- **Author page `/now/author/peter-travers`:** name 40/44, team ("Engineering") 15px grey, then posts as 56 px list rows. The author name in a post has a hover card.
- **At 1024:** text stays 624, media 976 (24 margins).
- **At 390:** h1 32 centred, body 15/24, cover 342×186.

### 1.4 Cloudflare: blog.cloudflare.com (redesigned; Astro, per its `data-astro-cid` attributes)

**Index (1440)**
- Warm near-black #151414. Inter Tight for headings, Inter for body, **JetBrains Mono for metadata**. Container 1344 (x48).
- h1 "Cloudflare Blog" 36/45, plus a one-line description (18px), plus an event promo strip.
- Featured: an 824 text column (date in mono 12 uppercase, title 32/40, excerpt, 32 px overlapping avatars) beside a **480×270 (16:9) illustration** on the right.
- Then a **2-column, full-bleed** grid (2 × 720) of **text-only** cells with 48 px padding: date (mono), title 24/33 w500, excerpt 16/28 at 70 % alpha, author avatars 32.
- "Load more" button.
- Categories are an "All Categories" dropdown in the site header. Tags live at `/tag/x/`.

**Post: technical ("Saving another 100TB of RAM…")**
- Tags as chips above the title ("Deep Dive · Engineering · Open Source +4"), then the date (mono), then h1 42/42 w500.
- Authors: overlapping avatars plus names. A mono row with "13 MINUTE READ" and "COPY URL".
- Cover **713×401 (16:9) at text width**, a custom orange illustration.
- Text 715 (x363), Inter 16/28 at 70 % alpha, 70–86 ch. h2 36/43 w600, 50 px top margin, "Copy link" anchor.
- **Right sticky TOC** (x1210 w230, top 40, dashed left border): "ON THIS PAGE", h2 links 14px, **active state shown by an SVG progress rail**.
- Left rail (230): a "DISCUSS ONLINE" block pinned to the bottom of the viewport.
- Code: bg #101010, 1 px border, radius 6, JetBrains Mono 14/24, padding 20.
- End, in order: "Related tags" chips, author list (32 avatars plus social icons), "Subscribe to receive notifications" form (inline, text width), then related posts (3 × 384).
- **Announcement ("Python Workers are now GA"):** the identical template, TOC included.
- **Author page:** 70 avatar plus name 48, then posts as featured-style rows (824 text + 480×270 image).
- **At 1024:** the left rail is dropped, text is 598, and the TOC is 290 sticky on the right.
- **At 390:** gutters 20, h1 36/36, **h2 also 36**, so the hierarchy collapses. The TOC is hidden entirely.

### 1.5 GitHub: github.blog (WordPress, Primer/Mona Sans)

**Index (1440)**
- White, with **dark full-width bands**. Container 1232 (x104).
- A magazine homepage: a dark hero with a lead story (592 wide, image 592×314 **1.88:1**, title 48/52 w800) and three compact items with **168×168 square thumbs** and titles 20/24.
- A "We do newsletters, too" band.
- "Latest" and "Popular" as two list columns (with "View all").
- Changelog, then a category showcase (a 568 lead plus 4 × 284 cards), then YouTube, then availability reports.

**Category (/engineering/)**
- Dark hero: breadcrumb, h1 48/52 w800, description 18/27 (w719).
- "Featured" 3-column grid (3 × 379, gap 48), then "Latest" 3-column grid, then **numbered pagination** (`/page/2/`).
- Cards: image **379×201 (1.88:1)**, title 20/24 w600, excerpt 16/24 grey, "Author · date" with the date in `ui-monospace`.
- Subcategories exist in the URLs (`/engineering/architecture-optimization/`).

**Post: technical ("Improving site performance by shipping more CSS")**
- Dark hero with breadcrumb (Home / Engineering / Architecture & optimization), h1 48/52 w800, and a one-line dek at 16px.
- Cover **1019×541 (1.88:1)** straddles the dark band and the white body. It is wider than the text: it spans text + gap + part of the rail.
- Byline row: author names (links), then date | "8 minutes" in mono. At the right end of the same row, "Share:" with three 28 px icons (X, Facebook, LinkedIn).
- Text 699 (x211), Mona Sans 18/30, 69–81 ch. h2 32/40 w700, 40 px top margin. Inline images 699, radius 6.
- Right column (x957, w272): **tag chips** above a **sticky TOC** ("Table of Contents", top 80, rounded link pills).
- End: "Tags", then **"Written by"** bios (120 px avatar, name, @handle, 2–3 line bio), then "Related posts" (3 × 379), then "Explore more from GitHub" product cards.
- **Author page:** dark hero with a 274 px avatar, name 48, @handle, bio 18/27. Then "Posts by this author", the first as a lead (text 485 + image 699), then a grid.
- **At 390:** h1 **28** (small), body 16/26, TOC hidden, share row kept.

### 1.6 Figma: figma.com/blog ("Shortcut", an editorial brand)

**Index (1440)**
- #131313, figmaSans plus **figmaMono** for labels. Container 1392 (x24).
- The blog has its own masthead: wordmark, sections (Maker Stories · Working Well · Inside Figma · Insights · Latest · Topics ▾) and a "Subscribe to Figma's editorial newsletter" button.
- **Full-bleed hero illustration, 1392×783 (16:9)**, then the lead story (title 64/67).
- A curated horizontal carousel ("Catch up on Config 2026") of 448 cards (image 448×246, **1.82:1**, title 32/37).
- Themed sections with h2 64/67.
- A newsletter block (h2 46 plus a 743 email field).
- "The latest": a **3 × 448 grid with 96 row gaps**. Tags are **mono uppercase outlined chips** (1 px 40 % white, radius 8).
- "See everything" link.

**Category/tag (/blog/product-updates/)**
- h1 46 plus dek, then **curated carousels** (h2 64), then "More product updates" (3 × 448 grid).
- "Load more" is a real link to `?page=2`, so it is crawlable.

**Post: announcement ("Introducing Figma Motion")**
- Date (mono 14) above a **90 px h1**, left-aligned, spanning 1392.
- Author with avatar and role ("Product Manager, Figma"). Topic chips on the right.
- **Hero video 1392×783 (16:9).**
- Text **684 centred** (x378), 18/25.2 (1.4) w330.
- Right rail (x1145, w271) holds three 32 px share buttons and **sidenotes** (18px paragraphs set against the body).
- h2 64/67 in the body, very loud.
- Blockquotes and images break out to **920** (+118 per side).
- End: newsletter form, "Related articles", product CTA ("Get started for free").
- Author names are not linked *(est.: no author pages seen)*.

### 1.7 Anthropic: anthropic.com/news and /engineering

**Newsroom index (1440)**
- **Cream #faf9f5**, anthropicSans for UI and **anthropicSerif for excerpts and body**. 12-column grid, 1272 wide (x84).
- Two-column hero: h1 "Newsroom" 52 on the left, press contacts on the right.
- Featured: **837×471 (16:9) media** on the left and three stacked text items on the right (w403: category 14 w500 plus date, title 19/23 w600, serif excerpt 15/21).
- "News": a table-like list (**date | category | title** in 3 columns, rows 38 px) with a search input (294) and "See more".

**Post: announcement (a product announcement)**
- Category label above the **centred h1** (52/57 w700), date below.
- Custom illustration 752×367 (2.05:1).
- Body **640** (x400) **serif 17/26.35 (1.55)**, 62–69 ch.
- h2 sans 25/30 w600, 32 px top margin.
- **Left sticky TOC** (x84, w172, top 92).
- **Footnotes** with backlinks in a closing section.
- End: two share icons, then "Related content" (3 text-only columns).
- There are no authors in news posts.

**Engineering**
- Index: a stack of titles only (32/38 w600), with a 250×250 illustration for the lead.
- Post: **asymmetric header**. The left column (250) holds "Published Apr 08, 2026"; the right (974) holds h1 52 and a **25/38.75 dek**.
- Body 640 serif; images 640×640, radius 16.
- Authors appear only in "Acknowledgements".
- Ends with a "developer newsletter" card (576).

### 1.8 Supabase: supabase.com/blog (a developer-tools startup)

**Index (1440)**
- Dark green-grey (oklch 0.19), Manrope for headings, Inter for UI. Container 1088 (x176).
- Featured: image **502×262 (1.92:1)** on the left, title 28/34 on the right. Two secondary posts with 142×73 thumbnails.
- Filter row: **pill chips** (All · Product · Company · Postgres · Developers · Engineering · Launch Week), a "Search blog" input (256) and a **list/grid view toggle**.
- List view: rows 1088×56 containing icon, title 14 w600, CATEGORY in caps, date.
- No visible pagination *(est.: infinite or full list)*.

**Post: announcement/technical ("Postgres Changes gets AND filters…")**
- Breadcrumb Blog / Product. h1 34/38 w500.
- "5 Aug 2026 · 4 minute read".
- Author: avatar, name and **team ("Engineering")** under the name.
- Cover **645×337 (1.92:1)** at text width.
- Text 647 (x269), Inter 16/28, 67–83 ch. h2 24/32 with a "#" anchor.
- Right column (x988, w276): **tag chips (9 px caps)** above a **sticky "ON THIS PAGE" TOC** (mono label, top 96).
- Code: Code Hike, #2a2929, 1 px border, radius 6.
- End: **Previous/Next post cards** (647×135), then a product CTA band ("Build in a weekend…" with two buttons).

### 1.9 Resend: resend.com/blog

**Index (1440)**
- Black. **Serif display h1 "Blog" at 76.8 px (Domaine)**, ABC Favorit for titles. Container 1232 (x104).
- ⌘K search button and a Subscribe button in the header.
- Two featured cards, 604 wide (image **602×338, 16:9**, title 36/45).
- "Latest Posts": 3 × 395 (image 393×206, **1.91:1**, title 20/25, "Author · date"), 64 row gaps.
- **All 172 posts on one page (23,390 px tall)**, with no categories.

**Post ("How APRF helps…")**
- Everything centred: date, h1 76.8 serif, dek 18 (w768), author (avatar plus name).
- **No cover.**
- Text 672 (x384), Inter 16/28 at 71 % alpha.
- Code container with a 1 px #212629 border, radius 12, commitMono 14/20.
- End: "Subscribe" and "Copy link" buttons, centred.

### 1.10 Cursor: cursor.com/blog (the added reference, widely cited in 2026)

**Index (1440)**
- Warm black #14120b, CursorGothic. 24-column grid, 1300 wide (x70).
- Featured: a large card (863×620) plus two stacked cards (427, image 427×224, **1.90:1**).
- Newsletter strip: label plus a 645 email input.
- Tabs (All · Product · Research · Company · Ideas · Customers) plus search (192).
- **Dense list rows (52 px) on a 5-column subgrid: date · category | title | authors | read time.**
- Then Customer stories, Press, Videos and Changelog sections, each with "View all →".

**Post: long technical ("Git at any scale", 27 min)**
- Left column (318): **sticky breadcrumb "Blog / Research"**.
- Title column 645 (x398): date, h1 36/43 w400 left-aligned, then initials avatar, author and "27 min read".
- Cover **video 645×339 (1.90:1)** at text width.
- **Inline "Table of Contents" card** at the top of the body (645×200, not sticky).
- Body 16/24, 78–85 ch. h2 22/28.6 w700.
- **Interactive diagrams break out to 968.**
- End: "Related posts" (the label is sticky in the left column) as 3 list items, then "View more posts →".

---

## 2. What they all do (with numbers)

| Measure | Range across the 11 sites | Median / typical |
|---|---|---|
| Index container at 1440 | 1080 (Stripe) to 1392 (Vercel, Figma) | **~1270** (Anthropic 1272, Linear 1280, Cursor 1300) |
| Side margin at 1440 | 24 to 180 | 48 to 104 |
| Post text column | 624 (Linear) to 810 (Stripe); 640 to 715 without Stripe | **~672** (Resend 672, Vercel 684, Figma 684, GitHub 699) |
| Body size / line-height | 16/24 to 18/30 | **17 to 18 px, lh 1.55 to 1.65** (only stripe.dev at 1.3 and Figma at 1.4 go tighter) |
| Measured ch/line | 62 to 87 | **70 to 80**, most sit above the classic 66 ch |
| Post h1 (desktop) | 34 (Supabase) to 101 (stripe.dev) | **48** (Vercel, Linear, GitHub; Anthropic 52) |
| Post h2 | 22 to 64 | **~32** (Vercel, GitHub; Cloudflare 36; Stripe 34) |
| h1 : body ratio | 2.1 to 5.6 | **~2.7** |
| Phone gutter | 16 to 24 | **20 to 24** |
| Phone h1 | 28 to 42 | **~36** |
| Phone body | 15/24 to 16/28 | **16/24 to 16/26** |
| Card grid columns (desktop) | 2 to 3 | **3** (Vercel, Linear, GitHub, Figma, Resend, Cursor's secondary rows) |
| Card column gap | 24 to 64 | 24 to 48 (Linear 64) |
| Card row gap | 24 to 96 | 48 to 64 |
| Thumbnail ratio | 1:1 (Stripe) to 16:9 | **1.88 to 1.92:1**, the OG 1200×630 ratio (GitHub, Figma, Supabase, Resend, Cursor). 16:9 at Linear, Cloudflare, Anthropic |
| Card title size | 20 to 24 (grid), 28 to 64 (featured) | **20** grid, **32 to 36** featured |
| Code blocks | 13 to 14 px mono, lh 20 to 24, radius 6 to 12, 1 px border or a background one step off the page | 14/22, radius 8 |

**Patterns that nearly everyone follows**
- **"One large plus N small" featured area** on the index (8 of 10 indexes; Linear and stripe.dev are the exceptions).
- **Category filter as a row of text tabs or pills** above the feed (Stripe, Vercel, Linear, Supabase, Cursor). The alternatives are a dropdown (Cloudflare, Figma "Topics") or top-level nav (GitHub).
- **Search on the index** (Vercel, Linear, Supabase, Anthropic, Resend, Cursor). Half use a ⌘K-style button rather than an input.
- **A left-aligned post title in a single column** (7 of 11). Centred titles appear at Linear, Resend and Anthropic news, the more "brand/editorial" ones.
- **A byline under the title** with avatars (16 to 32 px, overlapped when there are several authors), date, and usually reading time (Vercel, Cloudflare, GitHub, Supabase, Cursor, stripe.dev).
- **A heading anchor** ("Copy link to heading"/"#") on every h2 (Vercel, Cloudflare, Supabase, Cursor).
- **One conversion block at the end**: newsletter (Stripe, Cloudflare, Figma, Anthropic engineering, Resend) and/or a product CTA band (Vercel, Supabase, Figma, GitHub). Related posts appear at 6 of 11 (Cloudflare, GitHub, Figma, Anthropic, Cursor; Supabase uses prev/next).
- **Dark mode as the default** for dev-tool brands (Vercel, Linear, Cloudflare, Figma, Supabase, Resend, Cursor, stripe.dev). Light at Stripe, GitHub (with dark bands) and Anthropic (cream).
- **Colour is almost absent.** Accent colour is used for category labels and links only (Stripe #635bff, GitHub blue). Hierarchy comes from greys and alpha: secondary text at 50 to 70 % alpha.

---

## 3. Where they differ, and why

| Axis | Option A | Option B | Driver |
|---|---|---|---|
| Index format | **Card grid with images** (Linear, GitHub, Figma, Resend) | **Text-first list or table** (stripe.dev, Anthropic, Cloudflare, Cursor's archive, Supabase list view) | Volume. High-frequency publishers (Cloudflare, stripe.dev with 119 posts, Anthropic) go dense; low-volume, high-craft brands (Linear, Figma) spend space on artwork. Hybrids (Linear, Cursor) show cards first, then switch to rows. |
| Thumbnails | Every post has art (GitHub, Linear, Resend, Supabase) | None (Vercel, Cloudflare grid, Anthropic list) | Illustration budget. Vercel and Cloudflare avoid posts looking unfinished by dropping images from the grid entirely. |
| TOC | Sticky right rail (Cloudflare, GitHub, Supabase) or left rail (Anthropic) | None (Stripe, Vercel, Linear, Figma, Resend), or inline card (Cursor) | Content length. Deep technical blogs have TOCs; announcement-led blogs don't. Cloudflare shows the TOC even on short announcements (a template choice). |
| Author weight | Roles or teams visible, bios, author pages (Stripe roles, GitHub bios and pages, Cloudflare and Linear author pages, Supabase team label) | Names only, linked to X/LinkedIn (Vercel, Stripe), or no authors (Anthropic news) | Whether the blog is "people on the team" (engineering) or "the company speaks" (newsroom). |
| Post width model | Symmetric centred column (Vercel, Linear, Resend, Figma) | Column plus rail(s) (Stripe left rail, Cloudflare and GitHub/Supabase right rail, Anthropic left TOC, Cursor left breadcrumb) | Rails appear when there is persistent metadata or navigation to show (TOC, tags, authors). |
| Media width | Text width only (Stripe, GitHub, Anthropic, Supabase, Cloudflare) | Breakouts: Vercel +50/side, Figma +118, Linear +176, Cursor interactive +160 | Brands that ship visual product (Linear, Figma) want big screenshots. |
| Title scale | Restrained 34 to 48 (Supabase, Cursor, Cloudflare, Vercel, GitHub, Linear) | Display 76 to 101 (Resend, Figma, stripe.dev) | Editorial brand statement versus utility. |
| Pagination | Numbered, crawlable (Stripe, GitHub) | Load more (Vercel, Linear, Cloudflare, Figma's `?page=2` link) or everything on one page (Resend, stripe.dev) | SEO and archive depth versus simplicity. |

---

## 4. Best ideas worth adopting

1. **The 1.91:1 image ratio (1200×630) as the single post image.** One asset is the social card, the index thumbnail and the post cover (GitHub, Supabase, Resend, Cursor, Figma all land at 1.82 to 1.92).
2. **Cards, then a dense archive** (Linear, Cursor). Show about 6 to 9 cards, then 52 to 56 px rows (title … author · date · read time). This gives density without a wall of images.
3. **Team or role under the author's name** (Supabase "Engineering"; Stripe "Head of Product, Payouts…"). This fits the "categories are teams" model directly and builds credibility.
4. **Author pages**: avatar, name, team, bio, then posts (Linear is minimal, GitHub rich, Cloudflare in between). Add a **hover card** on the byline (Linear).
5. **Right-rail tags above a sticky TOC** (GitHub, Supabase). The rail stays useful even when the TOC is short.
6. **A TOC with a clear active state**: Cloudflare's progress rail; GitHub's highlighted pill.
7. **Machine-readable post**: "Copy for LLM / View as Markdown" (stripe.dev), a "Copy" menu (Vercel), "Copy URL" (Cloudflare). This is cheap if posts are Markdown already, and it is the 2026 replacement for rows of social share buttons.
8. **Share tools reduced to "Copy link" plus at most two networks**, placed in the byline row or at the end (Linear, Resend, Cloudflare). Nobody measured shows floating share bars any more.
9. **Mono for metadata** (dates, labels, reading time) at 12 to 14 px (Cloudflare, GitHub, Figma, Supabase, stripe.dev). It separates meta from prose without adding colour.
10. **Heading anchors on hover** (#) on every h2 or h3.
11. **Footnotes with backlinks** (Anthropic) and **sidenotes in the right rail** (Figma) for long-form writing.
12. **Media breakout tiers** (Linear, Vercel): text, wide (+~150 per side) and full, chosen per block.
13. **Prev/Next plus related posts from the same category** (Supabase, GitHub, Cloudflare).
14. **Crawlable "Load more"**: an `<a href="?page=2">` enhanced with JavaScript (Figma).
15. **Responsive filters**: tabs become a dropdown or a horizontally scrolling row on phones, and search collapses to an icon (Vercel, Linear).

## 5. Weaknesses to avoid

- **Measure too long:** Stripe 810 px at 18 px gives 69 to 87 ch, and Cursor and Cloudflare reach 85 ch. Keep 60 to 75 ch.
- **Low-contrast body:** Stripe w300 in #425466, and Cloudflare and Resend at 70 % alpha on near-black. Fine on retina, weak elsewhere.
- **Line-height too tight for prose:** stripe.dev at 1.3; Figma at 1.4 with w330.
- **Phone hierarchy collapse:** Cloudflare h1 36 = h2 36; GitHub phone h1 only 28 against 32 h2s on desktop.
- **TOC removed on phones** (Cloudflare, GitHub) instead of collapsing into a disclosure.
- **Phone index waste:** Stripe entries of 850 to 1,100 px each, and Vercel's 3 × 416 px featured cards (about 1,300 px) before the list.
- **No archive structure:** Resend puts 172 posts on one 23k px page with no categories or pagination.
- **Mixed content types in the feed** (Vercel mixes customer stories into the blog) with no type label.
- **Display-size body headings** (Figma h2 64) push content apart. **Giant h1s** (90 to 101) fail on long titles.
- **No author archive** (Stripe, Vercel link out to LinkedIn or X), so readers can't follow a writer.
- **Only a published date on guides.** None of them surfaces an "Updated" date. Guides need one.

---

## 6. Recommended layout spec: "company" preset

Assumptions: several authors, each with a team; categories = teams (plus cross-cutting tags); two content types, **guide** (long, instructional, updated over time) and **announcement** (short, time-bound). Light and dark both supported. Numbers are CSS px.

### 6.1 Shared tokens

| Token | Desktop ≥1280 | Tablet 768–1279 | Phone <768 |
|---|---|---|---|
| Container max | 1280 (content 1216 + 32 padding each side) | 100 % − 2×32 | 100 % − 2×20 |
| Grid | 12 columns, 32 gap (column ≈ 72) | 8 columns, 24 gap | 4 columns, 16 gap |
| Body text | 18/1.65 (≈ 30 px), weight 400 | 18/1.65 | 16/1.6 (≈ 26) |
| Post h1 | 48/1.1, weight 600, −0.02em | 40/1.12 | 32/1.15 |
| Post h2 | 28/1.25, margin 56 top / 16 bottom | 26/1.25 | 22/1.3, margin 40 top |
| Post h3 | 21/1.35, margin 36 top / 12 bottom | 20 | 18 |
| Dek (standfirst) | 20/1.5, muted | 19/1.5 | 17/1.5 |
| Meta (date, read time, labels) | 13 to 14/1.4, mono or tabular numerals, muted | same | 13 |
| Category label | 12/1, uppercase, +0.06em, team colour dot optional | same | same |
| Card title | grid 20/1.3 w600; lead 36/1.15 | 20 | 19 |
| Code | 14/1.6 mono, padding 16/20, radius 8, 1 px border, bg one step off the page | same | 13/1.6, horizontal scroll |
| Radius | media 12, cards 12, chips 999 | same | media 8 |
| Colour | Greys plus one accent for links and active states. Each team has an optional hue used only on its category label dot. | | |

Measure target: 18 px in a **680** column gives about 68 to 74 ch (measured analogues: Resend 672, Vercel 684, Figma 684). Do not go wider than 700.

### 6.2 Index (/blog)

**Desktop (1440)**
1. **Header** (y ≈ 120 below the site nav)
   - Left: h1 "Blog" 48 plus a one-line dek 18 muted (max 640).
   - Right: search button (⌘K style, 240×40), RSS icon, "Subscribe" button.
2. **Team tabs**: text tabs or pills, height 36, gap 8. The order is "All" then the teams, with an optional "Guides · Announcements" type switch at the right end.
   - The active tab uses full-strength text plus a 2 px underline or a filled pill. Inactive tabs are muted.
   - Each tab is a real link to `/blog/category/<team>/`.
3. **Featured ("1 plus 2")**
   - Lead: 8 columns (**800 px**), image **1.91:1 (800×419)**, radius 12, then category · date, title 36/1.15, 2-line excerpt 18, author avatars 24.
   - Secondaries: 4 columns (**384**) stacked. Each has image 1.91:1 (384×201), title 20, meta.
   - Leads can be pinned; otherwise use the newest.
4. **Latest grid**: 3 × 384, column gap 32, row gap 56. Card anatomy, top to bottom:
   - image 1.91:1, radius 12
   - meta line (CATEGORY · date · N min)
   - title 20/1.3, clamped to 3 lines
   - excerpt 16/1.5 muted, clamped to 2 lines
   - authors (20 px overlapping avatars; "A, B and 1 other")
   - Nine cards per page.
5. **Archive rows** (optional, Linear/Cursor pattern) after the grid: rows 56 tall, 1 px dividers, columns `date (120) | title (flex) | team (160) | authors (200) | read time (64)`.
6. **Newsletter band**: once, after the grid. Title 28, one email field (≤ 480), with a privacy line.
7. **Pagination**: numbered links (`/blog/page/2/`) plus Prev/Next, or a "Load more" that is an `<a href="/blog/page/2/">` enhanced with JavaScript.

**Tablet (1024)**
- Content 960, 2-column grid (2 × 468, gap 24).
- Lead goes full width with the image (1.91:1) above and the text below. The two secondaries sit side by side.
- Tabs stay on one row and scroll horizontally if needed.

**Phone (390)**
- 20 px gutters.
- Tabs become a horizontally scrolling row with an edge fade, or a "Team ▾" select. Search becomes an icon.
- The lead card is full width (image 350×183).
- After the lead, **switch to compact rows**: a 96×50 thumbnail (1.91:1) on the left, title 17/1.35 plus meta 13 on the right, about 88 px per row. Never exceed about 400 px per post.

### 6.3 Category / team page (/blog/category/<team>/)
- Same frame as the index, with the team tab active.
- **Header:**
  - h1 = team name, 40 to 48
  - description 18/1.5 (max 640)
  - optional "Writers" row: 28 px avatars of the authors in this team, linked to their author pages
  - post count
  - RSS for the category
- Optional **tag chips** (sub-topics) under the header: 32 tall, outlined, mono 12 uppercase.
- The featured slot shows the pinned post, or the newest post in the team. Then the grid, archive rows and numbered pagination (`/blog/category/<team>/page/2/`).
- Phone: same as the index phone layout.

### 6.4 Post (/blog/<slug>/)

**Desktop (≥1280): three zones on the 1216 content width.** The columns are `[left rail 220] 48 [text 680] 48 [right rail 220]`.

1. **Header** (spans the text column plus the right rail, max 948, left-aligned to the text column):
   - breadcrumb 14 muted ("Blog / Team")
   - category label
   - h1 48/1.1, max about 3 lines
   - dek 20/1.5 muted (max 680)
   - **Byline row**: overlapping avatars 32; names linked to author pages (hover card optional); "Role, Team" 14 muted for a single author; then `date · N min read` in mono 13. For guides, add "Updated <date>" when it differs.
   - At the right end of the same row: **Copy link**, "Copy as Markdown", plus at most 2 network icons (28 px, muted). No floating share bar.
2. **Cover** (optional): **1.91:1**, width **wide = 948** (text plus right rail), radius 12, a custom illustration or product shot.
   - Announcements: always.
   - Guides: optional (a diagram is better than decoration).
3. **Left rail** (sticky top 96): back-to-team link, tags. Leave it empty if there's nothing useful; the text column stays in place.
4. **Right rail** (sticky top 96):
   - "On this page" TOC showing h2s (h3s indented only for guides), 14/1.45 muted
   - active item in full-strength colour with a 2 px left bar
   - under the TOC, a small "Subscribe" link
   - Show the TOC for guides and for any post with ≥ 3 h2s. Otherwise the rail stays empty (announcements).
5. **Body**:
   - Paragraph spacing 1.1em.
   - Lists get 0.4em between items.
   - Links: accent colour plus a 1 px underline at 0.3em offset.
   - h2 anchors show a "#" on hover.
   - **Media widths**: `text` 680, `wide` 948 (+134 on the right, or +134 per side when centred), `full` 1216. Captions 14 muted.
   - **Code**: text width by default, wide on request. Header strip with filename or language plus a copy button, 14/1.6 mono, radius 8.
   - **Callouts** (note / tip / warning / important): text width, 1 px border plus a 3 px left accent in the callout colour, 16px icon, 16/1.55 text, padding 16/20.
   - **Footnotes**: superscript links, with a numbered list at the end that carries backlinks.
6. **End of post**, in this order:
   - tag chips
   - **author cards** (64 avatar, name, role and team, 2-line bio, "More from <name> →")
   - one newsletter card (text width)
   - **Prev/Next** within the category
   - **Related** (3 cards from the same team, 1.91:1 images)
   - optional single product CTA band, full width

**Tablet (1024–1279)**
- The left rail is dropped. The breadcrumb and tags move into the header.
- Columns are `[text 640] 40 [TOC 220]`, with 32 px margins. Wide media equals text plus rail (900).

**Below 1024**
- The TOC becomes a collapsible **"Contents"** disclosure card at the top of the body (Cursor pattern), plus an optional sticky mini-bar with the current section.

**Phone (390)**
- 20 px gutters. h1 32/1.15, dek 17. The byline wraps: avatars and names on the first line, meta on the second, and the share row (icons only) on a third line.
- Cover spans the gutter width (350×183).
- Body 16/1.6 (≈ 40 to 45 ch).
- `wide`/`full` media snap to 100 % of the gutter width. Code scrolls horizontally.
- The TOC is a disclosure.
- End blocks stack; related posts become compact rows.

**Guide vs announcement at a glance**

| | Guide | Announcement |
|---|---|---|
| TOC | yes (right rail; disclosure on small screens) | only if ≥ 3 h2 |
| Reading time | yes | yes |
| Updated date | yes | no |
| Cover | optional diagram | yes (1.91:1) |
| Author card at end | yes | yes (short) |
| End CTA | related guides plus newsletter | product CTA plus related |

### 6.5 Author page (/blog/author/<slug>/)
- **Header** (content width, left-aligned):
  - avatar **96** (72 on phone), round
  - name h1 40 (32 on phone)
  - "Role · <Team link>" 16 muted
  - bio 18/1.55 (max 640)
  - social or links row (icons 20)
  - "N posts"
- **Posts:** the same 3 × 384 card grid as the index (2 columns on tablet, compact rows on phone), including co-authored posts, newest first. Numbered pagination.
- Optional "Also on the <Team> team": 4 to 6 avatars linking to colleagues.

### 6.6 Accessibility and behaviour
- Text contrast ≥ 4.5:1. Don't use sub-400 weights for body text, and don't use alpha-dimmed body text below about 80 %.
- Every tab, category, author and pagination control is a real link. Filters change the URL.
- Sticky rails use `position: sticky; top: <header height + 24>` and never cover content. The TOC's active state comes from IntersectionObserver.
- Images use `aspect-ratio: 1.91 / 1; object-fit: cover`, which avoids layout shift.
