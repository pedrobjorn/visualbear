# Ticket 2 v4 (DR-0005) verify - Play card is the LAST card in the index gallery (2026-11-14)

RED -> GREEN on `scripts/test/gallery-order.test.js` (renders the gallery
macro through nunjucks with a fixture: one work card + one bottom-flagged
card, showPlay true):

- RED: "Play card is the LAST card - after the bottom-flagged closet card" failed
- GREEN after moving the `{% if _showPlay %}` block after the bottom-flagged
  loop in `gallery.nunjucks`: `npm test` -> mirror-link PASS, tabs PASS,
  play-data OK, gallery-order OK

Build + output:

- `npm run build` exit 0, all 5 release-guard checks OK
- `build/index.html` order: closet card < `id="play-teaser"` < `#about`
  (Play last in the gallery); the template comment switched to a nunjucks
  `{# #}` comment so no internal note ships in the HTML
- mirror `build/selected-works/index.html`: 0 `play-teaser` strings, 0
  `../play` hrefs (stripPlayTeaser anchor-only strip still works)

Visual probe (Playwright, static serve of `build/`; captures
`t2d-index-1440.png` / `t2d-index-390.png`):

- 1440 + 390: `cardH: 112`, `titleInsideCard: true`, `cardInsideGallery: true`,
  `galleryBottomDelta: 32` (gallery padding only - the Play card is flush at
  the gallery bottom; was 307 when the closet card sat below it), zero
  console errors, click -> `/play/`
