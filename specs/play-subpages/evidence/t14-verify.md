# Ticket 14 verify - `/play/photography/` page (2026-11-14)

Change: new `src/play/photography/index.nunjucks` - extends `_layouts/gallery.nunjucks`, `baseUrl = '../../'` (depth 2), NO hero call, just `gallery.content({content: site.data.photogallery, contentType: 'photogrid'})` + `lightbox.content({})` (dialog markup, hidden) + `<script type="application/json" id="photogrid-data">{{ site.data.photogallery | dump | safe }}</script>`.

Agent-checkable acceptance (built with 2 temp photos, newest first; probe via Playwright/Chromium; screenshots t14-photography-1440.png / t14-photography-390.png in this dir):

- `build/play/photography/index.html`: 0 `<h1>` (no hero), `.gallery-grid` present, grid cards newest-first (`beach day` = `data-lb-index="0"`, then `studio shot`), card hrefs/imgs `../../images/play/photography/<file>`, images ship in `build/images/play/photography/`
- Dialog present and hidden: `class="lightbox" hidden role="dialog" aria-modal="true"`, computed `display: none`
- `#photogrid-data` JSON matches `site.data.photogallery` order exactly (probe: `dataMatchesGrid: true`, first = "beach day")
- Browser @1440: 3-col grid, 2 cards rendered; @390: 2 cols; zero console errors
- Empty folder (final committed state, only `.gitkeep`): headless nunjucks exit 0, page renders gallery shell with 0 cards, `#photogrid-data` = `[]`, dialog still present+hidden, no template errors
- `npm run build` (release) exit 0, all guard checks OK; `npm test` 5/5 suites pass; `npm run lint` 0 errors (9 pre-existing warnings)

Note: the `.content.gallery:has(.gallery-grid)` rule from T11 removes the 66vh hero spacer on this hero-less page, so the grid starts at the top on desktop too.

Open items: seed photos pending (H2) - sign-off with real photos; lightbox behavior is T15.
