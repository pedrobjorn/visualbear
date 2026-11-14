# Ticket 12 verify - lightbox core (`lightbox-core.js`) + npm test (2026-11-14)

Changes:

- New `src/_modules/molecules/lightbox/lightbox-core.js` (CJS, `var`/function-declaration style like `tabs-core.js`): `stepIndex(i, dir, len)` - wrap-around stepping both directions, out-of-range indexes clamped, `len <= 0` -> `-1` (no selection), single item stays on 0; `normalizePhotos(list)` - rejects non-arrays and entries missing/empty `img` or `title` (throws), returns a clean `[{ img, title }]` with extra fields (e.g. `file`) stripped
- New `scripts/test/lightbox.test.js` (plain-node asserts, same shape as `tabs.test.js`): forward/back wrap, single item stays both directions, empty list safe (`-1` for any index), `[]` passes through, non-array/null/missing-img/missing-title/empty-img all throw
- `package.json` `test` script: appended `&& node scripts/test/lightbox.test.js`

Agent-checkable acceptance:

- `npm test` -> `mirror-link.test: PASS`, `tabs.test: PASS`, `play-data.test: OK`, `gallery-order.test: OK`, `lightbox.test: OK` (5 suites in the run output)
- `grep -c "document\|window" src/_modules/molecules/lightbox/lightbox-core.js` -> 0 (no DOM access); module loads under plain `node -e require(...)`
- `npm run build` (release) -> exit 0, all guard checks OK
- `npm run lint` -> 0 errors (9 pre-existing warnings, none in the new files)

Gates: prettier glob doesn't cover `scripts/test/` or `package.json`; specs files touched here are prettier-clean.

Out of scope per ticket: markup/styles (T13), controller + boot (T15).
