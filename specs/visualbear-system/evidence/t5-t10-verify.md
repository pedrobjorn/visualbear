# Evidence — Tickets 5-10 (amendment pass, 2026-11-12)

Method: headless Chromium (Playwright 1.65) against the released build
(`npm run build` = gulp → release-mirror → release-guard, exit 0) served
locally; the mirror browsed at `/selected-works/...`, public surfaces at
the live built paths. No axe install in this environment (as in t2) -
a11y coverage is computed-probe based below.

## Ticket 5 — Tab strip breathing room

- Probed at 1440 AND 390: `.vb-tabs` top = 80px on both tab states; nav
  height 48px → gap = 32px exactly (baseline measured: top = 48, gap 0).
- Strip-to-h1 rhythm unchanged in the shipped sense: strip margin-bottom
  still 24px; the whole hero block shifted by exactly the added 32
  (h1 top 233.73 → 265.73 at 1440, 254.73 → 286.73 at 390 — +32.00 both;
  measured twice after the enter-fade settles).
- `justify-content: center` intact; `section-top-padding` still has no
  rules anywhere (grep) - the fix lives on `.vb-tabs` (tabs.scss) only.
- Implementation note: the 32px is a single `margin-top` on `.vb-tabs`,
  so both tab grounds and the ticket-6 panel inherit it.

## Ticket 6 — Design system tab IS the styleguide

- The design panel renders `src/styleguide/_styleguide_blocks/` (intro,
  core, modules, containers, casesystem) with the styleguide page's own
  structure (`.text-container` > `.row` > blocks, `#styleguide_container`
  id preserved for the ticket-45/47 demo-scoping styles).
- Computed-style parity vs live `/styleguide/` (still public in this
  build, used as the reference): h1 "Design system" 38.4px #252528 (=
  reference size/ink), eyebrow #d0181e, swatch rgb(121,166,210) with
  #18181b text at 820px width (identical band), links #d0181e underline,
  section ink rgb(37,37,40). Panel ground pinned on the panel
  (`.vb-panel--designsystem`: background rgb(230,242,255) = `$vb-light`)
  - no body-class dependence in the panel rules.
- Visible h1 per tab state (offsetParent-filtered): dark = ["My Agentic
  Design Workflow … visuAI"], light = ["Design system", "h1 Heading"].
  The "h1 Heading" element is the Typography specimen inside the Core
  block (styleguide.core.nunjucks:127, each list item IS an h1-h4) - it
  ships exactly like that on today's public /styleguide/. Per the
  ticket-3 no-rewrite rule for guide content it is FLAGGED, not fixed;
  if the one-visible-h1 gate must be strict, the specimen needs Pedro's
  sign-off to render via classed elements instead.
- visuAI tab content is unchanged by construction: the hero + body come
  from the same unchanged `src/_data/pages/workflow.md` through the same
  mdhero/mdpage filters - the diff is structural (hero moved inside the
  panel; the copy-swap capture/paint retired from tabs.js). The
  percentage-based dark gradient recomputes against the +32 px page
  height, so a raw screenshot diff shows background-only drift; h1/hero
  offsets measured exactly +32 (above) at both widths.
- `data-vb-hero` wrapper and the design-panel placeholder are gone;
  tabs-core.js no longer exports HERO_FIELDS/heroFor (npm test green).
- Keyboard tab pattern retained and probed: ArrowRight → design tab
  focused/selected/active panel + light ground; ArrowLeft wraps back;
  roving tabindex verified both directions.

## Ticket 7 — Strip adapts to the styleguide context

- Light state plate: `rgba(37, 37, 40, 0.06)` on `.vb-tabs` at 1440 AND
  390 (probed computed background). Chosen: translucent dark instance,
  no border. Placed ON the `.vb-tabs` rule - a body-level declaration
  loses the custom-property fight to cs-workflow's ancestor-scoped
  `--cs-chip-plate` (inheritance follows proximity, not body
  specificity; learned in verification).
- Edge-strength math: plate over `$vb-light` (230,242,255) = (218,230,242)
  - SCEWRS contrast edge 1.116 (2.0x the old white-0.45 plate's 1.060 on
    this ground); the dark page's whisper plate (white 0.04 over #221d1f
    = (43,38,40)) is the same softness family.
- Dark ground unchanged: plate rgba(255,255,255,0.04) probed; labels
  #A6ADB8 / #EA544F per ticket-2 evidence.

## Ticket 8 — Walled garden nav

- `relativizeNavLinks(html, depth)` added to scripts/mirror-link.js
  (exact-quoted matches for `href="/"`, `href="/#work"`, `href="/#about"`;
  assets and deeper routes untouched). Unit-tested (TDD: red first) in
  scripts/test/mirror-link.test.js, including idempotency and asset
  pass-through.
- Wired in release-mirror.js's per-page pass; run log: "nav links
  rewritten to relative in 23 mirrored page(s)". Probed on the built
  mirror workflow page: nav/hero links = `../`, `../#work`,
  `../about/`, `#contact` in-page.
- Click-through (Playwright) from `/selected-works/workflow/`: logo →
  `/selected-works/`, Work → `/selected-works/#work`, About →
  `/selected-works/about/`, Contact → in-page scroll (URL unchanged).
- Idempotent re-run: md5 of every mirror index.html unchanged across a
  second release-mirror pass.
- Guard extended (release-guard.sh check 7): zero `href="/` page links
  in any mirrored index.html (assets /styles|scripts|images|fonts/
  excluded - 23 such asset links remain, logged by the guard). Asset
  serving = the deploy-config open question is left to Pedro; ticket
  note updated in mirror-link.js comments.
- Public pages' nav untouched: rewrites run mirror-side only; the
  public build tree keeps its absolute nav (guard separates zones).

## Ticket 9 — Mobile gallery background cut-off

- Repro (pixel scan at x=8, built mirror home, full-page capture at
  390): the gallery's own gradient band rode mid-screen over the body's
  viewport-height red fade and snapped (76,45,44) → (36,36,39) at
  y=711 (= gallery top 455 + the gradient's 256px transparent stop).
  Desktop's same stop lands at y~850 where the body has already
  converged (delta ~13, invisible) - that is why only mobile showed it.
- Fix (ticket option 3): mobile mq gets `background: none` on
  `.content.gallery`; the body's own fade (`body.home-page::before`,
  viewport-anchored, ticket 52) carries the color. Root cause is the
  copy of the desktop relationship without its 66vh offset.
- Verified: pixel scans at 390 and 320 find NO edge delta > 20 in the
  gallery band (previously 53); gallery computed background "none" at
  390/320. Desktop (1440) home: byte-identical dimensions, 68 differing
  pixels out of 4.4M (font-rendering jitter) vs the pre-change capture.
- Applies to public home and mirror home (same source rule); captures:
  evidence/t9-home-{1440,390,320}-full.png; baseline scan archived in
  the eval session notes (tmp) - before-value recorded above.

## Ticket 10 — Robot touch target + hover label

- TDD: scripts/test/mirror-link.test.js extended first (red: 44x44
  assertion failed), then markup implemented in scripts/mirror-link.js.
- Probed: link box = 44x44 (was 22x22); glyph span pinned bottom-left by
  flex → glyph rect stays at left:12px / 12px from the viewport bottom,
  i.e. the visual position ticket 1 shipped. Hit area only grows up and
  toward the page center.
- Pill: hover AND keyboard focus expand it (max-width 0 → 220px +
  opacity, 160ms, reduced-motion: none; collapse is instant per the
  ticket's "instant enough" bar). Text exactly "workflow & design
  system" (lowercase, from Pedro); glyph stays fixed; probed box width
  stays 44.
- a11y: accessible name unchanged ("The visualbear system" aria-label +
  title; probed); pill + glyph are aria-hidden visual sugar. Decorative
  public home span: NOT a link, not expanding, aria-hidden (probed);
  mirror home carries exactly one pill-capable link; strip idempotent
  (test + md5 evidence).
- REVIEW DEVIATION (recorded, ticket said "ink/plate per ground"): the
  expanded pill is a self-contained solid chip - `$vb-light` plate,
  `$vb-dark` ink (#18181b on #e6f2ff ≈ 12.6:1) - instead of the page's
  tinted contexts. Reason: the link is fixed and travels over the dark
  `.foot` band, the home's red fade AND light case-study sections; a
  translucent ground-derived plate inherits whichever ground is under
  it at hover time, and a first candidate (chip-plate var + inherited
  link red) measured 3.8-4.2:1 on dark grounds. The footer's own
  light-on-dark pairing reads on every ground this link can reach and
  matches the site's chip language. If Pedro wants the per-ground
  tints, it is a follow-up against scroll-position awareness (JS).

## Gates

- `npm test` PASS (mirror-link + tabs suites).
- `npm run build` (gulp → mirror → guard) exit 0; guard: walled-garden
  check green, air-lock green.
- eslint on the touched JS: clean.
- prettier (repo gate: src/\_styles/**/_.scss, _.md, specs/**/_.md,
  gulp/\*\*, markdown-render.js): PASS. (scripts/_.js are NOT in the repo
  gate; several were already prettier-dirty at HEAD - left untouched.)
- Captures: t5-t6-workflow-{1440,390}-dark-full.png, t6-t7-workflow-
  {1440,390}-light-full.png, t7-final-\* (final-build re-captures),
  t9-home-{1440,390,320}-full.png, t10-robot-focus-{1440,390}.png,
  t10-robot-hover-1440.png.

## Left open (owner: Pedro)

- The typography specimen h1 (T6, above) and the flagged unclosed quote
  at styleguide.containers.nunjucks:41 (from ticket 3).
- Mirror asset serving zone for the root-absolute styles/scripts (T8).
- R4-10's pending Pedro items unaffected by this pass.

---

# Addendum 2026-11-12 (same day) - tickets 11-13, Pedro's mirror review

Three regressions on the built mirror; spec'd in DR-0005 with tickets
11-13 before the fixes. Probed on the final release build.

## Ticket 11 - design panel renders as the full styleguide page

- Before (T6's panel): ancestor chain
  `main > article#workflow_container.case-study.cs-workflow > section.gallery-container
  > div.container > div.document-text.text-box > panel`- demo img capped
at the`.text-box img` 512px legacy rule (styleguide reference renders
  > 836), cs-workflow's dark-ground instances visible in the light panel.
- After: `main > section#vb-system-panel-designsystem.vb-panel >
section#styleguide_container.section` - direct page child, no
  text-box/cs-workflow ancestor (probed both widths). The give-back rules
  in tabs.scss retired (grep clean).
- Parity probes at 1440: paragraphs 836/680/836 and img 836 - identical
  to live /styleguide/; eyebrow #d0181e; panel spans 1440 (390 at mobile).
  Probed inks/section widths prove the panel no longer carries ANY
  cs-workflow scope.
- The specimen-h1 flag from T6 stands (light state: "Design system" +
  "h1 Heading" - Pedro's content, not fixed).
- Captures: evidence/t11-workflow-{1440,390}-light-full.png.

## Ticket 12 - About anchors to the mirror home's #about section

- Mirror inner pages: About href = `../#about` (was `about/`, ticket 8's
  mapping); mirror home: `#about` (also was `about/`; now in-page).
- Click-through (Playwright): from /selected-works/workflow/ - lands at
  /selected-works/#about with the #about section in the viewport (true);
  from the home - in-page scroll, section in viewport (true).
- Logo (#/no change) and Work (../#work) mappings untouched; guard check
  7 passes (no root nav links, 23 zone-served asset links); re-run
  stable. npm test green (assertions updated: about/ explicitly asserted
  absent).

## Ticket 13 - the pill actually expands

- Root cause (measured pre-fix): pill is a flex item of the 44x44 anchor
  and flex-shrink 1 crushed it - computed max-width 220px, RENDERED
  width 28px, text scrollWidth 213 fully clipped. T10's verification
  read computed max-width, not geometry; this evidence records rendered
  `getBoundingClientRect().width` from here on.
- After (flex-shrink: 0; max-width 220 -> 260): rendered width 213 at
  hover AND keyboard focus, both 1440 and 390; no clipping
  (scrollWidth not greater than box); collapsed still 0-width; glyph
  pinned at left 12 / 12 from the bottom (T1's exact position).
- Captures: evidence/t13-robot-hover-{1440,390}.png.

## Gates (final state)

- npm run build (gulp -> mirror -> guard) exit 0; npm test PASS;
  eslint clean on touched JS; prettier repo-gate PASS.
