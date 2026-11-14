# Ticket 17 verify - photography view switch (grid / full size), sticky below header (2026-11-14)

Changes (all additive; source diff vs c52df4a: only the lightbox.js selector broadening `.gallery-grid` -> `.content.gallery` shows as removed lines):

- `src/play/photography/index.nunjucks`: `.photoview` wrapper (padding-top 48px to clear the fixed nav) containing the switch - `<div class="photoview-switch" role="group" aria-label="Photo view">` with two buttons `data-view="grid"` (aria-pressed=true, default) and `data-view="full"` - above the gallery call
- `gallery.nunjucks` photogrid branch: additionally renders a hidden `.gallery-full` container - the same photos as stacked full-width `<img loading="lazy">` anchors with the same `data-lb-index`/`data-lb-img`/`data-lb-title` hooks (lightbox + no-JS href fallback work from full view too)
- `gallery.scss` (appended, scoped to new classes only): `.photoview-switch` sticky bar `position: sticky; top: 48px; z-index: 1` (fixed `nav.site-nav` is 48px at z-index 2) on a solid `$vb-dark` plate; buttons min-height 44px, active = red border (`$vb-primary`, 3.4:1 UI indicator on the dark plate) with `$vb-light` ink (15:1); `.gallery-full` stacked images `width: 100%; height: auto`; explicit `[hidden]` display rules for both containers
- New `photoview.js` controller (gallery organism, booted from main.js, no-op without the switch): toggles `hidden` on the two containers + `aria-pressed` on the buttons; no persistence, grid is always the default
- `lightbox.js`: click delegation moved to the shared `.content.gallery` so anchors in either view open the lightbox

Agent-checkable acceptance (Playwright/Chromium on the release build with the 5 preview photos; screenshots t17-photography-\*-1440/390.png in this dir):

- Default: grid visible, `.gallery-full` hidden, Grid `aria-pressed="true"`; switch bar top = 48px at scroll 0 (clears the fixed header)
- Click "Full size": grid hidden, full view shown with 5 stacked images at content width (868px @1440, 358px @390), page scrollable, Full pressed; after scrolling 600px the switch bar's top stays at exactly 48px = header bottom (sticky below the header, verified at 1440 AND 390)
- Lightbox opens from the full view (clicked item 2 -> preview-market.jpg + caption "preview market"); Esc closes; switching back to Grid restores the grid and aria-pressed
- Empty folder: switch renders, both containers empty, `#photogrid-data` = `[]`, exit 0, no errors
- Zero console/page errors in all states and both viewports
- Regression: worktree build diff (c52df4a vs 70cda5f, identical pipeline) - every existing page's HTML/XML byte-identical except `play/photography/index.html` (the intended page); all added CSS scoped to photoview/gallery-full/photofull classes
- Gates: `npm run build` exit 0 + 5/5 guards OK, `npm test` 5/5, `npm run lint` 0 errors (9 pre-existing warnings), prettier clean
