# Plan: Case-study section nav below the hero, sticky under the header, case-study links in new tabs

- Date: 2026-11-23
- Status: draft
- Evidence: Pedro's request 2026-11-23 (the request is the requirement source, quoted in Problem). Code eval 2026-11-23 per item below; anything not traceable to the request is marked ASSUMPTION.

## Problem / opportunity

Pedro 2026-11-23: "Add a navigation per new case study (fashion, ecommerce, closet, teachr) that sits below the hero inline based on the primary titles. Then on scroll have stick to the header matching the background color. Make any link from case studies open in new tabs."

Code eval 2026-11-23:

1. The four new case-study pages are long vertical scrolls with no in-page index: `/fashion-rebrand/` (6 sections), `/sports-ecommerce-redesign/` (11), `/digital-closet/` (5), `/teachr/` (15). The "primary titles" are the `## Title | Eyebrow | id` H2 lines in `src/_data/drafts/{fashion-rebrand,sports-ecommerce-redesign,digital-closet,teachr}.txt`, rendered by `mdPage()` (markdown-render.js:844, section splice at :975) as `<section class="cs-section" id="..."><p class="cs-eyebrow">..</p><h2>..</h2>`.
2. Each page template renders `{{ site.data.pages['...'] | mdhero | safe }}` then `{{ ... | mdpage | safe }}` inside `article.case-study` (e.g. src/teachr/index.nunjucks, src/fashion-rebrand/index.nunjucks) - the nav slot is between the two calls, i.e. directly below the hero block, in flow ("inline").
3. The fixed header `nav.site-nav` is `height: 48px; position: fixed; z-index: 2` (src/_modules/molecules/nav/nav.scss:3-6), background per page via the body class: default `$vb-primary` #d73735 (digital-closet has no body class), `body.cs-pink-page` -> #d50e95, `body.cs-black-page` -> #111111, `body.cs-teal-page` -> #0e7d6f (src/_styles/templates/_case-study.scss:1250, 1319, 1523). Sticky reference already on site: `.photoview-switch` sticks at `top: 48px` under the nav (specs/play-subpages T17).
4. Links inside case studies are emitted by the renderer with no `target`: `::: callout` links (markdown-render.js:314; teachr `try-app` -> `../teachr-app/?view=library`), "lead | href | title" link lists (:1308), inline markdown links. `mdpage` is shared with `/workflow/` (gulp/nunjucks.js:105), so new-tab behavior must be opt-in per page, not global.

## Goal

Each of the four case-study pages renders an in-page section nav directly below the hero, listing the primary section titles in document order; on scroll it sticks at `top: 48px` flush under the fixed header with the header's background color; every link rendered inside a case study that is not an in-page `#anchor` opens in a new tab (`target="_blank" rel="noopener noreferrer"`). Measured by built-HTML assertions in `npm test` plus Playwright computed-style/rect checks and captures at 1440x900 and 390x844.

## Non-goals

- `/teachr-agent/` (fifth case-study-shaped page, `cs-teal`) - out of scope unless Pedro opts in (open question).
- `/workflow/` and every other `mdpage`/`mdhero` consumer - link behavior unchanged.
- Home work cards (`src/_data/work.json`) linking TO the case studies, the global nav, and the buttonslider prev/next on case-study pages stay same-tab (DR-0002).
- Styleguide case-system demos - no `.cs-index` demo required.
- No new copy except the nav's `aria-label`.

## Approach

- Ticket 1: new `mdtoc` filter (markdown-render.js, registered in gulp/nunjucks.js next to `mdpage` at :105) that reuses mdPage's exact `##` parsing (refactor: extract a shared `parseSections()` so the nav ids can never drift from the rendered sections) and emits `<nav class="cs-index" aria-label="Case study sections">` with one `<a href="#id">Title</a>` per section, in order. The four page templates insert `{{ site.data.pages['...'] | mdtoc | safe }}` between `mdhero` and `mdpage`.
- Ticket 2: sticky styles scoped `.case-study .cs-index`: `position: sticky; top: 48px; z-index: 1` (under the nav's z-index 2), opaque background matching the header per page via one `--cs-head-bg` custom property set in the existing `body.cs-*-page` rules (plus the default on `body`) and consumed by both `nav.site-nav` and `.cs-index` (DR-0001). At 390px: horizontal scroll strip, no wrap.
- Ticket 3: `scroll-margin-top: calc(48px + <bar height>)` on `.cs-section` so TOC jumps land below the stuck bar; smooth scrolling is already global with a prefers-reduced-motion opt-out (scripts/test/anchors.test.js contract).
- Ticket 4: active-section highlight - exactly one `.cs-index a` carries `aria-current="true"` while its section is in view (IntersectionObserver, scoped to case-study pages).
- Ticket 5: new-tab links - opt-in renderer flag for the four case-study pages only (e.g. `mdpage(src, { links: 'blank' })`, templates pass it) adding `target="_blank" rel="noopener noreferrer"` to every emitted `<a>` whose href does not start with `#`; the Ticket 1 nav anchors stay same-tab by construction.
- Ticket 6: verification - new `scripts/test/cs-nav.test.js` wired into `npm test` (toc parity + target attrs), mirror-link and anchors audits still green, `npm run build` + release-guard exit 0, Playwright measurements + captures at 1440/390 into `evidence/`, visuaibear-review gates.

Alternative rejected: hand-written nav per page template - duplicates the primary titles and drifts on every draft edit; the `##` lines are the single source of truth.

## Asset requests

| Asset | Position in design | Min size / format | Status |
| ----- | ------------------ | ----------------- | ------ |
| -     | -                  | -                 | none needed; all changes are renderer / CSS / template |

## Foundational checks

H1: no destructive file operations (edits only; no file is deleted). H3: uncertainties batched in Open questions below.

## Breakdown

- [ ] Ticket 1 - `mdtoc` filter + insert into the 4 case-study templates (tickets.md)
- [ ] Ticket 2 - sticky `.cs-index` bar at top 48px, header-matched background per theme
- [ ] Ticket 3 - `scroll-margin-top` on `.cs-section` clears the stuck bar
- [ ] Ticket 4 - active-section highlight (`aria-current`) in `.cs-index`
- [ ] Ticket 5 - case-study links open in new tabs (opt-in, `#` anchors excluded)
- [ ] Ticket 6 - end-to-end verify: tests, build + guards, Playwright 1440/390, review gates

## Open questions

| Question | Owner | Blocks build? |
| -------- | ----- | ------------- |
| Include `/teachr-agent/` too? ASSUMPTION: no - Pedro listed four (fashion, ecommerce, closet, teachr); adding it is one template line | Pedro | No |
| Sticky bar background = header color (DR-0001) vs page ground | Pedro | No - DR-0001 picks the header color per "matching the background color"; the flip is one variable |
| "Any link from case studies" read as links ON the case-study pages (DR-0002); if Pedro meant the home cards linking TO case studies, that is a one-line `work.json`/gallery change | Pedro | No - assumption recorded |
| Prev/next buttonslider on case-study pages stays same-tab (DR-0002) | Pedro | No |
| Bar typography: text links ~13-14px, uppercase tracking like the nav, active = underline + lifted accent; bar height to be measured, then pinned in Ticket 3's calc - ASSUMPTION | Pedro | No - CSS-only retune |
