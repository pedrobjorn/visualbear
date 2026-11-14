# Ticket 2 (amended, DR-0003) verify - Play card inside the index gallery (2026-11-14)

Why the amendment: the first approach (separate 112px `card--thin` teaser
block below `#work`) broke visually - measured on the shipped build
(Playwright 1440 + 390): `.card-title` is ~118px tall (16px padding + h2 +
p) inside the 112px card, so it overflowed the card's top edge onto the
gallery gradient background (Pedro: "messes with the background and hiding
the text"). Fix: Play renders as a normal 256px card at the bottom of the
work gallery via the gallery's existing `showPlay` mechanism; the `thin`
flag, `.card--thin`, `.play-teaser` and `card-thin.test.js` are removed.

RED -> GREEN on the amended `stripPlayTeaser` case in
`scripts/test/mirror-link.test.js` (fixture now an in-gallery anchor):

- RED: old wrapper-based strip did not match -> "strip removes the
  in-gallery Play card anchor" failed
- GREEN: `npm test` -> mirror-link PASS, tabs PASS, play-data OK

Build + output:

- `npm run build` exit 0, all 5 release-guard checks OK
- `build/index.html`: `a#play-teaser` sits between `#work` and `#about`
  (inside the gallery), href `../play`, copy "Play / Stuff I do for fun";
  no `play-teaser` wrapper or `card--thin` markup; `build/styles/main.css`
  has neither rule
- mirror `build/selected-works/index.html`: 0 `play-teaser`, 0 `../play`
  hrefs, gallery wrapper and sibling cards intact

Visual probes (Playwright, static serve of `build/`; the v2 full-page
captures `t2b-index-*.png` were later overwritten by probe re-runs and are
removed - this measurement log is the v2 record; v3 captures are
`t2c-index-*.png`, see t2c-verify.md):

- 1440 + 390: card found, href `../play`, text "Play Stuff I do for fun",
  card height 256, `titleInsideCard: true`, `h2InsideCard: true` (no
  overflow), `cardInsideGallery: true`, zero console errors
- click at 1440 -> `http://localhost:3999/play/`
- card order: work cards, Play card, then the bottom-flagged closet card
  (galleryBottomDelta ~307px = the closet card below it)

Open items (not blockers): Play card img is the existing shipped thumb
`gallery_thumb_prettyugly.jpg` (ASSUMPTION - Pedro to validate or replace;
H2). Lint 0 errors (9 pre-existing tabs warnings); spec files prettier-clean.
