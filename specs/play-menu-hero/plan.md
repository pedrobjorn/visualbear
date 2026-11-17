# Plan: Play menu swap, matching Blog/Photos heroes with per-page spacing, centered Photos title + controls

- Date: 2026-11-17
- Status: draft
- Evidence: Pedro's request 2026-11-17 (five bullets, quoted in Problem). No analytics - ASSUMPTION recorded per item below. Builds on specs/play-consistency (page-play dark gradient shipped).

## Problem / opportunity

Eval of the current code (2026-11-17):

1. AMENDED 2026-11-17 (Pedro: "don't change the hero, change the nav menu - a nav variant just for play, visualbear nav untouched, hero as it was"): the "Play menu" is the NAV on play pages. The nav is rendered once in `_layouts/base.nunjucks` from `_data/sitemap.json` (Work `/#work`, About `/#about`, Contact `#contact`). Play variant (`_data/playsitemap.json`): Blog `/play/blog/`, Photos `/play/photography/`, Contact `#contact` - Work and About removed. The `/play/` hero (`playhero.yml` link list: Welcome / About / Work) is explicitly UNCHANGED.
2. Blog hero: `src/_data/bloghero.yml` is `title: Blog` only, rendered by the standard hero organism: `.hero` fixed at top, `height: 40vh` on desktop, `position: static` under the mobile breakpoint; the gallery clears it via `.content.gallery { margin-top: 66vh }`.
3. Photography has NO hero: `/play/photography/` renders `.photoview` (padding-top 48px for the fixed nav) containing `h1.photoview-title` ("Photography", left-aligned on the 900px content line), the sticky `.photoview-switch` (top 48px, flex row, left-aligned buttons), and the full-bleed `.gallery-grid` (`.content.gallery:has(.gallery-grid)` sets `margin-top: 0`, `max-width: none`, `padding: 24px 0 32px`).
4. So Blog and Photos pages don't match: one has a fixed hero + 66vh spacer + 900px column, the other a bare h1 + full-bleed grid starting at the top.
5. The Photos title and the grid/full controls are both left-aligned; Pedro wants them centered.

## Goal

`/play/` hero menu lists Blog and Photos (no About, no Work); `/play/blog/` and `/play/photography/` share the same hero-organism page structure on the same dark `page-play` ground, with Photos given a bit more hero space and Blog a bit less; the Photography title and the view controls are centered. Measured by computed-style/rect checks and captures at 1440x900 and 390x844.

## Non-goals

- Global nav (sitemap.json) unchanged. Case-study pages, home, about, workflow untouched.
- Blog post pages (depth 3, case-study shape) unchanged - "Blog hero" means `/play/blog/` only.
- No changes to the photogrid/lightbox behavior; the view switch keeps its sticky position (play-consistency T3 will restyle it to the vb-tabs strip; this plan's centering must stay consistent with that).
- No copy beyond the menu labels and "Photography" title.

## Approach

- Ticket 1 (amended per Pedro: nav variant, hero untouched) gives all 7 play pages a play nav menu - Blog, Photos, Contact - via a `{% block nav %}` override in two new play layouts; the visualbear nav (`sitemap.json`) and the `/play/` hero (`playhero.yml`) stay byte-identical.
- Ticket 2 gives `/play/photography/` the shared hero organism (new `src/_data/photohero.yml`), removing the standalone `h1.photoview-title` (one h1 per page - the hero h1 takes over) and adding the hero-clearing spacer for the photogrid on desktop.
- Ticket 3 adds hero spacing modifiers: Photos `hero--roomy`, Blog `hero--snug`, scoped so home/about/other heroes are untouched; page spacers follow the hero height (26vh gap kept, same as the default 40vh + 66vh).
- Ticket 4 centers the Photography title (`hero--center`) and the controls (`.photoview-switch { justify-content: center }`).
- Ticket 5 verifies end to end.

## Asset requests

| Asset | Position in design | Min size / format | Status                                         |
| ----- | ------------------ | ----------------- | ---------------------------------------------- |
| -     | -                  | -                 | none needed; all changes are data/CSS/template |

## Foundational checks

H1: no destructive operations (playhero.yml is edited, not deleted). H3: uncertainties batched below.

## Breakdown

- [x] Ticket 1 - Play NAV variant (Blog/Photos/Contact on play pages only; visualbear nav + /play/ hero untouched) - shipped 2026-11-17, amended same day per Pedro
- [x] Ticket 2 - Photography adopts the hero organism (photohero.yml + template + spacer; remove photoview h1) - shipped 2026-11-17 (hero--roomy 48vh value itself lands in T3; class wired, spacer 74vh in place)
- [ ] Ticket 3 - Hero spacing modifiers: Photos more (hero--roomy), Blog less (hero--snug) + matching gallery spacers
- [ ] Ticket 4 - Center the Photography title and the view controls
- [ ] Ticket 5 - End-to-end verify: npm test, build, guards, probes + captures at 1440/390

## Open questions

| Question                                                                                                                                                            | Owner | Blocks build?                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------- |
| RESOLVED 2026-11-17: "Play menu" = the nav menu on play pages only (nav variant), not the hero, not the global visualbear nav (Pedro's correction; DR-0001 amended) | Pedro | No, but if he means the global nav the scope changes completely     |
| Hero heights proposed: Photos 48vh, Blog 32vh (default is 40vh), spacers keep the 26vh gap (74vh / 58vh) - ASSUMPTION, confirm or adjust the numbers                | Pedro | No - acceptance uses the proposed values, one-line change to retune |
| Menu labels: "Blog" and "Photos" (card says "Photography"; the page title stays "Photography")                                                                      | Pedro | No                                                                  |
