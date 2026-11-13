# Evidence - amendment pass 2026-11-13b (Pedro's missed-items eval)

Method: same harness as mobile-eval-2026-11-13.md (Chromium mobile-
emulated + Firefox, static serve of the post-666809b build). All numbers
measured 2026-11-13 against build/ (commit 666809b + pending tree).

## Item: hide the My Closet card

- The card is the second entry of `src/_data/work.json`
  ("A new digital closet experience", thumb `gallery_thumb_closet.jpg`,
  external Google Drive href, target _blank).
- Consumed ONLY by the home gallery: `src/index.nunjucks:17`
  `{{gallery.content({content:site.data.work, ...})}}` ->
  `_modules/organisms/gallery/gallery.nunjucks` loops every entry into
  `card.content` with NO filtering (no hidden/show flag exists;
  showPlay/showBlog control only the Play/Blog cards).
- The mirror home gets the same cards (site.data.work) plus one injected
  mirror-only card (release-mirror), so hiding must live in the data or
  the macro to cover both zones.
- `gallery_thumb_closet.jpg` is ALSO referenced by the styleguide
  casesystem demo block (`styleguide.casesystem.nunjucks`) - that demo
  usage stays; only the gallery card hides.

## Item: Design System hero vs visuAI hero (measured)

Panel heroes compared on /selected-works/workflow/ at 1440 and 360
(both probed per tab state; hidden panel reads w 0):

| metric | 1440 visuAI | 1440 design | 360 visuAI | 360 design |
| --- | --- | --- | --- | --- |
| strip top | 80 | 80 | 80 | 80 |
| hero top | 149 | 149 | 149 | 149 |
| hero w | 836 | 836 | 288 | 252 |
| h1 size | 38.4px | 38.4px | 31.104px | 17.496px |
| eyebrow | 15.36/16mb | 15.36/16mb | 15.36/16mb | 15.36/16mb |
| summary | 22.464, w680 | 22.464, w680 | 22.464 | 22.464, w252 |

- 1440: heroes already match in type/spacing (ticket 46's cs-hero
  conversion landed). The divergence is MOBILE ONLY: at 360 the design
  h1 renders 17.496px vs visuAI's 31.104px. Candidate rules:
  `_typography.scss:661-690 / 770-790 / 884-900` (global mobile h1 ladder,
  `$mobile-h1-size`) vs the case-study hero's own h1 sizing in
  `_case-study.scss` (cs-hero) - the styleguide hero lives in
  `#styleguide_container > article.text-container` (`styleguide.intro.nunjucks`
  wraps it in `.case-study.document-text`, but the panel host chain
  differs from `.cs-workflow`, so a workflow-scoped hero rule does not
  reach it). Builder resolves by scoping the cs-hero h1 mobile size to
  the hero component, not the page shell.
- Design hero width at 360 is 252 vs visuAI 288 (different container:
  `.text-container` 900px-capped vs `.text-box`).

## Item: Design System body text (measured)

- At 360 the design panel's `.document-text` measures 324px wide vs
  visuAI's 288 (the styleguide page's `.text-container` padding is 32px
  at all widths, `_typography.scss:440-447`; the workflow shell insets
  36px per side on mobile via ticket 47's `#styleguide_container
  .case-study.document-text` rule - which only reaches elements carrying
  BOTH classes inside the container, not the section-level blocks).
- First body `<p>` of the design panel: 28.8px bold (legacy
  `.gallery-text` intro style, `_textelements.scss:83+`) vs visuAI body
  18.432px/300 at 1440, 17.28px at 360. Section h2 in design: 16.848px at
  360 vs visuAI h2 22.464px.
- So the design panel still renders the OLD styleguide typography on
  mobile (big intro paragraphs, narrower h-ladder, wider column) -
  Pedro's "body text doesn't match visuAI and other views, clean it up,
  especially on mobile".

## Item: about paragraph gap

- T23 shipped `.about-copy p + p { margin-top: 24px }`; probed uniform
  24px at all widths. Pedro wants ONE space, not two: 16px (the 8pt
  rhythm's first step above in-component 8; "16 list rhythm" per the
  T16 spacing-scale note). Amends ticket 23.

## Item: robot size vs bear

- Built state (post-T18): BOTH robots render the glyph at font-size
  20px - public home `build/index.html` and mirror
  `build/selected-works/index.html` (grep-verified inline styles).
  T18's evidence (t5-t10-verify.md) measured bear 22px vs robot 22px
  equal metrics but denser ink, hence 20px.
- If Pedro still reads the robot bigger on-device, the lever is 20 ->
  18px on both (mirror-link.js inline style + .floating-robot public
  span in _pages.scss) - spec'd as a verify ticket with the capture.

## Item: robot link target on the index

- Mirror index robot: `href="workflow/"` (the visuAI / design system
  page) - already true since T1 (grep-verified in
  build/selected-works/index.html).
- PUBLIC index robot: `href="#work"` (T20, DR-0004 addendum) - chosen
  because the public zone prunes /workflow/ (DR-R4-0002 air-lock:
  "information is the password", DR-R4-0003). Pointing the public pill
  at the system page requires un-pruning /workflow/ publicly, which
  reverses the air-lock posture - Pedro's explicit call, spec'd as an
  open question gating the ticket.
