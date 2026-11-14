# Ticket 8 verify - photogallery folder scan in gulp/nunjucks.js (2026-11-14)

Change: in `gulp/nunjucks.js`, right after the foldero load (and before the `--debug` dump, so the debug output includes it): scan `path.join(dirs.source, dirs.images, 'play', 'photography')` (= `src/_images/play/photography/`) for `.jpg/.jpeg/.png/.webp`, map each to `{ file, title, img }` (`title` = basename minus extension with `-`/`_` runs humanized to spaces, `img` = bare filename), sort by mtime descending, strip the mtime helper field. Missing folder -> `siteData.photogallery = []`, no error.

Note on `--debug`: passing it through `gulp.sh` makes gulp-cli respawn node with a literal `node --debug` flag, which exits 9 on the pinned Node 10 - so the flag can't be exercised through the CLI. Verified the injected data instead with a throwaway probe template (`src/probe-photogallery.nunjucks` containing `{{ site.data.photogallery | dump | safe }}`), which exercises the real task pipeline (foldero + scan + `plugins.data` injection); probe and test photos removed afterwards.

Agent-checkable acceptance:

- Missing folder (current repo state): headless `nunjucks` task exit 0, probe rendered `[]`; full `npm run build` exit 0, all guard checks OK, no error
- Dropped 3 temp photos with controlled mtimes (`beach-day.jpg` 11-13, `studio_shot.png` 11-12, `old-photo.jpeg` 11-10) and re-ran the nunjucks task: probe rendered `[{"file":"beach-day.jpg","title":"beach day",...},{"file":"studio_shot.png","title":"studio shot",...},{"file":"old-photo.jpeg","title":"old photo",...}]` - newest first, titles humanized, exact `{file,title,img}` shape
- Dropped a 4th newer photo (`newest-upload.jpg`, 11-14), re-ran: it became the first entry
- `npm test` -> all 4 suites PASS/OK

Gates: `npm run lint` -> 0 errors (9 pre-existing warnings, none in `gulp/nunjucks.js`); prettier `--check gulp/nunjucks.js` clean.

Open items (not blockers): seed photos are Pedro's pending asset (H2) - blocks T8/T14 sign-off only; no placeholder photos ship. Watch wiring for the folder is T9.
