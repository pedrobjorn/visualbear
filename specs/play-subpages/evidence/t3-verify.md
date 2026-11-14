# Ticket 3 verify - superseded stubs removed, reference grep clean (2026-11-14)

Deletions (named in plan.md Foundational checks H1):

- `git rm -r src/blog src/play/play_photography` - both dirs gone from the tree; the other `play_*` stubs (`play_graphic_design`, `play_drawings`, `play_web`) stay on disk, unlinked (plan non-goal)

Reference cleanup:

- `src/sitemap.xml`: the `https://www.visualbear.com/play/play_photography/` `<url>` block removed (the stub pages it listed no longer exist); `play_graphic_design`/`play_drawings` entries kept - those pages still ship
- `src/_data/blog.json`: the two dead mirror-era hrefs `../visualbear/blog/blog2` / `../visualbear/blog/blog1` repointed to the slug form T5 specifies (`blog2/`, `blog1/`, relative from `/play/blog/`); file still parses as JSON, 2 entries. T5 keeps the remaining entry work (date subtitles, order, img)

Agent-checkable acceptance:

- `grep -rn "visualbear/blog\|play_photography" src/` -> exit 1, zero matches (specs/ excluded per ticket)
- `npm test` -> `mirror-link.test: PASS`, `tabs.test: PASS`, `play-data.test: OK`, `gallery-order.test: OK`
- `npm run build` (release: headless build + release-mirror + release-guard) -> exit 0, all guard checks OK
- Build output: `build/blog/` absent (so `/blog/` 404s - `build/404.html` ships), `build/play/` = `index.html` + `play_drawings` + `play_graphic_design` + `play_web` only
- `grep -rn "visualbear/blog\|play_photography" build/` -> exit 1, zero matches; `build/sitemap.xml` has 0 `play_photography`; `build/play/index.html` card hrefs are exactly `../play/blog` and `../play/photography`; no `blog` hrefs on `build/index.html` outside `play/blog`

Gates: `npm run lint` -> 0 errors (9 warnings, all pre-existing in `tabs-core.js`/`tabs.js`).
`npm run format:check` -> 12 files warn, all pre-existing (11 in `specs/visualbear-system/` + `specs/play-subpages/evidence/t2c-verify.md` from ticket 2); every file touched by this ticket is prettier-clean.

Manual (Pedro): `npm run serve`, open http://localhost:3000/blog/ and http://localhost:3000/play/play_photography/ directly - both show the 404 page; click every card on / and /play/ - none leads to a removed stub.
