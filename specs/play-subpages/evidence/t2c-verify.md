# Ticket 2 v3 (DR-0004) verify - slim Play card inside the index gallery (2026-11-14)

RED -> GREEN on the title fit (Playwright, static serve of `build/`):

- RED: slim class + 112px height WITHOUT the title-fit rule -> `cardH: 112`,
  `titleInsideCard: false` at 1440 and 390 (the DR-0003 overflow reproduced
  inside the gallery)
- GREEN: added `.card--thin .card-container.card.medium .card-image .card-title
{ padding: 8px 16px; }` -> rebuild -> `cardH: 112`, `titleInsideCard: true`,
  `h2InsideCard: true`, `cardInsideGallery: true` at BOTH widths, zero console
  errors, click -> `/play/`. Captures: `t2c-index-1440.png`, `t2c-index-390.png`

Note: the t2b-index-\*.png captures (v2, full-size card) were overwritten by
later probe runs and are removed; v2's record is the measurement log in
t2b-verify.md.

Build + output:

- `npm run build` exit 0, all 5 release-guard checks OK
- `build/styles/main.css` carries both rules:
  `.card--thin .card-container.medium.card{height:112px}` and the 8px title padding
- `build/index.html`: `a#play-teaser.card--thin` inside the `#work` gallery,
  href `../play`, copy "Play / Stuff I do for fun"
- mirror `build/selected-works/index.html`: 0 `play-teaser`, 0 `../play` hrefs
  (stripPlayTeaser targets the anchor id; fixture in mirror-link.test.js updated
  to the `card--thin` class)
- `npm test`: mirror-link PASS, tabs PASS, play-data OK

Implementation note: the slim look uses the card macro's existing `class`
passthrough (`class: "card--thin"`) - no new macro flag was added (DR-0004).

Open items (not blockers): Play card img is the existing shipped thumb
`gallery_thumb_prettyugly.jpg` (ASSUMPTION - Pedro to validate or replace; H2).
