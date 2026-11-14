# Ticket 11 verify - photogrid styles (2026-11-14)

Changes (all additive - `git diff 9b80b09..b0a7433 -- src/_modules` = 59 insertions, 2 deletions that are only a trailing space and a missing final newline; no existing rule touched):

- `src/_modules/organisms/gallery/gallery.scss` - appended `.gallery-grid` block: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px`, `repeat(2, 1fr)` under `@include mq($until: mobile)`, square cells via `aspect-ratio: 1/1` + `height: auto; margin: 0` on `.card--grid .card-container.card.medium` (specificity 0,4,0 beats base `.medium.card` 0,2,0), materialize `.row`/`.col` zeroed inside the grid so cells fill their track; plus `.content.gallery:has(.gallery-grid) { margin-top: 0; background: none; }` so the hero-less photography page has no 66vh dead gap (scoped by `:has()`, photogrid pages only)
- `src/_modules/molecules/card/card.scss` - appended `.gallery-grid .card--grid .card-image` `:active/:focus/:hover/:focus-visible` override: `background-color: transparent; background-image: var(--vb-card-img) !important; outline: 2px solid $vb-primary` (#d73735). 0,4,0 beats the base red-plate hover (0,3,0) at equal `!important`, so the plate is suppressed and the image stays visible inside the grid only
- `src/_modules/molecules/card/card.nunjucks` - one inline conditional inside the existing style attribute: `{% if _grid %}; --vb-card-img: url(...){% endif %}` - emits nothing when the flag is off, so existing cards' markup is byte-identical (verified: 0 `vb-card-img` in build/play, build/index, build/play/blog)

Agent-checkable acceptance (Playwright/Chromium against a throwaway probe page driving the real photogrid branch with 3 temp photos; probe + photos removed after; screenshots in this dir):

- 1440px: grid `display: grid`, 3 columns, gap 16px, cells 289x289 (square), 3 cards, 0 `.card-title`, first card href = newest photo, `data-lb-index="0"` (t11-probe-1440.png)
- Hover a grid card: `outline: solid 2px rgb(215,55,53)`, `background-color: rgba(0,0,0,0)`, `background-image` still the photo URL - red outline ONLY, image visible (t11-probe-hover-1440.png)
- 390px: 2 columns, gap 16px, cells 187x187 square (t11-probe-390.png)
- Regression: `/play/` and `/` have zero `.gallery-grid`; hovering their cards still gives the red plate (`background-color: rgb(215,55,53)`, no outline) - the override is scoped
- Compiled `build/styles/main.css` contains all new rules; the base `.medium.card .card-image:hover` plate rule is untouched
- Worktree build diff (pre-T11 `9b80b09` vs T11 `b0a7433`, identical pipeline): all 23 HTML/XML pages whitespace-normalized identical - zero markup changes on existing pages
- Gates: sass compiles, `npm run build` exit 0 + all guard checks OK, `npm test` all 4 suites PASS/OK, `npm run lint` 0 errors (9 pre-existing warnings), prettier clean on `src/_styles/**/*.scss`

Open items: seed photos still pending (H2) - sign-off on the real /play/photography/ page happens at T14+; `:has()` needs a 2023+ browser (older ones just keep the 66vh spacer, no breakage).
