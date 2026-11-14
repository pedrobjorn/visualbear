Requirement source for every ticket in this file: Pedro's request 2026-11-14 (see plan.md Evidence - the request IS the requirement). Anything not traceable to that request is marked ASSUMPTION. Tickets are ordered by dependency - build top-down.

# Ticket 1: `play.json` becomes exactly Blog + Photography cards

- Part of: specs/play-subpages/plan.md (routes per DR-0001)
- Depends on: -
- Size: S
- Type: system
- Status: DONE 2026-11-14 - evidence in evidence/t1-verify.md: guard test `scripts/test/play-data.test.js` added to `npm test` (watched RED 3!=2, then GREEN, full suite passes); `play.json` = Blog (`../play/blog`) then Photography (`../play/photography`); headless build and full `npm run build` exit 0 (mirror + guard OK); `build/play/index.html` shows exactly the two card hrefs, no old stub hrefs, both default thumb imgs ship in `build/images/`
- Blocked on: card img assets (H2) for final visual sign-off only

## Context

`src/play/index.nunjucks` renders the hero (`site.data.playhero`) + gallery `contentType: 'play'` over `site.data.play`. `play.json` currently holds three cards pointing at placeholder sub-pages, and the `play-*-card.jpg` images it references do not exist in the repo (verified 2026-11-14).

## Requirements

- `src/_data/play.json` becomes exactly two entries, in order: Blog (`href: "../play/blog"`) then Photography (`href: "../play/photography"`), each with `title`, `subtitle`, `img`.
- `img` default: reuse an existing shipped thumb (ASSUMPTION - needs Pedro's validation; one-line swap when play-specific art arrives, H2).

## Design references

- Figma: n/a - reuse of existing modules. Hooks used: card molecule (`src/_modules/molecules/card/`), gallery organism. Principles applied: design-principles #4 (no new pattern) and #6 (rounded card, red accent).
- Existing style refs: `card.scss` (`.medium.card` 256px, radius/shadow mixins), `gallery.scss`, `colour-variables.scss`.

## Acceptance criteria (agent-checkable)

- [ ] `play.json` parses, exactly 2 entries, hrefs `../play/blog` and `../play/photography`, order Blog then Photography
- [ ] `/play/` renders hero + exactly those two cards; `npm run build` passes
- [ ] Gates: prettier `format:check` clean

## Manual test steps (Pedro)

- `npm run serve`, open http://localhost:3000/play/
- Expect the hero + exactly two cards, in order: "Blog / Ramblings" then "Photography / Phone shots"
- Hover each card: the status bar shows .../play/blog and .../play/photography (the pages 404 until Tickets 4/14 land - expected)

## Out of scope

- The index thinner card (Ticket 2), stub deletion (Ticket 3), the blog/photography pages themselves.

## Open questions

- Card subtitles copy - defaults "Ramblings" (Blog) and "Phone shots" (Photography), one-line swaps (Pedro)

---

# Ticket 2: Slim Play card at the bottom of the index gallery

- Part of: specs/play-subpages/plan.md (in-gallery placement per DR-0003, slim per DR-0004)
- Depends on: -
- Size: S
- Type: UI
- Status: DONE 2026-11-14, amended twice the same day after Pedro's visual reviews - v1: separate 112px teaser block below `#work` (title overflowed onto the gallery background, measured ~118px title in a 112px card); v2: full-size card in the gallery (DR-0003); v3 (shipped): slim 112px card INSIDE the gallery with the title-fit fix (DR-0004). Evidence: evidence/t2-verify.md (v1), evidence/t2b-verify.md (v2), evidence/t2c-verify.md (v3). Full `npm run build` exit 0, all guard checks OK; mirror home carries no Play card (guard check 8 clean)
- Blocked on: card img asset (H2) for final visual sign-off only

## Context

The index gallery is `gallery.content({content: site.data.work, contentType: '', showPlay: ..., showBlog: ...})`; the gallery organism's work branch already renders a built-in `_playCard` when `showPlay` is true.

## Amendment history

- Amendment 1 (DR-0003): Play lives INSIDE the gallery, not in a separate block - the v1 separate `.play-teaser` wrapper let the absolutely positioned `.card-title` (~118px) overflow the 112px card onto the gallery's gradient background.
- Amendment 2 (DR-0004, Pedro: "can't the play card still be slim but part of the gallery list?"): yes - keep the 112px slim card inside the gallery and fix the title fit in CSS (`.card--thin` title padding 16px -> 8px, ~102px block < 112px card). No new macro flag: the card macro's existing `class` passthrough carries `card--thin`.
- Amendment 3 (DR-0005, Pedro: "let's put play at the bottom of the gallery"): the Play card renders AFTER the bottom-flagged cards, so it is the very last card in the gallery (closet card moves one up). Locked by `scripts/test/gallery-order.test.js` (RED before the move, GREEN after).

## Requirements (as amended)

- `src/index.nunjucks`: the gallery call is `showPlay: true, showBlog: false`; no separate teaser block.
- `gallery.nunjucks`: the work branch renders `card.content({id: "play-teaser", class: "card--thin", card: _playCard})`; `_playCard` gets copy "Play" / "Stuff I do for fun", href `../play`, img = existing shipped thumb `../images/work/thumbs/gallery_thumb_prettyugly.jpg` (ASSUMPTION - Pedro; H2).
- `card.scss`: `.card--thin .card-container.card.medium { height: 112px; }` and the title-fit rule `.card--thin .card-container.card.medium .card-image .card-title { padding: 8px 16px; }` (specificity 0,5,0 beats the base 0,4,0 rule, no `!important`).
- The Play card is public-only: `stripPlayTeaser` in `scripts/mirror-link.js` strips just the `<a id="play-teaser">` anchor from mirrored pages; wired in `release-mirror.js`; asserted in `scripts/test/mirror-link.test.js`. Reason unchanged: /play/ is not mirrored and its `../play` href would escape the air-lock (guard check 8).
- Card order on the index: work cards, bottom-flagged cards (closet), then the slim Play card LAST (DR-0005).

## Design references

- Figma: n/a. Hooks used: gallery organism work branch (`_playCard`/`showPlay`), card molecule `class` passthrough. Principles applied: design-principles #4 (reuse existing mechanisms, no new flag) and #6.
- Existing style refs: `gallery.nunjucks`, `card.scss` (base `.card-title` padding 16px being overridden), `src/index.nunjucks`.

## Acceptance criteria (agent-checkable)

- [ ] `/` renders the work cards, then the slim Play card (112px at 1440 AND 390) inside the same gallery, linking to `/play/`; no separate teaser block
- [ ] The Play card's title rect sits fully inside the card rect at 1440 + 390 (no overflow onto the gallery background) - the DR-0003 bug stays fixed
- [ ] Copy exactly "Play" / "Stuff I do for fun"; `npm run build` exit 0 with all guard checks OK; mirror home has zero `play-teaser` / `../play` references
- [ ] Screenshots at 1440 + 390 (evidence/t2c-index-\*.png); prettier clean

## Manual test steps (Pedro)

- `npm run serve`, open http://localhost:3000/ and scroll to the bottom of the work cards
- The Play card is in the gallery there, slimmer than the work cards (~112px vs 256px), reading "Play / Stuff I do for fun" with the text fully on the card image; click it and you land on /play/
- Check at 1440 and at 390: text visible, no overlap with the card above, hover shows the usual red plate

## Out of scope

- The Blog card in the gallery (stays `showBlog: false`); nav/sitemap.

## Open questions

- Card img (Pedro) - default thumb above

---

# Ticket 3: Remove the superseded stubs + reference grep

- Part of: specs/play-subpages/plan.md
- Depends on: Ticket 1
- Size: S
- Type: system
- Status: DONE 2026-11-14 - evidence in evidence/t3-verify.md: `src/blog/` and `src/play/play_photography/` deleted (git rm, named in plan H1); the `play_photography` `<url>` removed from `src/sitemap.xml`; `blog.json` hrefs repointed to the slug form (`blog2/`, `blog1/`) so `grep -rn "visualbear/blog\|play_photography" src/` returns zero matches; the other `play_*` stubs stay on disk, unlinked; `npm test` all 4 suites pass; `npm run build` exit 0 with all guard checks OK; build output has no `build/blog/` (so `/blog/` 404s) and no `build/play/play_photography/`, zero stub references anywhere in `build/`

## Context

`src/blog/index.nunjucks` references a data key that does not exist; `src/play/play_photography/index.nunjucks` renders the word "test". Both are unlinked once `play.json` changes. H1: this deletion is named in plan.md Foundational checks.

## Requirements

- Delete the dirs `src/blog/` and `src/play/play_photography/`.
- Grep `src/` for live references to `visualbear/blog` and `play_photography` - none may remain (specs/ excluded).
- The other `play_*` stubs (`play_graphic_design`, `play_drawings`, `play_web`) stay on disk, unlinked (plan non-goal).

## Design references

- Hooks used: none (file ops). Principles applied: foundational H1 (deletion pre-declared in the plan).

## Acceptance criteria (agent-checkable)

- [ ] Both dirs gone from the tree and from the build output (`/blog/` 404s)
- [ ] `grep -rn "visualbear/blog\|play_photography" src/` returns no live references
- [ ] Gates: `npm run build` passes

## Manual test steps (Pedro)

- Open http://localhost:3000/blog/ and http://localhost:3000/play/play_photography/ directly - both should show the 404 page
- Click every card on / and /play/ - none leads to a removed stub

## Out of scope

- Deleting the other `play_*` stubs; any redirect for the old URLs.

## Open questions

- None

---

# Ticket 4: Blog index shell - `bloghero.yml` + `/play/blog/` page

- Part of: specs/play-subpages/plan.md
- Depends on: -
- Size: S
- Type: UI
- Status: DONE 2026-11-14 - evidence in evidence/t4-verify.md: new `src/_data/bloghero.yml` (name blog, title "Blog") + `src/play/blog/index.nunjucks` (gallery layout, `baseUrl = '../../'`, hero + `contentType: 'blog'` gallery over `blog.json`); `npm run build` exit 0 with all guard checks OK; `build/play/blog/index.html` shows the "Blog" h1 + one card per entry (`blog2/`, `blog1/`); empty `blog.json` renders hero + zero cards without errors; live check on `npm run serve`: `GET /play/blog` 301 -> `/play/blog/` 200 (no more "Cannot GET /play/blog"), `GET /blog/` 404 as expected after T3

## Context

The index/play structure is `hero.content(...)` + `gallery.content(...)` inside `_layouts/gallery.nunjucks`. The gallery organism already has a `contentType: 'blog'` branch rendering one card per entry.

## Requirements

- New `src/_data/bloghero.yml` with the same `name`/`title` shape as `playhero.yml`; default `title: "Blog"` (draft copy - Pedro rewrites; yml has no `[ai]` mechanism, so the default ships as-is and is Pedro's to replace).
- New `src/play/blog/index.nunjucks`: extends `_layouts/gallery.nunjucks`, `baseUrl = '../../'`, then `hero.content({content: site.data.bloghero, class: hero-about})` + `gallery.content({content: site.data.blog, contentType: 'blog'})`.

## Design references

- Figma: n/a - mirrors `src/play/index.nunjucks`. Hooks used: hero organism, gallery organism `blog` branch. Principles applied: design-principles #4 (reuse) and #5 (big is beautiful - full-size cards).
- Existing style refs: `src/play/index.nunjucks`, `src/_data/playhero.yml`, `hero.scss`, `gallery.scss`.

## Acceptance criteria (agent-checkable)

- [ ] `/play/blog/` renders the hero + one card per `blog.json` entry
- [ ] Empty `blog.json` (`[]`) renders the gallery shell with zero cards, no template errors
- [ ] Gates: `npm run build` passes; prettier clean

## Manual test steps (Pedro)

- `npm run serve`, open http://localhost:3000/play/blog/
- Expect the "Blog" hero + the post cards from `blog.json` (two seeded by Ticket 5), newest first
- Hard-refresh; no console errors

## Out of scope

- `blog.json` content itself (Ticket 5); post pages (Tickets 6-7).

## Open questions

- Hero copy (Pedro) - default "Blog"

---

# Ticket 5: `blog.json` entries repointed, date as the card subtitle

- Part of: specs/play-subpages/plan.md
- Depends on: -
- Size: S
- Type: system
- Status: DONE 2026-11-14 - evidence in evidence/t5-verify.md: both entries now `{title, subtitle: "14 Nov 2026", href: "<slug>/", img: "../../images/work/thumbs/gallery_thumb_prettyugly.jpg"}` (slugs `blog2/`, `blog1/`, order kept newest-first); no `visualbear` left in `blog.json`; `grep -rn "visualbear/blog" src/` clean; `npm run build` exit 0 + guards OK; served `/play/blog/` shows both cards with date subtitles and slug hrefs; `npm test` all suites pass

## Context

`src/_data/blog.json` has two entries with mirror-era broken hrefs (`../visualbear/blog/blog2`, `../visualbear/blog/blog1`) and non-date subtitles. The card molecule already renders `title` (h2) + `subtitle` (p), so the date goes in `subtitle` with no template change.

## Requirements

- Entry shape: `{ "title": "<post title>", "subtitle": "<post date>", "href": "<slug>/", "img": "<thumb>" }` (href relative from `/play/blog/`, depth 2).
- Repoint the two existing entries to their post slugs; subtitles become dates, default format "14 Nov 2026".
- Array order = display order: newest post first (top card = entry 0).

## Design references

- Hooks used: card molecule (title/subtitle fields). Principles applied: design-principles #4 (no new fields).
- Existing style refs: `src/_data/blog.json`, `card.nunjucks`.

## Acceptance criteria (agent-checkable)

- [ ] `/play/blog/` cards each show title + date and link to `/play/blog/<slug>/`
- [ ] `grep -rn "visualbear/blog" src/` finds nothing
- [ ] Gates: `npm run build` passes; prettier clean

## Manual test steps (Pedro)

- On /play/blog/ (after Ticket 4): each card shows the title with a date as the subtitle line (default "14 Nov 2026" style)
- Card order matches `blog.json` top-to-bottom: first entry renders as the top card

## Out of scope

- The post pages the hrefs point at (Tickets 6-7).

## Open questions

- Date format: "14 Nov 2026" (default) vs ISO `2026-11-14` (Pedro) - one-line change per entry

---

# Ticket 6: Blog post shell `/play/blog/<slug>/index.nunjucks`

- Part of: specs/play-subpages/plan.md
- Depends on: -
- Size: S
- Type: UI
- Status: DONE 2026-11-14 - evidence in evidence/t6-verify.md: `src/play/blog/hello-world/index.nunjucks` created - work layout, `baseUrl = '../../../'`, teachr wrappers, `mdhero`/`mdpage` on `site.data.pages['blog-hello-world']`, `buttonslider` from `project_blog_hello_world`, authoring comment on top; diff vs teachr shell shows only intended deltas; `npm run build` exit 0 + guards OK with the shell present (page output lands with T7 data - one plumber-logged template error until then, expected); `npm test` all suites pass

## Context

Case-study pages are the template: `_layouts/work.nunjucks` shell, hero via `{{ site.data.pages['<slug>'] | mdhero | safe }}`, body via `mdpage`, bottom prev/next via `buttonslider` from `src/_data/project_<slug>.json` (`"../disabled"` renders no arrow). Static build, so one dir per post: new posts copy this shell file into a new `src/play/blog/<slug>/` dir (manual flow - plan non-goal: no CMS).

## Requirements

- Create `src/play/blog/hello-world/index.nunjucks`: extends `_layouts/work.nunjucks`, `baseUrl = '../../../'`, article/section/`gallery-container` wrappers copied from `src/teachr/index.nunjucks`, content = `mdhero` + `mdpage` on `site.data.pages['blog-hello-world']`, then `buttonslider.content({nexthref: site.data.project_blog_hello_world.nexthref, prevhref: site.data.project_blog_hello_world.prevhref})`.
- A short comment at the top of the file states the copy-per-post authoring step.

## Design references

- Figma: n/a - 1:1 copy of the case-study shell. Hooks used: `mdhero`/`mdpage` filters (`markdown-render.js`), `buttonslider` molecule, `_layouts/work.nunjucks`. Principles applied: design-principles #2 (one h1, landmarks, focus) and #4 (no new machinery).
- Existing style refs: `src/teachr/index.nunjucks`, `src/_styles/templates/_case-study.scss`, `buttonslider.scss`, `AUTHORING.md`.

## Acceptance criteria (agent-checkable)

- [ ] Shell file exists at `src/play/blog/hello-world/index.nunjucks` and structurally matches the teachr shell (diff review: same wrappers, same filters, `baseUrl = '../../../'`)
- [ ] Renders correctly once Ticket 7 data lands (verified there); `npm run build` passes with the page present

## Manual test steps (Pedro)

- No page to open yet (the shell renders once Ticket 7's data lands) - check the file exists: `src/play/blog/hello-world/index.nunjucks`, and diff it against `src/teachr/index.nunjucks` to see the same shell shape
- The real page test happens in Ticket 7

## Out of scope

- Seed post content and `blog.json` entry (Ticket 7); any change to `markdown-render.js`/`AUTHORING.md`.

## Open questions

- None

---

# Ticket 7: Seed post data + top card (md, project json, `blog.json` prepend)

- Part of: specs/play-subpages/plan.md
- Depends on: Tickets 4, 5, 6
- Size: S
- Type: system + copy
- Status: DONE 2026-11-14 - evidence in evidence/t7-verify.md: `blog-hello-world.md` (hero title "Hello World", details "14 Nov 2026", short `[ai]`-marked body) + `project_blog_hello_world.json` + `blog.json` prepend (`hello-world/` on top, same title+date as the md hero); `/play/blog/hello-world/` renders 1 h1 + body + "< Blog" prev and no next arrow; `/play/blog/` top card = Hello World / 14 Nov 2026; `npm run build` exit 0 + guards OK, `npm test` all suites pass. NOTE: prevhref uses `"../"` not the ticket text's `"../../"` - from depth 3, `../` is what resolves to `/play/blog/` per the acceptance criteria. Cover img = reused shipped thumb pending H2 (one-line swap)
- Blocked on: seed post cover img (H2) - sign-off only, defaulted per T1/T2 pattern

## Context

The "new post" flow (Pedro: "can be manual"): drop `blog-<slug>.md` in `src/_data/pages/` (auto-loaded by foldero), add `src/_data/project_blog_<slug>.json`, prepend one entry to the TOP of `blog.json`. Title and date are manual and must match the md hero.

## Requirements

- `src/_data/pages/blog-hello-world.md`: front-matter hero per `AUTHORING.md` (title + date in hero meta) and a short body; agent-drafted copy carries the `[ai]` marker per visuaibear-core #7.
- `src/_data/project_blog_hello_world.json`: `{ "prevhref": {"link": "../../", "text": "Blog"}, "nexthref": {"link": "../disabled", "text": ""} }`.
- Prepend `{ "title": "<md hero title>", "subtitle": "<md hero date>", "href": "hello-world/", "img": "<cover, pending H2>" }` to the top of `blog.json`; title/date identical to the md hero.

## Design references

- Hooks used: foldero data load, `mdhero`/`mdpage`, `buttonslider`. Principles applied: core #7 (`[ai]` marking), design-principles #4.
- Existing style refs: `src/_data/pages/teachr.md` (front-matter format), `src/_data/project_teachr.json`.

## Acceptance criteria (agent-checkable)

- [ ] `/play/blog/hello-world/` renders the md hero + markdown body + bottom nav: prev links to `/play/blog/`, next arrow absent (`"../disabled"`)
- [ ] `/play/blog/` top card shows the same title + date as the post hero
- [ ] New-post flow verified once: add md + json prepend, rebuild, new card appears on top (re-checked in Ticket 16)
- [ ] A11y: one h1, landmarks intact, axe clean; Gates: `npm run build`, `npm test` pass

## Manual test steps (Pedro)

- On /play/blog/ the TOP card is the seed post; its title and date match the post page's hero exactly
- Open /play/blog/hello-world/: hero, body text, and a bottom nav with "< Blog" (goes back to /play/blog/) and NO ">" next arrow
- Authoring flow: copy the shell into a new `src/play/blog/<slug>/` dir, add `blog-<slug>.md` + `project_blog_<slug>.json`, prepend one entry to `blog.json`, save - the dev server reloads and the new card appears on top of /play/blog/

## Out of scope

- A second post; automating the flow.

## Open questions

- Seed post copy is `[ai]`-drafted - Pedro rewrites (core #7)

---

# Ticket 8: Photogallery folder scan in `gulp/nunjucks.js`

- Part of: specs/play-subpages/plan.md (DR-0002)
- Depends on: -
- Size: S
- Type: system
- Status: DONE 2026-11-14 - evidence in evidence/t8-verify.md: after the foldero load, `gulp/nunjucks.js` scans `src/_images/play/photography/` for jpg/jpeg/png/webp, sorts mtime-desc, sets `siteData.photogallery = [{file, title (humanized), img}]`; missing folder = `[]` no error. Verified via a throwaway dump-probe through the real nunjucks task (`--debug` itself can't run through gulp-cli on node 10 - it respawns with a literal `node --debug`): empty folder -> `[]`, 3 temp photos -> newest-first with humanized titles, 4th newer drop -> first entry; `npm run build` exit 0 + guards OK; `npm test` all suites pass
- Blocked on: seed photos (H2) for sign-off only

## Context

`gulp/nunjucks.js` loads `src/_data/` via foldero into `site.data`. The photogallery needs a second, derived data source: the image folder itself (DR-0002). Same task, same stack (`fs`/`path` already imported).

## Requirements

- After the foldero load, scan `path.join(dirs.source, dirs.images, 'play', 'photography')` for `.jpg/.jpeg/.png/.webp`; sort by mtime descending; set `siteData.photogallery = [{ file, title, img }]` where `title` = basename without extension, `-`/`_` humanized to spaces, and `img` = bare filename.
- Missing folder = `siteData.photogallery = []`, no error.

## Design references

- Hooks used: foldero load pattern in `gulp/nunjucks.js`. Principles applied: design-principles #4 (no new dependency, no new config).
- Existing style refs: `gulp/nunjucks.js` (loader), `gulp/copy.js` + `gulp/imagemin.js` (the folder already ships to `images/play/photography/`).

## Acceptance criteria (agent-checkable)

- [ ] Build debug output (`--debug`) shows `site.data.photogallery` sorted newest first
- [ ] Dropping a new jpg into `src/_images/play/photography/` and re-running the nunjucks task makes it the first entry (top-left card downstream)
- [ ] Missing/empty folder: `[]`, `npm run build` passes with no error

## Manual test steps (Pedro)

- Drop a .jpg into `src/_images/play/photography/` and save
- Rebuild (`npm run build:gulp` with `--headless`, or wait for Ticket 9's watch wiring on the dev server) and open /play/photography/ (after Ticket 14): the new photo is the top-left card
- Filenames with dashes/underscores become the lightbox title, e.g. "beach-day.jpg" -> "beach day"

## Out of scope

- Thumbnail generation (grid reuses the imagemin'd image with `background-size: cover` - Ticket 11); watch wiring (Ticket 9).

## Open questions

- Seed photos (Pedro) - blocks sign-off only (H2)

---

# Ticket 9: Dev watch wiring for the photography folder

- Part of: specs/play-subpages/plan.md (DR-0002)
- Depends on: Ticket 8
- Size: S
- Type: system
- Status: DONE 2026-11-14 - evidence in evidence/t9-verify.md: dev `['nunjucks']` watcher in `gulp/watch.js` now globs `src/_images/play/photography/**/*`; `src/_images/play/photography/.gitkeep` committed so the folder exists at watch start (gulp 3 gaze misses dirs created later). Live dev-serve check: dropping a photo fired `nunjucks` + `imagemin` in the log; empty folder (just .gitkeep) still scans to `[]`; `npm run build` exit 0 + guards OK, `npm test` all suites pass

## Context

In dev, `gulp/watch.js` re-runs `['nunjucks']` only on template/data globs, so a dropped photo would not regenerate pages. The production watch already full-rebuilds via `sync-mirror`.

## Requirements

- Dev branch of `gulp/watch.js`: add `path.join(dirs.source, dirs.images, 'play', 'photography', '**/*')` to the watcher that runs `['nunjucks']`.

## Design references

- Hooks used: existing watcher arrays in `gulp/watch.js`. Principles applied: design-principles #4.

## Acceptance criteria (agent-checkable)

- [ ] The dev `['nunjucks']` watcher glob list includes the photography folder (code check + dev-serve log shows the nunjucks task firing when a file is added there)
- [ ] Gates: `npm run build` passes (watch file is build config, not shipped output)

## Manual test steps (Pedro)

- With `npm run serve` running, drop a new photo into `src/_images/play/photography/` - the terminal should show the `nunjucks` task firing, and the browser reloads
- On /play/photography/ (after Ticket 14) the new photo appears top-left without restarting the server

## Out of scope

- Production watch (already covered by `sync-mirror`).

## Open questions

- None

---

# Ticket 10: Photogrid macros - gallery branch + card `grid`/`notext` flags + lightbox data hooks

- Part of: specs/play-subpages/plan.md
- Depends on: -
- Size: S
- Type: UI
- Status: DONE 2026-11-14 - evidence in evidence/t10-verify.md: gallery `photogrid` branch renders `<div class="gallery-grid">` mapping each `photogallery` entry to `{title, img, href}` at `../../images/play/photography/<file>` via `card.content({grid: true, notext: true, lightbox: true, index: loop.index0})`; card molecule gains `card--grid` class, suppressed title span, and `data-lb-index`/`data-lb-img`/`data-lb-title` hooks; anchors keep the real image href (no-JS fallback); probe render verified all hooks + order, existing card pages unchanged; `npm run build` exit 0 + guards OK, `npm test` all suites pass

## Context

`gallery.nunjucks` switches on `contentType` ('work'/'play'/'blog'); `card.nunjucks` renders `card.href/img/title/subtitle`. The photogrid reuses the card as a textless grid cell and a lightbox trigger: anchor `href` = the full image (no-JS opens the image directly), JS intercepts for the modal (Ticket 15).

## Requirements

- `gallery.nunjucks`: new `photogrid` branch - wrapper `<div class="gallery-grid">`, loop mapping each entry to `{ title: val.title, img: '../../images/play/photography/' + val.file, href: '../../images/play/photography/' + val.file }` and rendering `card.content({card: mapped, grid: true, notext: true, lightbox: true})`.
- `card.nunjucks`: when `notext`, omit the `.card-title` span; when `grid`, add class `card--grid` to the anchor; when `lightbox`, add `data-lb-index` (loop index - pass `spec.index`), `data-lb-img` (= href), `data-lb-title` (= title).

## Design references

- Figma: n/a. Hooks used: gallery organism, card molecule. Principles applied: design-principles #4 (variant flags on the existing card, not a new component) and #2 (works without JS via the real href).
- Existing style refs: `gallery.nunjucks`, `card.nunjucks`.

## Acceptance criteria (agent-checkable)

- [ ] Rendered grid cards (via Ticket 14's page) have no text, `card--grid` class, correct `../../images/play/photography/<file>` URLs, and `data-lb-index`/`data-lb-img`/`data-lb-title` hooks
- [ ] Anchors keep the real image as `href` (no-JS fallback)
- [ ] Gates: `npm run build` passes

## Manual test steps (Pedro)

- On /play/photography/ (after Ticket 14): cards show the image only - no title or subtitle text on them
- Inspect a card (devtools): the anchor's href is the full image URL, so "open image in new tab" shows the photo even with JS off; `data-lb-index`/`data-lb-img`/`data-lb-title` attributes are present

## Out of scope

- Grid styles (Ticket 11), the page (Ticket 14), the modal behavior (Ticket 15).

## Open questions

- None

---

# Ticket 11: Photogrid styles - grid layout, red-outline-only hover

- Part of: specs/play-subpages/plan.md
- Depends on: Ticket 10
- Size: S
- Type: UI
- Status: DONE 2026-11-14 - evidence in evidence/t11-verify.md (+ t11-probe-1440/390/hover screenshots): `.gallery-grid` appended to gallery.scss (3 cols / 2 at mobile, 16px gap, square cells via aspect-ratio); card.scss gets a `.gallery-grid`-scoped hover override (red outline only, image kept via a grid-only `--vb-card-img` inline var, plate suppressed by specificity). Purely additive - worktree build diff shows all 23 existing pages byte-identical (whitespace-normalized) and /play/ + / hover still shows the red plate in a real browser. Playwright probe: 3 cols @1440, 2 @390, 16px gap, square cells, hover = `solid 2px rgb(215,55,53)` + transparent bg + image visible. `npm run build` exit 0 + guards OK, `npm test` pass, prettier clean

## Context

`card.scss` `.card-image:hover` swaps the background for a red plate (`$vb-primary`) - the photogrid must instead show a red outline only. `gallery.scss` owns `.content.gallery`; module scss is imported in `src/_styles/main.scss` (line 49).

## Requirements

- `gallery.scss`: `.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }`, 2 columns at mobile; grid cells `aspect-ratio: 1/1`.
- `card.scss`: inside `.gallery-grid`, `.card--grid .card-image:hover` / `:focus-visible` = `outline: 2px solid #d73735` (visualbear-red base) ONLY - the default background-swap hover is suppressed there; image stays visible.

## Design references

- Figma: n/a. Hooks used: card molecule styles. Principles applied: design-principles #3 (no new images, `background-size: cover` on the existing file) and #6 (brand red token, no palette drift).
- Existing style refs: `card.scss` (`&:hover` block to override), `gallery.scss`, `colour-variables.scss` (`#d73735`).

## Acceptance criteria (agent-checkable)

- [ ] Hover/focus on a grid card shows the red outline and nothing else (screenshots 1440 + 390)
- [ ] Grid is 3 columns at 1440, 2 at 390, 16px gap, square cells
- [ ] Gates: sass compiles, `npm run build` passes, prettier clean

## Manual test steps (Pedro)

- On /play/photography/, hover a grid card: a thin red outline appears and the image stays visible (no red plate swap)
- Tab to a grid card with the keyboard: the same red outline shows on focus
- At 1440px wide: 3 columns; at 390px: 2 columns; gaps 16px; cells square

## Out of scope

- Any hover change outside `.gallery-grid` (work/play/blog cards keep the red plate).

## Open questions

- None

---

# Ticket 12: Lightbox core (`lightbox-core.js`) + `npm test`

- Part of: specs/play-subpages/plan.md
- Depends on: -
- Size: S
- Type: system
- Status: DONE 2026-11-14 - evidence in evidence/t12-verify.md: `src/_modules/molecules/lightbox/lightbox-core.js` (CJS like tabs-core.js) with `stepIndex` (wraps both ways, len 0 -> -1, single item stays) and `normalizePhotos` (clean `[{img,title}]`, throws on non-array/missing fields); `scripts/test/lightbox.test.js` wired into `npm test` - all 5 suites pass incl. `lightbox.test: OK`; grep confirms no `document`/`window` in the core; `npm run build` exit 0 + guards OK

## Context

House pattern for testable JS: pure core module + DOM controller + `scripts/test/*.test.js` wired into `npm test` (see `tabs-core.js` / `scripts/test/tabs.test.js`). The lightbox needs wrap-around stepping and input validation only - no DOM.

## Requirements

- New `src/_modules/molecules/lightbox/lightbox-core.js` (CJS like `tabs-core.js`): `stepIndex(i, dir, len)` wrapping both directions; `normalizePhotos(list)` returning `[{img, title}]` and rejecting non-arrays/missing fields.
- New `scripts/test/lightbox.test.js` with asserts: forward/back wrap, single item stays, empty list safe, invalid input throws.
- `package.json` `test` script: append `&& node scripts/test/lightbox.test.js`.

## Design references

- Hooks used: `tabs-core.js` + `scripts/test/tabs.test.js` pattern. Principles applied: design-principles #4 (pure core, no DOM).
- Existing style refs: `src/_modules/molecules/tabs/tabs-core.js`, `package.json` scripts.

## Acceptance criteria (agent-checkable)

- [ ] `npm test` passes including the new suite (run output shows all three test files)
- [ ] `lightbox-core.js` has no DOM access (grep: no `document`/`window`)

## Manual test steps (Pedro)

- Terminal only: `npm test` - the output should include "lightbox.test: OK" alongside the other suites

## Out of scope

- Markup, styles, controller (Tickets 13/15).

## Open questions

- None

---

# Ticket 13: Lightbox markup + styles

- Part of: specs/play-subpages/plan.md
- Depends on: -
- Size: S
- Type: UI
- Status: open

## Context

No modal exists in `src/`. The dialog markup renders hidden by default on the photography page (Ticket 14 includes the macro) and is shown by the controller (Ticket 15). Arrows reuse the buttonslider `<` / `>` style.

## Requirements

- `lightbox.nunjucks` macro `content(spec)`: `<div class="lightbox" hidden role="dialog" aria-modal="true" aria-label="Photo viewer">`, backdrop, `<figure>` with `img.lightbox-img` + `figcaption.lightbox-caption` (the small bottom title), prev/next buttons (`class="btn vb-btn"`, text `<` / `>`), close button top-right with `aria-label="Close"`.
- `lightbox.scss`: fixed overlay `inset: 0`, dark plate; image `max-height: 80vh; max-width: 90vw`; caption small, bottom-center, ink with contrast >= 4.5:1 on the plate; all buttons >= 44x44; `:focus-visible` outline; `[hidden]` respected; `prefers-reduced-motion` disables transitions.
- Import `lightbox.scss` in `src/_styles/main.scss` (next to the other molecule imports, ~line 46).

## Design references

- Figma: n/a. Hooks used: `buttonslider` arrow style, `tabs.scss` `[hidden]` pattern. Principles applied: design-principles #2 (targets >= 44px, contrast >= 4.5:1, visible focus, reduced motion) and #4 (one modal, no extra chrome).
- Existing style refs: `buttonslider.nunjucks`/`buttonslider.scss`, `_case-study.scss` ink values, `tabs.scss`.

## Acceptance criteria (agent-checkable)

- [ ] Sass compiles with the new import; the macro renders the dialog markup hidden on the photography page (after Ticket 14)
- [ ] Buttons >= 44x44, caption contrast >= 4.5:1 (probe), `role="dialog"` + `aria-modal` present
- [ ] Gates: `npm run build` passes, prettier clean

## Manual test steps (Pedro)

- On /play/photography/ (after Ticket 14), inspect the DOM: the `.lightbox` dialog exists but is `hidden`
- In devtools, measure the arrow and close buttons: each at least 44x44px

## Out of scope

- Controller behavior (Ticket 15); applying the dialog anywhere else.

## Open questions

- None

---

# Ticket 14: `/play/photography/` page - grid + data JSON + dialog

- Part of: specs/play-subpages/plan.md
- Depends on: Tickets 8, 10, 13
- Size: S
- Type: UI
- Status: open
- Blocked on: seed photos (H2) for sign-off only

## Context

The photogallery has no hero (Pedro's rule) - just the grid. The lightbox controller (Ticket 15) needs the photo array in the DOM: embed it as JSON.

## Requirements

- New `src/play/photography/index.nunjucks`: extends `_layouts/gallery.nunjucks`, `baseUrl = '../../'`, NO hero call - just `gallery.content({content: site.data.photogallery, contentType: 'photogrid'})`.
- Same page includes `lightbox.content({})` (dialog markup) and `<script type="application/json" id="photogrid-data">{{ site.data.photogallery | dump | safe }}</script>`.

## Design references

- Figma: n/a. Hooks used: gallery organism `photogrid` branch, lightbox macro, nunjucks `dump` filter. Principles applied: design-principles #4 and #5.
- Existing style refs: `src/play/index.nunjucks` (layout sibling), `gallery.nunjucks`, DR-0002.

## Acceptance criteria (agent-checkable)

- [ ] `/play/photography/` renders no hero (no h1), just the grid; newest file in the folder is the top-left card
- [ ] `#photogrid-data` JSON matches `site.data.photogallery` order; dialog markup present and `hidden`
- [ ] Empty folder: empty grid, valid empty JSON, no template errors; `npm run build` passes

## Manual test steps (Pedro)

- Open http://localhost:3000/play/photography/: no hero or big title - the grid starts at the top; the newest photo in the folder is the top-left card
- Devtools console shows no errors; the `#photogrid-data` script tag contains the photo list as JSON, in grid order

## Out of scope

- Lightbox behavior (Ticket 15); seed photos (assets).

## Open questions

- None

---

# Ticket 15: Lightbox controller + boot

- Part of: specs/play-subpages/plan.md
- Depends on: Tickets 10, 12, 13, 14
- Size: S
- Type: UI + system
- Status: open

## Context

Controllers boot from `src/_scripts/main.js` on `DOMContentLoaded` (see `tabs.init()`). The page provides `#photogrid-data` JSON and grid anchors with `data-lb-*` hooks (Ticket 10).

## Requirements

- `lightbox.js`: on boot, if `#photogrid-data` exists, parse it via `normalizePhotos`; delegate clicks on `.gallery-grid a[data-lb-index]` → `preventDefault`, open the dialog at that index; render `img.src` + caption; prev/next buttons and ArrowLeft/ArrowRight step via `stepIndex` (wrap); close button, Esc, and backdrop click close; focus moves to the close button on open and returns to the clicked anchor on close; `document.body` scroll locked while open; `hidden` attribute toggles visibility.
- Boot: `require` + `init()` in `src/_scripts/main.js`.

## Design references

- Hooks used: `tabs.js` controller pattern, `main.js` boot. Principles applied: design-principles #2 (keyboard parity, focus management, reduced motion via CSS) and #4.
- Existing style refs: `src/_modules/molecules/tabs/tabs.js`, `src/_scripts/main.js`.

## Acceptance criteria (agent-checkable)

- [ ] Click a thumb → modal opens with that image + bottom title; arrows/keys step through all photos and wrap; Esc/backdrop/close all close; focus returns to the card
- [ ] Single-photo grid: arrows render, stepping stays on the one photo; empty grid: no modal triggers, no errors
- [ ] A11y: dialog semantics + focus behavior asserted (Playwright probe at 1440 + 390), axe clean; Gates: `npm test`, `npm run build`, visuaibear-review pass; screenshots in evidence/

## Manual test steps (Pedro)

- On /play/photography/, click a thumbnail: the modal opens on that photo with its title at the bottom
- Right arrow button / Right-arrow key steps forward and wraps after the last photo; left arrow / Left-arrow wraps back to the last
- Esc, clicking the dark backdrop, and the X button each close the modal; focus returns to the thumbnail you clicked
- With exactly one photo in the folder: the arrows keep you on that photo

## Out of scope

- Zoom/pan/download/share in the modal.

## Open questions

- Caption = humanized filename (default, DR-0002)

---

# Ticket 16: Verify the feature end to end

- Part of: specs/play-subpages/plan.md
- Depends on: Tickets 1-15
- Size: S
- Type: system
- Status: open

## Context

House gates: `npm run build` (release), `npm test`, `npm run lint`, prettier `format:check`, `visuaibear-review` on changed pages, `visuaibear-prototype` capture loop at 1440 + 390.

## Requirements

- Run the full gate set on `/`, `/play/`, `/play/blog/`, `/play/blog/hello-world/`, `/play/photography/` plus the lightbox open state, at 1440 + 390.
- File screenshots + verify notes in `specs/play-subpages/evidence/`.
- Confirm both authoring flows once each: new post (Ticket 7 flow), new photo (Ticket 8 flow).

## Design references

- Hooks used: `visuaibear-review` gates, `visuaibear-prototype` capture loop. Principles applied: visuaibear-core #4 (done is machine-checkable) and #5 (nothing ships unseen).

## Acceptance criteria (agent-checkable)

- [ ] All gates pass; evidence files committed under `specs/play-subpages/evidence/`
- [ ] No regressions on existing pages (`/`, a case study, `/workflow/`) - spot-check screenshots

## Manual test steps (Pedro)

- Run the gates yourself: `npm run build`, `npm test`, `npm run lint`, `npm run format:check` (expect only the 11 pre-existing `specs/visualbear-system/` prettier warnings, nothing new)
- Walk the whole flow once at 1440px and once at 390px: / -> thinner Play card -> /play/ -> Blog card -> /play/blog/ -> top card -> post page -> "< Blog" back; /play/ -> Photography card -> /play/photography/ -> click a photo -> step with arrows -> close

## Out of scope

- Anything outside the five pages listed above.

## Open questions

- None
