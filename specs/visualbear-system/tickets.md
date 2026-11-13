# Ticket 1: Robot on the mirror - swap the floating bear for a robot above every surface

- Part of: specs/visualbear-system/plan.md
- Size: S
- Type: system
- Status: DONE 2026-11-12 - markup in scripts/mirror-link.js (tested:
  scripts/test/mirror-link.test.js, `npm test`), wired in
  scripts/release-mirror.js; evidence in evidence/t1-verify.md + DR-0004

## Context

The mirror's floating link is injected by `scripts/release-mirror.js` → `visuaiLinkFor()` into every `/selected-works` index.html just before `</body>`: an `<a class="bear">` fixed at bottom-left, emoji 🐻 (`\uD83D\uDC3B`), inline style `position:fixed;bottom:12px;left:12px;font-size:22px;` and **no z-index**. Positioned elements with `z-index: 1` and an opaque plate - `.foot` (`footer.scss:29`) and `#about` (`_pages.scss:188`) - paint over it while scrolling, so the link disappears behind page backgrounds exactly where it matters (a visitor reaching the contact area). Independent of the visualbear-system merge; ships first.

## Requirements

- Emoji swap: `\uD83D\uDC3B` → `\uD83E\uDD16` (🤖). Verify the surrogate pair - `\uD83D\uDC28` (the KOALA from the r4 anchor probe, `evidence/r4-verification.md:94`) is the known wrong neighbour.
- Layer: add an explicit `z-index: 3` to the inline style - above the nav's 2 (`nav.scss:6`) and the content surfaces' 1. A no-z-index fix (DOM order) was rejected: root-level positioned elements with `z-index: auto` always lose to `z-index: 1` layers regardless of DOM order.
- Rename the class `bear` → `robot` so selector-grep and the release verification read consistently with what it now is.
- `title` and `aria-label` (add one - the title alone is not announced everywhere): "The visualbear system" - the link's destination for every mirrored page.
- Idempotency guard untouched: the `VISUAI_MARK` check still prevents double injection on a re-run.
- href stays depth-relative; no other mirror output changes.

## Design references

- Figma: n/a (unicode glyph; no node) · Hooks used: none · Principles applied: `visuaibear-core` #7 - the mirror stays air-locked and unadvertised.
- Existing style refs: the link inherits the page's ink (`$vb-light` on dark grounds, `$vb-grey` on light; measured in `_case-study.scss:1300-1310`); hover feedback stays the opacity dims already on `a.icon` in `nav.scss` - no redraw.

## Acceptance criteria (agent-checkable)

- [ ] Visual: 🤖 fixed at bottom-left (bottom 12px, left 12px, ~22px size), visible above `.foot` and `#about` when scrolled to full depth, on the home (`/selected-works/`), `/workflow/` and `/teachr/` mirrors, on dark and light grounds (screenshots at 1440 + 390 widths)
- [ ] Behavior: keyboard focus reaches the link (tab order after the nav), focus ring uses the base focus-visible style; link navigates to `/workflow/` until the merge lands; no double injection on a second mirror pass
- [ ] Copy: accessible name exactly "The visualbear system"; no bear emoji anywhere in the release script or injected markup (diff check)
- [ ] A11y: link carries an accessible name and distinguishes from the nav landmark; axe clean on the three checked pages
- [ ] Gates: passes `visuaibear-review` checklist

## Out of scope

- The visualbear-system merge itself (Tickets 2-4) - this link points at `/workflow/` until that lands.
- Any custom robot artwork or the public 404/teachr pages.
- Shipped beyond scope on Pedro's 2026-11-12 addendum: the public index also carries the robot mark (decorative span, DR-0004).

## Open questions

- None

---

# Ticket 2: Tab shell - the hero's tab strip switching grounds and content

- Part of: specs/visualbear-system/plan.md
- Size: M
- Type: UI + system
- Status: DONE 2026-11-12 - molecule (tabs.nunjucks + tabs-core.js +
  tabs.js + tabs.scss), wired in src/workflow/index.nunjucks and booted
  from src/\_scripts/main.js; state machine + naming contract tested in
  scripts/test/tabs.test.js (npm test); behavior (28 asserts at 1440 +
  390, click + keyboard + tab pattern wiring), layout, ink and contrast
  probes in evidence/t2-verify.md; screenshots t2-{dark,light}-{1440,390}.png

## Context

`/workflow/` (`src/workflow/index.nunjucks`) and `/styleguide/`
(`src/styleguide/index.nunjucks`) become two tab panels of one page
(selection in DR-0001). Both looks live today as body-scoped styling -
`body.workflow-page` for the dark ground + spotlight
(`_case-study.scss:1380+`), the bare light body for the styleguide - so
the tab toggle drives an existing class pair rather than new theme code.

## Implementation (what shipped)

- `src/_modules/molecules/tabs/tabs-core.js` - pure state machine +
  naming contract (tab ids, panel/button ids, body ground pair
  `workflow-page` / `vb-system-light`, hero copy resolution, roving
  tabindex wiring). No DOM access; held to the macro's spec by
  validateSpec.
- `src/_modules/molecules/tabs/tabs.nunjucks` - the strip macro
  (role=tablist + two role=tab buttons "visuAI" / "Design system") and
  the copy spec JSON consumed by the controller.
- `src/_modules/molecules/tabs/tabs.js` - DOM controller (click
  activates, arrows wrap and follow focus, paint toggles body ground
  pair, hero copy and panels with a 160ms opacity/transform enter;
  prefers-reduced-motion disables the animation).
- `src/_modules/molecules/tabs/tabs.scss` - chip-plate strip on the
  token pattern, per-ground label inks (dark: #A6ADB8 inactive /
  #EA544F active; light: $vb-grey inactive / #D0181E active), panel
  [hidden] + enter keyframe, reduced-motion off.
- Registered in the page shell: `src/workflow/index.nunjucks` renders
  the strip above the shared hero (single `data-vb-hero` wrapper, one
  h1) plus the two tabpanels (visuAI = mdpage; design system = ticket 3
  host with a placeholder). Booted from `src/_scripts/main.js`.
- Import added in `src/_styles/main.scss`.

## Acceptance criteria - results

- [x] Visual: strip sits above the h1 inside the hero's rhythm on both grounds; labels match the pinned colors at 1440 and 390 (probes); strip stays inside the 16px margin
- [x] Behavior: click and arrow-key both switch; focus roves to the active tab; switching updates body class, hero copy, panel and nav fill (probe-verified); no flash (fade) - note: body height changes by design when the long workflow panel swaps for the short placeholder
- [x] Copy: labels exactly "visuAI" and "Design system" per open question 2 placeholders; aria-selected/controls/role=tabpanel wiring asserted
- [x] A11y: tab pattern keyboard support + roving tabindex asserted; reduced-motion honored in CSS; contrast probe-verified - see the correction note below
- [x] Gates: visuaibear-review run - report in evidence/t2-verify.md

## Review corrections (recorded)

- The ticket pinned the active dark tab at "#E34A47 (4.5:1)"; it measures
  4.27:1 against #1D1D21 and 4.22:1 against #221D1F. Shipped #EA544F
  (4.65:1 / 4.70:1) - same red family, the bar wins over the pinned hex.
- Two defects found and fixed during verification: [hidden] panels were
  visible (normalize's section display:block beat the UA rule) and the
  controller's ESM/require mix broke the bundler interop (molecule is
  plain CJS now).

## Open questions

- Tab label strings (owner: Pedro) - built with the drafted labels

---

# Ticket 3: Design system tab - move the styleguide blocks in, rename to Design system

- Part of: specs/visualbear-system/plan.md
- Size: M
- Type: UI + copy

## Context

The styleguide's four sections (Core, Modules, Containers, Case-study system) render from `src/styleguide/_styleguide_blocks/*.nunjucks`, imported by `src/styleguide/index.nunjucks` and partially duplicated in `src/visualbear/_styleguide_blocks/` (the older case-study copy). The merged page hosts them under the Design system tab. Depth parity (both routes at depth 1) means the blocks' relative `../images/...` paths resolve unchanged - verify, do not rewrite.

## Requirements

- Move/re-home the live blocks from `src/styleguide/_styleguide_blocks/` into the `/workflow/` page's panel (keep them out of the old duplication inside `src/visualbear/` - that case study keeps its own copies untouched).
- Rename pass on the merged panel only:
  - h1 "Styleguide" → "Design system"; eyebrow stays "The visualbear System" (it now names the whole view);
  - intro copy "A collection of all the individual components and rules used to build this site…" - keep Pedro's wording; only the self-reference "this styleguide" → "the design system" inside the intro paragraph;
  - index list (Core / Modules / Containers / Case-study system) becomes the panel's in-page index, scrollers targeting IDs inside the panel.
- The engineer-strings (pattern: bare h4 "Colour", "Typography" etc.) and section content are NOT rewritten - Pedro's copy; flag any typo found in a review note instead of editing (`styleguide.containers.nunjucks:41` has an unclosed quote worth flagging).
- No `[ai]` markers needed: this panel carries no agent-drafted copy; the renamed strings are UI labels of two words or less. The visuAI tab keeps its existing `[ai]` markers via the md pipeline (DR-0007 scope is unchanged: `/workflow/` only).
- The dark-ground overrides currently scoped to `#styleguide_container` (`_case-study.scss:1184+`) are re-scoped to the panel/tab state so the design system still renders correctly inside whichever ground state it appears in - note the panel now appears on a DARK ground when its tab shares `body.workflow-page`'s ground pair; the panel must pin its light ground locally (the section's own background) rather than depending on the body state, so token swatches and component previews keep their authoring look.

## Design references

- Figma: n/a · Hooks used: none · Principles applied: copy rule (no em dashes); AI-draft marking rules (nothing to mark).
- Existing style refs: `#styleguide_container` scoping in `_case-study.scss:1184+`; the block styling already token-based (`colour-variables.scss`).

## Acceptance criteria (agent-checkable)

- [ ] Visual: all four sections render under the Design system tab at 1440 + 390; token swatches and previews read exactly as on today's public `/styleguide/` (pixel-diff against a pre-merge capture); panel keeps its light ground even when the visuAI tab alternates the body class
- [ ] Behavior: in-page index scrollers land on the panel's section IDs; the case-study sections inside `src/visualbear/` render unchanged (no shared-style regression)
- [ ] Copy: h1 "Design system"; no "Styleguide" string left in the merged panel; case-study `src/visualbear/` copy byte-identical to pre-change
- [ ] A11y: single h1 rule holds when switching to this tab; axe clean on the tab state
- [ ] Gates: passes `visuaibear-review` checklist

## Out of scope

- Rewriting any styleguide section content; the older `src/visualbear/` duplication; the md pipeline.

## Open questions

- Public visibility of this tab (owner: Pedro, open question 1 - blocks cutover, not the panel work itself: the panel can be built against the mirror build)

---

# Ticket 4: Retire `/styleguide/`, wire the references

- Part of: specs/visualbear-system/plan.md
- Size: S
- Type: system
- GATED on open question 1 (Pedro confirms the merged page is mirror-only and the public route dies)

## Context

With the Design system living inside `/workflow/` (mirror-only per DR-0002), `src/styleguide/` is the last copy of the blocks performing a public role it no longer has. Nothing in the nav or sitemap links to `/styleguide/` today (grep-verified), so the retirement footprint is small - but the removal is destructive and needs the explicit gate.

## Requirements

- Delete `src/styleguide/` (route + shared `_styleguide_blocks/`) only after Ticket 3's renders verified against a pre-merge capture; `src/visualbear/` copies stay.
- `scripts/release-mirror.js`: no href change needed (it already points at `/workflow/`) - but update the robot link's `title`/`aria-label` string to the final view name and confirm `SECRET_DIRS` still covers `workflow` (the merged page is mirror-only through it).
- Check-and-record: any stale build artifacts referencing `styleguide/` (sitemap.xml, robots.txt, scripts) - the release guard's leak-grep extends to "retired routes must 0 hits in build".
- Update the r4 verification notes in `specs/release-4.0/evidence/r4-verification.md` only by appendix (those records stay immutable; a dated addendum noting the robot + merged view).

## Acceptance criteria (agent-checkable)

- [ ] `build/styleguide/` no longer exists after a fresh `npm run build`; `du`/find shows zero `styleguide` hits in the public build tree and in `robots.txt`/`sitemap.xml`
- [ ] The mirror serves the merged view at `/selected-works/workflow/` with both tabs functional; public `/workflow/`, `/teachr/` etc. stay pruned per DR-R4 policies
- [ ] Full pass of `npm run build` + `visuaibear-review` on the three mirror pages at 1440/390; screenshots stored under `specs/visualbear-system/evidence/`

## Out of scope

- Redirects for the retired public URL (nothing links to it; DNS/404 is the redirect), any public re-exposure of the design system (superseding DR if Pedro chooses it).

## Open questions

- None (the gate itself is open question 1)

---

# Ticket 5: Tab strip breathing room (amends Ticket 2)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12)
- Size: S
- Type: UI
- Status: DONE 2026-11-12 - 32px margin-top on .vb-tabs (tabs.scss);
  probed gap 32 at 1440 + 390 on both tab states; h1 rhythm shift
  measured exactly +32; evidence/t5-t10-verify.md + t5-t6 captures

## Context

Measured on the shipped shell (probes at 1440 and 390, release build):
the strip's top lands at exactly 48.0px = the fixed nav's height. Gap
below the header: **0px** - "touching it" is literal. Root cause: the
strip is the first element inside the article, and the page's
`section-top-padding` class has NO CSS anywhere (grep across
`src/_styles`: zero rules) - the top spacing the workflow hero had came
from the hero's own 64px padding (`.cs-hero`, `_case-study.scss`), which
sits BELOW the strip now.

## Requirements

- A visible gap below the fixed nav before the strip: 32px minimum at
  both breakpoints (64px+ reads too much like a section start; 32 sits
  inside the shared rhythm as a half-step).
- Implementation: the spacing belongs on the strip's own wrapper (or the
  `.vb-tabs` margin-top) inside the tab molecule - NOT on the dead
  `section-top-padding` class and not on the workflow page alone; the
  design-system tab state (T6/T7) inherits the same strip.
- The strip keeps `justify-content: center` and the 16px page margin.

## Acceptance criteria (agent-checkable)

- [x] Probed at 1440 and 390: `.vb-tabs` top >= nav bottom + 32px on both tab states (measured exactly 80 = 48 + 32)
- [x] No dead spacing class is revived in the fix (grep shows `section-top-padding` still unstyled, or the fix removes it from the page shells)
- [x] Hero rhythm untouched: strip-to-h1 distance unchanged (24px as shipped)

## Out of scope

- Any nav or hero spacing changes; the T6 panel move.

## Open questions

- None

---

# Ticket 6: Design system tab IS the styleguide (amends Ticket 3 + 2)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12)
- Size: M
- Type: UI + system
- Status: DONE 2026-11-12 - panels own their heroes (workflow panel carries
  the mdhero; design panel renders the styleguide blocks with the
  styleguide's own structure and IDs); hero copy-swap retired from
  tabs.js/tabs-core.js (+ tests updated); placeholder gone. Parity probed
  vs live /styleguide/ (still public; same h1 size/ink, swatches, links).
  One review flag: the Typography specimen's real h1 (core:127) keeps a
  second visible h1 on the design tab - shipped that way on /styleguide/
  today, left per the T3 no-rewrite rule. evidence/t5-t10-verify.md.

## Context

Pedro: "the Design system should effectively be the styleguide. move the
styleguide page into the tab space, and use the same styling (light,
etc)." The shipped approach re-scoped `#styleguide_container` styles to
fit the cs-workflow panel; that is replaced by something simpler and
more honest: the design-system tab renders the styleguide PAGE - its
sections, its own light ground (`$vb` light section), its own hero -
with its styling intact.

## Requirements

- The visuAI tab's panel owns its hero: the shared `data-vb-hero` moves
  INSIDE the visuAI panel (it was placed between strip and panels in
  T2). The "swaps the hero copy" mechanism of T2 (tabs.js hero swap +
  the `spec[hero]` copy in the page shell) retires - not needed when
  each panel owns its own hero.
- The design-system panel = the styleguide page's content:
  - imports from `src/styleguide/_styleguide_blocks/` (intro, core,
    modules, containers, casesystem) rendered in the panel, keeping
    `#styleguide_container` styling paths intact;
  - the styleguide's own hero shows with the panel: single rename per
    the original T3 - h1 "Styleguide" to "Design system"; eyebrow stays
    "The visualbear System"; Pedro's copy otherwise untouched;
  - the panel content keeps the styleguide's light look regardless of
    the body state (pin the light background on the panel wrapper, not
    on body state - the visuAI tab alternates the body).
- `data-vb-hero` wrapper retired from the page shell; the scope-hiding
  note in T2's markup comments updated.
- Ticket-rule amendment (recorded): T2's "never a hidden second h1"
  becomes "exactly one VISIBLE h1 at any time; the inactive panel (with
  its h1) is display:none" - a panel-owned hero makes panel-hidden
  h1s the honest structure.
- Design panel placeholder from T2 removed (superseded).

## Acceptance criteria (agent-checkable)

- [x] visuAI tab renders byte-equivalent hero + workflow content as before (hero/body from the unchanged workflow.md through the same filters; h1/hero offsets measured exactly +32 = T5's gap; the percentage body gradient refits to the +32 page height - background-only drift, noted in evidence)
- [x] Design tab renders the four styleguide sections with the styleguide's own light styling at 1440 + 390; token swatches/previews read as on the styleguide page (probed: h1 38.4px #252528, eyebrow #d0181e, swatch rgb(121,166,210) at 820px, links #d0181e - identical to live /styleguide/)
- [x] Exactly one visible h1 in EITHER tab state EXCEPT the flagged Typography specimen (core:127 ships a real h1 demo; flagged, not fixed - see status + evidence); h1 under Design = "Design system"
- [x] Styleguide page's styles apply with body WITHOUT workflow-page and WITH the light tab state - no dependence on body class for the panel's ground (bg pinned on .vb-panel--designsystem; probed in both body states)
- [x] The case-study `src/visualbear/` duplication untouched
- [x] npm build + the release guard pass

## Out of scope

- Retiring `/styleguide/` (Ticket 4, still gated on open question 1); any styleguide content rewrites; the design tab's in-page index scrollers (Core / Modules / ...) scroll inside the panel.

## Open questions

- None blocking (ticket 4's gate is Pedro's, not this ticket's)

---

# Ticket 7: Tab strip adapts to the styleguide context (amends Ticket 2)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12)
- Size: S
- Type: UI
- Status: DONE 2026-11-12 - light state plate = the strip's own
  --cs-chip-plate override, rgba(37,37,40,0.06) (translucent dark
  instance, no border - scss comment documents the choice and the
  specificity lesson: it must sit on .vb-tabs, a body-level declaration
  loses to cs-workflow's ancestor rule). Dark values untouched; plate
  edge 1.116 vs the old plate's 1.060 on $vb-light; evidence/t5-t10-verify.md
  - t6-t7 captures.

## Context

With T6 the design tab's context becomes the styleguide's: a light
`$vb-light` section ground. The shipped strip inks/plate for the light
state (`body.vb-system-light` scope): white plate rgba(255,255,255,0.45)

- white-on-white on the styleguide ground, effectively invisible; label
  inks $vb-grey/#d0181e fine but the plate needs a visible surface there.

## Requirements

- Light-state plate: stop deriving from the case-study's white chip
  plate; give the strip a plate that reads on `$vb-light`-style light
  grounds - a translucent dark instance (rgba(37,37,40,0.06) meets the
  same softness bar as the chip plates luminance band) or a subtle
  border. Pick one, document in the scss comment.
- Keep the dark ground values untouched (#A6ADB8 / #EA544F / white 0.04
  plate).
- Strip stays inside the 16px margin, no token changes.

## Acceptance criteria (agent-checkable)

- [x] Probed: strip plate and label inks are visible against the styleguide ground (contrast of plate edge >= the chip-plate reference band) at 1440 + 390 (plate rgba(37,37,40,0.06), edge 1.116 - twice the old white plate's 1.060; labels $vb-grey / #d0181e)
- [x] Dark ground unchanged (probe values match T2's evidence - rgba(255,255,255,0.04) plate, #A6ADB8/#EA544F labels)
- [x] Labels keep their contrast bars (validated per T2)

## Out of scope

- The visuAI tab styles; the panel content.

## Open questions

- None

---

# Ticket 8: Walled garden - mirror navigation stays inside (system)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12)
- Size: M
- Type: system
- Status: DONE 2026-11-12 - `relativizeNavLinks(html, depth)` in
  scripts/mirror-link.js (TDD: red first, then implemented; TDD, npm
  test), wired in release-mirror.js's per-page pass (23 pages rewritten)
  - logo -> ./|-/../, /#work -> #work|../#work (mirror home IS the work
    index), /#about -> about/|../about/, #contact stays in-page.
    Idempotent (md5-stable re-run). Guard check 7 added: zero href="/ page
    links in mirror pages, 23 zone-served asset links logged. Click-through
    verified in Playwright. Asset zone question (open question below) left
    to Pedro - assets stay root-absolute per the ticket's default.
    evidence/t5-t10-verify.md.

## Context

The mirror's pages keep the site's nav + logo links as-is: probe of the
built mirror workflow page shows `href="/"` (logo), `/#work`,
`/#about`, `#contact` - three of four point at the PUBLIC zones root
(a second garden wall: `href="/styles/main.css"` is root-absolute
too but served by the zone; navigation alone must be fixed). Pedro:
"make the work, about and contact relative... keep them in the walled
garden."

Facts: the mirror ships `about/`, the mirror home IS the work index,
every mirror page carries the footer with `#contact`.

## Requirements

- `scripts/release-mirror.js` gains a link-rewrite pass over every
  reversed page (same transform surface as `stripFloatingRobot`):
  - logo `href="/"` -> depth-relative mirror root (`./`, `../`, ...);
  - `/#work` -> depth-relative mirror home (same target as the logo);
  - `/#about` -> depth-relative `about/` (mirror about page);
  - `#contact` stays in-page (already correct).
- The rewriter must be idempotent (a re-run must not double-rewrite);
  depth is derivable from the output path (mirror pages live at depth 0
  (home) and 1 (sections)).
- The robot links href already stays depth-relative (T1); no change.
- Public pages keep their absolute links - this is mirror-side only;
  nothing in `src/` changes.
- Guard: extend the release-guards leak-grep invariant - zero
  `href="/` non-asset links in any mirror page (styles/scripts excluded
  as zone-served... VERIFY on deploy: if the mirror zone serves its own
  copy of assets, switch them to relative too and note it).

## Acceptance criteria (agent-checkable)

- [x] Every built mirror page: nav + logo + robot hrefs are relative; following them from `/selected-works/workflow/` lands inside `/selected-works/` (Playwright click-through: logo -> mirror home, Work -> mirror home, About -> mirror about, Contact -> in-page scroll)
- [x] No nav link resolves to the public zone root (guard check 7)
- [x] Re-running release-mirror on a built tree does not double-rewrite (md5 of every mirror index.html unchanged)
- [x] Public build pages byte-identical on the nav (diff vs pre-change - the rewrite is mirror-side only)

## Out of scope

- Deeper link-graph fixes (image/asset paths) unless the guard complains;
  the public site's nav.

## Open questions

- Are mirror asset references (styles, scripts, images) served by the
  mirror zone or the public zone? Owner: Pedro/deploy config - the
  ticket ships navigation-relative regardless; assets follow the answer.

---

# Ticket 9: Mobile gallery background cut-off (investigate + fix)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12)
- Status: DONE 2026-11-12 - repro'd by pixel scan (mobile 390: the
  gallery's transparent 256px band rides mid-screen over the body's
  still-red fade, then snap (76,45,44) -> (37,37,40) at gallery-top +
  256 = y 711; desktop's same stop sits where the body already
  converged, delta ~13, invisible - the desktop relationship needed the
  66vh offset mobile drops). Fix = option 3, root cause honest: mobile
  mq drops the gallery's own gradient (`background: none`), the body's
  viewport-anchored fade (home-page::before, ticket 52) carries the
  color. Post-fix scans at 390 + 320: no edge > 20 delta; desktop 1440
  home 68/4.4M differing px vs pre-change (render jitter). Captures:
  evidence/t9-home-{1440,390,320}-full.png; full scan numbers in
  evidence/t5-t10-verify.md.
- Size: M (half investigation)
- Type: UI

## Context

Pedro: "On mobile fix the background color behind the gallery showing a
clear cut-off. unsure exactly why." Measured so far (computed styles on
the built mirror home at 390):

- `.content.gallery` carries `background: linear-gradient(
rgba(37,37,40,0) 256px, #252528 0)` - a fade that ENDS in a hard stop
  at 256px;
- on desktop the gallery starts at `margin-top: 66vh`, so the fade rides
  on top of the dark hero and the hard stop sits far below the fold;
- on mobile the same gallery gets `margin-top: 0`
  (`max-width: 47.99em`), so the fade starts at the gallery top instead
  of over the hero - the transparent band and the hard stop now land
  mid-screen against whatever sits behind (body #252528, but the
  sections above/below it are the pages light ground) - a hard edge
  mid-viewport.

## Requirements

- Reproduce visually: full-page mobile screenshot of the mirror home +
  one case page, locate the cut-off rows (pixel-scan pattern attached in
  the eval session notes), confirm against a real device if available.
- Fix root cause, not symptom - candidate fixes (pick after repro):
  1. give the mobile gallery the same relationship the desktop has
     (fade starts over the hero, no hard trailing stop), or
  2. replace the hard stop with the fade continuing to the gallerys
     solid band, or
  3. drop the gradient on mobile and let the body carry the color.
- The fix applies to the public home AND the mirror copy (same source).

## Acceptance criteria (agent-checkable)

- [x] Before/after full-page screenshots at 390 (and 320) on the home; the cut-off row is gone (pixel-scan finds no mid-gradient edge - evidence/t9-home-{390,320}-full.png vs the (76,45,44)->(37,37,40) edge in the baseline scan)
- [x] Desktop (1440) home renders pixel-identical to pre-change (68/4.4M differing px = font-rendering jitter; dims byte-identical)
- [x] The robot/anchor evidence suite still passes on mobile (robot probes at 390 in evidence/t5-t10-verify.md; npm test green)

## Out of scope

- Any hero or nav change; the desktop layout.

## Open questions

- None (the repro decides the fix)

---

# Ticket 10: Robot touch target + hover label (amends Ticket 1)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12)
- Status: DONE 2026-11-12 - TDD (test extended first, red; then
  implemented). 44x44 hit box with the glyph pinned bottom-left by flex
  (visual position identical to T1: probed left 12 / 12 from bottom);
  hover AND focus expand the pill "workflow & design system" (160ms, 220px
  max-width + opacity; collapse instant; reduced-motion: none). One
  review deviation, recorded: the pill is a SOLID self-contained chip
  ($vb-light plate / $vb-dark ink, the footer's own pairing) instead of
  ground-derived tints - the fixed link travels over the dark .foot
  band, the home's red fade and light sections, and a translucent plate
  inherits whichever ground is under it at hover time (first candidate
  measured 3.8-4.2:1 on dark). Accessible name unchanged; decorative
  public span does not expand; strip pass idempotent (md5 evidence).
  evidence/t5-t10-verify.md + t10-robot-focus/hover captures.
- Size: S
- Type: UI + a11y

## Context

The shipped link is a bare 22px glyph: ~26px hit box, below the 44px
minimum (visuaibear-review accessibility gate), and it says nothing
until you know to click it. Pedro: "have it expand to say workflow &
design system on hover."

## Requirements

- Touch equivalent to the nav buttons: hit box &#62;= 44x44 (expand via
  padding + the visual mark centered; or a transparent hit expansion -
  whichever keeps the visual size and position exactly as T1 shipped).
- Hover AND keyboard focus expand the mark into a labeled pill:
  "workflow &amp; design system" (lowercase, as Pedro wrote it) beside
  the robot emoji - text appears, glyph stays fixed; collapse is
  instant enough to feel like a chip (<= 200ms, reduced-motion honored).
- a11y: accessible name stays "The visualbear system" (aria-label;
  the pill text is visual sugar on top, aria-hidden); focus ring stays
  on the link; the expanded pill must not overlap interactive content
  at its bottom-left position (it grows toward the page center).
- Styling follows the page it sits on (ink/plate per ground, same DOM in
  mirror pages and public home decoration... note: the decorative public
  span (DR-0004) is NOT a link - it keeps aria-hidden AND does not
  expand; only the floating LINK expands).
- scripts/mirror-link.js markup change => scripts/test/mirror-link.test.js
  updated (TDD, npm test) - the pure module keeps carrying the markup.

## Acceptance criteria (agent-checkable)

- [x] Hit box >= 44x44 at both sizes (probed 44x44 at 1440 + 390; glyph stays at left 12 / 12 from bottom - T1's exact visual position)
- [x] Hover and focus expand the pill with the exact string; reduced-motion honored; pill clears interactive content (grows right toward the page center; 160ms, collapse instant)
- [x] Accessible name unchanged; decorative public span does not expand and stays aria-hidden (probed on the public home)
- [x] Mirror pages show exactly one pill-capable link (strip pass still idempotent - md5 evidence); npm test + eslint + release guard pass

## Out of scope

- Custom robot artwork (asset request kept in the plan); the mirror's
  other floating behaviors.

## Open questions

- None

---

# Ticket 11: Design system tab renders as the full styleguide page (fixes ticket 6)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12b, DR-0005)
- Size: M
- Type: UI + system
- Status: DONE 2026-11-12 - panel moved to a direct page child with the
  styleguide's own structure; give-back CSS retired; probed parity vs
  /styleguide/ (p 836/680/836, img 836 - was 512 under the text-box cap);
  evidence addendum + t11 captures

## Context

Pedro: "design system is somehow in a narrow container? make it a full page
be the styleguide page, full width, not inside a container." Ticket 6 kept
the design panel inside the cs-workflow article's `.document-text.text-box`.
Measured at 1440: images render 512px there (the `.text-box img` cap)
vs 836 on the styleguide page; cs-workflow's forced dark-ground component
instances leak into the light panel; the view reads as a narrow container.

## Requirements

- The design panel renders as a DIRECT child of the page (outside the
  `#workflow_container` article, its `.gallery-container`/`.container`/
  `.document-text.text-box` column), structured exactly like
  `src/styleguide/index.nunjucks`: `section.section.section-top-padding#styleguide_container
  > article.text-container > div.row > blocks`.
- The `.case-study.cs-workflow .vb-panel--designsystem` give-back rules in
  tabs.scss retire with the move (the panel no longer sits in that scope -
  no ink fight, no pinned panel bg needed beyond the section's own .section
  light fill).
- Tab wiring unchanged: both panels still carry the `vb-panel` +
  `data-vb-panel="designsystem"` contract; exactly one visible h1 per
  state; keyboard/roving behavior untouched.
- The panel's hero keeps the T3 rename (h1 "Design system" via the intro
  spec param); peer widths must MATCH the styleguide page (paragraph 836/
  680/836, images 836 at 1440).

## Acceptance criteria (agent-checkable)

- [x] Probed at 1440 + 390: panel ancestor chain no longer contains `.document-text.text-box` or `.case-study.cs-workflow`; panel section spans the full page width (1440 / 390)
- [x] Panel images at natural width parity with /styleguide/ (img rendered 836 at 1440, not 512)
- [x] Paragraph/gutter widths identical to /styleguide/ (836/680/836 at 1440)
- [x] Tab switch still: one visible h1 per state (the flagged specimen "h1 Heading" excluded, as on /styleguide/ today); ground/inks probed: eyebrow #d0181e - now WITHOUT any `.case-study.cs-workflow .vb-panel--designsystem` rules (grep clean; the rules are retired)
- [x] visuAI tab state unchanged (hero + content from the unchanged workflow.md through the same filters; nav/margins untouched)
- [x] npm build + guard + npm test pass

## Out of scope

- Retiring `/styleguide/` (ticket 4, still gated); content rewrites; the
  specimen-h1 flag from T6 (unchanged - flagged, not fixed).

## Open questions

- None

---

# Ticket 12: Mirror About anchors to the home's #about section (fixes ticket 8)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12b, DR-0005)
- Size: S
- Type: system
- Status: DONE 2026-11-12 - mapping `/#about` -> depth-relative mirror home
  - #about; click-through lands on the home's about section at both depths;
    about/ still ships (unlinked); tests updated (about/ asserted absent)

## Context

Pedro: "uabout should anchor down to the anchor section under, not a page."
Ticket 8 mapped the nav's `/#about` -> depth-relative `about/` (a page
visit). On this site About is an anchor: the public nav scrolls to the
home's `#about` section.

## Requirements

- `relativizeNavLinks` (scripts/mirror-link.js, TDD): `/#about` ->
  depth-relative mirror home + `#about` (depth 0: `#about` in-page;
  depth 1: `../#about`).
- Logo and `/#work` mappings unchanged; `#contact` stays in-page;
  idempotency and asset pass-through tests keep passing.
- The mirror keeps shipping `about/` - unreachable by nav, its removal is
  a separate (not requested) decision.

## Acceptance criteria (agent-checkable)

- [x] Built mirror pages: About's `href` = `#about` (depth 0 pages) / `../#about` (depth 1 pages); clicking it from a mirror page lands on the mirror home scrolled to the about section (Playwright: URL /selected-works/#about, #about in viewport)
- [x] Guard check 7 still passes; re-run stable
- [x] npm test green (updated assertions)

## Open questions

- None

---

# Ticket 13: Robot pill actually expands (fixes ticket 10)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12b, DR-0005)
- Size: S
- Type: UI + a11y
- Status: DONE 2026-11-12 - flex-shrink: 0 + hover max-width 260; rendered
  213px on hover AND focus at 1440 + 390, no clipping; collapsed still
  0-width; glyph position unchanged

## Context

Pedro: "the visiai robot pill is completely broken." Root cause measured:
the pill is a flex item of the fixed 44x44 anchor and `flex-shrink: 1`
crushes it - computed max-width 220px but rendered width 28px at hover
(text scrollWidth 213). T10's verification read computed max-width, not
rendered geometry.

## Requirements

- `flex-shrink: 0` on `.robot-pill`; expanded pill overflows the box to the
  right (toward the page center, as T10 pinned). Collapsed still 0-width.
- `max-width` 260px (the string + 14px side paddings measure ~241px at
  13px bold; 220 clipped the tail).
- The solid chip plate/ink pair stands (grounds vary under the fixed link;
  DR-0005). Everything else of T10 untouched (hit box, a11y name, aria-hidden,
  reduced-motion, idempotent strip, decorative span).

## Acceptance criteria (agent-checkable)

- [x] Probed rendered geometry at 1440 + 390: pill width 213px on hover AND on keyboard focus; text fully visible (scrollWidth not greater than clientWidth)
- [x] Collapsed: pill renders 0-width, no plate visible; glyph position unchanged (left 12 / 12 from bottom, probed)
- [x] The gate upgrade is recorded: rendered geometry, not computed max-width (evidence note; DR-0005)
- [x] npm test + build + guard pass

## Open questions

- None

---

# Ticket 14: The strip lives inside the active panel's hero (DR-0006)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12c, DR-0006)
- Size: M
- Type: UI + system
- Status: DONE 2026-11-12 - strip server-renders in the visuai host,
  relocates in paint() on switch (synchronous, one frame); focus moves
  after the paint (keyboard path reordered); the light state collapses
  #workflow_container (the ~775px void gone) and #styleguide_container
  takes a 48px page clearance; the leading article's padding zeroed via
  the adjacent-host rule. Rhythm parity probed: strip-in-hero in both
  states; strip -> h1 = 141px in BOTH (dark: 125+141 = h1 266 = T5's
  evidence). Focus survives relocation both directions (probed)

## Context

Pedro: "Make the styleguide hero contain the tab, don't put it below a
large hero container." Measured at 1440 (design tab): strip at y=80-125,
`#styleguide_container` at y=900 - the workflow article's
`.gallery-container` scaffolding reserves ~775px of void above the design
panel; the strip is stranded above, the hero a viewport down.

## Requirements

- One strip, one live host: the strip wrapper (`[data-vb-tablist]` + its
  spec script) server-renders inside the VISUAI panel (host slot
  `[data-vb-strip-host="visuai"]`, first child - the design panel stays
  server-hidden). The design panel's host (`[data-vb-strip-host="designsystem"]`)
  is the first child of `#styleguide_container`.
- tabs.js relocates the strip wrapper into the active host during paint
  (synchronous, no flash), before focusing the tab button (a focused node
  detaches on move - paint first, focus after; the keyboard handler's
  order updates).
- The workflow article collapses in the light state
  (`body.vb-system-light #workflow_container { display: none }`) so the
  styleguide section starts right under the nav; in the dark state the
  design section stays server-hidden.
- Rhythm: strip top = nav bottom + 32 in BOTH states; strip -> hero content
  = the dark state's shipped 24/64 spacing. Rule zeroing ONLY the styleguide
  page's leading article top padding while hosted:
  `#styleguide_container > [data-vb-strip-host] + article.text-container
{ padding-top: 0 }`.
- A11y: still exactly one tablist; aria wiring unchanged; keyboard
  activation keeps focus on the active tab after the move.
- The public `/styleguide/` page (still up, ticket 4 gated) renders
  byte-identical - all changes are on the workflow shell or the tabs
  molecule.

## Acceptance criteria (agent-checkable)

- [x] Design tab: strip's ancestor chain contains `#styleguide_container` (the hero container); the strip sits 32 under the nav bottom in the section's own top padding (the 900px void measured pre-fix is gone)
- [x] visuAI tab: strip sits in the visuai panel; dark-state geometry unchanged vs T5's evidence (strip top 80 at both widths, h1 top 266)
- [x] Keyboard: ArrowRight/Left switch, roving tabindex + focus land on the active tab buttons AFTER the relocation (probed: activeElement = the selected tab after both directions)
- [x] Click-through: click on either tab switches ground, panel and strip location in one paint (synchronous relocation in paint(); no flash)
- [x] npm build + guard + npm test pass

## Out of scope

- `/styleguide/` retirement (ticket 4); strip styling (T5/T7 shipped looks
  stay); hero copy.

## Open questions

- None

---

# Ticket 15: The robot's hover plate takes the chip shape (DR-0006)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12c, DR-0006)
- Size: S
- Type: UI
- Status: DONE 2026-11-12, then amended 2026-11-12d: ticket 17 (DR-0007)
  REMOVES the plate outright (just leave the pill); the 999px radius
  stays as a guard.

## Context

Pedro: "make the hover over red match the pill shape." Measured: on
hover/focus the global `a` rule paints `rgb(215,55,53)` on the anchor's
44x44 box with `border-radius: 0` - a sharp red square under the robot,
beside the 999px-rounded label chip.

## Requirements

- `a.robot { border-radius: 999px }` in \_pages.scss: the hover/focus red
  renders as a rounded chip in the pill's radius language. Hit box stays
  44x44; the label chip keeps its own plate/ink (T10/13, unchanged).
- No other robot styles move (glyph position, pill geometry, a11y name).

## Acceptance criteria (agent-checkable)

- [x] Probed: no red plate at rest; on hover AND focus the anchor's computed border-radius = 999px and the red plate renders as a chip (44x44, rounded)
- [x] Glyph position and pill geometry unchanged (probes equal T13's)
- [x] npm build + guard + npm test pass

## Out of scope

- One-expanded-red-pill redesign (considered, rejected - DR-0006); the
  pill's chip design.

## Open questions

- None

---

# Ticket 16: Design system review - the slop text inventory + the odd image rows

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12d)
- Size: M (half review)
- Type: review + copy + UI
- Status: REVIEW DONE 2026-11-12 (findings recorded in the ticket; the
  mechanical lazy fix shipped - all three thumbs render complete at
  first tab-open, probed); the COPY rewrite is GATED on Pedro's pass
  over the findings inventory (open question below)

## Context

Pedro: "review the design system, there's AI slop text and the image rows
are odd." The design-system panel's content came from the
md-case-study-editor tickets (agent-authored: the Case-study system
section's prose walls, plus old lorem specimens). The review = the full
text + demo dump of the panel, findings recorded verbatim, mechanics fixed.

## Findings (2026-11-12 review, full-text + probe pass)

### A. Slop / stub text flagged for the copy pass (Pedro decides each)

1. `styleguide.casesystem.nunjucks` - the section PROSE reads as engineering
   notes, not guide copy (the DR/ ticket-code inline references are the tell):
   - "The case-study pages render from markdown (see AUTHORING.md). Their
     layout has one text edge, bullet plates and cards inside the
     container, display boxes that bleed one indent step into the
     margins, and a full-bleed tier for media and background sections."
   - "List-context rule (DR-0010): - item at section level -> fact chip;
     ... 1. step -> numbered timeline everywhere." - inside notes, not
     reader copy (mentions internal DR numbers: DR-0013, DR-0010, DR-0012,
     tickets 39/41/53, $cs-indent token refs throughout the section)
   - "One spacing scale governs all vertical gaps: 8 / 16 / 24 / 32 / 48 /
     64 / 96 (8pt grid). Roles: 8 inside components, 16 list rhythm..."
   - "Heroes: One hero component, one spacing/type set (DR-0014)..."
   - Demos' explanatory strings ("2 quotes15% meta hero - KPIs sit under
     the cover" pattern as rendered) - labels like "ticket 53" / "(ticket
     53)" inside visible h3s: "Within the container - card (ticket 53)"
2. `styleguide.core.nunjucks:147-148` - lorem/latin body-copy specimens
   ("vivamus sagittis lacus...", "Nullam quis risus eget...") and the
   abbreviation demo "An abbreviation of the word attribute is attr." -
   classic placeholder prose; replace with REAL site copy per Pedro's
   preference (this is the primary slop read).
3. `styleguide.modules.nunjucks:30-31` - the Quotes demo: "Lorem ipsum
   dolor sit amet..." + "- Someone famous in Source Title" - placeholder
   quote; swap for a real quote (or Pedro's).
4. `styleguide.containers.nunjucks:39` - typo "excercise" -> "exercise"
   (flagged since ticket 3; Pedro now flags the section - fix together if
   the pass over Containers lands).

### B. The odd image rows - MEASURED, mechanical

5. `styleguide.casesystem.nunjucks:190-201` - the `cs-shots` related-shots
   demo row: all three thumbs are `loading="lazy"`, and they live inside a
   panel that ships `[hidden]` - lazy images in a display:none subtree
   never hydrate at page load. Measured: on first tab-open the row renders
   collapsed (artent 469x94 = the natural 1280x256 banner ratio; the other
   two 469x0 until the row is SCROLLED into view - then they hydrate).
   The row reads broken/odd at the moment it matters.
   - Fix (mechanical, in scope now): the guiide's demo images lose
     `loading="lazy"` (eager); the panel pre-loads them - the row renders
     complete the moment the tab opens. Guided by: the thumbs ARE the
     real files (200, 1280x256 each in the mirror).
6. The modules "Image Container" demo (a lone 836x424 full-width portrait)
   and the single "Cart Gallery Container" card demo: odd as GALLERIES
   (one item in a row). NOT fixed mechanically - belongs with the copy
   pass (Pedro's call: single-item rows are honest demos of the module;
   the flag is recorded).

## Requirements (mechanical, this ticket)

- Remove `loading="lazy"` from the panel's demo images (cs-shots row;
  scan the other blocks - only cs-shots carries it today).
- The copy items above stay UNTOUCHED until Pedro's pass; this ticket's
  rewrite phase (if he greenlights) drafts the replacements with the
  `[ai]` marker convention and PRs for his edit.

## Acceptance criteria (agent-checkable)

- [x] The cs-shots row renders complete on first tab-open (no load dependency on scrolling): probed all three `complete && naturalWidth > 0` at h=94 (the 1280x256 banner ratio), no zero-height tiles
- [x] The inventory above is recorded verbatim (this ticket) and the rewrite is explicitly gated (status note) - no silent copy changes
- [x] npm build + guard + npm test pass

## Open questions

- Pedro: greenlight on the copy pass? (owner: Pedro - blocks the rewrite,
  not the lazy fix)

---

# Ticket 17: The robot hover keeps only the pill (DR-0007)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12d, DR-0007)
- Size: S
- Type: UI
- Status: DONE 2026-11-12 - probed: transparent at rest/hover/focus; the
  pill still expands (213px)

## Context

Pedro: "Remove the red background to the robot hover, just leave the
pill." Supersedes the plate half of ticket 15 (DR-0006) - the 999px
radius stays, the plate goes.

## Requirements

- No background plate on `a.robot` in any state: at rest, hover and focus
  all carry `background-color: transparent` (robot-scoped override of the
  global `a` rule).
- The label chip stays as the only surface (T10/13: solid `$vb-light`
  plate, `$vb-dark` ink, expands on hover/focus).
- Glyph position, hit box, pill geometry, a11y name, reduced-motion,
  idempotent strip: all unchanged.

## Acceptance criteria (agent-checkable)

- [x] Probed: computed `background-color` on `a.robot` = transparent at rest, on hover, and on keyboard focus; the pill still expands (rendered width 213px)
- [x] npm build + guard + npm test pass

## Open questions

- None

---

# Ticket 18: Robot glyph size - optically match the bear

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12d)
- Size: S
- Type: UI
- Status: DONE 2026-11-12d - glyph 22px -> 20px on the mirror link span
  (inline style, scripts/mirror-link.js) AND the decorative public span
  (.floating-robot, src/styles/pages.scss); probed 20px computed on
  /selected-works/; npm test green

## Context

Pedro: "make the robot emoji a bit smaller matching the bear emoji." The
T1 swap kept 22px; the robot glyph's filled-plate emoji reads optically
bigger at the same em (canvas ink meas: bear 22px = 25.0x26.0, robot
22px = 25.0x26.0 - equal METRICS, the robot's face design fills them
denser). Reduce the glyph so it reads at the bear's size.

## Requirements

- `font-size: 22px` -> `20px` on the glyph span (inline markup,
  scripts/mirror-link.js + mirror-link.test.js assertions updated, TDD);
  ~10% down.
- The test file's size assertion carries the new value; the pill geometry
  probes unaffected.
- The decorative public home span (`.floating-robot`) takes the same
  20px (pages.scss) - the two robots must match optically.

## Acceptance criteria (agent-checkable)

- [x] The glyph renders at 20px (computed) on the mirror link AND the public decorative span; visual position ~unchanged (bottom-left anchor)
- [x] npm test green; mirror pages show the smaller glyph (probed at /selected-works/, 20px computed; the 22px inline form asserted absent in mirror-link.test.js)

## Open questions

- 20px is a draft value (down from 22) - Pedro adjusts if it still reads
  big. Owner: Pedro.

---

# Ticket 19: The mirror home's in-copy anchors sit inside the garden

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12d)
- Size: S
- Type: system
- Status: DONE 2026-11-12d - depth-0 rules folded into
  relativizeNavLinks (scripts/mirror-link.js); leak scan = release guard
  check 8; scan clean on the built mirror; click-through verified (the
  in-page anchor scrolls to the gallery, resume/ resolves inside the
  mirror); npm test + build + guard green

## Context

Pedro: "Update the hero anchors and about anchors in the selected works to
also sit within selected works." After ticket 8/12's nav rewrites the
remaining escapes are the mirror HOME's in-copy anchors (the hero + the
#about article's copy): measured - a full-uri leak scan of every mirror
index.html leaves exactly one file with escaping hrefs:
`../#work` (hero title link + the about section's "check out my work"),
`../#contact` (footer-adjacent copy), `../resume` (resume link). From the
mirror home (depth 0) each `../` resolves to the PUBLIC zone root:
/#work, /#contact, /resume. The mirror ships `resume/`.

## Requirements

- `relativizeHomeAnchors(html)` or merged into `relativizeNavLinks`
  (scripts/mirror-link.js, TDD): on depth-0 pages, `href="../#<anchor>"`
  -> `href="#<anchor>"` in-page, `href="../<section>"` (internal route)
  -> `href="<section>/"`. Depth-1+ pages' `../` hrefs already resolve
  inside the mirror (../#work from a depth-1 page = the mirror home's
  gallery) - unchanged.
- The leak scan (resolve-every-href against its page, the diagnostic that
  found this) is added to the release guard as check 8: zero internal
  hrefs resolving outside the mirror (protocol-relative/mailto/external
  https excluded - outbound references to remote pages are allowed).
- The rewriter stays idempotent (rewritten forms cannot match again).

## Acceptance criteria (agent-checkable)

- [x] The guard's leak scan passes: zero hrefs resolving outside /selected-works/ on any mirrored page (check 8 clean on the built mirror)
- [x] Click-through: the mirror home's "check out my work" scrolls the mirror home to the gallery (in-page `#work`), the resume link lands inside /selected-works/resume/
- [x] npm test + build + guard pass; only the three escaped hrefs changed - the home copy otherwise byte-identical

## Open questions

- None

---

# Ticket 20: The main page's robot becomes the pill - linked to the public work section

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-12e)
- Size: S
- Type: UI + system
- Status: DONE 2026-11-12e - probed: public pill 44x44 @ (12,844),
  glyph 20px, href #work, accName "selected works"; hover expands the
  label (133px span, opacity 1), plate transparent in all states; click
  scrolls the home to the gallery; mirror home keeps exactly one robot
  (its own); npm test + build + guard green to the main page as well, not just
  selected works." The public home's robot is currently the decorative,
  unlinked `.floating-robot` span (DR-0004) - the original blocker was
  that a public link would disclose the air-locked mirror path
  ("information is the password", DR-R4-0003). Pedro decided (2026-11-12e
  question): the public pill links to the PUBLIC work section (`#work`,
  the home's own gallery) - no mirror-path disclosure, so the air-lock
  and guard check 3 stay untouched.

## Requirements

- The public home's robot becomes `<a class="robot" href="#work">`:
  same fixed geometry as the mirror pill (44x44 hit box, bottom-left,
  z-index 3), glyph 20px (ticket 18), hover/focus pill label
  "selected works" (the mirror pill's "workflow & design system" would
  mislabel a link to the gallery). aria-label + title carry the
  accessible name; the pill text stays aria-hidden (mirror parity).
- The mirror injector strips the PUBLIC pill along with the decorative
  span (the mirror home renders exactly one robot - its own, linking
  in-mirror). Guard check 6's "no visuai link on the public home" keeps
  passing: the public pill carries no mirror-visuai mark.
- TDD: strip tests extended in scripts/test/mirror-link.test.js
  (public pill stripped; the mirror's own injected link untouched).

## Acceptance criteria (agent-checkable)

- [x] The built public home (`build/index.html`) carries `<a class="robot" href="#work">` with the 20px glyph and the pill label; zero matches for the mirror path and mirror-visuai marker in it
- [x] The mirror home does NOT contain the public pill (stripped); exactly one `a.robot` remains per built page (the mirror's own, href="workflow/"); zero floating-robot residue in build/
- [x] Probed: hover/focus expands the pill (label span 133px, opacity 1; the anchor stays 44px inline by design), background transparent in every state (ticket 17), click scrolls the home to the gallery (scrollY 546, #work in view)
- [x] npm test + build + guard green

## Open questions

- None (the href question was answered by Pedro: public work section)

---

# Ticket 21: Nav survives 360px - slack budget + valid text-size-adjust (mobile eval, DR-0009)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13)
- Size: S
- Type: UI
- Status: DONE 2026-11-13 - one standard pair
  (-webkit-)text-size-adjust:100% in _base.scss (the 1.5em/MS lines gone,
  grep-verified in the built CSS); link padding 12->8 and logo margin
  12->8 inside the mq($until: tablet) block. Probes (evidence/t21-23-verify.md):
  elastic nav headroom 30.2px at 320 (worst case), 70.2 at 360, 85.2 at
  375 - both engines, three pages; zero document overflow everywhere; nav
  height 48 (targets intact); 1440 layout untouched. AC correction
  recorded: the original "Contact right edge <= viewport - 8" measured the
  wrong thing (the row is right-aligned BY DESIGN; the margin lives inside
  Contact's padding) - the honest slack metric is the elastic headroom.

## Context

Pedro: on Firefox Android the header nav overflows at ~360. Measured on
the Nov-12 build (evidence/mobile-eval-2026-11-13.md): the nav renders
19.2px links and fits 320/360/375 with the Contact box's right edge ON
the viewport boundary - the flex row is exact-fit, zero slack beyond the
54px logo-link gap. Any Android-side text widening (engine rounding, font
inflation) overflows the bar. The shipped CSS carries the only plausible
knob for an engine divergence: `-webkit-text-size-adjust: 1.5em` +
`-ms-text-size-adjust: 1.5em` (built CSS; source `_base.scss:8-11`) -
INVALID per the CSS spec (auto | none | <percentage> only) and Firefox
for Android ships text-size-adjust support, so its treatment of the value
can diverge from Chrome's. On-device Firefox Android behavior was NOT
reproducible in the eval harness (desktop-mode Firefox measured identical
to Chromium) - the budget fix is chosen because it removes the overflow
class regardless of which Android path caused it (DR-0009).

## Requirements

- Replace the pair in `src/_styles/atoms/_base.scss` with one standard
  declaration on `html, body`: `text-size-adjust: 100%` (plus the
  `-webkit-` prefix Chrome requires). 100% = no user-agent text scaling,
  the canonical font-boosting off switch; do not use `none` (Chrome's
  historical rendering bugs), do not keep a length unit.
- Reclaim slack at the `mq($until: tablet)` nav block
  (`nav.scss`): link padding `0 12px` -> `0 8px`; the logo's
  `margin: 0 12px` -> `0 8px`. Keep the last-child `padding-right: 16px`
  page-margin rule and the 48px bar/line-height.
- Desktop/tablet ranges unchanged: both changes live in the mobile
  include only.

## Design references

- Figma: n/a · Hooks used: none · Principles applied: DR-0009 (reclaim
  padding slack, never shrink the nav identity: 19.2px ink, 48px bar,
  44px targets).
- Existing style refs: `nav.scss` (`ul a` + `a.icon` mobile overrides),
  `_base.scss` text-size adjust pair.

## Acceptance criteria - results

- [x] Probed at 320, 360, 375 (Chromium + desktop Firefox, mobile-emulated Chromium): document.scrollWidth == innerWidth on home, about, workflow, and one case-study page
- [x] Slack measured, no longer exact-fit - AC CORRECTED to the honest metric: elastic headroom (space-between middle gap) >= 30px at 320 in both engines (the original "Contact right edge <= viewport - 8" criterion contradicted the designed right-aligned row; see evidence/t21-23-verify.md)
- [x] Built CSS contains no nonstandard text-size-adjust value (grep zero `text-size-adjust:1.5em`; the shipped pair is the grammar-valid 100%)
- [x] Desktop nav (1440) geometry unchanged (nav h 48, headroom 262; the edited rules live inside mq($until: tablet))
- [x] A11y: touch targets still >= 48px tall; labels unchanged
- [ ] Gates: passes `visuaibear-review` checklist (see evidence/t21-23-verify.md gates row; on-device Firefox Android capture still open - Pedro)

## Out of scope

- Any nav font-size, bar height, or logo change; the desktop nav; per-nav
  page colors.

## Open questions

- On-device confirmation (owner: Pedro): capture the Firefox Android
  bar pre/post-fix on the real phone - validates the DR-0009 assumption,
  does not gate the build.

---

# Ticket 22: Tab strip nowrap - one line per label at 360-375 (mobile eval)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13)
- Size: S
- Type: UI
- Status: DONE 2026-11-13 - `.vb-tab { white-space: nowrap }` on the base
  rule; compact envelope at mq($until: mobileLandscape): padding 8px 10px
  + letter-spacing .12em; the <=360 release lever ships letter-spacing
  .1em + padding 8px 8px (the probe found Firefox's strip content 4px
  over the 248px column when the lever was letter-spacing only, so the
  paddings joined it - recorded per this ticket's "record which values
  shipped"). Label size, radius, inks, plate untouched. Probes
  (evidence/t21-23-verify.md): exactly ONE line per tab at 320/360/375,
  BOTH engines, BOTH tab states (was 2 lines, h 58 vs 37); strip content
  fits its plate (scrollWidth == clientWidth everywhere); 1440 geometry
  unchanged (x 561 / w 318 / h 45); click-through ground swap, panel
  visibility and strip relocation round-trip probe-verified at 360 + 1440.
  Captures t21-t23-workflow-{320,360}-after.png vs the pre-fix wrap in
  mobile-eval-workflow-360-*.png.

## Context

Pedro: "the Design System tab overflows, widens the tab selector, looks a
bit odd (zoomed out?)" - on Chrome Android AND Firefox Android. Measured
(evidence/mobile-eval-2026-11-13.md): no document overflow anywhere;
the real defect is a WRAP. The strip's nowrap intrinsic width is 303px
(109 + 182 + 4 gap + 8 plate padding). The workflow text column is 288px
at 360 (page margins + container paddings) and boundary-exact 303 at 375
- so at both widths the flex chain shrinks the button and "DESIGN
SYSTEM" (uppercase, letter-spacing .18em, 0.8rem bold) breaks into two
lines: tab h 58 vs 37, y 84 vs 95 - a two-line chip in a one-line strip,
which reads as broken/wrong-size, hence "odd". Both desktop engines
reproduce it identically, so it was always there below ~376px.

## Requirements

- One line per label, always: `white-space: nowrap` on `.vb-tab`.
- A compact strip envelope under the shared mobile breakpoint
  (`mq($until: mobile)` or ~480px max - mirror the gallery's
  `max-width: 47.99em` idiom): tab padding `8px 20px` -> `8px 12px`
  and letter-spacing `.18em` -> `.12em`. Keep the 0.8rem label size, the
  radius, the inks, and the plate (tickets 2/5/7 states untouched).
- Target: both labels + plate fit the text column at 320 (worst case:
  column 248). If the math falls short at 320, the release lever is
  letter-spacing `.1em` at <=360 only - record which values shipped.
- No JS change: the wrap fix is CSS-only (tabs.js relocation untouched).

## Design references

- Figma: n/a · Hooks used: none · Principles applied: the chip-plate
  token (ticket 40/DR-0012) and the strip rhythm (T5) survive; envelope
  compression only.
- Existing style refs: `tabs.scss` (.vb-tabs, .vb-tab).

## Acceptance criteria - results

- [x] Probed at 320, 360, 375 (Chromium + desktop Firefox, mobile-emulated Chromium): every `.vb-tab` renders exactly ONE text line (range-rect count == 1); strip h == the one-line height (was 58px tabs)
- [x] Strip fits its host: at 320 the strip is 247 wide inside the 248 column, content scrollWidth == clientWidth in BOTH engines (no plate content overflow)
- [x] Inks unchanged by diff (no color rule touched; ground swap + strip relocation behavior re-probed both states at 360 + 1440)
- [x] 1440 strip geometry unchanged vs ticket 5 evidence (x 561, w 318, one-line)
- [ ] Gates: passes `visuaibear-review` checklist (see evidence/t21-23-verify.md)

## Out of scope

- Label copy ("visuAI" / "Design system" - Pedro's, open question 2);
  the strip's vertical rhythm (T5); any panel/ground change.

## Open questions

- None blocking (the 320 lever letter-spacing is pre-authorized here).

---

# Ticket 23: About paragraphs - one uniform gap, bare `<br>` retired (mobile eval)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13)
- Size: S
- Type: copy/UI
- Status: DONE 2026-11-13, with ONE recorded deviation - the dead
  `scroller` handlers also lived in BOTH styleguide intro index copies
  (src/styleguide/_styleguide_blocks/styleguide.intro.nunjucks - the live
  blocks that render in /styleguide/ AND the workflow design panel - and
  the src/visualbear/ case-study duplicate). The "case-study duplicates
  untouched" rule (ticket 3) was about CONTENT; a dead-handler removal is
  the ticket-16 class of mechanical fix, and the anchors jump natively
  without it. Removed in both; `scroller` grep = zero in src/ (minus two
  comment mentions). Home + /about/: `about-copy` class on the
  .document-text.text-box, all br gone,/.about-copy p + p margin-top:24px
  in _pages.scss, /about/ img alt in. Probes (evidence/t21-23-verify.md):
  paragraph gaps [24,24,24,24] uniform at 320/360/375/1440 on home #about
  AND /about/, both engines; zero br / onclick in the built pages;
  fashion-rebrand probed clean at 320/360/375. Capture
  t21-t23-about-360-after.png.

## Context

Pedro: the About Me text has extra space between the first and second
paragraph - make it one space, consistent. Measured
(evidence/mobile-eval-2026-11-13.md): in the about block
(`.document-text`), paragraph margins are 0 and the visible rhythm is
bare `<br>` elements - each adds one 23px line box. Three of four gaps
carry the +23 box; the p3->p4 gap has NO br and renders 0 (flush). The
block exists twice, byte-similar: home `#about` (`src/index.nunjucks`)
and `/about/` (`src/about/index.nunjucks`). Both copies also carry inline
`onclick="scroller('gallery')"` / `scroller('contact')` handlers -
`scroller` is defined nowhere (grep src/ + build zero hits): every click
throws a ReferenceError and falls through to the anchor default (found in
the JS eval, amendment item 4). The home copy's img has
`alt="Pedro Björn"`, the /about/ img has NO alt - a11y defect, fix as part
of the same markup work.

## Requirements

- Remove every bare `<br>` in BOTH copies; separation becomes uniform
  paragraph margins: a scoped rule (the about surfaces ONLY - do not
  touch global `.document-text` spacing used by case studies)
  `p + p { margin-top: 24px }` (8pt rhythm, ~parity with today's 23px
  br line box; note the exact shipped value in the PR).
- The p3->p4 gap becomes 24 like the others - the "flush + extra"
  inconsistency Pedro saw dies with the `<br>`s.
- Remove the two dead `onclick="scroller(...)"` attributes in both
  copies (the site's own smooth-scroll init in `_scripts/main.js` already
  handles same-page `#contact`; `../#work`/`../resume` navigate
  natively).
- The /about/ img gets `alt="Pedro Björn"` (parity with the home copy).
- Duplication flag (not fixed here): the block is hand-duplicated in two
  templates and HAS drifted ("resume" vs "online resume"). A shared
  partial is the structural fix - record as a candidate, owner Pedro.

## Design references

- Figma: n/a · Hooks used: none · Principles applied: copy rule (no em
  dashes - none present), review gate 1 (alt text).
- Existing style refs: `_pages.scss` #about; the about page's info
  layout (same classes).

## Acceptance criteria - results

- [x] Probed at 360 + 1440 (plus 320/375, both engines) on the home #about AND /about/: every consecutive-paragraph gap measures 24 (+/-0); zero `<br>` in either built page
- [x] No `onclick=` attribute remains in the about blocks or the styleguide intro blocks (built-HTML grep clean); `scroller` = zero hits in src/ outside comment text (the deviation note above)
- [x] /about/ img has an accessible name (`alt="Pedro Björn"`)
- [x] Case-study pages unaffected by the spacing rule (proxy: the rule's selector only matches .about-copy; fashion-rebrand probed clean at 320/360/375. NOTE: the visualbear case page's intro anchors lost their dead onclick - the one intended diff)
- [ ] Gates: passes `visuaibear-review` checklist (see evidence/t21-23-verify.md)

## Out of scope

- De-duplicating the two copies (flagged, owner Pedro); the global
  `.document-text` p spacing; the footer contact.

## Open questions

- None blocking (the shared-partial candidate rides with Pedro)

---

# Ticket 24 (optional): The smooth-scroll init migrates to CSS (JS disposition)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13, item 4)
- Size: S
- Type: system
- GATED on Pedro (open question below); the JS inventory that motivates it
  is recorded in evidence/mobile-eval-2026-11-13.md (section 4)

## Context

JS inventory result: of `main.js`'s three bootstraps, `tabs.init()` is
required (no CSS-only tab pattern with roving focus + panel relocation),
and `initCountUp()` stays (markup-first: real numbers ship in the HTML,
JS only animates; used on the case-study pages). `initSmoothScroll()`
(~30 lines + NAV_HEIGHT constant) re-implements what the platform now
does: `html { scroll-behavior: smooth }` + `scroll-margin-top: 48px` on
targets replaces the intercept/offset/scrollTo chain in CSS, with
reduced-motion free (`@media (prefers-reduced-motion: reduce)` keeps
`scroll-behavior: auto`). Support: Chrome 61+ (2017), Firefox 36+,
Safari 15.4 (2022) - older Safari simply JUMPS (correct offset is a
paint-time layout matter, so behavior degrades to instant, never broken).
`scroll-margin-top` also covers the same-page case the JS covers only
partially (it skips cross-page navigations anyway).

## Requirements

- Remove `initSmoothScroll()` from `_scripts/main.js`; add
  `html { scroll-behavior: smooth }` (reduced-motion guard) and
  `scroll-margin-top: 48px` on the anchor targets - an explicit selector
  list of the ids actually used (#work, #about, #contact and the gallery
  targets), NOT a global `[id]` rule (one that would paint a margin on
  every id on the site).
- Verify the anchor behaviors that depend on JS today: nav Work/About
  (cross-page `/#work` etc. - native navigation, unchanged), in-page
  `#contact`, the robot pill's `href="#work"` scroll (probed in ticket
  20 - MUST still stop below the nav).
- Keep `tabs.init()` and `initCountUp()` untouched.

## Design references

- Figma: n/a · Hooks used: none · Principles applied: progressive
  enhancement (behavior survives without JS; CSS owns presentation).
- Existing style refs: `_base.scss`; `_scripts/main.js` initSmoothScroll.

## Acceptance criteria (agent-checkable)

- [ ] Probed: clicking nav #contact and the robot pill (href #work) scrolls smoothly and lands >= 8px below the nav bottom at 360 + 1440
- [ ] `no-js` behavior: with JS disabled, same-page anchors still land below the nav (CSS path) - the current JS-free behavior (instant, hidden-under-nav) improves
- [ ] `main.js` shrinks (no smooth-scroll code; bundles diff clean otherwise); npm build + guard + npm test pass
- [ ] Gates: passes `visuaibear-review` checklist

## Out of scope

- CountUp removal; any tabs change; the `no-js`/`js` class hook (dead -
  removal candidate folded into ticket 23's markup pass or its own
  cleanup; flagged).

## Open questions

- Drop JS smooth scroll (older Safari < 15.4 jumps instantly instead of
  animating)? Owner: Pedro (gates this ticket; nothing else blocks).

---

# Ticket 25: Hide the My Closet card from the home gallery (both zones)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13b, item 1)
- Size: S
- Type: UI + data

## Context

Pedro: "Hide the My Closet card." Measured (evidence/amend-2026-11-13b-eval.md):
the card is the second entry of `src/_data/work.json` ("A new digital
closet experience", external Drive link). It is consumed ONLY by the
home gallery - `src/index.nunjucks:17` ->
`_modules/organisms/gallery/gallery.nunjucks`, which loops EVERY entry
into `card.content` with no filtering (only showPlay/showBlog exist, for
the Play/Blog cards). The mirror home renders the same `site.data.work`
plus one injected mirror-only card, so the hide must live in the data or
the macro to cover both zones. The closet thumb also appears in the
styleguide casesystem DEMO (`styleguide.casesystem.nunjucks`) - that demo
stays; only the gallery card hides.

## Requirements

- Add a per-entry hide flag, not a deletion: `"hidden": true` on the
  closet entry in `src/_data/work.json` (the data stays for later
  re-show; deletion is a destructive op nobody asked for).
- Teach the gallery macro to skip hidden entries:
  `{% if not val.hidden %}{{card.content({card:val})}}{% endif %}` in the
  work loop of `gallery.nunjucks`. No other card types change.
- Public home and mirror home both drop the card; the remaining cards
  (fashion, sports) and the mirror-only teachr card stay put.

## Design references

- Figma: n/a - Hooks used: none - Principles applied: data-preserving
  hide over deletion (H1-adjacent: no unrequested destructive edits).

## Acceptance criteria (agent-checkable)

- [ ] Built public home (`build/index.html`) AND mirror home
  (`build/selected-works/index.html`): zero occurrences of
  "digital closet" / `gallery_thumb_closet` in the gallery markup
  (grep); the other work cards + the mirror-only card present
- [ ] The styleguide casesystem demo still references its thumb (the
  demo is untouched - diff limited to work.json + gallery.nunjucks)
- [ ] Gallery grid re-flows cleanly at 360 + 1440 (no empty slot box -
  probe card count and row geometry)
- [ ] npm build + guard + npm test pass

## Out of scope

- Removing the /digital-closet/ page or its images; the styleguide demo
  usage of the thumb; any other card.

## Open questions

- None (hide, not delete, was Pedro's word).

---

# Ticket 26: The Design System hero matches the visuAI hero (amends tickets 6/11/46)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13b, item 2)
- Size: S
- Type: UI

## Context

Pedro: "Match the Design System hero to the VisuAI." Measured on the
merged view (evidence/amend-2026-11-13b-eval.md): at 1440 the heroes
already match (strip top 80, hero top 149, h1 38.4px, eyebrow/summary
identical type) - the divergence is MOBILE ONLY: at 360 the design h1
renders 17.496px vs the visuAI h1's 31.104px, and the design hero column
is 252 vs 288. Candidate rules: the global mobile h1 ladder
(`_typography.scss:661-690, 770-790, 884-900`, `$mobile-h1-size`) reaches
the styleguide hero because its host chain (`#styleguide_container >
article.text-container`) differs from the workflow shell's, so the
cs-hero h1 sizing in `_case-study.scss` does not win there.

## Requirements

- The cs-hero h1 (and its mobile scale) must be scoped to the hero
  COMPONENT (`.cs-hero h1`), not to the page shell, so both panels' heroes
  render identically: 38.4px at 1440, 31.104px at 360.
- The design hero's mobile column matches the visuAI shell: hero width
  288 at 360 (not 252) - i.e. the panel's `.text-container` gets the same
  mobile inset the workflow shell uses (36px per side, cf. ticket 47's
  rule), or the hero is pulled into the same text-box rhythm.
- Eyebrow/summary/details already match - keep. Ground inks differ by
  design (light vs dark) - keep.
- The public `/styleguide/` page (still up, ticket 4 gated) must keep
  rendering its own hero unchanged in type metrics.

## Design references

- Figma: n/a - Hooks used: none - Principles applied: one hero component,
  one type set (the T46/DR-0014 rule) - the component owns its sizing.
- Existing style refs: `_case-study.scss` cs-hero rules; the probe table
  in evidence/amend-2026-11-13b-eval.md.

## Acceptance criteria (agent-checkable)

- [ ] Probed at 360 + 1440 on BOTH tab states: h1 computed font-size
  equal across panels (38.4 at 1440, 31.104 at 360); hero top and strip
  top equal (149 / 80); hero width equal (836 / 288)
- [ ] Eyebrow, summary, details sizes equal across panels at both widths
- [ ] Public /styleguide/ hero unchanged (probe h1 size/position vs
  pre-change capture)
- [ ] npm build + guard + npm test pass

## Out of scope

- The hero COPY (eyebrow/h1/summary strings are Pedro's); the strip;
  panel content below the hero (ticket 27).

## Open questions

- None.

---

# Ticket 27: Design System body text matches the case-study views; cleanup, esp. mobile (amends tickets 3/11)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13b, item 3)
- Size: M
- Type: UI + system

## Context

Pedro: "Update the Design System body text styling to match visuAI and
other views, clean it up, especially on mobile." Measured
(evidence/amend-2026-11-13b-eval.md): the design panel still renders the
LEGACY styleguide typography - first body paragraph 28.8px bold
(`.gallery-text` intro style, `_textelements.scss:83+`), section h2
16.848px at 360 (vs visuAI h2 22.464px), and the panel column is 324px at
360 vs the workflow shell's 288 (the `.text-container` 32px padding at
all widths, `_typography.scss:440-447`; ticket 47's 36px mobile inset
only reaches `.case-study.document-text` elements inside the container,
not the section-level blocks). At 1440 the columns match (836) but the
intro paragraphs still render 28.8 bold vs the visuAI body 18.432 light.

## Requirements

- Inside the design PANEL (the /workflow/ Design system tab), section
  body text takes the shared case-study document rhythm: body 18.432px
  (17.28 at 360), h2 28.8 (22.464 at 360), same line-heights and inks as
  the visuAI panel - i.e. scope the panel's content blocks under the same
  `.case-study .document-text` text styles the other views use.
- The panel's mobile column matches the shells: 288px at 360 (36px
  insets), not 324.
- The legacy `.gallery-text` intro-paragraph styling (28.8 bold) does not
  apply inside the panel.
- The public `/styleguide/` page keeps its own look (ticket 4 gate) -
  all changes scoped to the workflow panel (`[data-vb-panel="designsystem"]`
  / `#styleguide_container` inside `body.vb-system-light`... choose the
  narrowest selector that hits only the panel; the public page must
  diff-clean).
- Demo specimens inside the guide (swatches, component previews, the
  typography ladder block) keep their authoring look - only the GUIDE'S
  OWN prose (intro paragraphs, section paragraphs, index lists) moves to
  the shared rhythm. The Typography specimen block itself is a demo -
  untouched.

## Design references

- Figma: n/a - Hooks used: none - Principles applied: one text edge, one
  body rhythm across views (the DR-0009/T16 spacing-scale rule: 8 inside
  components, 16 list rhythm, 24+ section gaps).
- Existing style refs: `_case-study.scss` document-text rules; probe
  numbers in evidence/amend-2026-11-13b-eval.md.

## Acceptance criteria (agent-checkable)

- [ ] Probed at 360 + 1440 in the design tab: first section paragraph
  == visuAI body metrics (18.432/300 at 1440, 17.28/300 at 360); panel
  `.document-text` width 836 at 1440 and 288 at 360; h2 28.8/22.464
- [ ] No horizontal overflow at 320/360 in the design tab
  (document.scrollWidth == innerWidth)
- [ ] Demo specimens unchanged (swatch colors + the typography ladder
  probe vs pre-change)
- [ ] Public /styleguide/ page diff-clean (probe: intro p still its own
  style there)
- [ ] visuAI tab byte/probe-identical
- [ ] npm build + guard + npm test pass

## Out of scope

- Rewriting guide COPY (T16's slop inventory stays gated on Pedro);
  the specimen demos; retiring /styleguide/ (ticket 4).

## Open questions

- None blocking.

---

# Ticket 28: About paragraph gap is ONE space - 16px, not 24 (amends ticket 23)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13b, item 4)
- Size: S
- Type: UI

## Context

Ticket 23 shipped `.about-copy p + p { margin-top: 24px }` (probed uniform
24 at all widths). Pedro: "Reduce the gap between paragraphs on about to
1, not two spaces, don't double it" - 24 reads as two rhythm steps; one
space = 16px (the scale's list-rhythm step; 8 is inside components per
the T16 spacing-scale note).

## Requirements

- `.about-copy p + p { margin-top: 24px }` -> `16px` in
  `_pages.scss` (the one rule T23 added). Nothing else moves.

## Design references

- Figma: n/a - Hooks used: none - Principles applied: the shared 8pt
  scale (16 = one space above component-internal 8).

## Acceptance criteria (agent-checkable)

- [ ] Probed at 360 + 1440 on home #about AND /about/: all consecutive
  paragraph gaps == 16 (+/-1), both engines
- [ ] No other spacing on those pages changes (diff the built CSS block)
- [ ] npm build + guard + npm test pass

## Out of scope

- Any other page's paragraph spacing; the T23 markup (br removal etc.)
  stands.

## Open questions

- None (16px = "one space" on the shared scale; if Pedro means 8, it is
  a one-line change - recorded here).

---

# Ticket 29: Robot is the same size as the bear - verify 20px on-device (amends ticket 18)

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13b, item 5)
- Size: S
- Type: UI + review

## Context

Pedro: "Make the robot the same size as the bear." Ticket 18 already
shipped 20px on both robots (mirror-link.js inline style + the public
`.floating-robot`/pill span) after measuring that the robot glyph's
filled plate reads optically bigger than the bear at equal em; grep on
the current build confirms BOTH robots at `font-size:20px`
(evidence/amend-2026-11-13b-eval.md). So this ticket is a VERIFICATION
pass with a pre-authorized lever, not new design.

## Requirements

- Probe the glyph's computed font-size on the public home and the mirror
  home at 360 + 1440: expect 20px both.
- Capture the robot next to a bear reference at the same nominal size
  (the old bear markup is gone; reconstruct the 22px bear span in a
  scratch page or use T18's canvas-ink measurement from
  evidence/t5-t10-verify.md) - if the robot still reads bigger, drop BOTH
  to 18px (mirror-link.js inline style + `_pages.scss` robot span) and
  update `scripts/test/mirror-link.test.js`'s size assertion (TDD).
- 20px stays unless the capture says otherwise; record which value ships.

## Design references

- Figma: n/a - Hooks used: none - Principles applied: optical size parity
  over metric parity (T18's measured lesson).

## Acceptance criteria (agent-checkable)

- [ ] Computed glyph size equal on public + mirror, probed at 360 + 1440
- [ ] Capture pair (robot vs bear reference) stored under evidence/
- [ ] If changed: test updated red-green, npm test green, both robots
  carry the same value (grep)
- [ ] npm build + guard pass

## Out of scope

- The pill geometry (T10/13), the hover behavior, the href (ticket 30).

## Open questions

- Final size value if the capture disagrees with 20 - owner Pedro (visual
  call on his phone).

---

# Ticket 30: The robot on the index links to the visuAI / design system page (amends ticket 20) - GATED

- Part of: specs/visualbear-system/plan.md (amendment pass 2026-11-13b, item 6)
- Size: S
- Type: system
- GATED on open question 1 below (the air-lock reversal is Pedro's call,
  it reverses DR-R4-0002/DR-R4-0003)

## Context

Pedro: "Make the robot link to the visuAI / design system page on the
index." Current state (grep on the build): the MIRROR index robot already
links there - `href="workflow/"` in build/selected-works/index.html
(since ticket 1). The PUBLIC index robot links `href="#work"` (T20's
explicit decision): the public zone PRUNES /workflow/ (release-mirror
prunes it, DR-R4-0002), so a public href="/workflow/" would 404, and T20
chose #work precisely to avoid disclosing the air-locked mirror path
("information is the password", DR-R4-0003).

## Requirements (once the gate clears)

- Public home robot `<a class="robot">` href `#work` -> the system page.
  Two ways, chosen by open question 1:
  (a) keep the public zone air-locked and change only the MIRROR index -
  already done; then this ticket is a no-op verify (assert
  `href="workflow/"` on the mirror home, `href="#work"` on public) -
  ship as tests only;
  (b) un-prune /workflow/ publicly (release-mirror stops pruning it,
  guard check "secret pages absent from the public root" is amended for
  this one route with a DR superseding DR-R4-0002 for it) and point the
  public pill at `/workflow/` (depth-relative `workflow/` from the home).
- Whichever: the pill's accessible name stays truthful (T20: label
  "selected works" must change if the target changes - e.g. "The
  visualbear system"), the mirror strip pass stays idempotent, and the
  release guard's leak checks are updated to match the new posture.
- TDD: mirror-link.test.js assertions extended for the chosen option.

## Design references

- Figma: n/a - Hooks used: none - Principles applied: the air-lock
  principle (visuaibear-core #7) UNTIL Pedro explicitly overrides it -
  this ticket records that override if he chooses (b).

## Acceptance criteria (agent-checkable)

- [ ] The built index page in the chosen zone carries the robot link to
  the system page (grep + Playwright click-through lands on
  /selected-works/workflow/ or /workflow/ per the option)
- [ ] Accessible name matches the actual destination
- [ ] Release guard green under the chosen posture; npm test green
- [ ] If (b): a new DR records the air-lock reversal and DR-R4-0002 is
  marked superseded-for-this-route

## Out of scope

- Any other page's robot; the pill visuals.

## Open questions

| Question | Owner | Blocks build? |
| --- | --- | --- |
| 1. Does "the index" mean the mirror index (already linked - verify only) or the PUBLIC home? If public: un-prune /workflow/ and reverse the air-lock for it, or keep #work? | Pedro | Yes - this ticket |
