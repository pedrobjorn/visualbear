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

## Regression proof - no existing page/component is impacted (2026-11-14)

Method: clean git worktrees built with the identical pipeline (`gulp --production --headless`), compared file-by-file (html/xml), whitespace-normalized:

- T10 in isolation (f3d5256 vs 4ed5584, its parent): ZERO content diffs across all pages. Raw diff shows only added whitespace-only lines inside card anchors on the 6 card-rendering pages (index, play, play/blog, styleguide, visualbear, workflow) - the `{% if %}` flag lines emit a newline when the flags are off. No markup, attribute, text, or URL changed anywhere.
- Whole play-subpages chain (f3d5256 vs d0d1116, pre-T3): the ONLY diffs are the intended ones - `blog/index.html` and `play/play_photography/index.html` removed (T3 stub deletion), `play/blog/index.html` + `play/blog/hello-world/index.html` added (T4-T7), and `sitemap.xml` loses exactly the `play_photography` `<url>` block (T3). `/`, `/play/`, all case studies, about, workflow, styleguide, resume, and the remaining `play_*` stubs are byte-identical (whitespace-normalized).
- Component level: `card.nunjucks`/`gallery.nunjucks` changes are additive `{% if spec.grid/notext/lightbox %}` branches with `or false` defaults - existing `card.content({card: val})` call sites never set the flags, so they render the same markup; verified by the zero content diff above plus `npm test` (play-data, gallery-order, mirror-link suites all PASS).
