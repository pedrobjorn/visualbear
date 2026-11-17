# Plan: Play polish - no home Play tile, one dark gradient across play pages, self-hiding photography switch, full anchor coverage

- Date: 2026-11-17
- Status: draft
- Evidence: Pedro's request 2026-11-17 (four changes, quoted in Problem). No analytics attached - ASSUMPTION: "play gallery page" means the `/play/` index and the whole `/play/` section, so blog + play + photography share one gradient.

## Problem / opportunity

1. The home work gallery ends with a thin Play teaser card (`id="play-teaser"`, play-subpages T2/DR-0003) linking to `/play/`. Pedro wants the tile removed.
2. The `/play/` section currently renders three different grounds: `/play/` uses the default body red gradient (no bodyattrs), `/play/blog/` + posts use the red brand fade layer (`body.page-blog`, DR-0007), `/play/photography/` uses its own dark grey gradient (`body.page-photography`, DR-0006). Pedro wants blog + play gallery pages consistent: 1 gradient, dark.
3. The photography grid/full switch (T17/T21/T24) is a sticky bar with a transparent background and solid `$vb-dark` buttons; it never hides. Pedro wants the options to have backgrounds, disappear on scroll down, appear on scroll up, in the same style as the visuAI / Design system tabs (`_modules/molecules/tabs/tabs.scss`).
4. Smooth anchoring was moved to CSS in ticket 24 (commit 7d99707): `html { scroll-behavior: smooth }` + `scroll-margin-top: 48px` on an explicit id list in `src/_styles/atoms/_base.scss:48-54`. The id list covers `#work #about #contact #core #modules #containers #casesystem` but the anchor audit below finds real targets with no margin: `#play`, `#discovery`, `#definition`, `#iteration`, `#implementation`, `#visual`. Pedro wants smooth scroll-to anchoring working across all experience.

Anchor audit (all `href` values containing `#` in `src/`, 2026-11-17):

| href                                                         | Used from                             | Target exists  | scroll-margin today |
| ------------------------------------------------------------ | ------------------------------------- | -------------- | ------------------- |
| `/#work`, `/#about`, `#contact`                              | nav (all pages, `_data/sitemap.json`) | yes (home)     | yes                 |
| `../#work`, `../#contact`                                    | `/about/`                             | yes (home)     | yes                 |
| `#work`, `#contact`                                          | home about copy                       | yes            | yes                 |
| `#core`, `#modules`, `#containers`, `#casesystem`            | styleguide intro                      | yes            | yes                 |
| `#visual`                                                    | styleguide core demo links            | demo specimen  | no                  |
| `#discovery`, `#definition`, `#iteration`, `#implementation` | `/art-ent/`                           | yes            | no                  |
| `#definition`                                                | `/climate-clock/` target              | yes            | no                  |
| `#play`                                                      | playhero (`_data/playhero.yml`)       | yes (`/play/`) | no                  |
| `#templates`                                                 | inside an HTML comment only           | no             | n/a (skip)          |

## Goal

Home gallery has no Play tile; every `/play/` page paints the same single dark gradient; the photography switch is a visuAI-tab-style pill strip with a background that hides on scroll down and returns on scroll up; every in-site anchor lands 48px below the fixed nav with smooth scrolling on all pages. Measured by pixel probes + Playwright anchor checks at 1440 and 390.

## Non-goals

- `/play/`, `/play/blog/`, posts and `/play/photography/` stay routed and public; only the home tile is removed. No nav change (the nav Play link is already commented out in `nav.nunjucks`) - see Open questions.
- No hero, card, lightbox, workflow or styleguide redesign. The home red fade is untouched.
- No CMS or authoring-flow changes.
- No JS scroll interceptor: anchoring stays on the CSS mechanism (DR-0004); this plan completes its coverage instead of re-adding the retired `initSmoothScroll` chain.

## Approach

- Ticket 1 removes the Play tile end to end: the macro render, the `showPlay` param, `card--thin`, and the now-dead mirror strip (`stripPlayTeaser`) plus its tests (DR-0001).
- Ticket 2 promotes photography's measured dark gradient to the one shared `/play/` gradient via a single `body.page-play` class on all play pages (DR-0002).
- Ticket 3 restyles `.photoview-switch`/`.photoview-btn` to mirror `.vb-tabs`/`.vb-tab` (plate background, 4px padding, 999px radius, 4px gap) and adds the scroll-direction hide/show in `photoview.js` (DR-0003).
- Ticket 4 completes the `scroll-margin-top` list from the audit above and verifies every anchor in a real browser (DR-0004).
- Ticket 5 runs gates + captures end to end.

## Asset requests

| Asset | Position in design | Min size / format | Status                                       |
| ----- | ------------------ | ----------------- | -------------------------------------------- |
| -     | -                  | -                 | none needed; all four changes are code/style |

## Foundational checks

H1: no destructive file operations (no deletions beyond the named dead code in Ticket 1; the play tile removal is a render removal, not a file deletion). H3: uncertainties batched in Open questions below.

## Breakdown

- [x] Ticket 1 - remove the home Play tile (macro, params, card--thin, mirror strip, tests) - shipped 2026-11-17
- [x] Ticket 2 - one shared dark gradient (`body.page-play`) on `/play/`, `/play/blog/`, all posts, `/play/photography/` - shipped 2026-11-17
- [x] Ticket 3 - photography switch: vb-tabs strip style + background, hide on scroll down / show on scroll up - shipped 2026-11-17
- [x] Ticket 4 - anchor coverage: scroll-margin-top for every real target + browser verification of smooth anchoring - shipped 2026-11-17
- [ ] Ticket 5 - end-to-end verify: `npm test`, build, review gates, 1440 + 390 captures, evidence
- [x] Ticket 6 - switch visibility amendment (DR-0005): strip never covered by photos (z-order probe), plate stays translucent not opaque, labels readable over photos - shipped 2026-11-17

## Open questions

| Question                                                                                                                                                                                                                                         | Owner | Blocks build?                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------- |
| With the tile gone, `/play/` has no in-site link (nav Play is commented out). Keep it unlinked, or restore a nav/other entry point?                                                                                                              | Pedro | No - tile removal proceeds either way |
| "Options have backgrounds": interpreted as the switch strip taking the `.vb-tabs` plate background with `.vb-tab`-style transparent buttons (DR-0003). If Pedro means solid fills on each button, that is a one-rule follow-up.                  | Pedro | No - DR-0003 records the reading      |
| "Tabs should not hide behind the photos": read as z-order + translucency (DR-0005), keeping the T3 scroll-down auto-hide he explicitly requested. If he means "never auto-hide on scroll", that is a one-line removal in photoview.js - confirm. | Pedro | No - DR-0005 records the reading      |
