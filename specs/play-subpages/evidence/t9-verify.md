# Ticket 9 verify - dev watch wiring for the photography folder (2026-11-14)

Change: in the dev (`!args.production`) branch of `gulp/watch.js`, the `['nunjucks']` watcher glob list now includes `path.join(dirs.source, dirs.images, 'play', 'photography', '**/*')` (= `src/_images/play/photography/**/*`). Plus `src/_images/play/photography/.gitkeep` so the folder exists from checkout - gulp 3's gaze does not reliably pick up files in directories created after the watcher registers (observed: dropping a photo into a freshly created folder fired nothing; with the folder present at watch start the drop fires).

Agent-checkable acceptance:

- Code check: the dev `['nunjucks']` watcher glob list contains the photography folder glob
- Live dev-serve check (`npm run serve:prod`, dev branch): with the server running, `touch src/_data/blog.json` -> `Starting 'nunjucks'...` fired (sanity, watchers alive); then dropping `watch-test2.jpg` into `src/_images/play/photography/` at 18:24:28 -> log shows `Starting 'nunjucks'...` AND `Starting 'imagemin'...` at 18:24:28 (nunjucks regenerates `site.data.photogallery`, imagemin ships the file; browser reloads on nunjucks end)
- Empty-state intact with the committed `.gitkeep`: probe template through the real nunjucks task rendered `[]` (the `.gitkeep` doesn't match the image-extension filter); a real dropped photo rendered as the first entry `[{"file":"watch-test.jpg","title":"watch test","img":"watch-test.jpg"}]`
- `npm run build` exit 0, all guard checks OK (watch.js is build config, not shipped output); `npm test` all 4 suites PASS/OK

Gates: `npm run lint` -> 0 errors (9 pre-existing warnings); prettier `--check gulp/watch.js gulp/nunjucks.js` clean.

Cleanup: all test photos + the probe template removed; only `.gitkeep` ships in the folder. Production watch unchanged (already full-rebuilds via `sync-mirror`).
