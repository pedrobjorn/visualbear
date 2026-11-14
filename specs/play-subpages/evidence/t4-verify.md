# Ticket 4 verify - blog index shell `/play/blog/` (2026-11-14)

Changes:

- New `src/_data/bloghero.yml`: `name: blog`, `title: Blog` (same name/title shape as `playhero.yml`; hero macro renders `content.title` as the h1; default copy is Pedro's to rewrite)
- New `src/play/blog/index.nunjucks`: extends `_layouts/gallery.nunjucks`, `baseUrl = '../../'` (depth 2), then `hero.content({content: site.data.bloghero, class: hero-about})` + `gallery.content({content: site.data.blog, contentType: 'blog'})` - mirrors `src/play/index.nunjucks`

Agent-checkable acceptance:

- `npm run build` (release: headless + mirror + guard) -> exit 0, all guard checks OK (22 mirrored pages, air-lock holds - /play/ stays public-only)
- `build/play/blog/index.html` renders: h1 "Blog" hero + one card per `blog.json` entry (2 cards), card hrefs `blog2/` and `blog1/` (depth-2 relative, resolve to `/play/blog/blog2/` etc.), card titles "First blog post" / "Second blog posts"
- Empty state: with `blog.json` temporarily `[]`, headless `gulp --production --headless` exit 0, page renders hero + gallery shell with zero cards, no template errors (file restored afterwards)
- `npm test` -> all 4 suites PASS/OK

Live route check (`npm run serve`, browser-sync on :3000):

- `GET /play/blog` -> 301 -> `/play/blog/` (the card's `../play/blog` href resolves - no more "Cannot GET /play/blog")
- `GET /play/blog/` -> 200, h1 "Blog" in the response
- `GET /blog/` (removed in T3) -> 404, as expected

Gates: `npm run lint` -> 0 errors (9 pre-existing warnings). `npm run format:check` -> 12 pre-existing warnings only; all files touched by this ticket are prettier-clean.

Open items (not blockers): hero copy defaults to "Blog" (Pedro rewrites); card imgs/hrefs inside the blog index are T5+ scope (post pages land with T6/T7).
