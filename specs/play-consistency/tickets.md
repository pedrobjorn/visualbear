# Tickets: Play polish (plan: specs/play-consistency/plan.md)

All tickets size S except Ticket 5 (M, verification only). Commands: `npm test`, `npm run build`, `npm run serve` (dev server on :3000). Browser checks at 1440x900 and 390x844 unless noted.

## Ticket 1: Remove the home Play tile

- Status: SHIPPED 2026-11-17 (npm test 5/5 green, build + release-guard OK, built home renders the 3 work cards and zero play-teaser)
- Part of: specs/play-consistency/plan.md (DR-0001)
- Size: S
- Type: UI + system

## Context

The Play teaser is the last card of the home work gallery. Its only job was linking to `/play/`; the release mirror strips it via `stripPlayTeaser`. Nothing else references `play-teaser`, `showPlay`, or `card--thin`.

## Requirements

- `src/_modules/organisms/gallery/gallery.nunjucks`: delete the `_playCard` definition, the `_showPlay` variables, and the `{% if _showPlay %}...card--thin...{% endif %}` render block; update the surrounding comments that reference the teaser/strip.
- `src/index.nunjucks`: drop `showPlay:true, showBlog:false` from the gallery call (keep `contentType:''`); update the T2 comment block.
- `src/_modules/molecules/card/card.scss`: delete `.card--thin` (sole user was the teaser).
- `scripts/mirror-link.js`: delete `stripPlayTeaser` and its export; `scripts/release-mirror.js`: delete the call and the guard-8 comment referencing it.
- Tests: `scripts/test/mirror-link.test.js` - remove the `stripPlayTeaser` assertions and fixture; `scripts/test/gallery-order.test.js` - remove the `play-teaser` assertions, keep the remaining order/blog-hidden assertions working with the new call signature.
- Leave `_blogCard`/`_showBlog` untouched (out of scope, DR-0001 option c).

## Acceptance criteria (agent-checkable)

- [ ] `grep -rn "play-teaser\|showPlay\|card--thin\|stripPlayTeaser" src scripts` returns no code hits (comments in specs/ excepted).
- [ ] `npm test` green (all five test files).
- [ ] `npm run build` green; built `build/index.html` contains no `play-teaser` and still renders all work cards.
- [ ] Visual: home capture at 1440 and 390 shows the work gallery ending at the last work card, no Play tile; `/play/` still renders at its URL.

## Out of scope

- Re-linking `/play/` anywhere (nav decision, plan Open questions). Blog card machinery.

## Ticket 2: One dark gradient across all `/play/` pages

- Status: SHIPPED 2026-11-17 (play-gradient.test green in `npm test` 6/6; build + 5 release guards OK; Playwright probes at 1440x900 and 390x844: all play pages `page-play` with body `rgb(24,24,27)`, one `::before` gradient `rgb(58,58,65) -> rgb(24,24,27)` at 100svh, nav `rgb(58,58,65)`, zero red in the nav band, below-fold margin flat, home still red)
- Part of: specs/play-consistency/plan.md (DR-0002)
- Size: S
- Type: UI

## Context

`body.page-photography` (`src/_styles/atoms/_base.scss:184`) already implements the page-anchored dark layer. It becomes the shared `body.page-play`.

## Requirements

- `_base.scss`: remove `body.page-blog` from the `body.home-page` selector (home-only again); replace the `body.page-photography` rule with `body.page-play { background: #18181b; &::before { ... height: 100vh/100svh; z-index: -1; background: linear-gradient(180deg, #3a3a41 0%, #18181b 100%); background: linear-gradient(180deg in oklab, #3a3a41 0%, #18181b 100%); } }` (identical values to the current photography rule).
- `src/play/index.nunjucks`: add `{% block bodyattrs %} class="page-play"{% endblock %}`.
- `src/play/blog/index.nunjucks` + `blog1/hello-world/blog2/blog3/index.nunjucks`: change `page-blog` to `page-play`.
- `src/play/photography/index.nunjucks`: change `page-photography` to `page-play`.
- `src/_modules/molecules/nav/nav.scss`: add `body.page-play nav.site-nav { background-color: #3a3a41; }` - the nav's base rule is solid brand red, which would cap the dark pages with a red bar (found by pixel probe, recorded in DR-0002).
- `src/_modules/organisms/gallery/gallery.scss`: the gallery's fade plate (transparent 256px, then solid) is the mask that hides the fixed hero title behind the gallery on scroll (gallery is `position: relative`, so its plate paints above the z-index:0 hero). On `body.page-play` it fades to the PAGE color: `background: linear-gradient(to bottom, rgba(24, 24, 27, 0) 256px, rgba(24, 24, 27, 1) 0px)` - the body `::before` layer converges to flat #18181b by the fold, so the static plate matches the ground at every scroll position. Pedro's follow-ups 2026-11-17: the #252528 plate read as a contrast band (~25k plate px at 1440); `background: none` removed the band but let the hero title show through the card gaps (176/1276 hero-visible points at scroll 500, bleeding at 900). The plate-in-page-color solves both. Mobile keeps `background: none` (hero is in flow there; override re-declared inside the mobile mq because the page-play rule outranks the plain one). Home keeps the original #252528 plate.
- Update the comments on those templates that reference DR-0006/DR-0007 backgrounds.

## Acceptance criteria (agent-checkable)

- [ ] Pixel probes (1440x900 and 390x844) on `/play/`, `/play/blog/`, `/play/blog/hello-world/`, `/play/photography/`: identical gradient curve, top of page ~#3a3a41 fading to #18181b within one viewport, no `#d73735` red anywhere on these pages.
- [ ] Long-page check: `/play/blog/` scrolled past 100vh shows no re-tile/snap back to a lighter color at the 900px boundary (same probe method as DR-0007's measurement).
- [ ] Hero text on `/play/` and `/play/blog/` still `$vb-light` and readable (contrast probe >= 7:1 against the local ground).
- [ ] Home capture unchanged: red fade still present at `/`.
- [ ] `npm test` + `npm run build` green.

## Out of scope

- Home, about, case-study, workflow, styleguide backgrounds.

## Ticket 3: Photography switch - vb-tabs strip style + background, hide on scroll down / show on scroll up

- Status: SHIPPED 2026-11-17 (photoview.test green, npm test 7/7; build + 5 guards OK; 22 Playwright probes at 1440/390 pass: plate `rgba(255,255,255,0.04)`, pill 999px/4px/4px, sticky top 48, transparent buttons, hidden on scroll-down past 120 with opacity 0 + visibility hidden, visible on scroll-up/top, grid/full toggle + aria-pressed intact, reduced-motion transition 0s with hide/show still working; captures in evidence/t3-switch-\*.png)
- Part of: specs/play-consistency/plan.md (DR-0003)
- Size: S
- Type: UI

## Context

`.photoview-switch` / `.photoview-btn` live in `src/_modules/organisms/gallery/gallery.scss:117-190`; controller in `photoview.js`. The tabs reference style is `_modules/molecules/tabs/tabs.scss` (`.vb-tabs` strip, `.vb-tab` buttons, dark plate `rgba(255,255,255,0.04)`).

## Requirements

- `.photoview-switch`: keep `position: sticky; top: 48px; z-index: 1`; change to the `.vb-tabs` geometry: `display: flex; gap: 4px; width: max-content; max-width: 100%; margin: 8px auto; padding: 4px; border-radius: 999px; background-color: var(--cs-chip-plate, rgba(255,255,255,0.04));` plus `transition: transform 0.2s ease, opacity 0.2s ease, visibility 0.2s ease;`. Add `.photoview-switch--hidden { transform: translateY(-8px); opacity: 0; visibility: hidden; }` and a `@media (prefers-reduced-motion: reduce)` block that sets `transition: none` on the switch.
- `.photoview-btn`: mirror `.vb-tab` - remove `background: $vb-dark`, keep `min-height: 44px; padding: 12px 20px; border: 0; border-radius: 999px; background-color: transparent; color: #a6adb8;` active `[aria-pressed='true']` `color: #ee6e73` + underline, hover/focus underline, uppercase, `$middle-font-size`, `$font-bold`, `letter-spacing: 0.18em`, `white-space: nowrap`, same compact breakpoints (`mobileLandscape` 12px 10px / 0.12em, max-360 12px 8px / 0.1em).
- `photoview.js`: keep the view toggle; add a passive scroll listener (rAF-throttled) tracking `lastY`: if `scrollY > lastY + 4 && scrollY > 120` add `.photoview-switch--hidden`; if `scrollY < lastY - 4 || scrollY <= 120` remove it; update `lastY` each frame. No-op when no switch on the page (existing guard).
- No markup changes in `play/photography/index.nunjucks` (classes already match).

## Acceptance criteria (agent-checkable)

- [ ] At 1440 and 390 on `/play/photography/`: at rest the switch is a pill strip with the plate background (probe: strip background is translucent white over the dark ground, buttons transparent), sitting below the fixed nav.
- [ ] Scroll down past 120px: strip gets `opacity: 0` / `visibility: hidden` and is not tab-focusable; scroll up (or back to top): strip visible again. Grid/full toggle and `aria-pressed` still work in both states.
- [ ] Under `prefers-reduced-motion: reduce` emulation: hide/show still applies, with no transition (computed `transition-duration: 0s`).
- [ ] Full-size view (`gallery-full`) and lightbox unaffected; scrolling photos never show through the strip (plate is opaque enough: probe the strip's effective background over a photo while stuck).
- [ ] `npm test` green; `npm run build` green.

## Out of scope

- Tabs molecule itself, workflow page, other pages' strips.

## Ticket 4: Complete smooth anchoring coverage across all pages

- Status: SHIPPED 2026-11-17 (anchors.test green, npm test 8/8; build + 5 guards OK; 56 Playwright clicks at 1440/390 x smooth/reduced-motion: every live anchor lands at top=48 except #contact, which lands at max scroll because the footer sits at the document end - pre-existing, correct)
- Part of: specs/play-consistency/plan.md (DR-0004)
- Size: S
- Type: system

## Context

`html { scroll-behavior: smooth }` + reduced-motion opt-out already sit in `_base.scss:36-43`; the `scroll-margin-top: 48px` list at `_base.scss:48-54` is missing the audited targets (plan.md table).

## Requirements

- `_base.scss`: extend the selector list to `#work, #about, #contact, #core, #modules, #containers, #casesystem, #play, #discovery, #definition, #iteration, #implementation, #visual` (keep the explicit-list approach and the no-global-`[id]` comment; add the new ids with a one-line comment referencing this ticket).
- No JS changes. No layout changes.

## Acceptance criteria (agent-checkable)

- [ ] Browser check at 1440x900 and 390x844, for each audited anchor: home `/#work`, `/#about`, `#contact`; from `/about/` the `../#work` and `../#contact` links; `/play/` hero `#play` link; `/art-ent/` `#discovery #definition #iteration #implementation`; `/styleguide/` `#core #modules #containers #casesystem`: after click + settle, `target.getBoundingClientRect().top` == 48 (+-1px) and `getComputedStyle(document.documentElement).scrollBehavior == 'smooth'`. Exception: `#contact` is the footer at the document end - it lands at max scroll (target as high as the document allows), which is the correct behavior.
- [ ] Same checks under reduced-motion emulation: `scrollBehavior == 'auto'`, same landing positions.
- [ ] `npm test` + `npm run build` green.

## Out of scope

- Re-adding any JS scroll interceptor; anchor styling; nav changes.

## Ticket 5: End-to-end verify + evidence

- Part of: specs/play-consistency/plan.md
- Size: M
- Type: research (verification)

## Requirements

- Run `npm test`, `npm run build`, `npm run lint`, and the `visuaibear-review` gates on the built site.
- Captures at 1440x900 and 390x844 into `specs/play-consistency/evidence/`: home (no tile), `/play/`, `/play/blog/`, `/play/photography/` grid at rest, photography scrolled down (switch hidden), photography scrolled up (switch visible), photography full-size view, one anchor-landing capture per audited anchor group.
- Write `evidence/verify.md` with the probe values (gradient RGB at top/mid/100vh on each play page, anchor landing offsets, switch visibility states) and the gate results.

## Acceptance criteria (agent-checkable)

- [ ] All commands green; `evidence/verify.md` lists every acceptance criterion from Tickets 1-4 with its measured value.
- [ ] Review gates pass with no new violations.

## Ticket 6: Switch visibility amendment - never behind photos, never opaque

- Status: SHIPPED 2026-11-17 (plate changed to a local `--cs-chip-plate: rgba(24,24,27,0.92)` on `.photoview-switch` after probes showed the 0.04 white plate gave ~1:1 label contrast over bright photos; T6 probes pass at 1440/390: stuck@48 + visible, elementFromPoint hits BUTTON not IMG, plate alpha 0.92 < 1, worst-case label contrast 7.68:1 / 5.88:1 over actual photo pixels; photoview.test guards z-index/alpha; npm test 8/8; build + 5 guards OK; captures evidence/t6-stuck-\*.png)
- Part of: specs/play-consistency/plan.md (DR-0005, Pedro's follow-up 2026-11-17)
- Size: S
- Type: UI

## Context

After T3 the sticky switch can stick over photogrid images. Pedro: "the tabs should not hide behind the photos and not be opaque so they can be seen above the photos."

## Requirements

- Z-order: `.photoview-switch` (z-index 1) always hit-tests above grid images; the lightbox dialog stays above the strip. No scss change expected - this is a verification guarantee, plus a fix if the probe fails.
- The plate stays translucent (`--cs-chip-plate`, fallback `rgba(255,255,255,0.04)`) - NOT an opaque solid - so photos remain visible through the strip.
- Option labels must stay readable over the brightest photo: contrast probe of the `#a6adb8` / `#ee6e73` inks over a stuck photo; if it fails, raise the plate alpha slightly (still translucent, never opaque).
- Keep the T3 scroll-down auto-hide (see plan open question if Pedro meant otherwise).

## Acceptance criteria (agent-checkable)

- [ ] 1440x900 + 390x844, scrolled so the strip sticks over photos: `elementFromPoint` at the strip center returns the strip or a button, never an `img`.
- [ ] Strip computed background remains translucent (alpha < 1), not a solid color.
- [ ] Label contrast over the stuck photo >= 4.5:1, or the plate alpha was raised (still < 1) until it passes.
- [ ] `npm test` + `npm run build` green.
