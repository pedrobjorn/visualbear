# Plan: Case-study section nav v2 - directly under the hero cover, max 5 curated links starting at Outcomes, left edge on the body edge, full-height button anchors

- Date: 2026-11-24
- Status: draft
- Evidence: Pedro's requests 2026-11-24 (the requests are the requirement source, quoted in Problem). Code + browser measurements 2026-11-24 in `evidence/measurements-2026-11-24.md`; anything not traceable to the requests is marked ASSUMPTION.
- Parent spec: `specs/case-study-nav/` (Tickets 1-3 shipped: `mdtoc` filter, sticky `.cs-index` at top 48px, `scroll-margin-top`). This plan supersedes the nav's position, link list, side padding, and link styling only; sticky mechanics, header-matched background (parent DR-0001), and same-tab `#` anchors stay.

## Problem / opportunity

Pedro 2026-11-24: "spec up the following relating to the navigation bar in the case studies: - Align the left edge to the left edge of the body - Keep the links to a maximum of 5. For example Teachr only has these: Summary / Context / Discovery & Validation / Design & Delivery / Deepdive: Teachr Assistant - Make the clickable anchors as tall as the container, and make them follow the design system button. don't squeeze them inside a smaller container."

Pedro 2026-11-24 (follow-up): "- Move the nav bar directly under the hero - Skip the summary as part of the links, start with outcomes"

Pedro 2026-11-24 (follow-up 2): "- Make the buttons ghost buttons - Make them touch eachother and center aligned - Don't make them so big, maybe 2/3 size."

Code + browser eval 2026-11-24 (`evidence/measurements-2026-11-24.md`, Playwright on built `/selected-works/teachr/` at 1440x900 and 390x844):

1. The nav lists every `##` section: teachr renders 15 links (measured). `mdToc` (markdown-render.js:1023) emits one `<li><a href="#id">Title</a></li>` per `## Title | Eyebrow | id` line, link text = the primary title.
2. Position today: `mdHero` (markdown-render.js:1401) emits the cover `<header class="cs-hero cs-hero--teal">` AND the meta band `<section class="cs-hero cs-hero--meta">` in one string; the 5 case-study templates render `mdhero` -> `mdtoc` -> `mdpage`, so the nav sits AFTER the meta band. Measured DOM order: `header.cs-hero` -> `section.cs-hero--meta` -> `nav.cs-index` -> sections; the gap between the cover's bottom (443.6px at 1440) and the nav's top (1189.5px) is 745.8px, filled by the meta band.
3. Left edge today: `.cs-index` is full-bleed (left = 0, measured), but `.cs-index ul` carries `padding: 0 48px` at desktop and `0 24px` at <=767px (`_case-study.scss:167,200`), so the first link sits at x=48 (1440) / x=24 (390). `document.body` left edge measures 0 at both widths (body margin/padding 0).
4. Anchor height today: the `<a>` measures 20px tall (font line) inside the 37px bar, with Materialize's `nav ul a { padding: 0 15px }` adding 15px side padding (measured `padL: 15px`) - the clickable area is a small box squeezed inside the bar, not the bar.
5. The design-system button is `.btn` (`src/_styles/atoms/_buttons.scss`): uppercase, font-weight 400, flat (`box-shadow: none`), `transition: background-color .3s, color .3s`, `padding: 16px 8px`, `text-align: center`, `height: auto`; the shipped link-buttons (`vb-btn`, `vb-btn-full`) are transparent-background `.btn` anchors with white ink, hover `background-color: $vb-primary` (#d73735), active/focus `background-color: $vb-secondary` (#79a6d2).
6. The page md already carries YAML front matter (`hero:` key, e.g. `src/_data/pages/teachr.md`), parsed by `splitFrontmatter` (markdown-render.js:539) which `mdToc` already calls - a `nav:` key is the natural home for the curated link list. The draft txt head maps to front matter via `specs/text-to-md/tools/draft-to-md.js` (`HEAD_FIELDS`), and the bounded vocabulary is enforced by `specs/text-to-md/tools/verify-page-md.js` (`HERO_KEYS`).
7. Teachr's requested links map to existing section ids, and per the follow-up the list starts at Outcomes (no Summary link): Outcomes -> `outcomes` (section title "Outcomes & Impact"), Context -> `process` (eyebrow "Context"), Discovery & Validation -> `discovery` (eyebrow), Design & Delivery -> `decisions` (eyebrow), Deepdive: Teachr Assistant -> `assistant`. Section counts: fashion-rebrand 6, sports-ecommerce-redesign 10, digital-closet 5, teachr 15, teachr-agent 7.

## Goal

On every case-study page the sticky `.cs-index` bar sits directly under the hero cover (zero gap, before the `.cs-hero--meta` band), spans the full viewport with its left edge on `document.body`'s left edge (0), and renders at most 5 links taken from an explicit per-page `nav:` list (teachr: Outcomes / Context / Discovery & Validation / Design & Delivery / Deepdive: Teachr Assistant). The links are ghost buttons (transparent background in all states, white ink, underline feedback - the same ghost recipe as the header links and `.photoview-btn`), they touch each other (`gap: 0`) and the group is center-aligned in the bar, each anchor is as tall as the bar at 2/3 of the full-size button (DR-0005: `padding: 7px 8px`, expected bar 35px). Measured by `npm test` assertions plus Playwright rect/computed-style checks and captures at 1440x900 and 390x844.

## Non-goals

- The fixed header `nav.site-nav` (logo at x=0, links, mobile menu) - unchanged.
- `mdhero` as used by non-case-study consumers (blog x4, `/workflow/`, styleguide) - they keep cover+meta in one call; only the 5 case-study shells reorder to cover / nav / meta (DR-0004).
- Sticky mechanics: `top: 48px`, z-index 1 under the header, opaque `var(--cs-head-bg)` background, 390px horizontal scroll of the link row - all unchanged from parent Tickets 2/3 (only the bar's height value changes, via `--cs-index-h`).
- Active-section highlight (`aria-current`, parent Ticket 4) and new-tab content links (parent Ticket 5) - unchanged behavior; the anchor restyle must not break them.
- `/workflow/` and every other `mdpage`/`mdtoc` consumer - unchanged; nav config is opt-in per page md.
- Home work cards, buttonslider prev/next - unchanged.
- Styleguide case-system demos - no `.cs-index` demo update required (ASSUMPTION).

## Approach

- Ticket 1: position + per-page curated nav config + button anchors in the renderer/templates. Split the hero emission for case-study shells only: new `mdcover` filter (cover `<header>` only) and `mdherometa` filter (the `.cs-hero--meta` section, reusing `heroMetaHtml`); `mdhero` stays byte-identical for blog/workflow/styleguide. The 5 case-study templates become `mdcover` -> `mdtoc` -> `mdherometa` -> `mdpage` (DR-0004). New `nav:` front-matter key (list of `{ label, id }`, max 5) consumed by `mdToc`; new `Nav: Label | id` head lines in the draft txt mapped by `draft-to-md.js` / `md-to-draft.js`, vocabulary extended in `verify-page-md.js`, AUTHORING.md doc-sync. Teachr's 5 entries land in `src/_data/drafts/teachr.txt` and regenerate `src/_data/pages/teachr.md`. Fallback when a page has no `nav:` key: first 5 sections in document order, label = primary title (ASSUMPTION - needs Pedro's lists for the other pages). Hard cap: more than 5 entries fails `cs-nav.test.js`. `mdToc` also emits `class="btn"` on each anchor.
- Ticket 2: CSS (DR-0002 + DR-0003 + DR-0005). `.cs-index ul` gets `padding: 0; gap: 0; justify-content: center; align-items: stretch` - the bar stays full-bleed (left edge = body left edge = 0) while the button group centers and the buttons touch; `li`/`a` become flex, anchor `height: 100%` of the bar; the anchor is a GHOST button scoped under `.case-study .cs-index` (transparent background + no shadow in ALL states, white ink, uppercase, `padding: 7px 8px` = 2/3 of the full-size `16px 8px`, transition, hover/focus = underline like the header links, `:focus-visible` outline, `aria-current` underline), overriding Materialize's `nav ul a` padding; bar vertical padding -> 0 so the anchor IS the bar's full height; re-measure and pin `--cs-index-h` (expected 7+20+7+1 = 35px), `scroll-margin-top` keeps consuming the var.
- Ticket 3: verification - `scripts/test/cs-nav.test.js` updated to config-driven counts and the new position assertion (teachr exactly 5, starting with Outcomes), `npm test` green, `npm run build` + release-guard exit 0, Playwright 1440/390 rect checks + captures into `evidence/`, visuaibear-review gates.
- Ticket 4: rollout - nav lists for fashion-rebrand / sports-ecommerce-redesign / digital-closet (Pedro supplies, else first-5 fallback), teachr-agent LAST per parent DR-0003.

Alternative rejected: keeping "all `##` sections" and hiding overflow - Pedro explicitly caps at 5 curated links; a scroll strip of 15 is the problem, not the answer. Alternative rejected: deriving the 5 automatically (e.g. always eyebrows) - Pedro's teachr list mixes custom labels ("Deepdive: Teachr Assistant") that no rule derives, so the list must be explicit per page. Alternative rejected for position: moving the meta band above the cover - the cover is the hero; the nav belongs under it, meta stays below the nav.

## Asset requests

| Asset | Position in design | Min size / format | Status                                               |
| ----- | ------------------ | ----------------- | ---------------------------------------------------- |
| -     | -                  | -                 | none needed; renderer / CSS / draft-head change only |

## Foundational checks

H1: no destructive file operations (edits + new spec files only). H3: uncertainties batched in Open questions below.

## Breakdown

- [x] Ticket 1 - hero split (`mdcover`/`mdherometa`) + templates reorder + `nav:` config (max 5, starts at Outcomes) + `class="btn"` anchors + teachr's 5 entries - DONE 2026-11-24 (evidence/t1-verify.md)
- [x] Ticket 2 - CSS: ghost buttons, touching + centered group, 2/3 size, bar left edge = body edge, bar height re-pinned to 35px (DR-0005) - DONE 2026-11-24 (evidence/t3-verify.md)
- [x] Ticket 3 - verify: tests, build + guards, Playwright 1440/390, review gates, captures - DONE 2026-11-24 (evidence/t3-verify.md, ALL_OK 147 checks)
- [x] Ticket 4 - rollout, teachr-agent LAST after Tickets 1-3 verified on the other four - DONE 2026-11-24 (evidence/t4-verify.md)

## Open questions

| Question                                                                                                                                                                                  | Owner            | Blocks build?          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------- |
| RESOLVED 2026-11-24 (Pedro: "Skip the summary as part of the links, start with outcomes"): teachr's list has NO Summary link; it starts with Outcomes -> `outcomes`                       | Pedro            | No - answered          |
| Outcomes link label: "Outcomes" (Pedro's word) vs the full section title "Outcomes & Impact" - default "Outcomes", one-word config change                                                 | Pedro            | No                     |
| Exact 5-entry lists for fashion-rebrand (6 sections), sports-ecommerce-redesign (10), digital-closet (5), teachr-agent (7); until provided, fallback = first 5 sections in document order | Pedro            | No - fallback ships    |
| SUPERSEDED by follow-up 2 (DR-0005): buttons are GHOST - no painted fill on any state; hover/focus = underline, same as the header links and `.photoview-btn`                             | Pedro            | No - answered          |
| Active/focus contrast: ghost keeps white ink on all four header colors (passes 4.5:1, same as header links) + a `:focus-visible` outline so keyboard focus is never color-only            | review gate      | No                     |
| "2/3 size" read as 2/3 of the DR-0003 full-size button (52px content -> 34px content, `padding: 7px 8px`, bar 35px); font stays 14px. Flip is one padding value                           | Pedro            | No - ASSUMPTION        |
| Bar height after restyle expected 35px (7+20+7 button + 1px border); pin the measured value into `--cs-index-h`                                                                           | build (Ticket 2) | No - measured at build |
