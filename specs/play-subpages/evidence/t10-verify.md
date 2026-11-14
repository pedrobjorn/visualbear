# Ticket 10 verify - photogrid macros (2026-11-14)

Changes:

- `src/_modules/organisms/gallery/gallery.nunjucks`: new `{% elif _contentType == 'photogrid' %}` branch - wrapper `<div class="gallery-grid">`, each `site.data.photogallery` entry mapped to `{title: val.title, img: '../../images/play/photography/' + val.file, href: '../../images/play/photography/' + val.file}` and rendered as `card.content({card: mapped, grid: true, notext: true, lightbox: true, index: loop.index0})`
- `src/_modules/molecules/card/card.nunjucks`: three variant flags on the existing card (no new component) - `grid` adds `card--grid` to the anchor class, `notext` omits the `.card-title` span, `lightbox` adds `data-lb-index="{{_index}}"` (spec.index from the gallery loop), `data-lb-img="{{_card.href}}"`, `data-lb-title="{{_card.title}}"`. The anchor keeps the real image URL as `href` (no-JS fallback)

Agent-checkable acceptance (rendered via a throwaway probe template driving the real nunjucks task with 2 temp photos, newest first - probe + photos removed after):

- Output: `<div class="gallery-grid">` with one anchor per photo; `class="card--grid"`; `href="../../images/play/photography/beach-day.jpg"` (real image, no-JS fallback); `data-lb-index="0"` / `"1"` in loop order; `data-lb-img` = href; `data-lb-title="beach day"` / `"studio shot"` (humanized by T8); `background-image: url(../../images/play/photography/<file>)`; NO `.card-title` span inside the cells
- Existing card usages unchanged: `build/play/index.html`, `build/index.html`, `build/play/blog/index.html` still render their `card-title` blocks and contain zero `data-lb-*` / `card--grid`
- `npm run build` (release) -> exit 0, all guard checks OK; `npm test` -> all 4 suites PASS/OK

Gates: nunjucks templates are outside the prettier glob; `npm run lint` -> 0 errors (9 pre-existing warnings).

Note: the photogrid branch hardcodes the depth-2 `../../images/play/photography/` prefix - it only renders on `/play/photography/` (T14). Grid styles are T11; the modal behavior is T15.
