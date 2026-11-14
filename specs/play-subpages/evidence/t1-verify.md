# Ticket 1 verify - play.json is exactly Blog + Photography (2026-11-14)

RED -> GREEN on `scripts/test/play-data.test.js` (wired into `npm test`):

- RED: `npm test` -> `AssertionError: actual: 3, expected: 2` (old play.json had 3 cards)
- GREEN after the play.json rewrite: `mirror-link.test: PASS`, `tabs.test: PASS`, `play-data.test: OK`

Build + rendered output:

- `NODE_ENV=production ./scripts/gulp.sh --production --headless` -> exit 0
- `npm run build` (release: headless build + release-mirror + release-guard) -> exit 0, all guard checks OK
- `build/play/index.html`: card hrefs = exactly `["../play/blog","../play/photography"]`; no `play_graphic_design`/`play_drawings`/`play_photography`/`play_web` hrefs; titles Blog + Photography present; card bg images `../images/work/thumbs/gallery_thumb_prettyugly.jpg` and `gallery_thumb_dukebox.jpg`, both present in `build/images/work/thumbs/`
- `src/_data/play.json` parses as JSON

Gates: `npm run lint` -> 0 errors (9 warnings, all pre-existing in `tabs-core.js`/`tabs.js`).
`npm run format:check` -> 11 files warn, all pre-existing in `specs/visualbear-system/` (confirmed identical at HEAD via stash); every file touched by this ticket is prettier-clean.

Open items (not blockers): card imgs are existing shipped thumbs (ASSUMPTION - Pedro to validate or replace); play-specific card art is a pending asset (H2) and blocks visual sign-off only. Subtitle copy defaults "Ramblings" / "Phone shots" (Pedro).
