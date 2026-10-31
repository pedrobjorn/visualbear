# Review: /styleguide/ — components vs the current system

- Date: 2026-10-31
- Reviewer: agent (visuaibear-review gates + visuaibear-prototype captures)
- Evidence: rendered-page measurement (`styleguide-review.py` method),
  axe-core 4.10.2 run at 1440, source audit of
  `src/styleguide/_styleguide_blocks/*` (455 lines)
- Verdict: **BLOCKED** — 2 serious a11y failures + the guide's core
  promise ("rendered with the REAL classes so this guide cannot drift
  from the code") is broken in three places.

## Gates

| Gate            | Result      | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A11y            | **FAIL**    | axe: color-contrast serious ×5 (core-block swatch labels #ebf5ff on light swatches = 2.32/2.71); listitem serious ×4 (`<li>` inside `<div>` in both case-system demos); heading-order moderate ×3; region moderate ×1 (`#__bs_notify__` — dev-only BrowserSync notifier, out of scope)                                                                                                                                                                                       |
| States          | NOT CHECKED | the guide demos are static; no interactive states exist to verify                                                                                                                                                                                                                                                                                                                                                                                                            |
| Tokens & system | **FAIL**    | chip demo is a `div.cs-facts > li` hack, not the real `ul.cs-facts` (measured: demo chip box at x=464, w=512 — not on the content-edge system); timeline demo is FAKE — hand-built inline-styled spans (`#d73735`, 26px circles), the real `ol.cs-timeline` (themed dot + connector) appears nowhere; zero of ticket-20's case-study color tokens are documented in the case-system section; `--cs-chip-plate` (DR-0012) exists in the code but is undocumented in the guide |
| Copy            | **FAIL**    | chip demo caption says "dot on the edge, text at the slight indent" — stale since tickets 39/41 (dot now 20px inside the plate, text at edge + 33); intro text still says "boxes that bleed" without the t39 chip exception; no mention of the content width 900/836 (DR-0013)                                                                                                                                                                                               |
| Consistency     | **FAIL**    | missing components: `cs-frame-caption` (DR-0011), `cs-plain` lists (t24/DR-0010), the list-context rule, the per-ground chip instances (workflow 0.04); the styleguide shell carries `id="resume_container"` — a copy-paste artifact that leaks ALL resume-scoped CSS (link red #d0181e etc.) onto this page                                                                                                                                                                 |
| Regressions     | PASS        | page renders; layout intact at 1440; no overflow                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Component inventory (what the guide has vs what the system is)

| Component                       | In guide? | Real markup?         | Current                                 |
| ------------------------------- | --------- | -------------------- | --------------------------------------- |
| Fact chips                      | yes       | **no** (div>li hack) | plate token, dot 20px in, text +33      |
| Timeline                        | yes       | **no** (fake spans)  | ol.cs-timeline, themed dots + connector |
| Display quote                   | yes       | yes                  | centered display element                |
| Card                            | yes       | yes                  | bleeds one step                         |
| Metrics                         | yes       | yes                  | -16 rhythm exception                    |
| Frame                           | yes       | yes                  | full-bleed wrapper                      |
| Frame caption (DR-0011)         | **no**    | —                    | new component                           |
| cs-plain lists (t24)            | **no**    | —                    | new component                           |
| Chip plate token (DR-0012)      | **no**    | —                    | new token + 2 ground instances          |
| Content width 900/836 (DR-0013) | **no**    | —                    | new                                     |
| Case-study color tokens (t20)   | **no**    | —                    | promised by ticket 20, never landed     |
| Type roles                      | yes       | mimicked inline      | sizes correct; not real elements        |

## Addendum (2026-10-31, found applying the width style)

**Width finding (now FIXED)**: the blocks' inner `article.gallery-text`
wrappers carried the gallery-page box rules (min-width 768, 128px
padding, max-width 960) INSIDE the 900px text-container — squeezing
the guide's content to 512px, off the unified 836. The intro block's
wrapper also sat outside any text-container (full-width section).
Fixed: `.text-container .gallery-text` flows (width auto, no min/max,
no padding — the container owns the width, DR-0013); the intro
wrapper moved into a text-container. MEASURED after: styleguide
content 836 at [302, 1138] at 1440 / [94, …] at 1024 / 704 at 768 —
identical to the resume and the case studies; the demo chip renders
on the real text edge. Blast radius: `text-container` is used only by
resume + styleguide; the resume never combines it with gallery-text.

## Verdict: BLOCKED — spec'd as Ticket 43 (styleguide refresh)

Fix direction: the guide must render REAL components in their REAL
containers (the anti-drift mechanism it promises), document the five
system pieces that landed since ticket 20, and clear the a11y
failures. Acceptance criteria are machine-checkable in ticket 43.
