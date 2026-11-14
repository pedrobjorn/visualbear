# Ticket 15 verify - lightbox controller + boot (2026-11-14)

Changes:

- New `src/_modules/molecules/lightbox/lightbox.js` (CJS, tabs.js controller pattern): on boot, if `#photogrid-data` exists, parse via `core.normalizePhotos` (broken JSON -> bail, leaving the no-JS link fallback); delegated click on `.gallery-grid a[data-lb-index]` -> `preventDefault` + open at that index; renders `img.src` (bare filename resolved against the anchors' `data-lb-img` directory) + `img.alt` + caption from the photo title; prev/next buttons and ArrowLeft/ArrowRight step via `core.stepIndex` (wrap both ways); close button, Esc, and backdrop click close; focus moves to the close button on open and returns to the clicked anchor on close; `document.body` scroll locked (`overflow: hidden`) while open; visibility toggles the `hidden` attribute only
- `src/_scripts/main.js`: `require` + `lightbox.init()` in the existing `DOMContentLoaded` boot (no-op on pages without the hooks)

Agent-checkable acceptance (Playwright/Chromium E2E on the real /play/photography/ page with 2 temp photos; screenshots t15-lightbox-open-1440.png / t15-lightbox-open-390.png in this dir):

- Click card 0 -> dialog `hidden=false`, `display: flex`, img `beach-day.jpg`, alt+caption "beach day", focus on `.lightbox-close`, body `overflow: hidden`
- Next button -> "studio shot"; ArrowRight wraps to "beach day"; ArrowLeft wraps back; prev button -> "beach day"
- Esc -> dialog hidden (`display: none`), focus back on the clicked `a.card--grid`, body overflow restored; reopen on card 1 -> "studio shot"; backdrop click -> closed, focus on card; close button -> closed
- No-JS fallback intact: anchor `href` is the real image URL (`../../images/play/photography/beach-day.jpg`)
- 390px viewport: opens on tap, ArrowRight steps correctly
- Single-photo grid: next/prev/arrows all stay on the one photo, Esc closes; empty grid (`[]`): 0 cards, dialog stays hidden, zero console/page errors in every state
- `build/scripts/main.js` bundle contains the lightbox controller; `npm run build` exit 0 + all guard checks OK; `npm test` 5/5 suites pass; `npm run lint` 0 errors, 9 pre-existing warnings (none in lightbox files after brace-style fix)

A11y: dialog semantics + focus behavior asserted via the probe above (role/aria-modal/aria-label from T13, focus trap entry/exit, keyboard stepping, 44px+ targets). A full axe run needs axe-core, which isn't vendored locally (tota11y fetches it remotely) - the axe gate runs with visuaibear-review in T16.
