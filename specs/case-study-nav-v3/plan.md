# Plan: Case-study section nav v3 - full-width bar with content-width link row and expanding options, red-line active state, condensed labels

- Date: 2026-11-24
- Status: draft
- Evidence: Pedro's requests 2026-11-24 (the requests ARE the requirements, quoted in Problem, including the same-day correction quoted there). Code + browser measurements 2026-11-24 in `evidence/measurements-2026-11-24.md`; anything not traceable to the requests is marked ASSUMPTION.
- Parent specs: `specs/case-study-nav/` (Tickets 1-3 shipped; Ticket 4 scroll-spy TODO, lands here as v3 Ticket 3) and `specs/case-study-nav-v2/` (Tickets 1-4 shipped as commit c225095). This plan changes only the link row's width (constrained to the body content width while the bar stays full-bleed, DR-0005), the buttons' fill, the active state, and the labels; position under the hero cover (gap 0), max-5 cap, bar full-bleed, sticky mechanics (top 48, z-index 1, header-matched bg), 35px bar height, and `scroll-margin-top` all stay.

## Problem / opportunity

Pedro 2026-11-24:

- "Expand the nav options to match the width of the rest of the body content"
- "Add an active state (unredlined) for selected / scrolled to sections)"
- "Condense some options, like 'Future improvements, Based on learnings' so they are not super long links"

Pedro 2026-11-24, correcting the first request's reading (DR-0005):

- "The menu was correct before, it should be full width. The LINK OPTIONS are what should be limited to the width of the content container, and spread to take up the space"

Measured 2026-11-24 on the shipped v2 build (`evidence/measurements-2026-11-24.md`):

1. The bar is full-bleed (0..1440 at 1440) while the body content column is 278..1162 (884px, `$content-width: 916px` minus 16px padding); the link row floats centered in the oversized bar. At 768/390 the bar is full-width like the content, so the mismatch is a desktop one.
2. No active state exists at runtime: 0 `aria-current` attributes even when scrolled to a section (parent Ticket 4 never shipped; its CSS rule is dead code).
3. Fallback labels are full section titles: fashion-rebrand's "Future Improvements, Based on Learnings" is a 362px link; sports' row is 1052px, wider than the 884px content column at 1440; rows overflow-scroll internally at 768/390.

## Goal

On every case-study page the `.cs-index` bar spans the full viewport (as before v3; when stuck it matches the fixed header edge-to-edge), while its link row (`ul`) is constrained to exactly the body content width (left/right equal to the `.cs-section` content edges at every viewport) and its max-5 option buttons expand to equal widths filling that row flush, the scrolled-to section's button carries a 3px brand-red active line driven by a shipped scroll-spy (`aria-current`), and every nav label comes from a condensed per-page `nav:` list capped at 28 chars at the authoring gate. Measured by `npm test` assertions plus Playwright rect/computed-style checks at 1440x900, 768x1024 and 390x844.

## Non-goals

- The fixed header `nav.site-nav`, the hero cover's full-bleed scope, the meta band: unchanged.
- Bar height (35px), sticky top 48 / z-index 1 / `var(--cs-head-bg)` bg, `border-bottom: 1px solid var(--cs-accent)`, `scroll-margin-top: calc(48px + var(--cs-index-h))`: unchanged.
- `mdhero`/`mdpage` output, blog / workflow / styleguide shells: byte-identical (existing sha256 fixture test covers this).
- Parent Ticket 5 (new-tab content links): still out of scope.
- Home work cards, buttonslider, gallery: unchanged.

## Approach

- Ticket 1 (copy + system): condensed `nav:` lists for fashion-rebrand, sports-ecommerce-redesign, digital-closet, teachr-agent via their drafts, regenerated page mds, label-length cap (24 chars, ASSUMPTION) in `verify-page-md.js`, exact-list assertions in `cs-nav.test.js` (DR-0003).
- Ticket 2 (UI, shipped 4139434, bar level SUPERSEDED by DR-0005): row-level rules stand - `li { flex: 1 1 0; min-width: 0 }` + `a.btn { width: 100% }` spread the options equally; ellipsis + `title` for over-long labels (DR-0001 row level).
- Ticket 5 (UI, DR-0005): restore the bar's full-bleed (`width: 100vw` + `margin-left: calc(50% - 50vw)`) and constrain the `ul` link row to the content width (`width: calc(100% - 32px); max-width: calc(#{$content-width} - 32px); margin: 0 auto`), so the options are limited to the content container and spread to take up the space while the menu bar itself stays full width.
- Ticket 3 (UI + system): ship the scroll-spy (parent Ticket 4) setting exactly one `aria-current="true"`, and style it as a 3px `--cs-index-active` (default `$vb-primary` #d73735) inset line replacing the underline on the active button (DR-0002).
- Ticket 4 (research): full verification - tests, build + release-guard, Playwright 1440/768/390 on all 5 pages, captures, visuaibear-review gates, evidence files.

Alternatives rejected: shrinking the bar itself to the content column (DR-0001 as first shipped in 4139434 - corrected same day by Pedro: the menu was correct full width, DR-0005); keeping the bar full-bleed with the row merely centered at natural width (leaves dead bar space at desktop and does not make the options "take up the space"); automatic label truncation with CSS ellipsis only and no per-page lists (Pedro's custom labels prove the list must be explicit, and a 362px title still dominates the row at desktop); active state as a painted fill (v2 DR-0005 explicitly made these buttons ghost in every state - a fill would contradict it; a line keeps ghost).

## Asset requests

| Asset | Position in design | Min size / format | Status                                          |
| ----- | ------------------ | ----------------- | ----------------------------------------------- |
| -     | -                  | -                 | none needed; CSS / JS / draft-head changes only |

## Foundational checks

H1: no destructive file operations (edits + new spec files only). H3: uncertainties batched in Open questions below.

## Breakdown

- [x] Ticket 1 - condensed per-page `nav:` lists for all 4 fallback pages + 28-char label cap (DR-0004) in the verify-page-md gate + tests - DONE 2026-11-24 (evidence/t1-verify.md)
- [x] Ticket 2 - CSS: buttons expand to fill equally + ellipsis edge + `title` on anchors (DR-0001 row level) - DONE 2026-11-24 as 4139434 (evidence/t2-verify.md); its bar-shrinks-to-content reading was corrected same day - see Ticket 5
- [ ] Ticket 5 - full-bleed bar restored; `ul` link row constrained to the body content width and options spread to fill it (DR-0005)
- [ ] Ticket 3 - scroll-spy JS + red-line active state via `--cs-index-active` (DR-0002; lands parent case-study-nav Ticket 4)
- [ ] Ticket 4 - verify: tests, build + guards, Playwright 1440/768/390, review gates, captures

## Open questions

| Question                                                                                                                                                                                                          | Owner | Blocks build?                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------- |
| "unredlined" read as "a red line": active state = 3px #d73735 inset line on the aria-current button, replacing underline for active (hover keeps underline). Alternative: persistent white underline while active | Pedro | No - default chosen, one CSS value to flip                                                                  |
| Active line on the red bar (digital-closet head bg #d73735): red-on-red is invisible, so `--cs-index-active: #fff` there - confirm white, or another contrast pick                                                | Pedro | No - token default + one override                                                                           |
| Equal-width expanding buttons (flex 1, tab-strip) vs natural-width buttons left-aligned inside the content-width link row (bar stays full-bleed per DR-0005)                                                      | Pedro | No - DR-0001/DR-0005 chose equal fill, flip is one flex value                                               |
| Label cap 24 chars (ASSUMPTION) and teachr's "Deepdive: Teachr Assistant" (27 chars, 238px): condense to "Assistant" or grandfather it above the cap                                                              | Pedro | No - gate value, one constant                                                                               |
| Proposed condensed lists per page (DR-0003) - confirm or edit labels/ids                                                                                                                                          | Pedro | Yes for Ticket 1 copy - defaults proposed, fallback = keep first-5 with shortened labels only where flagged |
| Narrow-width overflow with equal buttons: ellipsis + `title` (chosen) vs internal horizontal scroll strip (v2 behavior)                                                                                           | Pedro | No - ASSUMPTION, one CSS block to flip                                                                      |
