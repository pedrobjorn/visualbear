Requirement source for every ticket in this file: Pedro's requests 2026-11-24 (see plan.md Problem - the requests ARE the requirements). Anything not traceable to those requests is marked ASSUMPTION. Tickets are ordered by dependency - build top-down. Parents: specs/case-study-nav/ (Ticket 4 scroll-spy lands here), specs/case-study-nav-v2/ (shipped as c225095; DR-0002 superseded at bar level by v3 DR-0001).

---

# Ticket 1: Condensed per-page `nav:` lists (labels <= 24 chars) for the 4 fallback pages + gate + tests

- Part of: specs/case-study-nav-v3/plan.md (DR-0003)
- Depends on: -
- Size: S
- Type: copy + system

## Context

v2 Ticket 1 built the `nav:` front-matter list (max 5, ids validated against `##` ids, >5 or unknown id throws, fallback = first 5 sections with label = full primary title) plus the draft path (`Nav: Label | id` head lines in `src/_data/drafts/<slug>.txt` -> `draft-to-md.js` -> page md -> `mdToc`; back via `md-to-draft.js`; vocabulary enforced by `verify-page-md.js` gate 1b). Only teachr has a list today; the other 4 pages render the fallback, whose full titles are the long links (measured: fashion "Future Improvements, Based on Learnings" = 362px, sports row 1052px > 884px content column at 1440 - evidence/measurements-2026-11-24.md section 2/5).

## Requirements

- Add `Nav:` lines to `src/_data/drafts/fashion-rebrand.txt`, `sports-ecommerce-redesign.txt`, `digital-closet.txt`, `teachr-agent.txt` with the proposed condensed lists (DR-0003; Pedro confirms/edits - defaults: fashion = Context#context, Deep-Dive#deep-dive, Process#process, Outcomes#outcomes, Future & Learnings#future; sports = Problems#definition, Brand & Process#exploration, Site Redesign#site-redesign, Rollout#site-delivery, Outcome#site-outcome; closet = Problem#definition, Research#research, Flows & Validation#discovery, Design System#delivery, Outcome#outcome; teachr-agent = Outcomes#outcomes, Process#process, Problem#problem, Research#research, Discovery#discovery). Then re-run the text-to-md conversion to regenerate the 4 page mds (round-trip byte-identical check as in v2 t1-verify).
- teachr's list stays as shipped in v2 (starts at Outcomes); whether "Deepdive: Teachr Assistant" (27 chars) condenses to "Assistant" is a plan Open question - default: keep, grandfather above the cap.
- `verify-page-md.js` gate 1b: each `nav:` entry's `label` must be <= 24 chars (ASSUMPTION, one constant) in addition to the existing label+id-only / <=5 / id-matches rules.
- AUTHORING.md `nav:` contract: document the 24-char cap.
- `scripts/test/cs-nav.test.js`: assert the exact label|id list per page (all 5 pages now have explicit configs; teachr = the v2 5); assert a synthetic nav label of 25 chars fails the verify-page-md gate function; keep the existing >5-throws / unknown-id-throws / config-order / href-parity assertions.

## Design references

- Hooks used: `mdToc` + `splitFrontmatter`, text-to-md tools (`draft-to-md.js`, `md-to-draft.js`, `verify-page-md.js`). Principles applied: bounded authoring vocabulary (verify-page-md pattern), single source of truth (ids validated against the same `##` parse as mdPage), no blast radius (teachr list untouched; renderer runtime rules unchanged).

## Acceptance criteria (agent-checkable)

- [ ] `npm test` green: cs-nav.test asserts the exact 5 label|id pairs on each of the 5 pages (teachr unchanged from v2), the 25-char label gate rejection, and all pre-existing v2 assertions.
- [ ] Each regenerated page md front matter contains its `nav:` list; `verify-page-md` passes on all 5 page mds and rejects a bad-length label on a fixture; text-to-md goldens PASS.
- [ ] `npm run build` exit 0 + release-guard OK; built HTML of each page shows the condensed labels (fashion-rebrand's longest link text is "Future & Learnings", not the 33-char title).
- [ ] Gates: prettier `format:check` clean on edited js/md (not `src/_data/pages/`).

## Out of scope

- CSS width/active state (Tickets 2/3), verification captures (Ticket 4), any renderer change to mdToc's throw rules.

## Open questions

- Exact labels per page and the cap value - owner Pedro (defaults in DR-0003; fallback ships the proposed lists).

---

# Ticket 2: CSS - bar matches the body content width; option buttons expand to fill it equally

- Part of: specs/case-study-nav-v3/plan.md (DR-0001; supersedes v2 DR-0002 at bar level)
- Depends on: Ticket 1
- Size: M
- Type: UI
- Status: SHIPPED 2026-11-24 as 4139434 (evidence/t2-verify.md) - BAR-level reading corrected by Pedro same day ("the menu was correct before, it should be full width"): superseded at bar level by DR-0005, reworked in Ticket 5. The row-level rules shipped here (equal-fill li/a.btn, ellipsis + title) STAND.

## Context

`.cs-index` today: `width: 100vw; margin-left: calc(50% - 50vw)` full-bleed (`_case-study.scss` .cs-index block), sticky top 48, z-index 1, bg `var(--cs-head-bg)`, border-bottom 1px `var(--cs-accent)`, padding 0, height pinned 35px via `--cs-index-h`; `ul` flex, `gap: 0`, `justify-content: center`, `padding: 0`, `overflow-x: auto`, `white-space: nowrap`; `li` flex; `a.btn` full-height ghost 2/3 (`padding: 7px 8px`). The nav is rendered inside `.document-text` (`.text-box`: `$content-width: 916px`, padding 16, border-box; section content edges measured 278/1162 at 1440, 16/752 at 768, 16/374 at 390). Bar height and sticky mechanics do not change.

## Requirements

- Bar width: remove `width: 100vw` and `margin-left: calc(50% - 50vw)` from `.cs-index`; the bar becomes a normal block (`width: 100%` of the `.document-text` content box), so its left/right edges equal the `.cs-section` content edges at every viewport.
- Expanding options: `li { flex: 1 1 0; min-width: 0; }` and `a.btn { width: 100%; }` (keep `display: flex; align-items: center; justify-content: center` on the anchor so the label centers in the expanded button). `ul` keeps `gap: 0` (buttons touch); `justify-content: center` may stay (no-op when the row fills) or go - keep it, harmless. Max 5 buttons -> each is bar-width/5 (176.8px at 1440).
- Overflow edge (ASSUMPTION): on the anchor add `overflow: hidden; text-overflow: ellipsis;` (keep `white-space: nowrap`); the `ul` keeps `overflow-x: auto` as a fallback but with equal flex the row only overflows if a single label's min-content exceeds its share. `mdToc` adds `title="<label>"` to each anchor so the full label stays available (renderer change: one attribute, covered by tests).
- Unchanged: sticky `top: 48px`, `z-index: 1`, bg `var(--cs-head-bg)`, `border-bottom: 1px solid var(--cs-accent)`, `padding: 0`, `height: auto`, `--cs-index-h: 35px`, ghost button recipe, `:focus-visible` outline, `scroll-margin-top` consumers. The stuck bar is content-width too (floats centered under the header) - accepted in DR-0001.
- `scripts/test/cs-nav.test.js` CSS-contract block: replace the full-bleed assertions (`width: 100vw`, `margin-left: calc(50% - 50vw)`) with assertions that the `.cs-index` block contains NO `100vw` and NO `calc(50% - 50vw)`, plus source assertions for `flex: 1 1 0` on li and `width: 100%` + `text-overflow: ellipsis` on the anchor; assert `mdToc` emits `title=` on anchors.

## Design references

- Style refs: `.text-box` content width (`_gallery.scss` .text-box blocks, `$content-width`), v2 ghost button recipe in the same block. Principles applied: one content width site-wide (DR-0013), no new layout math (the bar inherits the column instead of computing 50vw), height stays pinned by the single `--cs-index-h` variable.

## Acceptance criteria (agent-checkable)

- [ ] Playwright 1440x900, 768x1024, 390x844 on all 5 pages at page top: `.cs-index` rect left/right == first `.cs-section` content rect (e.g. its `h2`) left/right within 0.5px (1440: 278/1162; 768: 16/752; 390: 16/374); gap cover->nav still 0; bar height still 35 == `--cs-index-h`.
- [ ] Buttons: all 5 anchors equal width within 0.5px; row width (last.right - first.left) == bar content width within 0.5px; consecutive links still touch within 0.5px; anchor height == bar - 1.
- [ ] After scrolling 800px: bar top == 48, sticky, bg == `nav.site-nav` bg, bar width still the content width.
- [ ] At 390: `scrollingElement.scrollWidth <= 390`; an over-long label shows `text-overflow: ellipsis` computed and the anchor carries `title`.
- [ ] `npm test` + `npm run build` + release-guard green; captures `evidence/cs-nav-v3-{page}-{1440,768,390}-{top,stuck}.png`.
- [ ] prettier `format:check` clean on edited files.

## Out of scope

- Ticket 1 labels/gate, Ticket 3 spy + active line, Ticket 4 wiring, header/hero/meta changes.

## Open questions

- Equal-fill vs natural-width (DR-0001 chose equal-fill); ellipsis vs scroll strip at narrow widths (plan Open questions).

---

# Ticket 3: Scroll-spy sets exactly one `aria-current="true"`; active state = 3px `--cs-index-active` line AND underlined anchor (DR-0002 amended by DR-0008)

- Part of: specs/case-study-nav-v3/plan.md (DR-0002 + DR-0008; lands parent specs/case-study-nav/tickets.md Ticket 4, currently TODO)
- Depends on: Ticket 7
- Size: M
- Type: UI + system

## Context

Measured 2026-11-24: 0 `aria-current` attributes at runtime on any page (even scrolled to a section); `build/scripts/main.js` has no aria-current code; the CSS rule `a[aria-current='true'] { text-decoration: underline; text-underline-offset: 4px }` (`_case-study.scss:223`) is dead. Parent Ticket 4 specified: vanilla IntersectionObserver, rootMargin `-48px 0px -<bar> 0px`, exactly one aria-current under the stuck bar, none above the first section, script only on case-study pages. Stuck bar occupies top 48..83 (48 header + 35 bar). Pedro 2026-11-24 on top of DR-0002: "also consider having the anchor underlined when in the section" - so active = 3px inset line in `--cs-index-active` AND underline (DR-0008). Scope is now 8 pages: the 5 md case-study shells plus the 3 legacy pages from Ticket 7 (DR-0007), whose sections are `.cs-nav-target` containers, not `.cs-section`.

## Requirements

- New scoped script `src/_scripts/cs-index.js`, booted from `src/_scripts/main.js` (one require + one init call, same pattern as tabs/lightbox/photoview; the module no-ops when no `.cs-index` exists, so blog/workflow/home pages never get aria-current): IntersectionObserver on `.case-study .cs-section, .case-study .cs-nav-target` with `rootMargin: -48px 0px -<barH>px 0px` where barH is read from the `.case-study` computed `--cs-index-h` (single height source). Track intersecting sections; when at least one intersects, set `aria-current="true"` on the matching `.cs-index a[href="#id"]` for the topmost intersecting section and remove it from all other links; when none intersect (hero zone), remove from all. No library, no animation. Also set aria-current immediately on anchor click for snappy feedback.
- CSS token (DR-0008 placement): `.case-study { --cs-index-active: #fff; }` next to `--cs-accent` - the DEFAULT bar bg is brand red (`body` `--cs-head-bg` in nav.scss) and the un-themed pages are exactly the red-bar ones (digital-closet + the 3 legacy pages), so white is the safe default; beside the existing `body.cs-pink-page / cs-black-page / cs-teal-page { --cs-head-bg }` blocks add `body.cs-pink-page .case-study, body.cs-black-page .case-study, body.cs-teal-page .case-study { --cs-index-active: #{$vb-primary}; }` (red line on pink/black/teal).
- `a[aria-current='true']` rule becomes: `box-shadow: inset 0 -3px 0 var(--cs-index-active); text-decoration: underline; text-underline-offset: 4px;` (line + underline per DR-0008; hover/focus keep the plain white underline, the line distinguishes active). Because the anchor is full bar height, the inset line sits flush on the bar's bottom border.
- `scripts/test/cs-nav.test.js`: source assertions - `.case-study` defines `--cs-index-active`; the 3 themed `body.<class> .case-study` overrides set `#{$vb-primary}`; the aria-current rule uses `var(--cs-index-active)` + `inset 0 -3px` + `text-decoration: underline` (no `text-decoration: none` in that rule); `src/_scripts/cs-index.js` exists, is required by `main.js`, uses IntersectionObserver over `.cs-section, .cs-nav-target`, reads `--cs-index-h`; blog/workflow/home templates contain no `.cs-index`.

## Design references

- Hooks used: IntersectionObserver pattern from parent Ticket 4 spec; token pattern `--cs-head-bg`/`--cs-accent` on `.case-study`. Principles applied: state must not rely on color alone (line + position, and keyboard focus keeps the white outline), single height variable (`--cs-index-h` feeds both scroll-margin and the spy's rootMargin), ghost stays ghost (line, not fill, per v2 DR-0005).

## Acceptance criteria (agent-checkable)

- [ ] Playwright 1440x900, 768x1024, 390x844 on ALL 8 pages (5 md + art-ent, climate-clock, steam-mobile): scrolled into a mid-page section (e.g. `#discovery`) -> exactly one `.cs-index a[aria-current="true"]`, it is `a[href="#discovery"]`, computed `box-shadow` includes the `--cs-index-active` color, `text-decoration-line` is `underline`; scroll to top -> zero aria-current; clicking a nav link sets aria-current immediately.
- [ ] Contrast/visibility: on digital-closet AND the 3 legacy pages (red bar) computed `--cs-index-active` resolves to #ffffff; on teachr / fashion-rebrand / sports-ecommerce-redesign / teachr-agent (teal/black/pink) to #d73735.
- [ ] `npm test` green (new source assertions), `npm run build` + release-guard exit 0.
- [ ] Captures: `evidence/cs-nav-v3-teachr-1440-active.png` + `evidence/cs-nav-v3-art-ent-1440-active.png` (scrolled mid-page, line + underline visible) + stuck captures.
- [ ] prettier `format:check` clean on edited js/scss.

## Out of scope

- Tickets 1/2/5/6/7, new-tab links (parent Ticket 5), reduced-motion animation (none added), header changes.

## Open questions

- None blocking - DR-0008 resolved the token default (white on the default red bar) and the underline addition.

---

# Ticket 4: End-to-end verification

- Part of: specs/case-study-nav-v3/plan.md
- Depends on: Tickets 1, 3, 5, 6, 7
- Size: S
- Type: research

## Context

v2 Ticket 3 pattern: `npm test`, `npm run build` + release-guard, Playwright 1440/768/390 on all 5 case-study pages, visuaibear-review gates, evidence into `specs/case-study-nav-v3/evidence/`.

## Requirements

- Run `npm test` (cs-nav.test.js updated per Tickets 1-3) - green.
- Run `npm run build` + release-guard - exit 0.
- Playwright at 1440x900, 768x1024 and 390x844 on all 8 pages (5 md + art-ent, climate-clock, steam-mobile per DR-0007): per page assert the Ticket 5 BAR criteria (full-bleed bar 0..viewport, gap 0, barH 35 = `--cs-index-h`, sticky top 48 + bg match when stuck) and the Ticket 6 ROW criteria (DR-0006: ul = 916px container 262/1178 @1440, full width below; space-between; natural-width buttons, first/last touch the row edges when the row fits, internal strip scroll at 390 with no page h-scroll; no clipped buttons) plus the Ticket 3 spy criteria (all 8 pages); labels = the condensed per-page lists; gap cover->nav == 0 (measure_gap.py); scroll-margin landing >= 83px; no page-level h-scroll at 390; 0 `data-ai` on the changed pages. Save captures to `evidence/`.
- Run visuaibear-review gates on the changed pages; record pass/fail in `evidence/t4-verify.md` together with the test/build/Playwright output (ALL_OK) and the capture list. Note the AI-attribution gate: production build must contain 0 `data-ai` attributes on the changed pages.

## Acceptance criteria (agent-checkable)

- [x] `evidence/t4-verify.md` exists with test output, build output, Playwright assertion results (ALL_OK), review-gate table, and capture file list. DONE 2026-11-24.
- [x] visuaibear-review report passes (or each failure is dispositioned in the verify file). DONE 2026-11-24 - all gates PASS (one dispositioned minor note: 35px touch height inherited from the frozen v2 bar height, plan non-goal).

## Out of scope

- Any new feature work.

---

# Ticket 5: Rework of Ticket 2 at bar level - full-bleed bar, link row constrained to the body content width (DR-0005)

- Part of: specs/case-study-nav-v3/plan.md (DR-0005; supersedes DR-0001 at bar level, keeps its row-level rules)
- Depends on: Ticket 2 (shipped 4139434)
- Size: S
- Type: UI

## Context

Pedro 2026-11-24: "The menu was correct before, it should be full width. The LINK OPTIONS are what should be limited to the width of the content container, and spread to take up the space." Ticket 2 shrank the `.cs-index` bar itself to the content column (4139434); this ticket restores the pre-v3 full-bleed bar and moves the content-width constraint to the `ul` link row. Current `.cs-index` block state (post-4139434): no full-bleed pair; `ul { display: flex; align-items: stretch; justify-content: center; gap: 0; margin: 0; padding: 0; list-style: none; overflow-x: auto; white-space: nowrap; }`; `li { display: flex; flex: 1 1 0; min-width: 0; }`; `a.btn { display: flex; align-items: center; justify-content: center; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 100%; ... ghost recipe }`. Content column (evidence/measurements-2026-11-24.md): `.document-text` = `$content-width: 916px` border-box, `padding: 0 16px` (edge-alignment DR-0002) -> content edges 278/1162 at 1440, 16/752 at 768, 16/374 at 390. The full-bleed bar is exactly viewport-aligned (margin-left calc(50% - 50vw) inside the centered 916px container), so an auto-centered row inside it lands on the same edges as the content column.

## Requirements

- `.cs-index`: restore `width: 100vw;` and `margin-left: calc(50% - 50vw);` and reword the block comment to DR-0005 (bar = viewport at every width; stuck bar matches the header edge-to-edge). Every other bar property unchanged: `position: sticky; top: 48px; z-index: 1; box-sizing: border-box; background-color: var(--cs-head-bg); border-bottom: 1px solid var(--cs-accent); padding: 0; height: auto; font-size: 14px; line-height: 20px;`.
- `ul`: change `margin: 0` to `margin: 0 auto;` and add `width: calc(100% - 32px); max-width: calc(#{$content-width} - 32px);` (32px = 2 x the 16px `.text-box` padding). Keep `display: flex; align-items: stretch; justify-content: center; gap: 0; padding: 0; list-style: none; overflow-x: auto; white-space: nowrap;`.
- `li` and `a.btn`: NO change (Ticket 2 row-level rules stand: `flex: 1 1 0; min-width: 0` on li; `width: 100%; justify-content: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 100%` + ghost recipe on a.btn).
- No renderer change (`title="<label>"` already shipped in Ticket 2).
- `scripts/test/cs-nav.test.js` CSS-contract block: on the `.cs-index` region require the full-bleed pair again (`width:\s*100vw;` and `margin-left:\s*calc\(50% - 50vw\);`) and drop the no-`100vw` / no-`calc(50% - 50vw)` assertions; on the `ul` region require `margin:\s*0 auto;`, `width:\s*calc\(100% - 32px\);` and `max-width:\s*calc\(#\{\$content-width\} - 32px\);`; keep all Ticket 2 li/a.btn assertions and the `title=` mdToc assertions.

## Design references

- Hooks: `$content-width` (`src/_styles/utilities/_variables.scss:40`), `.text-box { padding: 0 16px }` (`_gallery.scss`, edge-alignment DR-0002). Principles: one content width site-wide (DR-0013); bar = chrome, full-bleed like the fixed header and hero cover; links = content, aligned to the column.

## Acceptance criteria (agent-checkable)

- [ ] Playwright 1440x900, 768x1024, 390x844 on all 5 pages at page top: `.cs-index` rect == 0..viewport (1440: 0/1440 w 1440; 768: 0/768; 390: 0/390); `ul` rect left/right == first `.cs-section h2` rect left/right within 0.5px (278/1162; 16/752; 16/374); all 5 anchors equal width within 0.5px (176.8px at 1440); row width (last.right - first.left) == ul width within 0.5px; consecutive links touch within 0.5px; anchor height == bar height - 1; bar height == 35 == `--cs-index-h`.
- [ ] Gap cover->nav == 0 at 1440x900 and 390x844 via `/tmp/measure_gap.py` on the built site (localhost:8791).
- [ ] After `scrollTo(0, 800)`: bar top == 48, `position: sticky`, bg == `nav.site-nav` bg, bar still full-bleed 0..viewport, ul still == content edges.
- [ ] At 390: `scrollingElement.scrollWidth <= 390`; an anchor computes `text-overflow: ellipsis` + `overflow: hidden` and carries `title` == its label.
- [ ] `npm test` green with the flipped/added source assertions; `npm run build` + release-guard exit 0; prettier `format:check` clean on edited files.
- [ ] Captures regenerated: `evidence/cs-nav-v3-{page}-{1440,768,390}-{top,stuck}.png`.

## Out of scope

- Ticket 3 scroll-spy + active line, Ticket 4 full verification, Ticket 1 labels, any change to the li/a.btn row-level rules or the mdToc renderer.

## Open questions

- None blocking. The `32px` in the ul calc is 2 x 16px `.text-box` padding (edge-alignment DR-0002); if that padding ever becomes a variable, the calc should consume it.

---

# Ticket 6: Natural-width options spread edge-to-edge in the content-width row; labels condensed to simple terms (DR-0006)

- Part of: specs/case-study-nav-v3/plan.md (DR-0006; supersedes the equal-fill reading of DR-0001/DR-0005 at button level)
- Depends on: Ticket 7
- Size: M
- Type: UI + copy

## Context

Pedro 2026-11-24: "adapt the buttons inside cs-index to be better organised: left most and right most options touch the edges. Don't cut off the button widths. instead just use simple terms like Deepdive, etc". On the Ticket 5 build the equal-fill buttons clip labels mid-word at 1440 and collapse at 390 (evidence/t5-verify.md captures). Bar/row level stays as DR-0005 shipped: full-bleed bar, `ul` row constrained to the content width.

## Requirements

- Copy (drafts -> page mds): new `Nav:` labels - fashion-rebrand: Context, Deep-Dive, Process, Outcomes, Future; sports-ecommerce-redesign: Problems, Process, Redesign, Rollout, Outcome; digital-closet: Problem, Research, Flows, Design, Outcome; teachr: Outcomes, Context, Discovery, Design, Deepdive; teachr-agent: unchanged (Outcomes, Process, Problem, Research, Discovery). Edit the `Nav: Label | id` head lines in `src/_data/drafts/<slug>.txt` (ids unchanged), regenerate the 4 page mds via `node specs/text-to-md/tools/draft-to-md.js <draft> <slug>`, round-trip byte-identical (md-to-draft back to the draft minus note lines), `verify-page-md.sh` PASS on all 5 pages, goldens PASS.
- CSS (`_case-study.scss` `.cs-index`): `ul` gets `justify-content: space-between` (replaces `center`) and `width: 916px; max-width: 100%;` (the content container border box = `$content-width`, Pedro's edit; below 900 the container is full-width); `li` back to plain `display: flex` - remove `flex: 1 1 0` and `min-width: 0`; `a.btn` removes `width: 100%` (keep `display: flex; align-items: center; justify-content: center`, the `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` safety trio, `height: 100%`, ghost recipe). `ul` keeps `gap: 0; margin: 0 auto; padding: 0; overflow-x: auto; white-space: nowrap`. Bar block unchanged (full-bleed, sticky top 48, z-index 1, `--cs-head-bg`, 35px).
- `scripts/test/cs-nav.test.js`: `PAGE_NAV` updated to the new label lists; CSS contract - ul requires `justify-content: space-between`, `width: 916px`, `max-width: 100%`; li must NOT contain `flex: 1 1 0` or `min-width: 0`; a.btn must NOT contain `width: 100%`; ellipsis/`title=`/full-bleed assertions stay.

## Design references

- Hooks: `mdToc` + `splitFrontmatter`, text-to-md tools (`draft-to-md.js`, `md-to-draft.js`, `verify-page-md.js`), `$content-width` / `.text-box` 16px padding. Principles: bounded authoring vocabulary (verify-page-md pattern), one content width (DR-0013), no blast radius (teachr-agent list untouched; bar mechanics untouched).

## Acceptance criteria (agent-checkable)

- [ ] `npm test` green with the new `PAGE_NAV` lists and flipped CSS assertions; text-to-md goldens PASS; `verify-page-md` passes all 5 page mds.
- [ ] `npm run build` exit 0 + release-guard OK; prettier `format:check` clean on edited files.
- [ ] Playwright 1440x900, 768x1024, 390x844 on all 5 pages: ul left/right == `.document-text` border-box left/right within 0.5px (262/1178 at 1440, 0/768 at 768, 0/390 at 390); at 1440/768 first anchor left == ul left and last anchor right == ul right within 0.5px (edge options touch the edges); no anchor clipped at any width (each anchor scrollWidth <= clientWidth + 1); at 390 page scrollWidth <= 390 and first anchor flush left; li computed flex-grow == 0; bar full-bleed 0..viewport; gap cover->nav == 0 (measure_gap.py); stuck top 48 + header-matched bg; bar height 35.
- [ ] Captures regenerated `evidence/cs-nav-v3-{page}-{1440,768,390}-{top,stuck}.png`; evidence/t6-verify.md records results.

## Out of scope

- Ticket 3 spy/active line, Ticket 4 full verification, bar or row width changes, header/hero changes.

## Open questions

- Exact final labels per page - owner Pedro; defaults above (single simple terms, ids unchanged).

---

# Ticket 7: Extend the cs-index section nav to the sectioned legacy case studies (art-ent, climate-clock, steam-mobile) (DR-0007)

- Part of: specs/case-study-nav-v3/plan.md (DR-0007; applies DR-0005 + DR-0006)
- Depends on: Ticket 7
- Size: M
- Type: UI + system

## Context

The five md case studies share the nav via the `.case-study` shell + `mdtoc`. The legacy hardcoded pages art-ent, climate-clock, steam-mobile have section structure (adhops / projectile-lynx have none - out of scope, confirmed with Pedro). All `.case-study` styles target `.cs-*` classes except a bare `h1 { margin: 0 }`, which must be re-scoped under `.cs-hero` so legacy hero h1s (headline molecule) are untouched. Full md migration of these pages is the phase-4 backlog (specs/md-case-study-editor) - NOT this ticket; the nav markup is hardcoded but byte-format identical to mdToc's output so migration can drop in later.

## Requirements

- Templates `src/{art-ent,climate-clock,steam-mobile}/index.nunjucks`:
  - `<article>` gains the `case-study` class (e.g. `class="section section-top-padding case-study"`).
  - Insert the nav directly after the hero, before the first content block: `<nav class="cs-index" aria-label="Case study sections"><ul><li><a class="btn" href="#id" title="Label">Label</a></li>...</ul></nav>` (no whitespace between tags, same as mdToc).
  - Nav lists (simple terms, max 5): art-ent = Discover#discovery, Define#definition, Iterate#iteration, Implement#implementation, Conclusion#conclusion; climate-clock = Overview#definition, Branding#iteration, Site#site, Display#display, Lessons#lessons; steam-mobile = Process#process, Research#research, Identity#identity, Results#results, Lessons#lessons.
  - Add the missing target ids and the `cs-nav-target` class on each target container: art-ent conclusion container; climate-clock site/display/lessons containers (leave the duplicate id="iteration" block alone - not a target); steam-mobile process/research/visual/results/lessons containers. Existing ids (discovery, definition, iteration, implementation on art-ent; definition, iteration on climate-clock) also get `cs-nav-target` added to their class list.
- `_case-study.scss`:
  - Move the bare `h1 { margin: 0; }` (ticket 44 comment) from `.case-study` level into the `.cs-hero` block, so the selector becomes `.case-study .cs-hero h1` - the 5 md pages are unaffected (their h1 is in `.cs-hero`), legacy hero h1s keep their margins.
  - Add inside `.case-study`, next to `.cs-section`: `.cs-nav-target { scroll-margin-top: calc(48px + var(--cs-index-h, 40px)); }`.
  - Nothing else changes - the `.cs-index` block (full-bleed bar, 916px/max-100% space-between row, natural-width buttons, ellipsis+title) applies via the article class as-is.
- `scripts/test/cs-nav.test.js`: new legacy block - for each of the 3 pages assert the article has `case-study`, the template contains the exact `<nav class="cs-index"...>` markup with the exact label|id list in order, the nav sits after the headline macro call, every target id exists in the template and its container carries `cs-nav-target`; scss assertions: no bare 2-space `h1 {` selector remains in \_case-study.scss, `.cs-nav-target` scroll-margin rule exists under `.case-study`, `.cs-hero` contains the `h1` rule.

## Design references

- Hooks: `.case-study` scoping pattern (all styles under one class, "to avoid leaking" - file header), `mdToc` markup format, `--cs-index-h` single height variable. Principles: no blast radius (legacy pages' other styles untouched - only `.cs-index` + vars activate), same structure everywhere.

## Acceptance criteria (agent-checkable)

- [ ] `npm test` green incl. the new legacy block; `npm run build` + release-guard exit 0; prettier `format:check` clean on edited files.
- [ ] Playwright 1440x900, 768x1024, 390x844 on art-ent, climate-clock, steam-mobile: bar rect == 0..viewport; ul == 916px centered (262/1178 at 1440; 0/768; 0/390); at 1440/768 first anchor left == ul left and last anchor right == ul right within 0.5px; no anchor clipped at any width (scrollWidth <= clientWidth + 1); li computed flex-grow == 0; bar height 35 == `--cs-index-h`; nav is the hero's next sibling (no elements between); after scrollTo(0, 800) bar top == 48, sticky, bg == `nav.site-nav` bg; clicking each nav link lands the target at rect top >= 83 within 1px (48 + 35); page scrollWidth <= viewport at 390; legacy page hero h1 computed margin unchanged vs before (margin-top/bottom as pre-change).
- [ ] Captures `evidence/cs-nav-v3-{art-ent,climate-clock,steam-mobile}-{1440,768,390}-{top,stuck}.png`; evidence/t7-verify.md.

## Out of scope

- adhops / projectile-lynx (no sections - confirmed with Pedro), full md migration of legacy pages (phase-4 backlog), Ticket 3 spy/active line, Ticket 4 full verification, any restyle of legacy page content.

## Open questions

- Final labels per legacy page - owner Pedro; defaults above (single simple terms).
