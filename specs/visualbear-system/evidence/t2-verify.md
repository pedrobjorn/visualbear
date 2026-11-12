# Ticket 2 verification - tab shell (2026-11-12)

Automated: `scripts/test/tabs.test.js` (npm test) - the pure state logic:
constants + naming contract, activate/arrow/home/end with wrap, wiring
spec (one selected, roving tabindex), body ground pair, hero copy swap,
single default tab.

## Build + live checks (headless npm build:gulp --production, then served)

Behavior suite (28 asserts, PASS at 1440 + 390):

- default state: visuAI selected, visuAI h1, design panel hidden, exactly
  one h1
- click switch: body swaps workflow-page -> vb-system-light, h1 + hero
  copy swap to "The visualbear System - Design system", panels toggle,
  aria-selected moves
- keyboard: ArrowRight and Home activate and rove focus (checked
  document.activeElement), Home returns to visuAI + dark ground
- tab pattern wiring intact: 1 tablist, 2 tab buttons, 2 tabpanels,
  correct aria-selected + roving tabindex + hidden panels

Layout/ink probes:

- strip above the h1 inside the hero rhythm at both widths, no horizontal
  overflow
- dark inks: inactive rgb(166,173,184) (#A6ADB8 7.8:1), plate
  rgba(255,255,255,0.04) (the dark chip instance); light inks: plate
  rgba(255,255,255,0.45) (the light chip instance)
- contrast (computed in the probes): #A6ADB8 on #1D1D21 > 7:1; #252528 on
  white > 7:1; #D0181E on white > 5:1

## Spec correction found by review (recorded)

- Ticket 2 pinned the active dark tab at #E34A47 "4.5:1" - it actually
  measures 4.27:1 (#1D1D21) / 4.22:1 (#221D1F). Fixed: #E8504D (4.55 /
  4.50). The underline still carries the state as designed.

## Bugs found + fixed during verification

- normalize's `section { display: block }` beat the UA's [hidden] rule,
  so the design panel was visible before any tab switch - fixed with an
  explicit `.vb-panel[hidden] { display: none }` in tabs.scss.
- babel/bundle interop broke the ESM import of the controller ("u.default
  .init is not a function") - the molecule module is now plain CJS
  (module.exports), required from main.js.

## Evidence files

- t2-dark-1440.png / t2-dark-390.png (visuAI tab, dark ground)
- t2-light-1440.png / t2-light-390.png (design tab, light ground)
- Suites: /tmp/tabs-verify.py (behavior), /tmp/tabs-visual.py (layout +
  contrast math) - rerunnable against any served build.

## Known notes

- The design panel content is a placeholder by design; ticket 3 fills
  it. The AC "pixel-diff vs pre-merge styleguide" belongs to ticket 3.
- The body height difference on tab switch is the panel swap itself (the
  workflow content is much longer); the strip stays at the top, so there
  is no scroll jump.
