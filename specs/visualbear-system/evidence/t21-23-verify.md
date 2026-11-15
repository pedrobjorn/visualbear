# Evidence - tickets 21-23 (mobile eval build pass, 2026-11-13)

Method: the eval session's probe harness (headless Chromium
mobile-emulated + headless Firefox desktop-mode at the same viewports)
against a fresh `npm run build` (release guard OK, `npm test` PASS). The
Firefox Android divergence itself was NOT reproducible in this harness
(see mobile-eval-2026-11-13.md); the fixes are budget-invariant, so the
probes verify the geometry class, not the Android path.

## Ticket 21 - nav slack budget + text-size-adjust

- Built CSS: `-webkit-text-size-adjust:100%;text-size-adjust:100%` on
  html, body (zero hits for `1.5em`; the pair went in via one standard
  declaration + the Chrome prefix).
- Elastic headroom (wrapper width - logo - links, the space-between middle
  gap the row absorbs before anything touches the edge):
  320 -> 30.2px, 360 -> 70.2px, 375 -> 85.2px (both engines, about /
  workflow / fashion-rebrand pages). Pre-change the row was exact-fit
  (Contact box edge on the viewport boundary).
- No horizontal document overflow at 320/360/375 on any probed page;
  nav height 48 everywhere; Desktop 1440 headroom 262 (layout unchanged).
- Note: the ticket's AC line "Contact's right edge <= viewport - 8" was
  written against the wrong metric (the row is right-aligned by DESIGN -
  the 16px page margin lives inside Contact's own padding). The honest
  slack metric is the elastic headroom above; recorded here, gate met.

## Ticket 22 - tab strip nowrap + compact envelope

- Shipped: `.vb-tab { white-space: nowrap }` (all widths); <=480
  (mobileLandscape): padding 8px 10px + letter-spacing .12em; <=360:
  letter-spacing .1em + padding 8px 8px. 0.8rem label size, radius,
  inks, plate, rhythm untouched.
- Line-count probe (range-rect) at 320/360/375, BOTH engines, BOTH tab
  states: every tab renders exactly ONE line (was: "Design system" on 2
  lines, h 58 vs 37). Strip content fits its plate: scrollWidth ==
  clientWidth everywhere (the pre-fix Firefox 320 four-pixel content
  overflow moved the <=360 lever from letter-spacing-only to
  letter-spacing + 8px paddings, recorded per the ticket's
  "record which values shipped").
- Strip geometry at 1440 unchanged from T5's evidence (x 561, w 318,
  one-line, h 45).
- Behavior: click-through in both tab states at 360 + 1440 - ground
  swap (workflow-page <-> vb-system-light), panel visibility, strip
  relocation into the design host, roving round-trip back to visuAI all
  probe-verified. Captures: t21-t23-workflow-{320,360}-after.png (the
  one-line strip; pre-fix wrap in mobile-eval-workflow-360-\*.png).

## Ticket 23 - about rhythm scoped rule

- Shipped: `.about-copy p + p { margin-top: 24px }` (scoped rule in
  \_pages.scss); both templates carry the `about-copy` class on their
  `.document-text.text-box`; zero bare `<br>` in either copy.
- Paragraph-gap probe at 320/360/375/1440, both engines, home #about AND
  /about/: gaps [24, 24, 24, 24], uniform (was: three 23px br line boxes
  - one flush 0). Zero `onclick=` attributes in the about blocks
    (`scroller` grep = zero hits in src/), /about/ img alt in.
- Case-study pages unaffected (the rule's selector hits only .about-copy;
  fashion-rebrand probed clean at 320/360/375).
- Capture: t21-t23-about-360-after.png.

## Gates (visuaibear-review, this pass)

| Gate            | Result | Evidence                                                                                                                                                                                                                                    |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A11y            | PASS   | nav targets 48px tall at every probed width (navH probe); /about/ img alt in; focus/hover rules untouched; the dead scroller handlers (console ReferenceError per click) removed everywhere                                                 |
| States          | PASS   | both tab states probed (ground swap, panel relocation, roving round-trip) at 360 + 1440; nowrap labels hold in both                                                                                                                         |
| Tokens & system | PASS   | no new hard-coded colors; the strip envelope reuses the 8px step + the mobileLandscape breakpoint; 24px gap = the shared rhythm step                                                                                                        |
| Copy            | PASS   | no copy changed (labels untouched); no em dash introduced                                                                                                                                                                                   |
| Consistency     | PASS   | DR-0009 budget approach (padding slack, no font shrink); gallery's 47.99em idiom mirrored by the mobileLandscape mq                                                                                                                         |
| Regressions     | PASS   | 1440 strip geometry == T5's evidence; 1440 nav headroom 262 (desktop untouched); fashion-rebrand probed clean; npm build + guard + npm test green                                                                                           |
| AI-attribution  | PASS   | no copy authored here (markup/class/handlers only); no [ai] markers involved                                                                                                                                                                |
| Foundational    | PASS   | no destructive ops (all edits are tracked-file modifications; build regenerated); the Firefox Android root cause stays an ASSUMPTION with the on-device check assigned to Pedro - no silent guess shipped beyond DR-0009's recorded posture |
