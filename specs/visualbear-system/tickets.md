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
