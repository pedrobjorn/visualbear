# Tickets: Play menu + matching Blog/Photos heroes (plan: specs/play-menu-hero/plan.md)

Commands: `npm test`, `npm run build`, `npm run lint`. Browser checks at 1440x900 and 390x844 unless noted. Depends on specs/play-consistency T2 (page-play dark ground) which is shipped.

## Ticket 1: Play NAV variant - Blog + Photos + Contact on play pages only; visualbear nav and the /play/ hero untouched

- Status: SHIPPED 2026-11-17, AMENDED same day per Pedro ("don't change the hero, change the nav menu - a nav variant just for play") - the first draft (hero edit in playhero.yml) was reverted (git diff on playhero.yml is empty); play-menu.test green, npm test 9/9; build + all 5 release guards OK (mirror-link.js relativizes the play hrefs for the mirror zone); browser at 1440/390: play pages show nav Blog/Photos/Contact, / + /about/ + /workflow/ + /art-ent/ keep Work/About/Contact, /play/ hero still has the original Welcome/I'm Pedro/Here's-stuff links to ../about and #play, nav click-through works; captures evidence/t1-play-nav-_.png + t1-home-nav-_.png
- Part of: specs/play-menu-hero/plan.md (DR-0001, amended)
- Size: S
- Type: UI + system

## Context

Nav is rendered once in `_layouts/base.nunjucks` from `site.data.sitemap` (Work/About/Contact).

## Requirements

- `base.nunjucks`: wrap the nav in `{% block nav %}{{nav.content({links: site.data.sitemap})}}{% endblock %}` (default unchanged - every non-play page stays byte-identical).
- New `src/_data/playsitemap.json`: Blog `/play/blog/`, Photos `/play/photography/`, Contact `#contact` - no Work, no About.
- New `_layouts/play.nunjucks` (extends gallery) and `_layouts/play-work.nunjucks` (extends work, for the posts), each overriding `{% block nav %}` with `site.data.playsitemap`.
- `play/`, `play/blog/`, `play/photography/` extend play.nunjucks; the 4 blog posts extend play-work.nunjucks. Home keeps gallery.nunjucks.
- `scripts/mirror-link.js` `relativizeNavLinks`: also rewrite `href="/play/blog/"` and `href="/play/photography/"` depth-relative, so mirrored play copies stay inside the walled garden (the release guard failed on the first build without this).
- `playhero.yml` untouched.

## Acceptance criteria (agent-checkable)

- [x] `playhero.yml` still has `../about` and `href="#play"` (hero as it was; git diff empty).
- [x] `sitemap.json` still Work/About/Contact; `playsitemap.json` is exactly Blog/Photos/Contact.
- [x] All 7 play pages extend a play layout; `index.nunjucks` still extends gallery.
- [x] Browser: play pages' nav = Blog/Photos/Contact; non-play pages' nav = Work/About/Contact; `/play/` hero unchanged; nav Photos click-through lands on /play/photography/.
- [x] `npm test` + `npm run build` green incl. all release guards.

## Out of scope

- The `/play/` hero link list, the visualbear nav (sitemap.json), other pages.

## Ticket 2: Photography adopts the hero organism (pages match Blog)

- Status: SHIPPED 2026-11-17 - evidence in evidence/t2-verify.md + evidence/t2-review.md + t2-\*.png captures. New `photohero.yml`; photography template renders `hero.content({content:site.data.photohero, class:'hero--roomy hero--center'})` before `.photoview`, bare h1 deleted (one h1, "Photography"), body `page-play play-photos`; `.photoview` 48px padding + `.photoview-title` rule removed; `body.play-photos .content.gallery:has(.gallery-grid)` spacer 74vh desktop / 0 mobile (mobile mq block placed after the rule so it wins at equal specificity); blog index + 4 posts get `page-play play-blog`. play-hero.test green (watched RED first), `npm test` 10/10, build + 5 release guards OK, lint + format:check clean; probes 26/26 + 12/12 at 1440x900/390x844, zero console errors (grid top 750 >= hero bottom 360, margin-top 666px=74vh, switch sticky at 48, view switch + lightbox intact from both views, grid full-bleed). NOTE: hero height measured 360px (40vh default) - the `hero--roomy` 48vh rule (432px acceptance value) lands in Ticket 3, classes already wired; re-verify in T3/T5
- Part of: specs/play-menu-hero/plan.md (DR-0002)
- Size: S
- Type: UI

## Context

Blog page = `hero.content` + gallery with 66vh spacer. Photography = bare `h1.photoview-title` + sticky switch + full-bleed grid with `margin-top: 0` (`.content.gallery:has(.gallery-grid)`).

## Requirements

- New `src/_data/photohero.yml`: `name: photo`, `title: Photography`.
- `src/play/photography/index.nunjucks`: render `{{hero.content({content:site.data.photohero, class:'hero--roomy hero--center'})}}` (import the hero macro) before `.photoview`; delete `<h1 class="photoview-title">Photography</h1>`; body class becomes `page-play play-photos`.
- `.photoview` loses `padding-top: 48px` (hero occupies the top); the switch keeps `position: sticky; top: 48px`.
- Desktop spacer for the grid: `body.play-photos .content.gallery:has(.gallery-grid) { margin-top: 74vh; }` (74vh = roomy hero 48vh + the standard 26vh gap; keep `max-width: none; padding: 24px 0 32px; background: none` from the existing rule). Mobile keeps `margin-top: 0` (existing mobile rule wins there).
- Delete the now-unused `.photoview-title` rule from `gallery.scss`.
- Blog pages (`play/blog/index.nunjucks` + blog1/2/3/hello-world): body class becomes `page-play play-blog`.

## Acceptance criteria (agent-checkable)

- [ ] Built `/play/photography/index.html` has `class="hero hero--roomy hero--center"` with h1 "Photography", no `.photoview-title`, and `body class="page-play play-photos"`.
- [ ] 1440x900, scroll 0: hero rect height = 432px (48vh); photogrid top >= hero bottom (no overlap); computed `.content.gallery` margin-top = 74vh on desktop.
- [ ] 390x844: hero is `position: static`, grid margin-top = 0 (mobile rule still wins).
- [ ] One h1 per page: exactly one `<h1>` in the built photography HTML.
- [ ] `npm test` + `npm run build` green.

## Out of scope

- Hero height values themselves (Ticket 3), centering (Ticket 4), blog hero change.

## Ticket 3: Hero spacing - more for Photos, less for Blog

- Part of: specs/play-menu-hero/plan.md (DR-0002)
- Size: S
- Type: UI

## Context

Default hero is `height: 40vh` desktop with a 66vh gallery spacer (26vh gap). Proposed per-page modifiers: Photos `hero--roomy` 48vh + 74vh spacer, Blog `hero--snug` 32vh + 58vh spacer. Values are an ASSUMPTION (plan open question) - Pedro can retune with one line each.

## Requirements

- `hero.scss`: add `.hero--roomy { height: 48vh; }` and `.hero--snug { height: 32vh; }` BEFORE the `@include mq($until: mobile)` block so mobile `height: auto` still wins at equal specificity.
- `src/play/blog/index.nunjucks`: hero call gets `class:'hero--snug'` (keep existing class passthrough).
- Gallery spacers: `body.play-blog .content.gallery { margin-top: 58vh; }` (desktop; mobile rule already zeroes it), and the photos spacer from Ticket 2 (`body.play-photos ... 74vh`).
- No other page's hero changes (home/about/case studies keep 40vh) - verify by computed style on `/`.

## Acceptance criteria (agent-checkable)

- [ ] 1440x900: computed hero height = 432px on `/play/photography/`, 288px on `/play/blog/`, 360px on `/` (untouched).
- [ ] At scroll 0 on both pages: gallery top >= hero bottom (content clears the fixed hero).
- [ ] 390x844: hero `height: auto` + `position: static` on both play pages.
- [ ] `npm test` + `npm run build` green.

## Out of scope

- Retuning the vh values (open question), mobile spacing.

## Ticket 4: Center the Photography title and the controls

- Part of: specs/play-menu-hero/plan.md (DR-0003)
- Size: S
- Type: UI

## Requirements

- `hero.scss`: `.hero--center .content { text-align: center; }` (both breakpoints).
- `gallery.scss`: `.photoview-switch { justify-content: center; }`.
- Blog hero stays left-aligned (no modifier there).

## Acceptance criteria (agent-checkable)

- [ ] 1440x900 and 390x844 on `/play/photography/`: computed `text-align` of the hero content is `center`; the h1's rect center is within 2px of the hero content's horizontal center.
- [ ] `.photoview-switch` computed `justify-content` is `center`; the switch's rect center is within 2px of the page center at 1440 (it is max-width 900 margin auto, so centered on the content line).
- [ ] `/play/blog/` hero `text-align` remains `start`/left.
- [ ] Must compose with play-consistency T3 (vb-tabs strip): after that lands the strip is `width: max-content; margin: 0 auto` - still centered; re-run this check when T3 ships.
- [ ] `npm test` + `npm run build` green.

## Out of scope

- Centering anything else; the lightbox.

## Ticket 5: End-to-end verify + evidence

- Part of: specs/play-menu-hero/plan.md
- Size: M
- Type: research (verification)

## Requirements

- Run `npm test`, `npm run lint`, `npm run build` (release guards green).
- Probes at 1440x900 and 390x844: all Ticket 1-4 acceptance values (menu links, hero rects, spacer, one h1, centering rects), click-through Blog/Photos from `/play/`.
- Captures into `specs/play-menu-hero/evidence/`: `/play/` hero menu, `/play/blog/` and `/play/photography/` at rest + scrolled at 1440 and 390.
- Write `evidence/verify.md` listing each acceptance criterion with its measured value.

## Acceptance criteria (agent-checkable)

- [ ] All commands green; `evidence/verify.md` covers Tickets 1-4 with measured values; captures stored.
