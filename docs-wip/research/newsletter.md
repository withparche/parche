# Newsletter-first publications: layout research (September 2026)

How measured: live pages in a browser at a 1440×900 viewport (plus 1024×768 and 375×812 where noted). Values come from `getBoundingClientRect` and computed styles and are in CSS px. Boxes are written `x,y,w,h` (y = distance from the top of the document). **(est.)** marks a derived or estimated value. Characters per line (cpl) are estimated as width ÷ (font-size × ~0.47–0.52 em average glyph width), so every cpl figure is (est.). Ghost theme values also come from the theme source on GitHub (TryGhost/Source, TryGhost/Casper). Nothing was signed into, subscribed to or submitted.

Sites: Lenny's Newsletter (Substack) · Stratechery (custom WordPress) · Platformer (Ghost 6, Source-based) · Ghost Source/Casper theme source · Medium (article + author page) · beehiiv default site (Newsletter Operator) · The Rundown AI (beehiiv behind a custom Next.js site) · Buttondown (Hillel Wayne's *Computer Things*) · Dense Discovery (indie, numbered, award-winning) · Roden by Craig Mod (indie, numbered) · Every (multi-writer, widely praised 2025–26).

---

## 1. Per-site measurements

### 1.1 Lenny's Newsletter: Substack (lennysnewsletter.com)

**First visit.** A full-screen welcome interstitial appears before any content. It has a 680×315 illustration, the name (H1 24px/700, centred), a promise (16/23, grey, 384 wide, 3 lines), the social proof "Over 1,200,000 subscribers" (14px/600) and an inline form 384 wide (input 275 + button 109, 40 tall). Below the form is "No thanks". `/subscribe` is the same screen.

**Home at 1440.** Container 1232 wide, 104px margins.
- Header: logo centred, Subscribe button and Sign in on the right. Tab nav below it (Home, Podcast, Start here, Top posts, About…).
- Featured latest issue: split hero. Image 616×323 (1.91:1, the OG ratio) on the left. On the right, a centred title (30/38 bold sans), a dek (17/24) and an uppercase meta line (11px, +0.2px tracking).
- "Most popular" strip: 4 compact items, each a 64×64 square thumbnail on the right plus a 15/20 bold title.
- Main feed: 916 wide with Latest/Top/Discussions tabs and a search icon. It is a 3-column card grid of 284-wide cards (32 gutter) with 3:2 thumbnails (284×189) above. Each card has a title (19/26 bold), a dek (14/20), and uppercase meta (date · author, 11px) followed by like/comment/restack counts.
- Right sidebar: 284 wide, holding the logo, a 12/20 description and an inline form 284 wide.
- Footer: another inline subscribe form.
- The feed ends in "See all", which leads to the archive.

**Home at 1024.** Gutters 24. The sidebar is dropped. The hero image is 488 wide. The grid stays 3 columns of 304.

**Home at 375.** Gutters 16. The hero image is full-bleed 375×211. The title stays 30px. Cards form a single column at 343×229.

**Archive (/archive).** A single 624-wide column (408→1032) of list rows. Each row has a title (19/26 bold), a dek (15/20) and meta. The thumbnail is **160×107 (3:2) on the right**. Month dividers ("AUGUST 2026") are 11px uppercase in the accent colour. Loading is infinite scroll. Tabs and search sit at the top. There is no issue numbering.

**Post at 1440.**
- Column 728 (356→1084).
- Title 32/36 bold sans, **left-aligned**; dek 18/24 grey.
- Byline row: avatar, author, uppercase date and a "PAID" flag.
- Engagement bar under the byline: like (449), comments (7), restack (25) and Share on the right.
- Body: Spectral 19/30.4 (1.6), paragraph margin 20, ≈75 cpl (est.). Mobile: 17/27.2.
- H2 30.9, H3 26.1, H4 21.4 (sans).
- Images span the column (728), 3:2 in practice.
- A fixed left-edge **TOC rail** (a strip of dashes at x=8, 28×119) expands on hover.

**Subscribe prompts in a free post.** One inline form after the intro (y≈490). One after the body. One "Ready for more?" at the bottom. Add the header button and the first-visit interstitial and that is **five surfaces** per page. The engagement bar appears twice (top and bottom). The end of the post has a comments preview ("Discussion about this post", 2 threads, "16 more comments") followed by related posts.

**Paid post.** The body cuts off and a centred paywall box (728×216) follows: "This post is for paid subscribers" (22px/300), a Subscribe button, and "Already a paid subscriber? Sign in". There is no fade. Below it: Previous/Next and a contributor bio card.

**About page.** A plain text column with a heading that carries the social proof. It explains what paid subscribers get. A distinctive touch is a link to an email you can send your manager to expense the subscription. It ends with a Subscribe button.

### 1.2 Stratechery (stratechery.com, custom WordPress)

**Layout.** Container 1080 (180→1260): main column 740 plus sidebar 300. The top band is tinted. The logo is on the left, next to link columns (By Ben Thompson / Explore) and a **tinted "Stratechery Plus" box** with Subscribe and Log in buttons. The only subscription call-to-action (CTA) lives in that header box.

**Home.** A blog river of **full posts**. The document is 74,000px tall, and "Older Posts →" pagination sits at the bottom. The weekly roundup uses **year.week numbering in the title** ("2026.39: Begun, the Aggregator Wars Have"), with a kicker ("This Week in Stratechery", 16px grey) above an H2 of 28px/500. The sidebar holds search, a Plus "Updates" list (title plus a full date per item, "View All") and podcasts with 64×64 art.

**Post.**
- Title 36/36 weight 500 sans, left. Date 16px grey, then "Listen to this post" (an audio player 740 wide).
- Body freight-sans-pro 18/27 (1.5), **≈90 cpl (est.)**, which is too long.
- Images 600–665 wide, narrower than the column and centred.
- End of post: share row (Facebook/X/LinkedIn/Email), Jetpack "Related" (3 text items), then **issue-to-issue prev/next** ("← 2026.38: Doomforce · 2026.39… →").
- No inline subscribe box and no popups.

**Mobile.** 24px gutters. The sidebar moves to the bottom. Title 32px, body unchanged at 18/27.

### 1.3 Platformer (platformer.news, Ghost 6.65, Source-based, with the Outpost CTA plugin)

**Home at 1440.**
- **Hero subscribe band**: full-bleed 1440×574 gradient. H1 46/50.6 bold centred with −1.3px tracking and 1020 wide. Dek 19/28.5 at 78% white. Form 560×56 with the button inside the pill ("Join free", 132×44), plus an outlined secondary "Become a paid subscriber".
- "LATEST" label: 12px/550 uppercase.
- List rows 980 wide (230→1210). **Thumbnail 220×136 (≈1.62:1) on the left** and text 600 wide: title 20/26 weight 725, dek 14.5/20.3, meta 12.5 grey. Recurring "Following:" items drop the thumbnail and run the text full width at 22.8px.
- "START HERE": 3 cards 298 wide, image 16:9 above.
- The end repeats the subscribe band (form 560×56). There is also a floating "Subscribe" pill fixed at the bottom right (Ghost Portal).

**Home at 1024.** Gutters 31. H1 41px. The list keeps its left thumbnail (220) with 600 of text.

**Home at 375.** Gutters 20. H1 30px. The form stays inline (335×56, button inside). The first item stacks its image on top (335×207).

**Post at 1440.**
- Column 720 (360→1080). Tag kicker (small, accent) above the title.
- Title 46/50.6 bold, **left**. Dek 19/27.6. Byline: avatar, author (16/650), then date + read time (13.5 grey). Share button on the right.
- **Feature image 1120 wide (the "wide" track, 1.67:1)**, breaking out 200px on each side of the text column.
- Body Inter 17/27.2 (1.6), −0.01em tracking, ≈82 cpl (est.).
- The issue is built from recurring named sections (H2 27px: "Following"; H3 22px: "Those good posts", "Talk to us").

**Subscribe prompts in a post.**
- An inline minimal CTA (a 500-wide form) after a few paragraphs.
- A **slide-up panel** from the bottom (640×231, with close button, heading, subheading, form 442 wide, sign-in link and a 120×120 image).
- Comments.
- "Read more": 4 cards across 1320.
- A footer band with a cadence statement ("At least one free edition… every week"), a 40px title and a form 560×56.
- The floating Portal pill.

**About page.** Sections in order: what we cover (3 topics) → how we report → about the author (credentials as social proof) → Join (cadence stated as free weekly plus paid extra) → masthead.

### 1.4 Ghost theme source (Source and Casper), for reference

- **Source**: `--container-width: 1320px`; container gap `clamp(24px, …, 48px)`; grid gap 42px; content column `min(720px, 100% − 2·gap)` inside a named-line canvas (`full / wide / main`). Title `clamp(3.4rem, …, 4.6rem)` (34–46px). Body 1.7rem (17px)/1.6 with −0.01em tracking. Card images 16:9, featured items 1:1. Post grid `repeat(auto-fit, minmax(248px, 1fr))`. Breakpoints 1199 / 767 / 576.
- **Casper**: `.inner` 1200; same main 720 canvas. Title `clamp(3.2rem, 5vw, 5.2rem)`. Body 2rem (20px)/1.6 serif. Card image ratio 55% padding (≈1.82:1). Feed 6-column base grid → 2 → 1 columns. Breakpoints 991 / 767 / 650.

### 1.5 Medium

**Article at 1440.**
- Column 680 (380→1060).
- Title 42/52 sohne bold, left. Byline: avatar, author, Follow, "9 min read", date.
- Action bar: clap (61K), comments (134), restack on the left; save/listen/share on the right. It repeats at the end.
- Body **source-serif 20/32 (1.6)**, −0.06px tracking, paragraph spacing ≈34 (est.), ≈72 cpl (est.). H2 24/30 sans.
- Images span the column (680) at mixed ratios.
- **One mid-article subscribe box** at ≈45% depth: 680×201, centred 18px serif heading, email form.
- End: a "Written by" author card (500 wide, Follow), more from the author, recommended stories.
- Tag chips above the title. Highlights appear as green marks in the margin.

**Author page (the logged-out stand-in for an archive).**
- Main 680 (196→876) plus right sidebar ≈300 behind a hairline rule: large avatar, follower count, bio, Following list.
- Rows: tiny avatar + author + date (13px) → title 24/30 bold → excerpt 16/20 grey (2 lines) → actions. **Thumbnail 160×107 (3:2) on the right.** Loading is infinite scroll.
- The logged-in home feed uses the same row pattern (not measured; login needed).

### 1.6 beehiiv default site: Newsletter Operator (newsletteroperator.com)

**Home.**
- Container 1280, 80 margins.
- Centred hero: 70×70 logo (8px radius), H1 42/50 bold, promise 23/32 (579 wide), form 442×48 (input 338 + "Join Free" 104).
- "Featured" (24px bold): 3 cards 417 wide, **16:9 images, 8px radius**. Meta is "• 8 min read" (12px), then title 24/28.8 bold, then dek 16px.
- "Latest Posts": the same 3-up grid (411 wide), then a **"Load more"** button.
- Footer: a two-column subscribe band.

**Post.**
- Column 780 (330→1110). Breadcrumb (Home > Posts > title).
- Title 40px Inter bold, left. Subtitle 18px. Date 12px. A row of 7 round share icons on the right.
- The email body follows. It **repeats its own title as a second H1** (28/49 Noto Sans), preceded by a "DEEP DIVE" kicker.
- Body Arial 17/25.5 (1.5), ≈92 cpl (est.). Images 780 wide.
- A **fixed bottom action bar** (65 tall: back, like, share).
- End: a two-column band (brand + "Trusted by 50,000+…" on the left, form 384+108×48 on the right).

**Subscribe page (/subscribe).** A heading with the outcome promise, the dek, a lead magnet ("free guide"), the social proof ("Trusted by 50,000+…") and 3 CEO testimonials. The form is a single "Join Free" field.

### 1.7 The Rundown AI (therundown.ai, beehiiv backend, custom front end)

**Home.**
- **Dark hero**: H1 72/78 centred (with a gradient word), promise 15px, form 500×44 (364 + 136).
- Social proof "Join over 2,000,000+ readers from companies like:" plus a logo row.
- "Latest Newsletters" (H2 48px centred): 1 big card (560 wide, 16:9) plus a 2×2 grid of 268-wide cards (1.6:1). Then "Latest News" and "Guides" rows of 4 × 264 (16:9).
- Container 1152.

**Issue.**
- Breadcrumb. Title 48/60 bold in a 635-wide column. "PLUS:" dek 18/28. Author + date. Share icons (FB/X/LinkedIn).
- The **email HTML embedded as-is**: 601 wide, Helvetica 16/24, emoji H4 section headers 22px, and the email chrome still visible ("Read Online | Sign Up | Advertise").
- End: "Recent Newsletters" 4-up, then a centred "Stay Ahead on AI." CTA band with a 500-wide form.

### 1.8 Buttondown: Computer Things (buttondown.com/hillelwayne)

**Landing page (the subscribe page).**
- Column 600. Name as H1, centred, ~36px.
- A personal intro that names the cadence ("weekly content"), 4 topic bullets and a link to the archive.
- A **stacked form in a tinted card** (558 wide: label "Email *", then a full-width input, then a full-width button). "Powered by Buttondown" at the end.

**Archive.**
- Column 600 (420→1020). Each row: date (12px grey), then title (16px bold), then a one-line description (16px). **No images.**
- "Older archives" pagination (`?page=2`). No numbering.
- Header: name on the left; Archives / Search / Log in / a blue Subscribe pill on the right.

**Issue.**
- Column 600. Date (12px), title H1 32px Source Serif 4 **centred**, subtitle H2 20px/600 grey centred.
- Body **Source Serif 4 20/32 (1.6)**, ≈64 cpl (est.).
- **One subscribe box at the end** (a 558-wide tinted card), then comments ("Posting this comment will subscribe you…").
- No popups, no share bar, no likes.

### 1.9 Dense Discovery (densediscovery.com, indie, numbered weekly, 407 issues)

**Home is the subscribe page (at 1440).**
- Split hero. Left: 500-wide column with a logo mark, H1 50/55 bold ("One email worth opening, every week"), promise 22/33 and form 502×54 (362 + 140 dark button). Two micro-lines under the form: **a live "Next issue is dispatched within 24 hours!"** and "Enjoyed by 36,000+ global readers".
- Right: **5 fanned issue previews** (480×788 each, offset 30px) with an "Explore the Archive" button over them.
- Then: 3 short testimonial cards with stars.
- "What to expect": 8 recurring sections in a 2-column grid (Tools, Books, Media, Inspiration, Guests, Numbers, Polls, Socials), each an H3 24px plus a one-line description.
- A counter line: "407 issues since 2018".
- Curator bio. A 4-up values row (one tree planted per issue, ethical hosting, indie focus, community). Awards.
- Final centred CTA "Join us – free, once a week." (H2 35px, form 602×54).

**Archive = issue reader (/issues/407).**
- An **app-like two-pane layout**. Left pane 482: blurb, a full-width "Subscribe Now" (400×54), then a scrolling list ("Issue 407 / title", with sort ↑↓).
- Right pane: 958 wide, the issue rendered in an iframe from the email HTML. Text column 680, **Inter 21/31**, ≈62 cpl (est.). Section H2s 23px, item H3s 17px.
- A per-issue colour theme (hero tinted to match the cover art, with an artwork credit). An "Issue 407" pill with copy-link.
- **Mobile**: the list collapses behind "Browse issues". A sticky top bar holds Subscribe and Browse issues. An issue pill with ← → prev/next and copy-link.

### 1.10 Roden by Craig Mod (craigmod.com/roden, indie, numbered monthly)

**Archive (also the subscribe page).**
- Dark background. Centred masthead: "Roden" 30px serif (weight 400), "A MONTHLY NEWSLETTER / WRITTEN BY CRAIG MOD" in tiny caps.
- A 1px rule, then a borderless email input (260×36, placeholder "email address") with a text-link "SUBSCRIBE".
- A centred list: **issue number as the link (17px/800, accent blue)**, month (15px), then the issue title. One entry is 3 lines, about 67px tall. All 118 issues are on one page.

**Issue.**
- Column 616 (412→1028). Masthead: round logo mark + "Roden / Issue 118 / September 10, 2026". A hairline rule.
- Title 44/44 serif **weight 400**, left. Dek 17px. A short 40px rule.
- Image 616 wide (3:2). Body system sans 17/25.5 (1.5) with **`hyphens: auto`**, ≈72 cpl (est.).
- End: a centred "made possible by" block (membership) and a short definition of what Roden is. No inline popups.

### 1.11 Every (every.to, multi-writer, praised redesign)

**Home.** A magazine grid with a wordmark masthead. A promo band (headline 44px serif with a mixed-italic word). A 3-column grid: 296-wide cards (16:9) / a 590-wide lead image (4:3) / a "Recent essays" rail. Card titles are Signifier serif 24px/400.

**Post.**
- Column 736 (352→1088). Title 48px serif **weight 400**, left, with a swash capital. Dek 24px serif. Author avatar + name.
- Date · read time · "Updated …". An action row: Listen, copy link, X, LinkedIn, Facebook, like (13), comments.
- Hero 736 wide (16:9). Body **Signifier 20/30 (1.5)**, ≈78 cpl (est.). H2 30px.
- A **registration wall**: a bottom sheet covering about 55% of the viewport ("Sign in to read for free", Google button, illustration on the right). It appears after about 1 screen, even on free posts.
- A cookie banner as well.

---

## 2. What they all do (with numbers)

1. **One reading column of 600–780px, median ≈720.** Measured widths: 600 (Buttondown), 616 (Roden), 680 (Medium, Dense Discovery), 720 (Platformer/Ghost), 728 (Substack), 736 (Every), 740 (Stratechery), 780 (beehiiv). The median ≈720 is Ghost's constant `min(720px, 100% − 2·gap)`.
2. **Body 17–21px, line-height 1.5–1.6.** Measured: 17/27.2, 18/27, 19/30.4, 20/32, 20/30, 21/31, 17/25.5. Mobile drops 1–2px (Substack 19→17) or not at all (Stratechery 18).
3. **Left-aligned article titles, 32–48px.** 32 (Substack), 36 (Stratechery), 40 (beehiiv), 42 (Medium), 44 (Roden), 46 (Ghost), 48 (Every, Rundown). Only Buttondown centres. Titles use line-height 1.0–1.2 with tight negative tracking on sans faces.
4. **A dek (subtitle) under the title**, 17–24px, grey or lighter weight. It is part of the model on every platform.
5. **Byline row**: 32–40px avatar, then name, then date (11–16px, often uppercase with tracking on Substack) plus read time. Actions sit to the right of it.
6. **The subscribe form is a single email field plus a button on one line.** Height 40–56 (Substack 40, beehiiv 48, Platformer 56, Dense Discovery 54). Width 384–560 in a hero, the column width in a post. Only Buttondown stacks it.
7. **The home page opens with the promise and the form.** Every newsletter-first site above the fold has a one-line promise (H1 42–72px or name + 16–22px description) → form → social proof ("Over 1,200,000 subscribers", "36,000+ readers", "Trusted by 50,000+"). The exceptions are Stratechery (header box) and Buttondown.
8. **A subscribe prompt at the end of every post**, always. A mid-post prompt appears on Substack, Medium and Platformer.
9. **List archives use a small 3:2 or ~1.6:1 thumbnail**: 160×107 on the right (Substack archive, Medium) or 220×136 on the left (Ghost Source). Card grids use 16:9 (beehiiv, Ghost, Rundown) or 3:2 (Substack).
10. **Month or date grouping and infinite scroll or "Load more"** on the big platforms. Indies use one long page (Roden) or numbered pagination (Buttondown, Stratechery).

## 3. Where they differ and why

| Axis | Option A | Option B | Why |
|---|---|---|---|
| Home | **Landing page** (promise + form + proof; Dense Discovery, Rundown, beehiiv, Platformer hero) | **Feed** (Substack magazine grid, Stratechery full posts, Medium) | Landing pages convert first-time visitors, who make up most traffic from shares. Feeds serve returning readers. Newsletter-first sites put the landing above a short list. |
| Archive entry | **Text only** (Buttondown, Roden, Stratechery related, Dense Discovery sidebar) | **Thumbnail** (Substack, Medium, Ghost, beehiiv) | Single-writer, text-driven letters have no meaningful per-issue art. Platforms default to images because OG images exist. |
| Numbering | **Explicit**: "Issue 407", "118" as the link, "2026.39:" | None (Substack, Ghost, beehiiv, Medium, Buttondown) | Indie letters treat issues as editions. Platforms treat them as posts. Numbering signals cadence and gives a sense of collection ("407 issues since 2018"). |
| Issue body | **Web-native article** (Substack, Ghost, Medium, Buttondown, Roden) | **Email HTML embedded** (Rundown, Dense Discovery iframe, beehiiv's duplicate H1) | Embedding is cheap and faithful, but it leaks email chrome ("Read Online") and fixes the width at 600. |
| Title alignment | Left (almost all) | Centred (Buttondown, Substack's welcome) | Left reads as an article. Centred reads as a letter or card. |
| Prompt intensity | Quiet: 1–2 (Buttondown, Roden, Stratechery) | Loud: 4–6 surfaces (Substack interstitial + 3 forms + header; Platformer slide-up + inline + footer + pill; Every's regwall) | Loud is growth-optimised on high-traffic platforms. Quiet is trust-optimised for personal letters. |
| Engagement | Likes/comments/restacks (Substack, Medium, Every) | Comments only (Ghost, Buttondown) or nothing (Roden, Stratechery) | Network platforms need social signals for discovery. Owned sites do not. |
| Type | Serif body (Substack Spectral, Medium, Buttondown, Every) | Sans body (Ghost Inter, Stratechery, Roden, Dense Discovery, beehiiv) | Serif gives an essay or letter voice. Sans gives a news or digest voice. |
| Theme per issue | Dense Discovery tints each issue to its cover art | Everyone else: static | Only possible when each issue has one hero artwork. |

## 4. Best ideas worth adopting, and weaknesses to avoid

### Best ideas
1. **A cadence stated as a fact next to the form**: "free, once a week"; "Next issue is dispatched within 24 hours" (computed from the schedule); Platformer's "at least one free edition every week". Put it directly under the form in 14px.
2. **A counter of issues**: "407 issues since 2018". This is social proof that doesn't depend on the subscriber count, and a new newsletter can use it too.
3. **The issue number as the primary archive link** (Roden) and in the kicker (Stratechery "2026.39:", Dense Discovery "Issue 407" pill).
4. **Prev/next between issues** at the end and in a compact pill on mobile (Dense Discovery ← →, Stratechery "← 2026.38 · 2026.39 →"). Newsletters are sequential; related-by-tag is secondary.
5. **"What to expect" = the recurring sections of an issue**: 8 named blocks with one-line descriptions. That tells readers what each issue contains, not just the topic. It pairs with named recurring H2s inside issues (Platformer "Following", "Those good posts", "Talk to us").
6. **Preview of real issues on the landing page** (fanned issue screenshots with "Explore the Archive").
7. **A wide breakout for the cover only** (Ghost: 720 text, 1120 image).
8. **A left-edge TOC rail** for long issues (Substack): unobtrusive until hovered.
9. **A two-pane archive reader** on desktop (Dense Discovery): list on the left, issue on the right. Good for binge-reading a back catalogue.
10. **An expense-it template** on the about page (Lenny) for paid tiers.
11. **An end-of-post box as a tinted card at column width** (Buttondown, Medium): one clear, calm prompt.
12. **Per-issue accent colour** taken from the cover art (Dense Discovery), as an optional prop.
13. **`hyphens: auto`** with a 600–680 measure (Roden) for tidy ragged edges on mobile.

### Weaknesses to avoid
1. **A full-screen interstitial on first visit** (Substack). It blocks the content you came to read.
2. **A registration wall on free content** (Every's bottom sheet covering ~55% of the viewport).
3. **Slide-up panels plus a floating pill plus inline plus footer** (Platformer: 4 surfaces on one post). Stacked prompts compete and cheapen each other.
4. **Duplicate title** (beehiiv shows the web H1 and then the email's own H1).
5. **Leaked email chrome** ("Read Online | Sign Up | Advertise" on the web, Rundown). A fixed 600 width inside a wider page.
6. **An overlong measure**: Stratechery ≈90 cpl, beehiiv ≈92 cpl (est.). Stay at 60–75.
7. **Dense meta in 11px uppercase** with counts (Substack cards: date · author · 408 · 6 · 34). The numbers are noise on a personal site.
8. **Home as an endless river of full posts** (Stratechery, 74,000px). It is hard to scan.
9. **No numbering or dates grouping in platform archives**: they become undifferentiated feeds.
10. **Cookie banners with optional tracking on by default** (Every).

---

## 5. Recommended layout spec: newsletter preset

Principles: one writer, numbered issues, subscription is the point. **One calm, well-placed prompt beats five.** Web-native issue pages, not embedded email.

### 5.1 Global tokens

- **Container**: 1200 max. Side gutter `clamp(20px, 4vw, 48px)` (≈48 at 1440, ≈40 at 1024, 20 at 375).
- **Reading column (`--measure`)**: 680px (≈65–70 cpl at 19–20px serif / 18px sans). Wide track: 960. Full track: container.
- **Body**: 19px/1.6 serif by default (20px/1.6 if the font runs small; 18px/1.6 for sans). Phone: 18px/1.6. Paragraph spacing 1em. `hyphens: auto` on narrow screens only.
- **Type scale**: issue title `clamp(32px, 2.2vw + 18px, 44px)`/1.1, weight 600–700 sans or 400–500 display serif, −0.01 to −0.02em. Dek 20–22px/1.4 muted. H2 in body 26px, H3 21px. Meta 14px (not uppercase 11px). Kicker 13px, 600, +0.04em uppercase.
- **Vertical rhythm**: 8px base. Section gaps 64 (desktop) / 48 (phone). Title block → cover 32. Cover → body 40.
- **Form**: one row, height 48 (52 in the hero). Input + button share a 1px border and 8px radius (or a pill). Button label is a verb ("Subscribe"). It stacks to full width below 420px.

### 5.2 Home = landing + recent issues

**Desktop 1440:**
1. **Masthead band**, centred, max 640 wide, padding 96 top / 64 bottom:
   - Optional logo mark 56–64px.
   - Name/promise H1 44–56px/1.1.
   - Promise 20px/1.5, muted, max 2 lines (≤ 560).
   - Form 480×52.
   - Under the form, 14px muted, one line: **cadence · issue count · subscribers** ("Every Sunday · 142 issues since 2021 · 12,400 readers"). Omit the parts that don't exist.
   - Optional variant: split 50/50 (text left 520, stack of the 3 latest issue covers fanned on the right) when issues have art.
2. **Latest issue, featured**, 960 wide:
   - Horizontal card, cover 3:2 at 460 on the left.
   - On the right: kicker "Issue 142 · Sep 21, 2026", title 32px, dek 18px, "Read issue →".
   - If there is no cover art, it becomes a text-only card with the issue number set large (64px, tabular numerals) as the visual.
3. **Recent issues list**, 680 wide, 6–10 rows, each row 1px-rule separated, padding 20 vertical:
   - `No. 141` (tabular numerals, muted, fixed 56px left column)
   - Title 20px/600, then dek 16px muted (1 line, truncate)
   - Date 14px on the right, or under the title on phone.
   - Thumbnails **off by default**. Optional prop: a 96×64 (3:2) thumbnail on the right.
   - Then "All issues →".
4. **"What's in each issue"** (optional): 3–6 recurring sections as a 2- or 3-column grid of name + one line.
5. **About the writer**: 64px portrait, 2–3 lines, link to About.
6. **Closing CTA**: a tinted card at 680, H2 28px ("Get the next issue"), cadence line, form. It must not repeat step 1 word for word.

**Tablet 1024:** the masthead stays centred at 600. The featured card becomes cover 3:2 at 420 plus text. The list stays at 680.

**Phone 375:** gutter 20. H1 34–36px. Form stacked (input 48, full-width button 48, 8 gap). The featured card stacks: cover full-bleed within the gutter (335×223), then text. List rows: the number sits above the title as a kicker instead of in a left column. The date goes under the dek.

### 5.3 Archive (/issues)

- 680 column. Title "All issues" + count ("142 issues since 2021") + a compact inline form on the right (desktop) or under the title (phone).
- **Grouped by year** (H2 14px uppercase, sticky while in view). Rows as in 5.2.3.
- **Pagination**: plain pages of 50 or a single page (≤ 300 issues is fine on one page, as on Roden). No infinite scroll.
- Optional variant (desktop ≥ 1200): a **two-pane reader**. Left 360: issue list scrolling independently. Right: the issue at 680.

### 5.4 Issue page

**Desktop 1440, top to bottom:**
1. Slim header (64 tall): name on the left; Archive, About and a "Subscribe" button on the right. No floating pill.
2. **Title block**, left-aligned in the 680 column:
   - Kicker "Issue 142" (links to the archive) + date + read time, 14px.
   - Title 40–44px. Dek 20–22px muted.
   - Byline only when guest-written; the default single author doesn't need an avatar on every issue.
3. **Cover** (optional): wide track 960, 16:9 or 3:2, 8px radius or none, caption 14px. The phone version runs full width within the gutter.
4. **Body** at 680, 19/1.6. Images at the column width by default, `wide` (960) optional per image. Recurring section headings as H2 26px with an optional small-caps label.
5. Optional **TOC** when the issue has ≥ 4 H2s: a sticky left rail outside the column at ≥ 1280 (dashes, expand on hover). Hidden on smaller screens.
6. **End of issue** (in this order):
   - A small sign-off (signature or "— Name").
   - **One subscribe card**: tinted, 680 wide, padding 32. H3 22px "Get issue 143 in your inbox". Cadence line 15px. Form. Hidden for known subscribers if the stack allows.
   - **Prev / next issue**: two halves, each "← No. 141 · title".
   - Share: a single "Copy link" plus a native share on phone. No 7-icon rows.
   - Optional comments or "Reply by email" (a mailto link): a letter voice suits the reply.
7. **No mid-body form by default**. An optional prop inserts one after paragraph N (≥ 40% depth). No slide-ups, no interstitials, no floating pills.

**Paid issue**: cut off after 3–5 paragraphs with a 96px fade to background. A card at column width: "This issue is for paying readers" (22px), a 1-line benefit, a Subscribe button, and "Already a member? Sign in".

**Tablet 1024**: the same, with the wide track clamped to the container. The TOC is hidden.

**Phone 375**: gutter 20. Title 32px/1.15. Body 18/1.6. The cover is full width. A sticky bottom bar is only allowed as a **prev/next pill** (Dense Discovery style), never a CTA bar.

### 5.5 Subscribe page (/subscribe) and About

- **/subscribe**: centred 560 column, top padding 96.
  - Logo mark → H1 36–44px (the promise, not "Subscribe").
  - A 2-sentence description.
  - **3–5 bullets of what you get**, or the recurring sections.
  - Cadence line → form (52 tall, full column width).
  - Proof line (subscriber count or issue count).
  - Optional 1–3 short testimonials (≤ 20 words each, name + role).
  - Optional "Read a recent issue first →" linking to the latest issue.
  - Paid tiers (if any) as two side-by-side cards below, 272 each (stacked on phone), each with a price, 3 bullets and a button.
  - Privacy line: 13px, e.g. "One email a week. Unsubscribe anytime."
- **/about**: 680 column. Portrait + H1. Why this newsletter exists. What each issue contains (the sections). Cadence. Selected issues (3–5 links with numbers). The same subscribe card as at the end of an issue.

### 5.6 What the preset should expose as props (not slots)

`cadence` (text) · `issueCount` (auto) · `subscriberCount` (optional) · `sections[]` (name + one-liner) · `featuredStyle: cover | number` · `listThumbnails: off | right` · `issueNumbering: "Issue {n}" | "No. {n}" | "{year}.{week}"` · `midPostCta: off | afterParagraph(n)` · `toc: auto | off` · `paywallFade: true` · `accentFromCover: false`.
