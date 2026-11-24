Requirement source for every ticket in this file: Pedro's requests 2026-11-24 (see plan.md Problem - the requests ARE the requirements). Anything not traceable to those requests is marked ASSUMPTION. Tickets are ordered by dependency - build top-down. Parent spec: specs/case-study-nav/ (Tickets 1-3 shipped there; DR-0003 there sequences teachr-agent last).

---

# Ticket 1: Nav directly under the hero cover + per-page `nav:` config (max 5, starts at Outcomes) + `class="btn"` anchors

- Part of: specs/case-study-nav-v2/plan.md (DR-0001, DR-0004)
- Depends on: -
- Size: M
- Type: system

## Context

`mdHero` (markdown-render.js:1401) emits cover `<header class="cs-hero cs-hero--<variant>">` + meta `<section class="cs-hero cs-hero--meta">` (via internal `heroMetaHtml`, :1374) as one string. The 5 case-study templates render `mdhero` -> `mdtoc` -> `mdpage` (e.g. src/teachr/index.nunjucks:23-29), so the nav currently sits AFTER the meta band (measured 745.8px below the cover at 1440x900). `mdToc` (markdown-render.js:1023) emits one link per `## Title | Eyebrow | id` line (teachr = 15). It already calls `splitFrontmatter(src)` (markdown-render.js:539), which parses the page md's YAML front matter (`hero:` key pattern, e.g. src/\_data/pages/teachr.md). The draft txt head maps to front matter via `specs/text-to-md/tools/draft-to-md.js` (`HEAD_FIELDS` at :62) and back via `md-to-draft.js`; the bounded vocabulary is enforced by `specs/text-to-md/tools/verify-page-md.js` (`HERO_KEYS`, gate 1 at :59). Filters registered in gulp/nunjucks.js:105-109. `scripts/test/cs-nav.test.js` currently asserts link count = section count (6/10/5/15) and nav-after-hero position. Other `mdhero` consumers (blog x4, /workflow/, styleguide) must stay byte-identical.

## Requirements

- Position (DR-0004): new `mdCover(src)` returning only the cover header, and `mdHeroMeta(src)` returning `heroMetaHtml(splitFrontmatter(src).meta.hero.meta)`; register both in gulp/nunjucks.js (`mdcover`, `mdherometa`) next to `mdhero`. `mdHero` output stays byte-identical. In each of the 5 case-study templates (fashion-rebrand, sports-ecommerce-redesign, digital-closet, teachr, teachr-agent) replace the `mdhero`/`mdtoc`/`mdpage` sequence with:
  ```
  {{ site.data.pages['<slug>'] | mdcover | safe }}
  {{ site.data.pages['<slug>'] | mdtoc | safe }}
  {{ site.data.pages['<slug>'] | mdherometa | safe }}
  {{ site.data.pages['<slug>'] | mdpage | safe }}
  ```
- Nav config (DR-0001): page md front matter gains a top-level `nav:` key - a YAML list of `{ label: <string>, id: <section-id> }`, max 5 entries. Teachr's list (Summary removed per Pedro's follow-up; starts at Outcomes):
  ```yaml
  nav:
    - label: 'Outcomes'
      id: outcomes
    - label: 'Context'
      id: process
    - label: 'Discovery & Validation'
      id: discovery
    - label: 'Design & Delivery'
      id: decisions
    - label: 'Deepdive: Teachr Assistant'
      id: assistant
  ```
- `mdToc(src)` reads `splitFrontmatter(src).meta.nav`. If present: render exactly those entries, in config order, `<li><a class="btn" href="#<id>"><label></a></li>`; every `id` MUST exist among the parsed `##` sections (parseSections shared with mdPage, parent Ticket 1) - unknown id throws. If absent: fallback = first 5 sections in document order, label = primary title (ASSUMPTION). If `nav` has more than 5 entries: throw (build-time failure).
- Every emitted anchor carries `class="btn"` (DR-0003); markup stays `<nav class="cs-index" aria-label="Case study sections"><ul>...</ul></nav>` with no whitespace between tags (parent Ticket 1 height-pinning note).
- Draft path: `Nav: Label | id` head lines in `src/_data/drafts/<slug>.txt` (repeatable, max 5) map to the `nav:` front-matter list in `draft-to-md.js`; `md-to-draft.js` maps it back; `verify-page-md.js` allows the `nav` top-level key and validates: list of objects with only `label` + `id` keys, <= 5 entries, ids matching `##` ids in the body. Then add teachr's 5 `Nav:` lines to `src/_data/drafts/teachr.txt` and re-run the text-to-md conversion to regenerate `src/_data/pages/teachr.md`.
- Update AUTHORING.md: the shell description becomes the four-line `mdcover`/`mdtoc`/`mdherometa`/`mdpage` order, and "the nav follows the `##` lines automatically" becomes the `nav:` front-matter contract (bounded vocabulary, max 5, id must match a `##` id, fallback first-5).
- Update `scripts/test/cs-nav.test.js`: (a) position - in each built page, `.cs-index` immediately follows the cover `header.cs-hero` and precedes `section.cs-hero--meta` and the first `.cs-section`; (b) per page, link count = config length (teachr exactly 5) with labels/hrefs `Outcomes#outcomes, Context#process, Discovery & Validation#discovery, Design & Delivery#decisions, Deepdive: Teachr Assistant#assistant`; each href matches a `cs-section` id from `mdPage` on the same source; every anchor has `class="btn"`; a synthetic >5 `nav:` list throws; unknown id throws; pages without `nav:` render their first 5 sections; (c) `mdHero` output byte-identical to before on all page md files (blog/workflow/styleguide untouched).

## Design references

- Hooks used: `mdtoc`/`mdhero`/`mdpage` filters, `splitFrontmatter`, `heroMetaHtml`. Principles applied: single source of truth (ids validated against the same `##` parse as mdPage), bounded authoring vocabulary (verify-page-md pattern), no blast radius on non-case-study consumers.

## Acceptance criteria (agent-checkable)

- [ ] `npm test` green, including updated `cs-nav.test.js`: teachr renders exactly the 5 configured links above with `class="btn"` on each; position assertions (a) pass on all 5 pages; `mdHero` byte-identical on all page md files; fallback pages render first-5; >5 config throws; unknown id throws.
- [ ] `src/_data/pages/teachr.md` front matter contains the `nav:` list above; `npm run build` exit 0 + release-guard OK; built `build/selected-works/teachr/index.html` shows `header.cs-hero` -> `nav.cs-index` (5 links) -> `section.cs-hero--meta`.
- [ ] `verify-page-md` passes on the regenerated teachr md and rejects a bad `nav:` key on a fixture.
- [ ] Gates: prettier `format:check` clean on edited js/md (not `src/_data/pages/`).

## Out of scope

- CSS (Ticket 2), verification captures (Ticket 3), other pages' lists (Ticket 4), parent Tickets 4/5 (aria-current JS, new-tab links), any change to blog/workflow/styleguide shells.

## Open questions

- Outcomes label "Outcomes" vs full title "Outcomes & Impact" - default "Outcomes" (plan Open questions).

---

# Ticket 2: CSS - ghost buttons, touching + centered group, 2/3 size; bar left edge on the body edge; bar height re-pinned

- Part of: specs/case-study-nav-v2/plan.md (DR-0002, DR-0003, DR-0005)
- Depends on: Ticket 1
- Size: M
- Type: UI

## Context

All styles scoped under `.case-study .cs-index` in `src/_styles/templates/_case-study.scss` (:139-206 today). Measured 2026-11-24: bar 37px tall, `ul` padding `0 48px` / `0 24px`, gap 24px/16px, first `<a>` 20px tall with Materialize `nav ul a` 15px side padding. `--cs-index-h: 37px` (:49) feeds `scroll-margin-top: calc(48px + var(--cs-index-h, 40px))` on `.cs-section` (:211, :1282). Ghost recipe precedent on the same colored bars: `nav.scss` header links (`background-color: transparent` in all states, underline feedback) and `.photoview-btn` (gallery.scss:236, transparent on the plate, underline on hover/focus). Materialize's `.btn-flat` is NOT reused (it paints rgba(0,0,0,.1) on focus and fixes height 36px). The bar sits directly under the hero cover since Ticket 1 (DR-0004) - no position CSS change; sticky stays `top: 48px`.

## Requirements

- Bar left edge (DR-0002, bar-level): `.cs-index` stays full-bleed (`width: 100vw; margin-left: calc(50% - 50vw)`), so its left edge = body left edge = 0. The `ul` gets `padding: 0` at all widths - replaces `padding: 0 48px` (:167) and mobile `padding: 0 24px` (:200). Keep `overflow-x: auto; white-space: nowrap` for narrow screens.
- Touching + centered (DR-0005): `.cs-index ul { display: flex; align-items: stretch; justify-content: center; gap: 0; }` - buttons flush against each other, group centered in the bar (replaces `gap: 24px` desktop / `16px` mobile and the old left-aligned row; the bar-level left-edge criterion from DR-0002 stands, the group-level "first link left = 0" is refined to centered).
- Full-height anchors (DR-0003): `li { display: flex; }` (kills Materialize float); `a.btn { display: flex; align-items: center; height: 100%; }` - the anchor box equals the bar's content height.
- Ghost button at 2/3 size (DR-0005) on `.case-study .cs-index a.btn`: `background-color: transparent; box-shadow: none; color: #fff; text-transform: uppercase; letter-spacing: .5px; font-weight: 400; transition: background-color .3s ease-in-out, color .3s ease-in-out; padding: 7px 8px; text-align: center; font-size: 14px; line-height: 20px;` (padding 7px 8px = 2/3 of the full-size 16px 8px -> 7+20+7 = 34px content, 35px bar incl. border); `:hover, :focus { background-color: transparent; text-decoration: underline; text-underline-offset: 4px; }`; `:active` same (no fill); `&:focus-visible { outline: 2px solid #fff; outline-offset: -2px; }`; `a[aria-current='true']` keeps underline + lifted accent. NO `$vb-primary`/`$vb-secondary` fill in any state (supersedes DR-0003's hover/active fills). These scoped rules must beat Materialize's `nav ul a` (specificity: `.case-study .cs-index ul a.btn` wins) and `nav { height: 56px }` stays killed by the existing `height: auto` on `.cs-index`.
- Bar padding: `.cs-index { padding: 0; }` (vertical padding lives in the button's 7px); keep `border-bottom: 1px solid var(--cs-accent)`, full-bleed, sticky `top: 48px; z-index: 1`, `background-color: var(--cs-head-bg)` - all unchanged.
- Re-pin height: measure the new bar at 1440 and 390 (expected 7+20+7+1 = 35px), set `--cs-index-h` to the measured value with the updated arithmetic comment (:45-49); `scroll-margin-top` keeps consuming the var, no other change.
- `scripts/test/cs-nav.test.js` CSS-contract block: add source assertions for `gap: 0`, `justify-content: center`, `padding: 7px 8px` on the anchor, transparent `background-color` on `a.btn`, and underline (not fill) on hover within the `.cs-index` bar region.

## Design references

- Style refs: `src/_modules/molecules/nav/nav.scss` (ghost header links on the same grounds; logo at x=0), `src/_modules/organisms/gallery/gallery.scss` `.photoview-btn` (:236, ghost-on-plate recipe), `src/_styles/atoms/_buttons.scss` (`.btn` base: uppercase, flat, transition). Principles applied: one ghost recipe for all controls on colored bars, one height variable (`--cs-index-h`).

## Acceptance criteria (agent-checkable)

- [ ] Playwright 1440x900 and 390x844 on each case-study page: at page top, `.cs-index` rect top === `header.cs-hero` rect bottom (gap 0, DR-0004); `.cs-index` rect left === `document.body` rect left (=== 0, bar-level DR-0002); `padding-left` of the `ul` === 0px; row centered: first link left === (viewport width - ul scrollWidth)/2 within 1px; buttons touch: for consecutive links, `link[i+1].left === link[i].right` (within 0.5px); every `.cs-index a` height === `.cs-index` height - 1px (full bar height); computed `display` flex on `ul`/`li`/`a`, `gap` 0px, `justify-content` center.
- [ ] Computed style of `.cs-index a.btn`: `text-transform: uppercase`, `padding: 7px 8px`, `background-color: rgba(0,0,0,0)` in normal AND hover state (ghost: no fill), hover `text-decoration-line: underline`; bar height === measured `--cs-index-h` (expected 35px).
- [ ] After scrolling 800px: `.cs-index` rect top === 48, position sticky, backgroundColor === `nav.site-nav` backgroundColor (per theme).
- [ ] `--cs-index-h` equals the measured bar height; a `.cs-section` scrolled to via its TOC anchor lands with its top at `>= 48 + --cs-index-h` (scroll-margin check).
- [ ] At 390: no page-level horizontal scroll (`document.scrollingElement.scrollWidth <= 390`); the bar's own row scrolls internally if the 5 labels overflow.
- [ ] Captures: `evidence/cs-nav-v2-{page}-{1440,390}-{top,stuck}.png`.

## Out of scope

- Ticket 1 renderer/config/templates, Ticket 3 test wiring, header nav, other templates.

## Open questions

- "2/3 size" read as 2/3 of the DR-0003 full-size button (52px content -> 34px, `padding: 7px 8px`, bar 35px), font stays 14px - one padding value to flip (plan Open questions).

---

# Ticket 3: End-to-end verification

- Part of: specs/case-study-nav-v2/plan.md
- Depends on: Tickets 1, 2
- Size: S
- Type: research

## Context

Parent Ticket 6 pattern (specs/case-study-nav/tickets.md): `npm test`, `npm run build` + release-guard, Playwright 1440/390, visuaibear-review gates, evidence into `specs/case-study-nav-v2/evidence/`.

## Requirements

- Run `npm test` (cs-nav.test.js updated per Ticket 1) - green.
- Run `npm run build` + release-guard - exit 0.
- Playwright at 1440x900 and 390x844 on all 5 case-study pages (fashion-rebrand, sports-ecommerce-redesign, digital-closet, teachr, teachr-agent): assert per page - nav top === cover bottom at page top (DR-0004); link count <= 5; bar left === body left === 0 and row centered (DR-0002/DR-0005); consecutive links touch (gap 0); anchor height === bar height - 1; ghost: anchor background transparent in normal + hover, hover underline; bar height === `--cs-index-h`; sticky top === 48 when scrolled; bar bg === header bg; teachr labels exactly the 5 configured, starting with Outcomes. Save captures to `evidence/`.
- Run visuaibear-review gates on the changed pages; record pass/fail in `evidence/t3-verify.md`.

## Acceptance criteria (agent-checkable)

- [ ] `evidence/t3-verify.md` exists with test output, build output, Playwright assertion results (ALL_OK), and capture file list.
- [ ] visuaibear-review report passes (or each failure is dispositioned in the verify file).

## Out of scope

- Any new feature work.

---

# Ticket 4: Rollout - nav lists for the remaining case studies, teachr-agent last

- Part of: specs/case-study-nav-v2/plan.md (parent DR-0003 sequencing)
- Depends on: Ticket 3 green on teachr
- Size: S
- Type: copy + system

## Context

Section counts: fashion-rebrand 6 (`context, deep-dive, process, outcomes, future, lessons`), sports-ecommerce-redesign 10 (incl. coupon sub-study sections), digital-closet 5, teachr-agent 7. Until Pedro supplies lists, the first-5 fallback (Ticket 1) already satisfies the max-5 cap on every page.

## Requirements

- Add `Nav:` lines to the drafts of fashion-rebrand, sports-ecommerce-redesign, digital-closet (Pedro supplies the label|id lists; if not supplied, ship the fallback and leave a plan Open-question entry), regenerate their page md via text-to-md.
- teachr-agent LAST, after Tickets 1-3 verify on the four named pages (parent DR-0003): add its `Nav:` lines, regenerate, extend `cs-nav.test.js` counts.

## Acceptance criteria (agent-checkable)

- [ ] Each page's built HTML shows <= 5 `.cs-index` links; `npm test` + build green after each page.
- [ ] teachr-agent added only after the other four verify (order recorded in `evidence/`).

## Out of scope

- Anything beyond the nav list per page.

## Open questions

- The three remaining lists - owner Pedro, does not block (fallback ships).
