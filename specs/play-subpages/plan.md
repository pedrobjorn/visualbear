# Plan: Play sub-pages - a blog and a photogallery under /play/

- Date: 2026-11-14
- Status: draft
- Evidence: Pedro's request 2026-11-14 (this spec change IS the requirement; no analytics attached - ASSUMPTION: blog and photography are "play" content, so they live under `/play/`, not at the root)

## Problem / opportunity

`/play/` today lists three cards whose sub-pages render the placeholder word "test", and there is a vestigial `src/blog/` stub (it references a data key that does not exist). Pedro wants two real sub-pages under Play: a blog and a photogallery, built with the same design system and the same code stack. The index should surface Play through one thinner card below the work gallery.

## Goal

Ship `/play/blog/` (hero + gallery of posts; post pages in the case-study shape) and `/play/photography/` (no hero; thumbnail grid + lightbox modal), both in this repo as sub-pages of `/play/`, reachable from the index via a thinner Play card below the gallery.

## Non-goals

- No nav, sitemap, footer, hero or card redesign; no changes to case studies, the workflow system page, or the release/mirror pipeline. Play pages stay public-only.
- The old `play_*` stubs (`play_graphic_design`, `play_drawings`, `play_web`) become unlinked but are NOT deleted. Only the two superseded stubs (`src/blog/`, `src/play/play_photography/`) are removed (Ticket 1).
- No CMS or upload UI. Adding a post = drop the md file + prepend one entry to `blog.json` (manual, by design). Adding photos = drop files in the folder (automatic, DR-0002).
- No pagination, albums, or captions beyond the lightbox title.

## Approach

- Routes under `/play/` (DR-0001): `/play/blog/`, `/play/blog/<slug>/`, `/play/photography/`.
- Play keeps its current shape (hero from `playhero.yml` + gallery); `play.json` becomes exactly two cards: Blog, Photography.
- Index: the work gallery renders the built-in Play card at the bottom of the gallery, slim (112px, `card--thin` with the title-fit fix) - `showPlay: true, showBlog: false`, linking to `../play` (placement per DR-0003, slim per DR-0004).
- Blog index mirrors the index structure: hero organism + gallery `contentType: 'blog'` over `src/_data/blog.json`. Card title = post title, card subtitle = post date.
- Blog posts reuse the case-study structure 1:1: work layout + `mdhero`/`mdpage` filters on `src/_data/pages/blog-<slug>.md` + `buttonslider` prev/next from `src/_data/project_blog_<slug>.json`. The existing markdown pipeline (`AUTHORING.md`) applies unchanged.
- Photogallery: new gallery `contentType: 'photogrid'` - the card molecule in a CSS grid, text suppressed, hover is a red outline only. Fed by `site.data.photogallery`, which the nunjucks gulp task builds by scanning `src/_images/play/photography/` newest first (DR-0002).
- New lightbox molecule: modal with the image, left/right arrows stepping through the grid, a small title at the bottom, close via button/Esc/backdrop.

## Asset requests

| Asset                          | Position in design                      | Min size / format                          | Status                                                                                                |
| ------------------------------ | --------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 3-5 seed photos                | photogrid thumbs + lightbox             | jpg, shipped through the existing imagemin | pending (Pedro) - blocks Tickets 8/14 sign-off (H2)                                                   |
| 1 seed post cover              | first blog card img + post hero         | jpg thumb like `src/_images/work/thumbs/*` | pending (Pedro) - blocks Ticket 7 (H2)                                                                |
| Play/Blog/Photography card img | `/play/` cards + the index thinner card | jpg card                                   | default: reuse existing shipped thumbs (ASSUMPTION - needs Pedro's validation); play art pending (H2) |

Verified 2026-11-14: the `play-*-card.jpg` files the current `play.json` references do not exist in the repo, so those cards already render broken images - the card imgs are new assets, not reuses. Empty states (zero photos, zero posts) must still render without errors. No placeholder fallback ships for the pending assets (H2) - each pending asset blocks only the section that needs it.

## Foundational checks

H1: Ticket 3 deletes the two superseded stub dirs (`src/blog/`, `src/play/play_photography/`) - both are committed placeholders, linked from nowhere after `play.json` changes; the deletion is named here because it is destructive. H2: the pending image assets above block only the section that needs them; no placeholder fallback. H3: material uncertainties are batched in Open questions below, each with an owner.

## Breakdown

Tickets are ordered by dependency - build top-down. All are size S; each is independently verifiable, and each ticket carries a "Manual test steps (Pedro)" section for hand-testing (`npm run serve` -> http://localhost:3000 unless the step says otherwise).

- [x] Ticket 1 - `play.json` becomes exactly Blog + Photography cards
- [x] Ticket 2 - thinner Play card below the index gallery (`card--thin`)
- [x] Ticket 3 - remove the superseded stubs + reference grep
- [x] Ticket 4 - blog index shell: `bloghero.yml` + `/play/blog/` page
- [x] Ticket 5 - `blog.json` entries repointed, date as subtitle
- [x] Ticket 6 - blog post shell `/play/blog/<slug>/index.nunjucks`
- [x] Ticket 7 - seed post data + top card (md, project json, `blog.json` prepend)
- [x] Ticket 8 - photogallery folder scan in `gulp/nunjucks.js`
- [x] Ticket 9 - dev watch wiring for the photography folder
- [x] Ticket 10 - photogrid macros (gallery branch + card `grid`/`notext` flags + lightbox data hooks)
- [ ] Ticket 11 - photogrid styles (grid layout, red-outline-only hover)
- [ ] Ticket 12 - lightbox core (`lightbox-core.js`) + `npm test`
- [ ] Ticket 13 - lightbox markup + styles
- [ ] Ticket 14 - `/play/photography/` page (grid + data JSON + dialog)
- [ ] Ticket 15 - lightbox controller + boot
- [ ] Ticket 16 - verify: gates, evidence, both authoring flows

## Open questions

| Question                                                                     | Owner | Blocks build?                   |
| ---------------------------------------------------------------------------- | ----- | ------------------------------- |
| Seed photos + blog card img + post cover (assets above)                      | Pedro | Yes, for that section only (H2) |
| Date format on blog cards: "14 Nov 2026" (default) vs ISO `2026-11-14`       | Pedro | No - one-line change per entry  |
| Lightbox title source: humanized filename (default) vs a titles sidecar json | Pedro | No                              |
