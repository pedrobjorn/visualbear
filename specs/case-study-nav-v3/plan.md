# Plan: Case-study section nav v3 - content-width bar with expanding options, red-line active state, condensed labels

- Date: 2026-11-24
- Status: draft
- Evidence: Pedro's requests 2026-11-24 (the requests ARE the requirements, quoted in Problem). Code + browser measurements 2026-11-24 in `evidence/measurements-2026-11-24.md`; anything not traceable to the requests is marked ASSUMPTION.
- Parent specs: `specs/case-study-nav/` (Tickets 1-3 shipped; Ticket 4 scroll-spy TODO, lands here as v3 Ticket 3) and `specs/case-study-nav-v2/` (Tickets 1-4 shipped as commit c225095). This plan changes only the bar's width, the buttons' fill, the active state, and the labels; position under the hero cover (gap 0), max-5 cap, sticky mechanics (top 48, z-index 1, header-matched bg), 35px bar height, and `scroll-margin-top` all stay.

## Problem / opportunity

Pedro 2026-11-24:

- "Expand the nav options to match the width of the rest of the body content"
- "Add an active state (unredlined) for selected / scrolled to sections)"
- "Condense some options, like 'Future improvements, Based on learnings' so they are not super long links"

Measured 2026-11-24 on the shipped v2 build (`evidence/measurements-2026-11-24.md`):

1. The bar is full-bleed (0..1440 at 1440) while the body content column is 278..1162 (884px, `$content-width: 916px` minus 16px padding); the link row floats centered in the oversized bar. At 768/390 the bar is full-width like the content, so the mismatch is a desktop one.
2. No active state exists at runtime: 0 `aria-current` attributes even when scrolled to a section (parent Ticket 4 never shipped; its CSS rule is dead code).
3. Fallback labels are full section titles: fashion-rebrand's "Future Improvements, Based on Learnings" is a 362px link; sports' row is 1052px, wider than the 884px content column at 1440; rows overflow-scroll internally at 768/390.

## Goal

On every case-study page the `.cs-index` bar spans exactly the body content width (left/right equal to the `.cs-section` content edges at every viewport), its max-5 option buttons expand to equal widths filling the bar flush, the scrolled-to section's button carries a 3px brand-red active line driven by a shipped scroll-spy (`aria-current`), and every nav label comes from a condensed per-page `nav:` list capped at 24 chars at the authoring gate. Measured by `npm test` assertions plus Playwright rect/computed-style checks at 1440x900, 768x1024 and 390x844.

## Non-goals

- The fixed header `nav.site-nav`, the hero cover's full-bleed scope, the meta band: unchanged.
- Bar height (35px), sticky top 48 / z-index 1 / `var(--cs-head-bg)` bg, `border-bottom: 1px solid var(--cs-accent)`, `scroll-margin-top: calc(48px + var(--cs-index-h))`: unchanged.
- `mdhero`/`mdpage` output, blog / workflow / styleguide shells: byte-identical (existing sha256 fixture test covers this).
- Parent Ticket 5 (new-tab content links): still out of scope.
- Home work cards, buttonslider, gallery: unchanged.

## Approach

- Ticket 1 (copy + system): condensed `nav:` lists for fashion-rebrand, sports-ecommerce-redesign, digital-closet, teachr-agent via their drafts, regenerated page mds, label-length cap (24 chars, ASSUMPTION) in `verify-page-md.js`, exact-list assertions in `cs-nav.test.js` (DR-0003).
- Ticket 2 (UI): drop the bar's full-bleed so it matches the body content column; `li { flex: 1 1 0; min-width: 0 }` + `a.btn { width: 100% }` so the options expand to fill the bar; ellipsis + `title` for over-long labels at narrow widths (DR-0001).
- Ticket 3 (UI + system): ship the scroll-spy (parent Ticket 4) setting exactly one `aria-current="true"`, and style it as a 3px `--cs-index-active` (default `$vb-primary` #d73735) inset line replacing the underline on the active button (DR-0002).
- Ticket 4 (research): full verification - tests, build + release-guard, Playwright 1440/768/390 on all 5 pages, captures, visuaibear-review gates, evidence files.

Alternatives rejected: keeping the bar full-bleed and only centering a content-width row (does not match "expand the options to the width of the body content"); automatic label truncation with CSS ellipsis only and no per-page lists (Pedro's custom labels prove the list must be explicit, and a 362px title still dominates the row at desktop); active state as a painted fill (v2 DR-0005 explicitly made these buttons ghost in every state - a fill would contradict it; a line keeps ghost); making the stuck bar full-bleed again via position:fixed (second height pin + complexity, no requested behavior).

## Asset requests

| Asset | Position in design | Min size / format | Status                                          |
| ----- | ------------------ | ----------------- | ----------------------------------------------- |
| -     | -                  | -                 | none needed; CSS / JS / draft-head changes only |

## Foundational checks

H1: no destructive file operations (edits + new spec files only). H3: uncertainties batched in Open questions below.

## Breakdown

- [x] Ticket 1 - condensed per-page `nav:` lists for all 4 fallback pages + 28-char label cap (DR-0004) in the verify-page-md gate + tests - DONE 2026-11-24 (evidence/t1-verify.md)
- [ ] Ticket 2 - CSS: bar = body content width, buttons expand to fill it equally, ellipsis edge (DR-0001)
- [ ] Ticket 3 - scroll-spy JS + red-line active state via `--cs-index-active` (DR-0002; lands parent case-study-nav Ticket 4)
- [ ] Ticket 4 - verify: tests, build + guards, Playwright 1440/768/390, review gates, captures

## Open questions

| Question                                                                                                                                                                                                          | Owner | Blocks build?                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------- |
| "unredlined" read as "a red line": active state = 3px #d73735 inset line on the aria-current button, replacing underline for active (hover keeps underline). Alternative: persistent white underline while active | Pedro | No - default chosen, one CSS value to flip                                                                  |
| Active line on the red bar (digital-closet head bg #d73735): red-on-red is invisible, so `--cs-index-active: #fff` there - confirm white, or another contrast pick                                                | Pedro | No - token default + one override                                                                           |
| Equal-width expanding buttons (flex 1, tab-strip) vs natural-width buttons left-aligned inside the content-width bar                                                                                              | Pedro | No - DR-0001 chose equal fill, flip is one flex value                                                       |
| Label cap 24 chars (ASSUMPTION) and teachr's "Deepdive: Teachr Assistant" (27 chars, 238px): condense to "Assistant" or grandfather it above the cap                                                              | Pedro | No - gate value, one constant                                                                               |
| Proposed condensed lists per page (DR-0003) - confirm or edit labels/ids                                                                                                                                          | Pedro | Yes for Ticket 1 copy - defaults proposed, fallback = keep first-5 with shortened labels only where flagged |
| Narrow-width overflow with equal buttons: ellipsis + `title` (chosen) vs internal horizontal scroll strip (v2 behavior)                                                                                           | Pedro | No - ASSUMPTION, one CSS block to flip                                                                      |
