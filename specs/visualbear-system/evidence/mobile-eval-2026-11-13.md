# Evidence — mobile 360-375 eval (Pedro's request, 2026-11-13)

Method: headless Chromium + headless Firefox (Playwright) against the
Nov 12 23:38 build served statically (`python3 -m http.server -d build`).
Chromium ran mobile-emulated (viewport + DSF 2 + touch); Firefox ran
desktop-mode at the same viewport widths — Firefox mobile emulation is not
available in this harness, so ANDROID-specific behaviors (text sizing) are
NOT reproduced here and are recorded as findings + assumptions, not
verified defects. Cap echoed (fashion-rebrand draft): the mobile direction
came from the toy AM.

## 1. Header nav at 360 / 320 (both engines, desktop mode)

nav.site-nav > .content.nav-wrapper, viewport 360 (Chromium; Firefox
identical to 0.1px):

| link    | box             | font   | right edge            |
| ------- | --------------- | ------ | --------------------- |
| logo    | x 12, w 40      | -      | 52                    |
| Work    | x 106, w 76     | 19.2px | 182                   |
| About   | x 182, w 82     | 19.2px | 264.4                 |
| Contact | x 264.4, w 95.6 | 19.2px | 360.0 = viewport edge |

- document.scrollWidth == innerWidth == 360 on home / about / workflow in
  BOTH desktop engines: the row FITS - but with the Contact box pinned to
  the exact viewport edge (the 16px last-child page-margin rule survives
  as in-box padding; the next ink pixel is the viewport boundary). The
  budget is exact-fit, slack lives only between logo and links (54px).
- Same at 320 (contact right = 320.0 exactly). The flex pair always fills
  the viewport edge-to-edge.
- Nav font is 19.2px (1.2rem). Any Android-side text widening larger than
  the 54px slack pushes the ul past the viewport -> horizontal scroll. The
  only engine-divergent knobs found: (a) the shipped
  `-webkit-text-size-adjust: 1.5em` + `-ms-text-size-adjust: 1.5em` pair in
  the built CSS (invalid per CSS spec - only auto | none | <percentage> are
  valid; Firefox for Android ships text-size-adjust support, Chrome treats
  the em value as dropped - divergence is possible), (b) Firefox Android's
  text-inflation behavior. ASSUMPTION - needs on-device validation: the
  Firefox Android overflow comes from an Android text-sizing path, not from
  a CSS rule desktop engines can reproduce.
- Touch targets: 48px tall (>= 44 ok) at every width.

## 2. Tab strip at 360 / 375 (both engines)

`.vb-tabs` (workflow page, visuAI panel host), viewport 360:
host column = 288px wide (page margins 16 x2 + container paddings);
`.vb-tabs` caps there via max-width:100%.

| strip / tab       | 360 (both engines)           | 375 (both engines)     |
| ----------------- | ---------------------------- | ---------------------- |
| strip box         | w 288, h 66                  | w 303, h 66            |
| tab visuAI        | w 109, ONE line, h 37, y 95  | w 109, 1 line, h 37    |
| tab Design system | w 167, TWO lines, h 58, y 84 | w 182, TWO lines, h 58 |

- The strip's nowrap intrinsic width is 303px (109 + 182 + 4 gap + 8
  plate padding). At 360 the host is 288 -> the flex chain shrinks the
  BUTTON, and "Design system" (uppercase, letter-spacing .18em, 0.8rem
  bold) wraps into two lines. At 375 it happens too (strip 303 == host
  303, boundary-exact).
- The wrapped tab renders misaligned (y 84 vs 95) and taller (58 vs 37):
  this is Pedro's "widens the tab selector / looks odd, zoomed out" - the
  tab selector does not overflow the DOCUMENT (no scrollWidth growth was
  measured anywhere), it wraps and reads broken/odd.
- Cameras: mobile-eval-workflow-360-{chromium,firefox}.png.

## 3. About text rhythm (`.document-text` on the home `#about` and /about/)

Paragraph margins measure 0px in this scope; the visible paragraph
separation is ENTIRELY bare `<br>` elements - each contributes one 23px
line box (the paragraphs' line-height). Measured at 360 (chromium;
firefox identical):

| gap                                        | br before? | gap px |
| ------------------------------------------ | ---------- | ------ |
| p1 (Hi! I'm Pedro) -> p2 (I'm a Stockholm) | YES        | +23    |
| p2 -> p3 (I have worked)                   | YES        | +23    |
| p3 -> p4 (I love design)                   | NO         | 0      |
| p4 -> p5 (Feel free to)                    | YES        | +23    |

So: three gaps carry an EXTRA 23px line box, one gap is flush - the
anomaly Pedro reads as "extra space between the first and second
paragraph" (and its inconsistency). Fix direction: one uniform gap,
no `<br>`.

Duplication note (flag only): the block is duplicated verbatim in
`src/index.nunjucks` (#about) and `src/about/index.nunjucks` and has
drifted (home: "my resume", about: "my online resume"; the home img has
`alt="Pedro Björn"`, the about img has NO alt - an a11y defect in the
about copy - ticket 23).

Dead-handles note (JS eval result): both copies carry inline
`onclick="scroller('gallery')"` / `scroller('contact')` - `scroller` is
defined NOWHERE (grep src/ + build/scripts/main.js zero hits): every such
click throws a ReferenceError and falls through to the anchor default.
Dead code sitting in both copies.

## 4. JS inventory (what the javascript is for, and if it's needed)

`build/scripts/main.js` = 4.6 kB minified, three bootstraps from
`src/_scripts/main.js`:

| init                 | what it does                                                                                                                                                                                                                                                                  | needed?                                                                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tabs.init()`        | the visualbear-system tab widget: click/arrow-key switching, panel relocation (ticket 14), ground + panel swap, 160ms enter. No CSS-only equivalent with roving keyboard focus exists. Sans JS the visuAI panel renders (server-shipped) and the design panel stays `hidden`. | KEEP - required by tickets 2/6/11/14                                                                                                                                                                                            |
| `initCountUp()`      | animates `[data-countup]` metrics on case-study pages (used in build: fashion-rebrand, sports-ecommerce-redesign, digital-closet + mirrors). Markup-first: final value ships in the HTML and is only reset to 0 when IntersectionObserver exists AND motion is allowed.       | KEEP - content degrades to the real numbers without it,                                                                                                                                                                         |
| `initSmoothScroll()` | same-page anchor clicks: offsets by the 48px fixed nav, scrolls smoothly, honors reduced-motion.                                                                                                                                                                              | REPLACEABLE - `html { scroll-behavior: smooth }` + `scroll-margin-top: 48px` on the targets does the same in CSS (progressive: older Safari < 15.4 jumps instantly but correctly). ~30 lines retire. Ticket 24, gated on Pedro. |

Dead JS found: the `onclick="scroller(...)"` handlers above (undefined
function), and the `no-js` class on `<html>` (base.nunjucks:9) is never
swapped to `js` by anything - a dead hook, remove or wire, ticket 23's
scope carries the handler removal.
