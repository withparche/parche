# Magazine / editorial layout research (captured 2026-09-27)

## Method and caveats

- **How we measured.** We loaded pages live in a browser at 1440×900, 1024×768 and 375×812. JavaScript read `getBoundingClientRect` and computed styles. Numbers are CSS px at that viewport; "x" is the left offset. "cpl" (characters per line) = paragraph characters ÷ rendered lines, measured on a real body paragraph.
- **Blocked sites.**
  - wired.com and nytimes.com are blocked in the browser pane.
  - For **Wired** we downloaded the HTML with curl and parsed its inline CSS tokens (Condé Nast "Verso" platform, the same one as The New Yorker, which *was* measured live).
  - For **NYT**, the section front was measured live through an August 2026 Wayback Machine capture. NYT article pages return "Not Authorized" even in the archive, so the NYT article values are marked **(est.)** and come from prior knowledge of their public CSS.
- **Extra sites** added as widely praised editorial designs: **The New Yorker**, **Rest of World**, **Eye on Design (AIGA)** alongside **It's Nice That**.
- **Paywalls.**
  - The Atlantic shows 3 body paragraphs.
  - The New Yorker body was not rendered at all.
- **Ads.** What renders for a logged-out, consent-declined visitor in the US. A site showing "no ads observed" may still sell ads in other regions or states.
- **(est.)** marks any value not read directly from a rendered element.

---

## 1. Per-site measurements

### 1.1 The Verge (theverge.com)

**Home, 1440**
- `main` max-width 1300 (x70). The main column is 800 wide (x88) and the right rail 380 wide (x969). The gutter is about 80.
- **Top.** A 728×90 leaderboard sits in a 1100×90 slot above the masthead.
- **Lead.**
  - Image 680×544 (**5:4**).
  - Headline in the display face Manuka **90px/72px, weight 900**. It overlaps the image bottom.
  - Dek in the serif FK Roman **24/28.8**.
- **Rail.**
  - Starts with a large card: 380×253 image (3:2) with a 34px headline.
  - Then a "Latest / Following" text river: PolySans 16px bold heads and 16/20.8 serif excerpts.
- **Secondary.** A 2-up of text-only items (20px heads, 375 each).
- **Topic packages.** Titles like "This week in AI", 24px bold, each with a 380×380 (**1:1**) image left.
- **Bottom.** "Latest from Tech / Reviews / …" rows.

**Home, 1024.** The rail disappears. A single column about 580 wide is centred (x222). The lead image is 580×464 and the lead headline 65px. The secondary 2-up uses 75px square thumbs.

**Home, phone.** 10px gutters on images, 20px on text. The lead headline stays 65px. The list uses 75×75 square thumbs on the **left**.

**Section front (/tech)**
- Hub dek: 22/30.8 serif spanning 1100.
- **Two co-leads** side by side: 530×353 (**3:2**), 34px headlines, 20/24 serif deks.
- Then a 1100×310 billboard slot (970×250 creative).
- Then the "Latest in Tech" stream in the left column (x200, 670 wide) with a "Most Popular" rail at x970:
  - The stream is short text posts: 16px bold head, then 16/20.8 serif running text.
  - "Most Popular" is 5 numbered items with 16/17.6 bold heads.
- Pagination: Previous/Next buttons.

**Article (feature template)**
- Container 1100 (x170–1270).
- **Header** is split:
  - Square lead image 550×550 on the left.
  - Right side: kicker row (mono 12px caps, tracking 1.2px), then H1 PolySans **65/65, weight 500, tracking −1.3px**, left-aligned, 510 wide.
  - Dek 26/28.6 sans. Byline and date in 11–12px mono.
  - Share: **three 30px icon buttons** (copy link, share, gift) plus a "Comments (count)" pill, all under the byline.
- **Body.**
  - Column **600px** (x270), FK Roman **18/28.8 (1.6)**, about **64 cpl**, 20px paragraph gap.
  - Pull-outs / related asides **320 wide hang into the left margin** (x170).
- **Rail.** 300 wide at x970, a **100px gap** from the text. It holds a 300×250 at the top and further 300×250s at about 3100 and about 5500.
- **Ads in the body.**
  - A 300×250 centred in a **600×310 slot** (label plus padding, about 30px above and below). It first appears after about 3 paragraphs, then roughly every 2,400px.
  - A 600×338 Connatix video player.
  - Full-width 60px ad strips between sections.
- **1024.** The rail drops. Body stays 600, H1 44/45.8, lead image 700 square.
- **Phone.** 20px gutters, body 18/28.8, **37 cpl**, H1 44px.

**Author page**
- Name in the display face at **160px**, weight 900, spanning 1100.
- 150×150 portrait, role (13px), bio 22/30.8 serif (930 wide).
- Social links in mono 11px caps, and a Follow button.
- Then "More from …" in the same stream-plus-rail layout as section fronts.

**Typography.** Sans (PolySans) and display (Manuka) for headlines. **Serif (FK Roman) for body and deks**. Mono for all meta.

### 1.2 The Atlantic (theatlantic.com)

**Home, 1440**
- Container **1280, 80px margins**.
- **Top grid** `296 | 624 | 296`, i.e. 3/6/3 of a 12-column grid:
  - **Centre lead:** image 624×416 (**3:2**), headline A Garamond **38/44**, dek 20/28, text below the image.
  - **Left column:** two stacked 296×197 (3:2) cards with 24/32 heads.
  - **Right column:** a text list with 18/26 heads and **80×80 square thumbs on the right**.
- **Below:** rows of **4 × 296, gap 32**, with **1:1** images, 24/32 heads and 18/26 deks.
- A half-and-half row: 2 × 624, each containing 296 + 296.
- **No display ads observed** on home.

**Section front (/ideas).** A single centred 874 column (x283). Each **river row is text 546 on the left and a 296×296 square image on the right**, with a row pitch of 356px. Heads 24/32, deks 18/26. No rail, no ads observed.

**Article**
- **Header**, all left-aligned in a **665 column (x388)**:
  - Kicker "Global" in mono 13px caps, tracking 0.78px.
  - H1 A Garamond **46/52, weight 400**.
  - Dek **24/32**, then "By …" at 24/32.
- **Lead image 976×549 (16:9) at x232**. That is **1.47× the text width**.
- Caption and credit in mono 12px.
- **Body** A Garamond **22/33 (1.5)**, **70 cpl**, 30px paragraph gap.
- **No right rail.** Section heads are "Atlantic Serif" 32/34 in caps with 1px tracking.
- "Share" and "Give a Gift" are small text buttons (64×16) after the lead image.
- **Comments open in a 600px off-canvas drawer** on the right.
- **1024.** Text column stays 665 (x180). Lead image 976.
- **Phone.** H1 38/44, 24px gutters, body 20/30, **38 cpl**, lead image full-bleed 375×211. The document measured 970px wide at 375, i.e. **horizontal overflow**, likely an ad or embed element.

**Author page.** Centred 874 column.
- 120px portrait, name 44/44 in "Atlantic Condensed", a Follow link (mono 13).
- Bio 22/30 serif with "Read More +" (mono 12).
- "Latest" river: text 558 plus a 296 square image on the right. Heads **32/36**, deks 20/28, date in mono 13.

**Typography.** Serif everywhere for content (A Garamond). Mono (Logic Monospace) for kickers, dates and captions. Graphik sans for the navigation.

### 1.3 The Guardian (theguardian.com)

**Grid.** Named CSS grid lines: `70 | 3×60 (left column) | 12×60 (main) | 60 | 70`, with a 20px gap. Content is **1300** at 1440 (x70–1370).

**Home**
- A **top-above-nav billboard of 1440×295** (970×250 creative) sits **above the masthead**.
- Each "container" (Headlines, etc.) puts its **title in the left column (220 wide)**; content starts at x330.
- Lead headline GH Guardian Headline **28/32.2, weight 500**. Others are 20/23 and 17/19.5.
- Images **5:4** (220×176, 460×368). The top strip uses 98×98 square thumbs.
- **Full-width 1300×298 ad bands between containers**, about every 1,500px (2992, 4522, 6077, 7788).

**Article**
- **Left meta column** (x90, 220 wide) holds:
  - section / series label (20px bold);
  - bylines (17px bold);
  - date (12px);
  - a "Share" button (105×36).
- **Main column 620** (x330):
  - H1 **34/39.1, weight 500**, left-aligned, 620 wide.
  - Standfirst **20/23 in a narrower 540** column.
  - Lead image **620×496 (5:4) at text width**. Caption 14/18.9 sans below it.
- **Body** Guardian Text Egyptian (slab serif) **17/23.8 (1.4)**, **71 cpl**, 12px paragraph gap. Drop cap on the first paragraph.
- **Right rail 300** at x1050 (100px gap). It contains a **1600px-tall sticky ad container** (300×600 / 300×250 moves inside it).
- A 1300×294 merchandising ad after the article. Reader-revenue asks sit inline and in an overlay.
- **1024.** The left meta column folds above the article. Main stays 620 and the 300 rail stays.
- **Phone.** **10px gutters** (tight), H1 28/32.2, body 17/23.8, **40 cpl**, lead image full-bleed 375×300.

**Author (profile) page**
- Name in the left column (20px bold).
- Bio 17px in the 620 main column, with a 100×100 photo right.
- **Items grouped by month**, with the month label in the left column.
- 4-up cards of 220×176 (5:4): 20/23 heads, 12px bold timestamps.
- **Numbered pagination.**

**Typography.** Serif throughout (Guardian Headline, Guardian Text Egyptian). Sans for meta and captions.

### 1.4 Smashing Magazine (smashingmagazine.com)

- **Fluid type.** Sizes are non-integer (20.41, 33.84, 44.72 …), so they are clamp/vw based.
- **Home**
  - Lead: **author avatar 177×177 as the image**, headline Mija **44.7/53.7 bold**, date 18px, excerpt Elena serif **20.4/33.5** (701 wide), "Continue reading ↬".
  - Secondary items: 33.8/40.6 heads with 119px avatars.
  - Right: newsletter box (about 325 wide).
  - Then "guides" cards: 3 × 296.
- **Article**
  - H1 **49/58.8 bold, 1176 wide** (wider than the body).
  - Meta row: read time, then "Share on Twitter, LinkedIn" as **plain text links**.
  - Summary lede 23.5px, first paragraph 22.4px, then body.
  - **Body 700 column** (x132), Elena **20.4/33.5 (1.64)**, **72 cpl**, 28.6px paragraph gap.
  - H2 27.6/41.4 bold. Blockquotes in-column at 21.4/35.4.
  - **Right rail 336** (x972, 140px gap): author bio card first, then **house ads only** (their books and workshops: 286×238 images in boxes of 412–823 height). A partner strip of 700×72 mid-article, and a 1325-wide partner logo band at the end.
  - No lead image.
- **Author page**
  - 119px avatar, bio 25px serif (800 wide), "Find elsewhere" link box on the right.
  - **The article count is set vertically** ("9 articles", rotated).
  - Text-only list: 32px heads, date inline at the start of a 20px excerpt, read time and comment count in a right column.
- **Typography.** Sans display (Mija) for heads. **Serif (Elena) for body**.

### 1.5 CSS-Tricks (css-tricks.com), as the tech-magazine reference

- **Home**
  - Hero is **50/50**: image 671×425 (1.58) left; right side a 49px heading, 19.7/33.5 dek and date.
  - "Popular this month": a **horizontal scroller** of about 187-wide text cards, with a 44px section title.
  - Then a grid of `992 | 300` (gap 49): river rows with a **397×315 (5:4) thumb on the left and 595 of text**.
  - Small **sponsor cards 201×56**. No IAB display ads.
- **Article**
  - H1 MD Primer **65.6/72 bold, 992 wide**. Kickers 10.8px bold caps. Author and date at 16px.
  - **Body text 616 wide** (x115) in Blanco serif **19.7/33.5 (1.7)**, **66 cpl**.
  - **Code blocks and demo iframes break out to 861 wide.**
  - H2 43.9/48.3.
  - Right rail 300 (x1091), used for unrelated/sidebar content. Related posts (Jetpack) at the end.

### 1.6 It's Nice That (itsnicethat.com), design-led independent

- **Home.** Content about 1060 wide (x190).
  - **Lead 1059×638 (1.66)**. Below it the text splits: 40/48 Labil sans headline (595 wide), 17/25 Bradford serif dek (404 wide) beside it.
  - Then **3 × 339 columns (gap 20) using native image ratios** (0.65–1.0, mostly **4:5** portrait), so the grid is ragged, masonry-like. Heads 18/23.
  - No display ads observed.
- **Article**
  - **Split header:** text column 520 on the left:
    - discipline tags;
    - H1 **40/48, tracking 1px**;
    - standfirst **25px serif**;
    - "Words: author" and date (13px);
    - tag chips (11px).
  - Hero image on the right (about 416 wide).
  - **Body 628 left-aligned** (x190), Bradford **17/25 (1.47)**, **78 cpl** (too long).
  - Images at **text width 628**, mostly **4:5**, stacked.
  - Right column 324 (x936), sticky.
  - A **floating bottom pill nav** ("Reading / More from / Work / Search").
- **Typography.** Sans (Labil) for heads and UI. **Serif for body**.

### 1.7 AIGA Eye on Design (eyeondesign.aiga.org), design-led independent

- **Home.** Content 1292 (**74px margins**).
  - **Lead 1292×804 (1.61)** with a centred overlay headline Chapeau **45/56** and dek 22/27.5.
  - Then **2 × 609 (3:2-ish, 1.47)**, then **3 × 381 (1.47)**. **The gutter (74) equals the page margin.**
  - Heads 24/28.8, then 18/22.5.
  - No ads.
- **Article**
  - **Centred header:** kicker 12px caps (tracking 1px), H1 **45/56 centred in 482**, dek 22/27.5 centred in 440.
  - Share as **uppercase 12px text links top-right**.
  - **Lead image 1292×1292** (content-wide).
  - **Numbered captions** ("01 …", 12px caps).
  - **Body 650 centred** (x395), Suisse Neue Light (**sans**) **22/33 (1.5)**, **55 cpl**, 35px paragraph gap.
  - Horizontal-scroll image gallery (467×350 items). No rail, no ads.

### 1.8 Rest of World (restofworld.org), widely praised news-magazine design

- **Home.** 16-column grid, **1240 at 100px margins**, 54px columns, **25 gap**.
  - **Left rail "latest" 224 wide, text only** (Moderat 15/16.5 bold heads).
  - Main 924: lead **608×342 (16:9)** with a Georgia 17.5/23.6 dek, secondaries 291×164 (16:9).
  - 3-up rows of 291 (16:9).
- **Article**
  - **Left contributor column** (x80, 220 wide) with portraits.
  - H1 Moderat **48/52.8 bold**, left, 527 wide (x420).
  - **Lead image 960×540 (16:9)** starting at the text's left edge and extending right: **1.6× the text width**. Credit in mono 10px, **right-aligned**.
  - **Body 600** in Georgia **20/32 (1.6)**, **62 cpl**.
  - **Margin notes / pull-outs 340 wide sit in the right margin** (x1040), beside the paragraph they belong to.
  - Related: 3 × 340×227 (3:2). A sticky reading header. No ads.

### 1.9 The New Yorker (newyorker.com), same platform as Wired

- **Home**
  - **Split hero:** image 720×780 filling the right half to the edge. Left text: Irvin **36/40** headline, Caslon 21/28 dek, byline 20px.
  - 12-column grid **1312 (64 margins), 80px columns, 32 gap**.
  - "Today's Mix" 4-up text cards (304): 22/28 heads, 17/24 deks.
  - **Fiction module with a real text excerpt** (21/31.5) and "Continue reading »".
  - **728×90 leaderboards in full-width bands** about every 1,550px.
- **Article (paywalled)**
  - **Split header:** rubric, H1 Irvin **42/46.7 centred in 500**, dek Caslon 21/28 centred, byline 15px, date 12px — all in the left half. Image 656×728 (about 9:10) in the right half.
  - Caption 13/16 Graphik.
  - Body wrapper **640** (x176), rail 300 (x960).
  - "Save this story" is a 56px round button floating at the left edge.
  - Body text is not rendered for logged-out visitors. Est. Caslon 21/31.5, the same as the excerpt on home.

### 1.10 Wired (wired.com), from HTML and CSS tokens (not rendered)

- Same Verso platform as The New Yorker: max-width 1600; grid **12 columns, gap 2rem, margin 4rem** (≥1024).
- **Body column = columns 3–10 (8 of 12)**, about 864 at 1440 without a rail (est.). With a rail, est. about 640 as on The New Yorker.
- H1 WiredDisplay (condensed sans) **38 → 44 → 54px** at 0/768/1024, line-height about 1.04. Tracking −0.5px.
- Dek Apercu **700, 20/28**.
- Body **BreveText (serif) 19/28**. Paragraph margin 16px.
- H2 Apercu 700 **28/36 → 34/40**. H2 margin-top 40px.
- Feature template: **"SplitScreen" header** (2 columns, full-bleed, theme colour).
- **Named ad slots:** `hero` (top, `should-hold-space`), `in-content`, `mid-content` (15 on home, between packages), `rail`, `footer` (`should-hold-space`), `outstream` (video), `overlay`, `out-of-page`, `read-more` (native in-feed card), `sponsor-product`.
- Home is built from "subtopic discovery" packages (1 hero + 2 secondaries each), separated by mid-content ad bands.

### 1.11 The New York Times (nytimes.com)

**Section front (/section/technology, live via the Wayback capture)**
- Content **1200** (x120–1320).
- **Lead package:**
  - Lead image 608×405 (**3:2**) on the left, Cheltenham **23/27 bold** headline below, Imperial 15/22 summary.
  - 2nd column (about 300) with a text story.
  - 3rd column (225) of text items with **75×75 square thumbs on the right**.
- Sub-section band "Personal Technology": **5 × 208 square** images, 16/18 heads.
- **"Latest" stream:**
  - **Date in a left column.**
  - Text starting at x445: Cheltenham **23/25, weight 400** head (470 wide), Imperial 14/20 summary (715 wide).
  - **160×160 square thumb on the right** (x1000).
- "More in …" links per band.

**Article (est., not measurable here)**
- Text column about **600**. Imperial **20/30** at desktop, 18/25 on phone. Cheltenham H1 about 40px, left-aligned.
- Byline with a small portrait, then the date. A row of share / gift / save / comment-count buttons.
- Lead image wider than the text (about 945–1200) or full-bleed on features.
- No right rail.
- In-article ads labelled "Advertisement" with a **"Skip advertisement" link**.

---

## 2. What they all do (with numbers)

**1. The text column is 600–700px and never wider.** Measured:

| Site | Text column |
|---|---|
| Verge | 600 |
| Rest of World | 600 |
| CSS-Tricks | 616 |
| Guardian | 620 |
| It's Nice That | 628 |
| New Yorker (wrapper) | 640 |
| Eye on Design | 650 |
| Atlantic | 665 |
| Smashing | 700 |

The median is **about 628px**.

**2. The measure is 62–72 characters per line on desktop.** Verge 64, CSS-Tricks 66, Atlantic 70, Guardian 71, Smashing 72, Rest of World 62. The outliers are Eye on Design at 55 and It's Nice That at 78 (78 reads noticeably long). **On phones: 37–40 cpl.**

**3. Body text is serif at 17–22px (median about 20px), with line-height 1.4–1.7 (median 1.55–1.6).** 10 of the 11 sites use a serif body. Eye on Design is the only sans (Suisse Light at 22px). Examples:

| Site | Body size / line-height |
|---|---|
| Guardian | 17/1.4 |
| It's Nice That | 17/1.47 |
| Verge | 18/1.6 |
| Wired | 19/1.47 |
| CSS-Tricks | 19.7/1.7 |
| Rest of World | 20/1.6 |
| Smashing | 20.4/1.64 |
| Atlantic | 22/1.5 |

**4. Headlines are left-aligned** at 34–66px on desktop, median about 46px:

| Site | H1 at 1440 |
|---|---|
| Guardian | 34 |
| It's Nice That | 40 |
| New Yorker | 42 |
| Eye on Design | 45 |
| Atlantic | 46 |
| Rest of World | 48 |
| Smashing | 49 |
| Wired | 54 |
| Verge | 65 |
| CSS-Tricks | 65.6 |

Line-height is 1.0–1.15, with tight or negative tracking on sans faces (Verge −0.02em, Wired −0.5px). **Centred headlines appear only on feature/split templates** (Eye on Design, New Yorker). **Phone H1: 28–44px.**

**5. The dek / standfirst is 20–26px** (Guardian 20, Atlantic 24, Verge 26, It's Nice That 25, Eye on Design 22, Wired 20). It is often **narrower than the body** (Guardian 540 vs a 620 body).

**6. Meta uses a third voice: mono or small sans at 10–13px, often caps with 0.05–0.1em tracking.** This covers kickers, dates, captions and credits. Verge, Atlantic, Rest of World and It's Nice That use mono; Guardian, New Yorker and Wired use sans.

**7. The rail, when present, is 300px** (IAB MPU width). Verge, Guardian, CSS-Tricks and New Yorker are 300; It's Nice That 324; Smashing 336. **The gap from text to rail is 100–145px**, far more than the grid gutter. Verge and Guardian 100, CSS-Tricks 115, It's Nice That 118, Smashing 140, New Yorker 144.

**8. Content width at 1440 is 1200–1312**, margins 64–120:

| Site | Content width | Margins |
|---|---|---|
| NYT | 1200 | 120 |
| Rest of World | 1240 | 100 |
| Atlantic | 1280 | 80 |
| Eye on Design | 1292 | 74 |
| Guardian | 1300 | 70 |
| Verge (home) | 1300 | 70 |
| New Yorker / Wired | 1312 | 64 |

**Gutters are 20–32px**, except Eye on Design at 74.

**9. Front pages:**
- One dominant lead occupies 45–75% of content width: Atlantic 624/1280, NYT 608/1200, Verge 680/1300, Eye on Design and It's Nice That about 100%.
- It is usually **3:2** (Atlantic, NYT, Verge section co-leads, Rest of World uses 16:9). The lead headline is 28–45px; the Verge's 90px is the exception.
- Secondaries use **grids of 4 × about 296 or 5 × 208**.
- **Square (1:1) thumbnails dominate lists and rivers:**
  - Atlantic 296, NYT 160 and 75, Verge 380 and 75, Guardian 98.
  - List thumbs sit **on the right** of the text on Atlantic, NYT and The Atlantic home list; **on the left** on Verge phone and CSS-Tricks.

**10. Every text-heavy page has a river/list whose rows put text on one side and a thumbnail on the other.** Atlantic: 546 text + 296 square. NYT: date column + text + 160 square. CSS-Tricks: 397 5:4 thumb + 595 text.

**11. Ad rules that hold on every ad-supported site we measured:**
- **Nothing sits between the H1 and the lead image.**
- The top ad sits **above or directly below the masthead**, never inside the article header.
- The first in-article ad comes after **at least 2–3 paragraphs** (Verge about 350px into the body).
- Ads are **centred in the text column** with **about 30px** of padded, labelled space above and below. Verge uses a 600×310 slot for a 300×250.
- **Front-page ads are full-width bands between packages.** Guardian and New Yorker place one about every 1,500–1,550px; Wired has 15 mid-content bands on home.
- **The rail carries one sticky tall unit** (Guardian: a 1600px sticky container) or repeated 300×250s about every 1,200–2,400px (Verge).
- **Reserved height:** Wired/New Yorker `should-hold-space`, Guardian fixed 295/298 slot heights, Verge fixed 90/310 slots.

---

## 3. Where they differ and why

| Axis | Option A | Option B | Why |
|---|---|---|---|
| **Rail on article** | None: Atlantic, Eye on Design, Rest of World, NYT (est.), Wired features | 300 rail: Verge, Guardian, New Yorker, Smashing, CSS-Tricks, It's Nice That | Subscription or long-read brands drop the rail to feel bookish. Ad-funded or news brands keep it for the MPU and for "most popular". |
| **Where byline and meta go** | Under the headline (most) | Left meta column 220 (Guardian); left contributor column (Rest of World) | A left column keeps the header short and gives the text an anchored start, at the cost of width. It folds above the headline below 1100–1300px. |
| **Lead image width** | Text width, 5:4 (Guardian) | Wider than the text: 1.47× (Atlantic 976/665), 1.6× (Rest of World 960/600), content-wide (Eye on Design 1292) | Wider images signal "magazine feature"; text width signals "news". |
| **Header layout** | Stacked | Split screen, image one half and text the other (New Yorker, Wired, Verge features, It's Nice That) | Split keeps headline and image both above the fold at 1440×900 without a giant hero. |
| **Headline face** | Serif (Atlantic, Guardian, New Yorker, NYT) | Sans or display (Verge, Wired, Smashing, CSS-Tricks, It's Nice That, Rest of World) | Heritage print titles use serif; tech/design titles use sans. **Body is serif either way.** |
| **Front composition** | Symmetric 3/6/3 with a centre lead (Atlantic) | Lead + rail (Verge); left title column plus containers (Guardian); big hero then 2-up then 3-up (Eye on Design); ragged native-ratio grid (It's Nice That) | Symmetric = curated magazine. Title-column containers = many sections at news cadence. Big hero plus decreasing columns = low volume, image-led. |
| **Thumbnail ratio** | 1:1 in lists (Atlantic, NYT, Verge) | 3:2 in cards (Atlantic top, NYT lead, Rest of World 16:9); 5:4 (Guardian, CSS-Tricks); 4:5 native (It's Nice That, portfolio work) | 1:1 keeps river rows of equal height regardless of headline length. |
| **Ads** | Heavy IAB display (Verge, Guardian, Wired, New Yorker) | House / sponsor only (Smashing, CSS-Tricks); none observed (Atlantic front, Eye on Design, Rest of World, It's Nice That) | Business model. The layout is the same; only the slots differ. |

---

## 4. Best ideas worth adopting

1. **Text column about 640px with graded breakouts.** Column (640) → wide (about 960, 1.5×) → full-bleed. CSS-Tricks lets code and embeds go to 861 while text stays at 616. Rest of World and The Atlantic run the lead image at 1.5–1.6× the text width.
2. **Margin notes / pull-outs in the right margin** beside the related paragraph, 340 wide (Rest of World), or asides hanging into the left margin (Verge, 320). This uses rail-less whitespace instead of an ad rail.
3. **Guardian-style left meta column** (about 200–220): byline, date, share and series label. It folds above the headline below about 1100px, and its section-title version organises fronts neatly.
4. **A dek narrower than the body** (Guardian 540 vs 620). It reads as a distinct block.
5. **A third "meta" voice in mono or small caps** at 11–13px, tracking about 0.08em, used for kickers, dates, captions, credits and ad labels. Captions right-aligned or numbered ("01") for image-led pieces (Rest of World, Eye on Design).
6. **River rows with square thumbs on the right and a date column on the left** (NYT, Atlantic). Rows stay equal height; scanning is fast.
7. **Numbered "Most popular" (5 items), text-only**, in the rail or as a left "latest" rail (Rest of World 224 wide).
8. **Subtle share tools:** 3 icon buttons at 30–32px under the byline (Verge), or text links (Smashing, Eye on Design). Repeat once at the end. Never a floating social bar.
9. **Comments behind a count button or in a drawer** (Atlantic 600px off-canvas; Verge "Comments (n)").
10. **Author pages as real profiles:**
    - large name at 44–160px;
    - 120–150 portrait;
    - bio at 20–25px serif with "Read more";
    - links in mono;
    - article count (Smashing sets it rotated);
    - the list grouped by month (Guardian).
11. **Reserved ad heights and named slots** (Wired's `hero`, `in-content`, `mid-content`, `rail`, `footer`, `read-more`) with an "Advertisement" label and a padded slot. NYT adds a "Skip advertisement" link.
12. **Gutter equals page margin** on image-led fronts (Eye on Design, 74/74). It is calm and makes a strong grid.
13. **Text excerpts as front-page modules** (New Yorker fiction excerpt, Smashing excerpts). A magazine's front can show words, not only thumbnails.
14. **Mixed-length rivers:** "quick posts" (text only) interleaved with full cards (Verge stream).

## 4b. Weaknesses to avoid

- **A billboard above the masthead** (Guardian: 295px of a 900px viewport before the logo). Put the top ad below the navigation, 90–250 tall, reserved.
- **Too many ads:** Verge home has a rail MPU about every 1,200px, plus in-feed strips, plus full-width strips. The Verge article has in-body 300×250s about every 2,400px, a video player, and a rail. Cap it at one unit per viewport height.
- **Horizontal overflow on phones:** Verge home measured 630px document width at 375; Atlantic article 970px. Something (ad, embed, oversized logo) escapes the viewport. Clip ad and embed containers with `max-width:100%` and `overflow:clip`.
- **10px phone gutters** (Guardian) are too tight. 16–24 is the norm (Verge 20, Atlantic 24).
- **A measure over 75 characters** (It's Nice That 78 at 17px). Cap at about 70ch.
- **Display headlines left at desktop size on phones:** the Verge lead is 65px at 375 wide, 3–4 words per line.
- **Stacked overlays:** consent + terms + newsletter modal + support asks (Verge, Guardian, It's Nice That) all fight the first view.
- **Share bars with brand logos and floating stickies:** none of the best sites use them. Keep sharing quiet.

---

## 5. Recommended layout spec: "magazine" preset

### 5.0 Tokens

**Container and grid**

| Viewport | Container | Grid | Gutters |
|---|---|---|---|
| ≥1280 | 1280 max, side margin `clamp(16px, 5vw, 80px)` | 12 columns, gap 32. Column = 77.3; 3 col = 296, 4 = 405, 6 = 624, 8 = 843 | — |
| 768–1279 | fluid | 8 columns, gap 24 | 32 |
| <768 | fluid | 4 columns, gap 16 | **20** |

**Text widths**

| Name | Width |
|---|---|
| `--measure` (body) | **40rem = 640px** (about 66ch at 20px) |
| `--measure-dek` | 36rem = 576 |
| `--wide` | 60rem = 960 |
| `--full` | 100vw |
| `--embed` | 54rem = 864 (code, embeds, tables) |

**Type scale** (desktop / phone). Use `clamp()` between them.

| Role | Desktop | Phone | Line-height | Tracking | Face |
|---|---|---|---|---|---|
| Display (front lead, author name) | 64 | 40 | 1.0 | −0.02em | — |
| H1 article | 48 | 32 | 1.1 | −0.01em | — |
| Section title | 32 | 24 | — | — | — |
| Card-L | 32 | 24 | — | — | — |
| Card-M | 24 | 20 | 1.2 | — | — |
| Card-S | 18 | 17 | 1.25 | — | — |
| Dek | 22 | 19 | 1.35 | — | serif |
| Body | **20** | **18** | **1.6 / 1.55** | — | serif |
| Pull quote | 30 | 24 | 1.25 | — | — |
| Meta, caption, kicker | 13 / 12 | 12 / 11 | 1.3 | kicker caps +0.08em | mono or small sans |

- Headlines are a preset choice: serif (heritage) or sans (tech). **Body stays serif by default.**

**Rhythm.** 8px base. Paragraph gap = 1em. Between modules: 64 desktop, 48 tablet, 40 phone.

**Rules.**
- 1px hairlines between list items.
- **A 2–3px top rule above section titles**, which sit on it at 13px caps or 24–32px display.
- No boxes or shadows on cards.

### 5.1 Front page

**Desktop ≥1280**

1. **Top ad slot** (optional) *below* the navigation: 970×90 or 970×250, reserved min-height, label on top, 24px padding.
2. **Lead package**, choose one variant:
   - `lead-stack` (default):
     - Lead 8 columns (843), image **3:2** (843×562), kicker, headline Display 48–56, dek 20.
     - Beside it, a 4-column stack (405) of 4 items: 1 with a 3:2 image and a Card-M headline, then 3 text-only Card-S items separated by hairlines.
   - `centre`: 3/6/3 (296 | 624 | 296) as on The Atlantic. Centre lead 3:2. Left: two 3:2 cards. Right: a list with **80px square thumbs on the right**.
   - `hero`: content-wide image **16:9 or 1.6:1**. Headline below or overlaid bottom-left, max 12 words.
3. **Card row:** 4 × 296 (3 columns each), image **3:2** (296×197; option 1:1), Card-M headline, optional 16px dek, meta line.
4. **River + rail:**
   - River 8 columns: rows of text (Card-L/M head, 17px dek, meta) on the left with a **thumbnail on the right, 240px wide, 3:2 (or 1:1 at 160)**. Row gap 32 with hairline dividers. After every 6th row, insert either an in-feed ad band or a "quick post" (text only).
   - Rail 4 columns (≥300):
     - "Most read": 5 items, large numerals, text only, Card-S.
     - Newsletter box.
     - 300×250 ad at top; 300×600 sticky lower (top offset = header + 24).
5. **Category bands** (one per featured category): section title on a 3px rule, "See all →" at the right, then 1 lead (6 columns, 3:2) + 3 compact items. Or 4-up cards.
6. **Between every 2 bands:** a full-width ad band (970×250 centred, reserved 250 + label + 2×24 padding). Max 3 per page.
7. "More stories" button or numbered pagination (current page, next, last).

**Tablet 768–1279.**
- The lead becomes full width (image 3:2); the stack becomes a 2-column row under it.
- The card row becomes 2 × 2.
- **The rail folds.** "Most read" goes after the 4th river item; the rail ad goes in-feed.
- The river thumb shrinks to 200 (3:2).

**Phone <768.**
- Lead image full-bleed 3:2. Headline 32–36, dek 18.
- Cards become rows: text on the left, **96×96 square thumb on the right**.
- Ad bands 300×250 centred, max one per 1.5 screens.
- 20px gutters.

### 5.2 Section (category) front

- **Header:**
  - kicker "Section";
  - section name Display 56–64;
  - description in 20px serif at max 640;
  - sub-category chips (13px, row, scrollable on phone);
  - 3px top rule.
- **Top:** 2 co-leads at 6/6 (624 each, 3:2, Card-L headline, dek). Or `lead-stack` when there is one strong story.
- **Then** the river + rail exactly as on the front. The rail holds "Most read in <section>", the newsletter and ads.
- **Pagination:** numbered pages plus Previous/Next (Guardian and Verge style), about 20 items per page. Page 2 and later **drop the co-leads** and start straight with the river.

### 5.3 Article

**Desktop ≥1280, default "standard" template**

The whole thing is a 1280 grid:

```
[meta 200] 40 [body 640] 100 [rail 300]
```

That totals 1280. The **no-rail variant** centres the 640 body and lets margin notes use the free right space.

**Header**, aligned to the body's left edge. The headline may span into the rail column.
- Kicker: section, 12px caps mono, +0.08em.
- **H1 left-aligned**, 48/1.1, max width 760 (about 12–14 words per 2–3 lines).
- Dek 22/1.35 serif at **max 576**.
- Byline row: 36px round avatar, author names 15px bold, date and read time 13px meta.
  - With the left meta column active (≥1280), put the byline, date and share in the meta column instead (Guardian model) and start the lead image immediately under the dek.
- Share: **3 icon buttons at 32px** (copy link, native share, save/bookmark) plus "Comments (n)". Right of the byline row, or in the meta column. Repeat once at the end.

**Lead image** (per post: `column | wide | full | split | none`).
- Default `wide`: **960 (1.5× body), 3:2 or 16:9**, left edge aligned with the body, extending right.
- `split`: 50/50 image and header, for features (New Yorker / Wired / Verge).
- Caption 13/1.35 sans under the image at body width. Credit 11px caps mono, right-aligned.

**Body**
- 640, **20/1.6 serif, about 66ch**. First paragraph optional drop cap (3 lines).
- H2 30/1.2, 48 above and 16 below. H3 22.
- **Inline images:** `column` 640, `wide` 960, `full` 100vw.
- Code, tables and embeds up to 864.
- **Pull quotes:** at ≥1280, a **margin note in the rail space** (300 wide, 24/1.3, top rule 2px), placed beside the paragraph. Below that, in-column: 30/1.25 with 2px rules above and below and 40px vertical margin.
- **Table of contents** (long posts over about 1,500 words and 4+ H2s):
  - sticky in the left meta column at ≥1280, 13px list;
  - a collapsed `<details>` "Contents" after the dek at smaller widths.

**Rail** (standard template only)
- 300×250 ad at the top.
- "Most read" (5).
- **A sticky 300×600 in the last third**, sticky top = header + 24.
- Newsletter card.

**End of article, in this order:**
1. tags (chips);
2. share repeated;
3. author card (64px avatar, name, 2-line bio, "More by" link);
4. newsletter signup (full body width, 1 field + button, no modal);
5. **"Read next"**: 3 × 405 cards (3:2) at full container width;
6. **comments collapsed** behind "Show comments (n)";
7. full-width footer ad.

**Tablet 768–1279.** The meta column folds under the dek. **The rail is hidden**: its ad moves in-body and "Most read" goes to the end. Body 640 centred. `wide` images become container width (about 720–1000).

**Phone.**
- 20px gutters. H1 32/1.12, dek 19, body **18/1.55 (about 38–40 cpl)**.
- Lead image **full-bleed**. Captions at 20px inset.
- Share icons in one row under the byline.
- Pull quotes in-column. TOC collapsed.

### 5.4 Author page

- **Header** (container width):
  - portrait **144×144** (circle or square per preset);
  - name Display 56–64 (the Verge goes to 160; keep it at 64 so long names fit);
  - role 13px caps;
  - bio 20/1.5 serif at max 720, clamped to 4 lines with "Read more";
  - links (site, social, RSS, email) in 12px mono;
  - article count ("48 articles"), optional.
- **List:** the same river as the section front (text left, **3:2 at 240 or 1:1 at 160 on the right**, date meta), 8 columns. Optional **grouping by month**, with the month label in the left meta column at ≥1280 (Guardian).
- Rail: "Most read by <author>" (optional), newsletter. No ads above the first item.
- Pagination: numbered pages.
- Phone: portrait 96, name 36, bio 18, river rows with 96×96 thumbs.

### 5.5 Ad placements (all optional, all with reserved height and an "Advertisement" label in 11px caps meta)

| Slot | Where | Sizes | Rules |
|---|---|---|---|
| `top` | **Below** the main nav, above the page content (never above the logo) | 728×90, 970×90, 970×250; phone 320×50 / 320×100 | Reserve min-height; 24px padding; one per page |
| `front-band` | Between front/section packages | 970×250 in a full container band (tinted background) | At most one per 2 packages; max 3 per page; never directly after the lead package |
| `in-feed` | In the river | Native row with the same row geometry as an article (thumb + text + "Sponsored" kicker), or 728×90 | At most 1 per 6 rows |
| `rail-top` | Top of the rail | 300×250 | Only when the rail exists (≥1280) |
| `rail-sticky` | Last third of the rail | 300×600 sticky | One sticky element in the rail; release before the footer |
| `in-article` | After paragraph 3, then every 6–8 paragraphs (≈1200–1600px) | 300×250 centred in the 640 column (desktop without rail, tablet, phone); 640×360 outstream video optional | ≥2 paragraphs from any heading, image, pull quote or embed; never before the first paragraph; never between H1 and lead image; 32px margin above and below; max 3 per article; collapse the slot if unfilled |
| `article-end` | After "Read next", before the footer | 970×250 / phone 300×250 | One |
| `sponsor` | Kicker line / card | Text "Paid content from X" in meta voice | For house or sponsored posts, like CSS-Tricks and Smashing |

**Global rules**
- At most one ad unit visible per viewport height.
- No sticky ads on phones by default.
- Slots are clipped to the viewport (`max-width:100%`, `overflow:clip`) to prevent horizontal overflow.
- All slots reserve their height so nothing moves when they load.
