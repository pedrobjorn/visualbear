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

# Ticket 3: Scroll-spy sets exactly one `aria-current="true"`; active state = 3px `--cs-index-active` red line

- Part of: specs/case-study-nav-v3/plan.md (DR-0002; lands parent specs/case-study-nav/tickets.md Ticket 4, currently TODO)
- Depends on: Ticket 2
- Size: M
- Type: UI + system

## Context

Measured 2026-11-24: 0 `aria-current` attributes at runtime on any page (even scrolled to a section); `build/scripts/main.js` has no aria-current code; the CSS rule `a[aria-current='true'] { text-decoration: underline; text-underline-offset: 4px }` (`_case-study.scss:223`) is dead. Parent Ticket 4 specified: vanilla IntersectionObserver, rootMargin `-48px 0px -<bar> 0px`, exactly one aria-current under the stuck bar, none above the first section, script only on case-study pages. Stuck bar occupies top 48..83 (48 header + 35 bar). Hover/focus already use the white underline, so the active state must differ: v3 DR-0002 chooses a 3px inset line in `--cs-index-active` (default `#{$vb-primary}` #d73735).

## Requirements

- New scoped script (e.g. `src/_scripts/cs-index.js`, wired in the loader/template only for pages rendering `.cs-index` - the 5 case-study shells): IntersectionObserver on the `.cs-section` elements with `rootMargin: -48px 0px -35px 0px` (read `--cs-index-h` from the `.case-study` computed style so the bar height variable stays the single source); on intersect set `aria-current="true"` on the matching `.cs-index a[href="#id"]` and remove it from all others; when no section intersects (hero/meta zone), remove from all. No library, no animation. Disconnect when no `.cs-index` on the page. Also update aria-current on anchor click (the browser jump lands the section under the bar; the observer will catch it, but set immediately for snappy feedback).
- CSS on `.case-study`: new token `--cs-index-active: #{$vb-primary};` next to `--cs-accent`; `body.cs-pink-page`-style per-theme overrides where needed - digital-closet's head bg IS #d73735, so on `body` classes whose `--cs-head-bg` is $vb-primary set `--cs-index-active: #fff` (open question for Pedro; default white). teachr/teal (#0e7d6f), fashion/black (#111), sports/pink (#d50e95): default red line is visible on all three.
- `a[aria-current='true']` rule becomes: `box-shadow: inset 0 -3px 0 var(--cs-index-active); text-decoration: none;` (supersedes the v2 underline rule for aria-current; hover/focus keep the white underline). Because the anchor is full bar height, the inset line sits flush on the bar's bottom border.
- `scripts/test/cs-nav.test.js`: source assertions - `.case-study` defines `--cs-index-active`; the aria-current rule uses `var(--cs-index-active)` and `inset 0 -3px` and does NOT set text-decoration underline; the spy script file exists and is referenced only by case-study wiring (assert no `.cs-index`/aria-current reference leaks into blog/workflow shells).

## Design references

- Hooks used: IntersectionObserver pattern from parent Ticket 4 spec; token pattern `--cs-head-bg`/`--cs-accent` on `.case-study`. Principles applied: state must not rely on color alone (line + position, and keyboard focus keeps the white outline), single height variable (`--cs-index-h` feeds both scroll-margin and the spy's rootMargin), ghost stays ghost (line, not fill, per v2 DR-0005).

## Acceptance criteria (agent-checkable)

- [ ] Playwright 1440x900 on teachr: scroll to `#discovery` -> exactly one `.cs-index a[aria-current="true"]`, it is `a[href="#discovery"]`, computed `box-shadow` includes the `--cs-index-active` color, `text-decoration-line` is `none`; scroll to top -> zero aria-current. Repeat at 390x844. Repeat on one other page (fashion-rebrand).
- [ ] Contrast/visibility: on digital-closet the active line color != the bar bg color (assert computed `--cs-index-active` resolves to #ffffff there).
- [ ] `npm test` green (new source assertions), `npm run build` + release-guard exit 0.
- [ ] Captures: `evidence/cs-nav-v3-teachr-1440-active.png` (scrolled mid-page, active line visible) + per-page stuck captures from Ticket 2.
- [ ] prettier `format:check` clean on edited js/scss.

## Out of scope

- Tickets 1/2, new-tab links (parent Ticket 5), reduced-motion animation (none added), header changes.

## Open questions

- "unredlined" = "a red line" reading + white line on the red bar (DR-0002; plan Open questions).

---

# Ticket 4: End-to-end verification

- Part of: specs/case-study-nav-v3/plan.md
- Depends on: Tickets 1, 2, 3
- Size: S
- Type: research

## Context

v2 Ticket 3 pattern: `npm test`, `npm run build` + release-guard, Playwright 1440/768/390 on all 5 case-study pages, visuaibear-review gates, evidence into `specs/case-study-nav-v3/evidence/`.

## Requirements

- Run `npm test` (cs-nav.test.js updated per Tickets 1-3) - green.
- Run `npm run build` + release-guard - exit 0.
- Playwright at 1440x900, 768x1024 and 390x844 on all 5 pages (fashion-rebrand, sports-ecommerce-redesign, digital-closet, teachr, teachr-agent): per page assert the Ticket 2 width/fill criteria and the Ticket 3 spy criteria (spot-check spy on teachr + fashion-rebrand at all widths, attribute presence on the rest); teachr labels still the v2 5, other pages the Ticket 1 condensed lists; gap cover->nav == 0; sticky top 48 + bg match after 800px scroll; scroll-margin landing >= 83px; no page-level h-scroll at 390. Save captures to `evidence/`.
- Run visuaibear-review gates on the changed pages; record pass/fail in `evidence/t4-verify.md` together with the test/build/Playwright output (ALL_OK) and the capture list. Note the AI-attribution gate: production build must contain 0 `data-ai` attributes on the changed pages.

## Acceptance criteria (agent-checkable)

- [ ] `evidence/t4-verify.md` exists with test output, build output, Playwright assertion results (ALL_OK), review-gate table, and capture file list.
- [ ] visuaibear-review report passes (or each failure is dispositioned in the verify file).

## Out of scope

- Any new feature work.
