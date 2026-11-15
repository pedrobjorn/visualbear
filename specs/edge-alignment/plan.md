# Plan: edge alignment - body content spans the nav's `.content` box on all devices, all public pages

- Date: 2026-11-15
- Status: shipped 2026-11-15 under DR-0002 (tickets 1-10 done; 44/44 edge-probe combos PASS at nav box +-16)
  icon + nav text limit, i.e. the nav's 16px page margin applied to body
  content; only image bleeds touch the viewport edge) - tickets 7-10
- Evidence: Pedro's request 2026-11-15 ("body content a bit narrower than the
  menu elements - match the edges of the logo / navigation buttons on all
  devices"); edge probe of the 2026-11-15 build (nav `.content` 262..1178
  @1440, 0..390 @390; body text 300..873 home @1440, 36..354 workflow @390,
  33.9..356 resume @390). Contract in DR-0001.

## Problem / opportunity

The nav bar and the body use different page columns: nav `.content` is
916px, body containers are 900px with extra inner insets (14.4px col gutter,
32/36px text-box padding). Measured gap between menu element edges and body
text edges: ~38-42px desktop, ~24-30px mobile. Pedro wants one column.

## Goal

At 320 / 390 / 768 / 1440 on every public page (`/`, `/play/`,
`/play/photography/`, `/play/blog/`, `/play/blog/hello-world/`, `/workflow/`,
`/styleguide/`, `/resume/`, `/about/`, case studies), body text and content
boxes sit 16px inside the nav `.content` box on each side (the nav's page
margin): desktop 278..1162 at 1440, mobile 16..vw-16 (measured, <= 0.5px
delta). The right edge equals the nav's text limit; the left edge sits at
the home icon. Only image bleeds (full-bleed media, photogrid) may touch
the viewport edge. All gates green; captures in evidence/.

## Non-goals

- No text at 0px gutters: inner text padding stays (32px desktop, 16px below
  916px) - the nav links have the same relationship to the nav box.
- No change to the photogrid's full-bleed behavior (already edge-to-edge,
  T18) or to full-bleed bands (`cs-wide--full`).
- No copy changes except the styleguide width-tier numbers (ticket 5).
- No new components; this is width/padding unification only.

## Approach

Single source for the column: `$content-width: 916px` in `_variables.scss`
(the nav `.content` max-width becomes the variable too). Replace every
900px content cap with it; drop the gallery col gutter inside
`.content.gallery`; drop the sub-916px text-box gutter 36 -> 16. Details and
per-file anchors in tickets.md. Alternative rejected: keeping 900px and
shrinking the nav to match - Pedro chose the nav edges as the target.

## Asset requests (H2)

| Asset | Position | Min size / format | Status      |
| ----- | -------- | ----------------- | ----------- |
| -     | -        | -                 | none needed |

## Foundational checks

- H1: no destructive operations - edits only.
- H2: no new assets.
- H3: target edges and scope answered by Pedro 2026-11-15 (nav container
  edges, all public pages) - recorded in DR-0001.

## Breakdown

- [x] Ticket 1 - `$content-width: 916px` variable; nav `.content` + all 900px caps use it
- [x] Ticket 2 - gallery card columns span the full column (col gutter out inside `.content.gallery`)
- [x] Ticket 3 - sub-916px text-box gutter 36 -> 16 (case-study + styleguide demo wrapper)
- [x] Ticket 4 - resume/about `.text-container` on the column + small-screen gutter
- [x] Ticket 5 - styleguide width-tier doc numbers (900/836 -> 916/852)
- [x] Ticket 6 - verify: edge probe all pages x 4 widths, captures, gates
      (superseded expectations - re-run under tickets 7-10)
- [x] Ticket 7 - gallery card gutter 0 -> 16px (cards at nav box +-16, DR-0002)
- [x] Ticket 8 - text-box gutter 32 -> 16px at all widths; bleed cap 16 -> 8px
      below 916px (nothing but image bleeds touches the viewport edge)
- [x] Ticket 9 - text-container/hero/resume gutters to 16px at all widths
- [x] Ticket 10 - styleguide copy 916/852 -> 916/884; re-probe + captures + gates

## Open questions

| Question                                             | Owner | Blocks build? |
| ---------------------------------------------------- | ----- | ------------- |
| None - target and scope answered by Pedro 2026-11-15 | -     | -             |
