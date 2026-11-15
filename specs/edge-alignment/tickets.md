# Tickets: edge alignment - body content spans the nav `.content` box

- Part of: specs/edge-alignment/plan.md (contract in DR-0001)
- Target: at 320 / 390 / 768 / 1440, on `/`, `/play/`, `/play/photography/`,
  `/play/blog/`, `/play/blog/hello-world/`, `/workflow/`, `/styleguide/`,
  `/resume/`, `/about/`, case studies - body container left/right == nav
  `.content` left/right (<= 0.5px). Nav `.content` = max-width 916, margin
  auto, full-bleed below 916 (base.scss).
- Page column today: 900px caps in many files (see ticket 1 anchors).

## STRICT RULES

1. One source of truth: `$content-width: 916px` in
   `src/_styles/utilities/_variables.scss`; every page-column cap uses it.
2. Inner text gutters stay readable: 32px on desktop (>= 916px viewport),
   16px below 916px - matching the nav links' own inner padding, so text
   edges land where menu text lands. Never 0px text gutters.
3. No copy changes except ticket 5's styleguide width numbers. No new
   components. Full-bleed media bands (`cs-wide--full`, photogrid) untouched.

---

# Ticket 1: `$content-width` variable + replace every 900px page-column cap

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: system
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-edge-probe.json (44/44 PASS)

## Requirements

- Add `$content-width: 916px !default;` next to `$vb-primary` in
  `src/_styles/utilities/_variables.scss` (~line 37).
- `src/_styles/atoms/_base.scss` `.content` (~line 101): `max-width: 916px` ->
  `max-width: $content-width` (the reference box).
- Replace `900px` with `$content-width` in exactly these page-column rules:
  - `src/_modules/organisms/gallery/gallery.scss`: `.content.gallery`
    max-width (line 5), `.photoview-title` (line 95), `.photoview-switch`
    (line 112)
  - `src/_styles/templates/_gallery.scss`: `.text-box` width (lines 296, 477,
    633), `.gallery-text` max-width (line 643), `.text-box` max-width
    (line 782)
  - `src/_styles/molecules/_textelements.scss`: `.text-container` width (lines
    115, 165, 213) and max-width (line 271)
  - `src/_styles/atoms/_typography.scss`: `.text-container` width (lines 450,
    515, 572) and max-width (line 646)
- Do NOT touch: comments mentioning 900px viewport bands
  (`_gallery.scss:568`, `_base.scss:150-159`, `headline.scss:46`), the
  commented-out `width: 900px` (textelements:195), or non-column 900px values.

## Acceptance criteria (agent-checkable)

- [ ] `grep -rn "900px" src/**/*.scss` shows only comments/non-column uses
- [ ] `grep -rn '\$content-width' src/` lists the 13 rules above + base `.content`
- [ ] Probed at 1440: `.content.gallery`, `.text-box`, `.text-container` boxes
      all equal nav `.content` box (262..1178); at 390: all 0..390
- [ ] Gates: build exit 0 + 5/5 guards, npm test 5/5, lint 0, format:check
      clean

## Out of scope

- Gutters/padding changes (tickets 2-4); docs (ticket 5).

---

# Ticket 2: gallery cards span the full page column

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: UI
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-edge-probe.json (44/44 PASS)

## Context

Cards inside `.content.gallery` sit in materialize `.row > .col` wrappers;
the col gutter (measured 14.4px) insets the card boxes from the container
edge (cards at 284.4..1155.6 @1440 vs container 270..1170; 14.4..375.6 @390 vs
0..390). The photogrid already zeroes row/col inside its grid
(gallery.scss `.gallery-grid .card--grid .row/.col`) - same pattern here.

## Requirements

- In `src/_modules/organisms/gallery/gallery.scss`, scoped to
  `.content.gallery` (NOT the photogrid, which has its own rules): zero the
  row margin and col padding so card boxes span the container:
  `.content.gallery .row { margin: 0; .col { padding: 0; } }`
- Card-to-card spacing keeps coming from the card molecule's own margin
  (`.medium.card`) - verify visually that cards don't touch.
- All widths: desktop and mobile.

## Acceptance criteria (agent-checkable)

- [ ] Probed at 1440 + 390 on `/` and `/play/`: first/last card boxes' left/right
      == `.content.gallery` left/right (<= 0.5px); cards do not overlap/touch
      (gap > 0 between adjacent card boxes)
- [ ] Photogrid page unchanged (`.gallery-grid` cells still 1px-seam grid)
- [ ] Gates: build + test + lint + format:check clean

## Out of scope

- The photogrid's own rules; hero spacing (`margin-top: 66vh`).

---

# Ticket 3: sub-916px text-box gutter 36 -> 16

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: UI
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-edge-probe.json (44/44 PASS)

## Context

`.case-study .text-box` gets `padding-left/right: 36px` below 907px
(`_case-study.scss:948-953`, comment at 945-947 documents the
`(vw-900)/2 + 32` text-edge formula). The styleguide demo wrapper copies it
(`_case-study.scss:1217-1220`). With the column full-bleed below 916, 36px
puts text at 36..vw-36 while the last nav link's label ends at vw-16.

## Requirements

- `_case-study.scss`: change the `@media (max-width: 907px)` block to
  `@media (max-width: 915px)` and both paddings 36px -> 16px; update the
  comment (text edge below 916 is now a flat 16px).
- `_case-study.scss:1217-1220`: styleguide wrapper padding 36px -> 16px (and
  its media query to 915px to match).
- Desktop (>= 916px) text-box padding stays `0 32px`.

## Acceptance criteria (agent-checkable)

- [ ] Probed at 390 + 320 on `/workflow/` and a case study: text-box text
      edges = 16..vw-16; at 1440: (vw-916)/2+32 .. vw-((vw-916)/2+32)
- [ ] Styleguide demo demos keep no horizontal scroll (scrollWidth ==
      clientWidth at 390)
- [ ] Gates: build + test + lint + format:check clean

## Out of scope

- Desktop paddings; component-level paddings (`cs-wide` 48px etc.).

---

# Ticket 4: resume/about `.text-container` on the column + 16px side gutter below 916

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: UI
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-edge-probe.json (44/44 PASS)

## Context

`.text-container` (resume + about) is `width/max-width: 900px` (ticket 1 moves
it to `$content-width`) with `padding: 32px` in every media band - so on
mobile its text sits at ~32px while the nav logo sits at 6px. box-sizing is
border-box globally, so the 900 was the OUTER width (836 inner) - after
ticket 1 the outer width is 916 and inner 852 at 32px gutter.

## Requirements

- Ticket 1 moves the width; here, in every `.text-container` band rule whose
  range is below 916px viewport (textelements.scss ~211-216, ~265-274 and
  any smaller bands; typography.scss ~566-578, ~640-650 - check each band's
  min/max), change `padding: 32px` to `padding: 32px 16px` (16px side
  gutters, vertical rhythm unchanged).
- Bands >= 916px keep `padding: 32px`.

## Acceptance criteria (agent-checkable)

- [ ] Probed at 1440: `/resume/` and `/about/` `.text-container` outer box ==
      nav `.content` box; at 390: text edges = 16..vw-16
- [ ] Gates: build + test + lint + format:check clean

## Out of scope

- Resume-internal row/col gutters beyond the container (title block layout).

---

# Ticket 5: styleguide width-tier doc numbers

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: copy
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-edge-probe.json (44/44 PASS)

## Requirements

- `src/styleguide/_styleguide_blocks/styleguide.casesystem.nunjucks` line ~34:
  "Content width: 900/836 ... container's 836px inner width at 1440" ->
  "916/852" and "852px inner width at 1440" (916 outer, 32px gutter => 852
  inner). Check the whole width-tiers list for other 900/836 references and
  update them consistently. No other copy changes.

## Acceptance criteria (agent-checkable)

- [ ] Built `/styleguide/` HTML contains "916/852" and no "900/836"
- [ ] Gates: build + test + lint + format:check clean

## Out of scope

- Any other styleguide copy.

---

# Ticket 6: verify - edge probe all pages x 4 widths, captures, gates

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: system
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-edge-probe.json (44/44 PASS)

## Requirements

- Probe script `tools/edge-probe.py` (Playwright, served build): for each
  public page x width in {320, 390, 768, 1440}, record nav `.content` rect
  and the body containers' rects (`.content.gallery`, `.text-box`,
  `.text-container`, first card) and assert left/right equality <= 0.5px.
  Store JSON + console output in `evidence/`.
- Full-page captures at 1440 + 390 for `/`, `/workflow/`, `/resume/`, one
  case study -> `evidence/*.png`.

## Acceptance criteria (agent-checkable)

- [ ] Probe JSON: all pages x widths PASS (container edges == nav edges)
- [ ] `npm run build` exit 0 + 5/5 release-guards; `npm test` 5/5; `npm run
lint` 0 problems; `npm run format:check` clean
- [ ] Diff limited to the scss files of tickets 1-4 + styleguide block +
      `specs/edge-alignment/**`
- [ ] Passes `visuaibear-review` checklist on `/`, `/workflow/`, `/resume/`

## Out of scope

- Mirror/walled-garden behavior (guards cover it).

---

# Ticket 7: gallery card gutter 0 -> 16px (DR-0002 correction)

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: UI
- Status: DONE 2026-11-15 - see evidence/t10-verify.md + t10-edge-probe.json (44/44 PASS)

## Context

Ticket 2 zeroed the row/col gutter inside `.content.gallery`, putting card
boxes flush with the nav box (and on mobile flush with the viewport edge).
DR-0002: cards are body content, not image bleeds - they sit at the nav's
16px page margin like everything else.

## Requirements

- In `src/_modules/organisms/gallery/gallery.scss`, change the ticket-2 rule
  to `.content.gallery .row .col { padding: 0 16px; }` (row margin stays 0).
- The photogrid (`.gallery-grid .card--grid ...`) keeps its zeroed gutter -
  image bleed exception, full-bleed per T18.

## Acceptance criteria (agent-checkable)

- [ ] Probed at 1440 + 390 on `/` and `/play/`: card boxes at nav box +-16
      (278..1162 @1440; 16..374 @390); photogrid cells still 0..vw
- [ ] Gates: build + test + lint + format:check clean

---

# Ticket 8: text-box gutter 32 -> 16px at all widths; bleed cap 8px below 916px

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: UI
- Status: DONE 2026-11-15 - see evidence/t10-verify.md + t10-edge-probe.json (44/44 PASS)

## Requirements

- `src/_styles/templates/_gallery.scss`: all 7 `.text-box { padding: 0 32px }`
  rules -> `padding: 0 16px` (the nav's page margin, all widths).
- `src/_styles/templates/_case-study.scss`: in the `@media (max-width: 915px)`
  block, remove the now-redundant `.case-study .text-box` 16px padding
  override; change the bleed cap from 16px to 8px (`.cs-timeline li`,
  `.cs-quotes`, `.cs-twocol .cs-col`) so bleeding boxes keep 8px clearance
  from the viewport edge - nothing but image bleeds touches the bleed.
- `#styleguide_container .case-study.document-text` stays 16px below 915px.

## Acceptance criteria (agent-checkable)

- [ ] Probed: `.text-box` text at nav box +-16 at 1440 (278..1162) and at
      390 (16..374) on `/workflow/` + a case study
- [ ] No non-image element has left <= 0.5 or right >= vw-0.5 at 320/390 on
      case studies (scrollWidth == clientWidth); `.cs-wide--full` /
      `.gallery-grid` exempt
- [ ] Gates: build + test + lint + format:check clean

---

# Ticket 9: text-container + hero + resume gutters to 16px at all widths

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: UI
- Status: DONE 2026-11-15 - see evidence/t10-verify.md + t10-edge-probe.json (44/44 PASS)

## Requirements

- `src/_styles/molecules/_textelements.scss`: the appended sub-916
  `.text-container` rule becomes unconditional (16px side padding, all
  widths; vertical rhythm from the bands unchanged).
- `src/_styles/templates/_resume.scss`: the appended `#resume_container`
  rule becomes unconditional - `.text-container` 16px sides + `.row`/`.col`
  gutter zeroed at all widths.
- `src/_modules/organisms/hero/hero.scss`: `.hero .content { padding: 0 16px; }`
  (scoped to .hero - the nav's own `.content` must NOT be padded).
- `.photoview-title` / `.photoview-switch` already carry 16px side padding -
  no change.

## Acceptance criteria (agent-checkable)

- [ ] Probed: `/resume/`, `/about/`, `/` hero h1 text at nav box +-16 at 1440
      and 390
- [ ] Nav unchanged: `nav.site-nav .content` box still 262..1178 @1440,
      0..390 @390; logo/link positions untouched
- [ ] Gates: build + test + lint + format:check clean

---

# Ticket 10: styleguide copy + re-probe + captures + gates

- Part of: specs/edge-alignment/plan.md
- Size: S
- Type: copy + system
- Status: DONE 2026-11-15 - see evidence/t10-verify.md + t10-edge-probe.json (44/44 PASS)

## Requirements

- `styleguide.casesystem.nunjucks`: "916/852" -> "916/884"; "852px inner width
  at 1440 (32px gutter; 16px below 916px viewport)" -> "884px inner width at
  1440 (the nav's 16px page margin)".
- Update `tools/edge-probe.py` expectations: body containers/text at nav box
  +-16 (<= 0.5px) on all pages x 320/390/768/1440; plus a no-touch-bleed check
  (no non-image element at the viewport edge on small screens; photogrid and
  `cs-wide--full` exempt).
- Re-run probe, refresh captures at 1440 + 390 for `/`, `/workflow/`,
  `/resume/`, a case study; run all gates.

## Acceptance criteria (agent-checkable)

- [ ] Probe: all page-width combos PASS at the +-16 contract; no-touch-bleed
      check PASS
- [ ] `npm run build` exit 0 + 5/5 guards; `npm test` 5/5; lint 0;
      format:check clean
- [ ] Built `/styleguide/` shows 916/884, no 900/836 or 916/852
