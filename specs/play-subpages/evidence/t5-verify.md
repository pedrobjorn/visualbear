# Ticket 5 verify - blog.json entries repointed, date as card subtitle (2026-11-14)

Change: `src/_data/blog.json` rewritten to the entry shape `{ title, subtitle: <date>, href: "<slug>/", img: "<thumb>" }`:

- Entry 0 "First blog post" -> href `blog2/`, subtitle `14 Nov 2026`, img `../../images/work/thumbs/gallery_thumb_prettyugly.jpg`
- Entry 1 "Second blog posts" -> href `blog1/`, subtitle `14 Nov 2026`, img `../../images/work/thumbs/gallery_thumb_prettyugly.jpg`
- Array order kept (top card = entry 0 = newest first); hrefs were already in slug form from the T3 grep cleanup; imgs moved off the dead mirror-era `../visualbear/images/...` path onto the depth-2 public path; subtitles are now dates in the default "14 Nov 2026" format (date format + real dates are Pedro's open question; titles are draft copy)

Agent-checkable acceptance:

- `grep -rn "visualbear/blog" src/` -> exit 1, zero matches; `visualbear` no longer appears in `blog.json` at all
- `blog.json` parses as JSON, 2 entries
- `npm test` -> all 4 suites PASS/OK
- `npm run build` (release) -> exit 0, all guard checks OK
- `build/play/blog/index.html`: card hrefs `blog2/` and `blog1/` (resolve to `/play/blog/blog2/`, `/play/blog/blog1/`), both `<p class="card-content">` subtitles render `14 Nov 2026`, card bg `url(../../images/work/thumbs/gallery_thumb_prettyugly.jpg)`, and `build/images/work/thumbs/gallery_thumb_prettyugly.jpg` ships
- Live on `npm run serve`: `GET /play/blog/` -> 200, both cards show title + "14 Nov 2026" + slug hrefs in the served HTML

Gates: `npm run lint` -> 0 errors (9 pre-existing warnings). `format:check` -> 12 pre-existing warnings only; all files touched by this ticket prettier-clean.

Open items (not blockers): real dates + date format (Pedro, one-line per entry); the post pages `blog1/`/`blog2/` 404 until authored (T6/T7 flow); seed post cover img pending (H2, T7).
