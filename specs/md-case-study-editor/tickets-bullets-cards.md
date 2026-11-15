# Tickets — bullets & card/text alignment unification (2026-10-31)

Plan: `plan-bullets-cards.md` · Rule: `DR-0010.md` · Reference set:
`sports-ecommerce-redesign`, `teachr`, `digital-closet`.

Constraint carried from `tickets-phase3.md`: the toolchain runs on
Node 10 (`.nvmrc`) — no new dev dependencies; prettier stays 2.x.

A reusable renderer audit exists for these tickets (run from the repo
root; asserts emitted components per context):

    node -e 'const {mdPage}=require("./markdown-render.js");
      const html=mdPage(require("fs").readFileSync("src/_data/pages/<page>.md","utf8"));
      console.log(html)'

---

# Ticket 24: Renderer — plain-bullet syntax + list-context rule

- Part of: `plan-bullets-cards.md`, DR-0010
- Size: M
- Status: DONE 2026-10-31 - `*` runs extract to `<ul class="cs-plain">` before marked; `-` unchanged (unit render test); all existing pages diff empty (no `*` in content).
- Type: system

## Context

`mdPage`'s `listRenderer()` tags every `ul` as `cs-facts`; container
bodies render via `renderFlow` with a plain `marked.Renderer()` — the
chip/plain split is a side effect of two code paths. `*` and `-` are
both markdown bullets, but marked's list renderer never sees the marker
character.

## Requirements

- Section-level lists keep their current behavior: `-` → `cs-facts`.
- New: `*` at section level → plain `<ul>` (no class) with the chip
  geometry minus the plate: the list bleeds one step
  (`margin: 16px (-$cs-indent)`), the dot sits ON the text edge
  (`left: $cs-indent`), the text +8 (`padding-left: $cs-indent + 8px`)
  — the exact refined chip rule applied to general bullets (Pedro,
  build batch 1).
- Container bodies keep rendering plain bullets (`renderFlow`
  unchanged in effect; the rule is now intentional — DR-0010): inside
  a bleeding box the list does NOT bleed again — dot on the box's text
  edge, text +8 (already the measured behavior in `cs-col`).
- Implementation approach is the builder's choice (e.g. tag list runs
  by source marker before marked, or post-classify `cs-facts` runs);
  the acceptance criteria are the contract.
- No change to `mdresume` (it already renders plain lists).

## Acceptance criteria (agent-checkable)

- [x] Render audit on all 7 md-driven pages: section-level `-` lists
      emit `ul.cs-facts`; section-level `*` lists emit bare `<ul>`;
      lists inside `cs-card`/`cs-col`/`cs-panel` bodies emit bare `<ul>`
- [x] The `*` plain list renders with the standard dot: dot on the text
      edge, text +8px (computed-style check, matches the ticket-19 rule)
- [x] Edge audit clean on all 7 pages at 1440 and 390
      (`tools/edge-audit.py`); axe zero violations
- [x] `npm run lint` and `npm run format:check` pass
- [x] No existing page's rendered output changes except where it uses
      `*` lists (none do today — full-render diff must be empty)

---

# Ticket 25: Chip geometry unified with the bullet rule (REVISED 2026-10-31)

- Part of: `plan-bullets-cards.md` (findings 2 + 11)
- Size: S
- Status: DONE 2026-10-31 - chip dot at $cs-indent (on the text edge, 352), text +8 (360), symmetric 36px padding, em-based top (23.49px vs 23.5 before). Verified on fashion/teachr/ecommerce/closet at 1440+1425.
- Type: UI
- Supersedes: the ticket-22b chip geometry ("dot at 20px in the chip")

## Context

Measured at 1440 (2026-10-31): the chip dot renders at 344 — 8px LEFT
of the text edge (352), in the gutter — and the chip text sits ON the
edge (0 indent). That is the opposite of the ticket-19 bullet rule (dot
ON the text edge, text +8px), which the plain bullets in the same
page's `::: columns` follow (dot 352, text 360). Pedro: "the bullets
still don't indent but spill out of bleed." The old hard-coded values
(`left: 20px; top: 23.5px`, asymmetric padding 28/20) caused both the
violation and the right-edge overrun.

## Requirements

- Chip dot at `$cs-indent` from the plate's left edge (= exactly ON the
  text edge, since the plate bleeds `$cs-indent`); no raw `20px`.
- Chip text +8px past the dot: `padding-left: $cs-indent + 8px` — the
  same text-indent the plain bullets take (DR-0009 amendment: bullet
  text at edge +8 is allowed).
- Symmetric right padding (`$cs-indent + 8px`) — text can no longer
  overrun the right text edge.
- Vertical dot offset in em (the plain-list `0.73em` pattern), not px.
- The plate KEEPS its approved bleed (DR-0009: "boxes can live within
  the bleed") — only the marker/text geometry moves.
- Applies to every `cs-facts li` on all case-study pages (fashion 22,
  ecommerce 26, teachr 3, closet 2).

## Acceptance criteria (agent-checkable)

- [x] On all 4 chip-using pages at 1440 and 1425 (Pedro's viewport):
      dot left == section text edge (±1px); text left == edge + 8 (±1px)
- [x] Chip text never overruns the right text edge (edge audit, all
      pages, 1440 + 390)
- [x] One geometry for ALL bullets on a page: chip and plain-list dots
      align at the same x (pixel-sampled)
- [x] No raw px tied to the chip geometry (grep: no `20px`/`23.5px` in
      the `.cs-facts` block)
- [x] axe zero violations; edge audit clean; captures for Pedro's
      review (chips move +8px right — intended change); lint + format pass

---

# Ticket 26: `[summary:]` directive at section level + migrate commented raw HTML

- Part of: `plan-bullets-cards.md` (finding 4)
- Size: S
- Type: system + copy
- Status: SYNTAX DONE 2026-11-01 — `expandDirective` handles section-level
  `[summary:]` (full render diff of all 7 pages EMPTY; hero containers
  unchanged, verified by render). MIGRATION HALF STILL BLOCKED on Pedro's
  open question (render or delete the commented blocks).

## Context

`[summary:]` is handled only by `renderHero` (inside `::: hero`). The
closing-summary pattern exists on two pages only as commented-out raw
HTML, which ships in the built output as comments:
`digital-closet.md` (`<p class="cs-summary"><em>…</em></p>`) and
`sports-ecommerce-redesign.md` (cs-twocol + cs-note block).

## Requirements

- `expandDirective` gains `[summary: text]` → `<p class="cs-summary"><em>…</em></p>`
  (matches the existing `.cs-summary` box: bleeding, centered text).
- `::: hero` keeps its own `[summary:]` handling (it emits a different
  element) — no behavior change there.
- Migration half BLOCKED on Pedro's open question (render or delete the
  commented blocks). If render: rewrite both pages' comments as
  `[summary:]` / `::: columns` blocks and delete the comments; if
  delete: remove the comments and leave the directive for future pages.

## Acceptance criteria (agent-checkable)

- [ ] `[summary: text]` at section level renders the `.cs-summary` box
      (bleed edge 324–1116 at 1440, centered text — computed-style check)
- [ ] The ecommerce coupon hero's `[summary:]` output is unchanged
      (render diff on that hero container: empty)
- [ ] Decision on the commented blocks executed per Pedro's answer and
      the built HTML no longer contains them in either case
- [ ] Edge audit clean; axe zero violations; lint + format pass

---

# Ticket 27: Quote byline syntax

- Part of: `plan-bullets-cards.md` (finding 5)
- Size: S
- Type: UI + copy
- Status: SYNTAX DONE 2026-11-01 — `[byline:]` after a quote moves inside
  its blockquote (verified: lone quote + group; a trailing byline does not
  break group formation; quote-scoped label-tier style shipped). ADOPTION
  on ecommerce still blocked on Pedro's open question.

## Context

`.cs-byline` exists but only inside `::: hero`. The one standalone
byline (ecommerce, "- E-commerce Department") is inline quote text, so
it renders at quote size/weight instead of the label tier.

## Requirements

- New directive `[byline: text]` on the line after a standalone quote →
  a label-tier line (15.36px, quiet ink) inside the quote's
  `blockquote`, centered with it.
- Quote groups: bylines attach per-quote (a byline after a `>` line
  belongs to that quote; a group byline is out of scope).
- Adoption on ecommerce's E-commerce Department quote only if Pedro
  wants bylines (open question); the syntax ships regardless.

## Acceptance criteria (agent-checkable)

- [ ] `[byline:]` after a lone quote renders inside the blockquote as
      the label tier (15.36px, ≤5.7 ink) — computed-style check
- [ ] A quote followed by another quote (group formation) is not broken
      by a trailing byline (render audit: both quotes still group)
- [ ] axe zero violations (byline contrast on all four theme grounds:
      default, pink, teal, workflow dark); lint + format pass

---

# Ticket 28: Dead CSS removal

- Part of: `plan-bullets-cards.md` (finding 6)
- Size: S
- Type: system
- Status: DONE 2026-11-01 — `.cs-pullquote` and `.cs-steps` deleted from
  `_case-study.scss` (including the three theme-scoped `.cs-steps
.cs-number` selectors); zero live refs; full render diff EMPTY; lint +
  format pass.

## Context

Renderer audit 2026-10-31: `.cs-pullquote` (boxed quote variant) and
`.cs-steps` (4 refs) are emitted by no renderer path on any of the 5
md-driven pages. Quotes render as `.cs-quote`; timelines as
`.cs-timeline`. (Note: `.cs-wordmark` in the workflow block stays —
explicitly kept per its in-place comment.)

## Requirements

- Grep every shell and pattern in `src/` (including `src/_data/patterns/`
  and `src/_modules/`) for `cs-pullquote` / `cs-steps` before deleting.
- Delete the rules only where nothing references them; anything
  referenced by a shell or pattern stays (and gets a comment pointing
  at its consumer).

## Acceptance criteria (agent-checkable)

- [ ] `grep -rn "cs-pullquote\|cs-steps" src/ specs/ docs/` returns only
      this ticket and deleted-CSS commit history afterwards (zero live refs)
- [ ] Full render of all 7 pages unchanged (diff empty); edge audit clean
- [ ] `npm run lint` and `npm run format:check` pass

---

# Ticket 29: AUTHORING.md sync + doc-sync gate

- Part of: `plan-bullets-cards.md` (findings 1, 3)
- Size: S
- Type: copy
- Status: DONE 2026-11-01 — list-context rule + `*` syntax in the
  convention table; `::: quotes full` replaced with `::: cards full`;
  `[summary:]`/`[byline:]` documented; `::: hero` and `::: table` added
  (the doc-sync gate caught them as undocumented). Gate committed as
  `specs/md-case-study-editor/tools/doc-sync.sh` — passes: 7 types in
  both sets. format:check passes.

## Context

AUTHORING.md currently: documents `- item` → chips unconditionally
(wrong in boxes, per DR-0010); shows a `::: quotes full` example that
the renderer rejects with silent content loss (reproduced 2026-10-31;
ticket 18d already decided `quotes` is not a container type).

## Requirements

- Convention table gains the context rule + `*` plain-bullet syntax
  (DR-0010 wording).
- Replace the `::: quotes full` example with a supported one
  (`::: metrics full` already exists in the guide; use `::: cards full`
  or drop the band example to one instance).
- Document `[summary:]` and `[byline:]` once Tickets 26/27 land.
- New standing rule recorded in the guide: every `:::` type documented
  in AUTHORING.md must be a known container in `renderContainer`, and
  every renderer container type must be documented.

## Acceptance criteria (agent-checkable)

- [ ] Doc-sync check passes mechanically: the set of container types in
      AUTHORING.md == the set handled in `renderContainer` (scriptable
      grep; commit the one-liner as `tools/doc-sync.sh`)
- [ ] `::: quotes` no longer appears in AUTHORING.md; the unknown-
      container warning stays in the renderer (escape hatch visible)
- [ ] The list-context rule and both new directives documented with a
      renderable example each
- [ ] `npm run format:check` passes (AUTHORING.md is a formatted target)

---

# Ticket 30: Fashion `::: table` mobile overflow

- Part of: `plan-bullets-cards.md` (finding 8)
- Size: S
- Status: DONE 2026-10-31 - renderer emits cs-tablebox (role=region, tabindex=0, aria-label); overflow-x auto; fashion@390 scrollWidth 390 (was 496).
- Type: UI
- Page: `fashion-rebrand` (the only `::: table` in the repo —
  `fashion-rebrand.md` line 145); fix is systemic so any future
  container-level table inherits it

## Context

`table.cs-table` has `width: 100%` but tables keep their min-content
width: fashion's table measures 496px on a 390 viewport → 106px
horizontal scroll (`scrollWidth` 496 vs 390; ecommerce and teachr
measure clean at 390). Ecommerce's markdown tables never reach this
state because `mdPage` converts them to card grids — which is why the
reference comparison hid the bug. At 768 the table is fine (spans 0–768
inside its `cs-wide--full` wrapper); the 768 spill on fashion is
Ticket 31's, not this one.

## Requirements

- Full-bleed wrappers containing tables get horizontal overflow
  handling: the table scrolls inside its wrapper (`overflow-x: auto`)
  rather than pushing the page wide — tables keep their cell padding
  (Ticket 18d decision, unchanged).
- Visible affordance: a soft scroll hint on the wrapper (e.g. edge fade
  or the existing scrollbar styling) so a cut-off column is discoverable;
  simple is fine, no carousel.
- Alternative rejected: reflowing the table to stacked cards on mobile —
  that duplicates the mdPage table→cards transform and changes the
  content's meaning (an outcomes matrix, not a list).

## Acceptance criteria (agent-checkable)

- [x] `scrollWidth == innerWidth` on `/fashion-rebrand/` at 390, 480 and
      768 (the page never scrolls horizontally)
- [x] The full table content stays reachable: the 4th+ columns scroll
      horizontally inside the wrapper (measured: table width > wrapper
      width, wrapper `overflow-x: auto`)
- [x] Keyboard: the scrollable wrapper is focusable (tab reaches it) and
      arrow-keys scroll it — axe zero violations
- [x] Edge audit clean; captures at 390/768 for Pedro's review; lint +
      format pass

---

# Ticket 31: Bleed vs container inset — kill the 768–791 spill band

- Part of: `plan-bullets-cards.md` (findings 7, 9); DR-0009 amendment
- Size: S
- Status: DONE 2026-10-31 - text-box padding 36px at <=839 (scoped .case-study); scrollWidth == innerWidth at 320/390/480/600/767/768/780/840/1024/1440 on all 7 pages; boxes >= 8px inside viewport everywhere; 1440/1024 unmoved.
- Type: UI
- Pages: ALL 7 case-study pages (not fashion-specific)

## Context

DR-0009 bleeds boxes 28px into each gutter. That is only safe while the
container's side inset is ≥ 28px. The `.document-text` inset is 16px at
768 and only grows past 28px at ~791 (auto margins), so between 768 and
~791 every bleeding box sticks up to 12px out of the viewport → real
horizontal scroll (measured: −12…780 at 768 on all three reference
pages). Below 767 the reduced rules leave boxes 4px from the viewport
edge, under the 8px margin ticket 18c promises.

## Requirements

- IMPLEMENTATION DECISION (build batch 1, measured): the root cause is
  that DR-0009's "reduced bleed below $break-small" was never
  implemented — one rule (box = text edge − 28px) runs at every width.
  Instead of per-component breakpoint surgery, enforce the invariant
  **text edge ≥ 36px (= 28px bleed + 8px viewport margin) at every
  viewport** by bumping the shared text-box padding inside the two
  narrow bands, scoped to `.case-study`: ≤767 (32→36) and 768–839
  (16→36). One rule; no component geometry changes; above 840 the auto
  margins already guarantee the invariant (measured: text edge = (vw−768)/2 + 16).
- DR-0009 amendment: the bleed is capped by the container inset —
  expressed as this invariant rather than shrinking the bleed token.

## Acceptance criteria (agent-checkable)

- [x] `scrollWidth == innerWidth` on all 7 pages at 768, 780, 790
      (the band), plus 320, 390, 480, 600, 767, 840, 1024, 1440
- [x] Every bleeding box's left and right edges sit ≥ 8px inside the
      viewport at 320, 390, 480, 600, 768, 840, 1024, 1440 (measured,
      all pages)
- [x] At 1440 and 1024 nothing moves (box edges stay 324–1116 / 116–908
      on the reference pages — full-page diff: empty)
- [x] At ≤767 the text edge sits at 36 (was 32): content shifts 4px
      right — intended; captures for Pedro's review
- [x] axe zero violations; edge audit clean; captures for Pedro's review

---

# Ticket 32: Box-audit tool — boxes, tables, horizontal overflow

- Part of: `plan-bullets-cards.md` (finding 10)
- Size: S
- Type: system

## Context

`tools/edge-audit.py` measures text elements only. Both spills (the
fashion table, the 768 band) are invisible to every committed check —
the box criteria of tickets 18c/23 were never machine-verified.

## Requirements

- New repo tool `specs/md-case-study-editor/tools/box-audit.py`
  (Playwright, same usage pattern as edge-audit): per page and viewport,
  measures every box component (`.cs-card`, `.cs-facts li`,
  `.cs-summary`, `.cs-col`, `.cs-panel`, `.cs-quote`,
  `.cs-quotes .cs-quote`, `.cs-frame`, `.cs-wide`, `.cs-metrics`,
  `.cs-table`, plus `table` generally) and flags:
  - any element extending past the viewport (`left < −1` or
    `right > innerWidth + 1`)
  - any box edge closer than 8px to the viewport edge
  - `scrollWidth != innerWidth`
  - box edges off the bleed edge (±2px), except documented exceptions
    (metric chips −16 rhythm, panel-width frames, display graphics)
- Same viewports as edge-audit plus 768 and 780 (the spill band).
- Wire into the ticket protocol: Tickets 30/31 and all future
  box-touching tickets must pass BOTH audits.

## Acceptance criteria (agent-checkable)

- [ ] Tool committed and runs: `python3 tools/box-audit.py [baseUrl] [--json OUT]`
- [ ] Run against the CURRENT dev server it fails on fashion@390 (table)
      and all pages@768 (band) — proves it detects the class of bug;
      after Tickets 30/31 it passes clean
- [ ] Reports committed under `evidence/box-audit.json`; README in
      `tools/` updated (both audits + when to run which)
- [ ] `npm run format:check` passes

---

# Ticket 33: Annotation dots stay inside their box

- Part of: `plan-bullets-cards.md` (finding 12)
- Size: S
- Status: DONE 2026-10-31 - .cs-panel .cs-annotation: margin-left 0, dot inside (352-360), text +8 (360); verified on fashion at 1440.
- Type: UI
- Page: `fashion-rebrand` (the only page with `[point:]`s); fix is
  systemic for any future page

## Context

Measured at 1440: an annotation's dot rect is 336–344 while its panel
plate spans 352–1088 — the dot hangs 16px OUTSIDE the panel box
(`.cs-annotation { margin-left: -16px }` was designed for the open
section gutter, but panels are boxes). At 768 the dot lands at 0–8 —
ON the viewport edge. Pedro reads these as bullets spilling out of the
container.

## Requirements

- The gutter hang applies only where there IS a gutter: annotations at
  section level keep it; annotations inside a box (panel, card, col)
  keep the dot within the box — dot on the box's text edge, text +8
  (the bullet rule), no negative margin.
- The 768 edge case is also covered by Ticket 31's inset cap; this
  ticket's in-box rule must hold independently at every viewport.

## Acceptance criteria (agent-checkable)

- [x] On `/fashion-rebrand/` at 1440/1425: every annotation dot's left
      edge >= its panel's left edge (measured)
- [x] At 768/390: no annotation dot within 8px of the viewport edge
- [x] Section-level annotations (if any are authored) keep the gutter
      hang; edge audit clean; axe zero violations; lint + format pass

---

# Ticket 34: Resume — content-list rhythm (dot-leak claim corrected)

- Part of: `plan-bullets-cards.md` (finding 13, CORRECTED 2026-10-31)
- Size: S
- Status: DONE 2026-10-31 - content lists + skill detail lists get 0.5rem top rhythm; unmarked lists regression-guarded in box-audit (rendered-pseudo check).
- Type: UI
- Page: `resume`

## Context

Re-measured with rendered pseudo-element checks: the name, contact and
download lists are correctly UNMARKED (their `::before` is `display:
none` — ticket 22a holds; the earlier leak report was a probe artifact
that read ::before geometry without checking display). The confirmed
issue: content lists sit flush — 0px gap above every content ul; they
touch the preceding title row. Pedro: "resume bullets have no spacing."

## Requirements

- Content lists get a top gap on the 8pt scale (ticket 21): 8px above
  each content ul; the existing 9.6px (0.5rem) item spacing stays.
- The unmarked lists stay unmarked — add the rendered-pseudo check
  (display 'none' = no dot) to the audit so the exclusion can never
  silently regress.

## Acceptance criteria (agent-checkable)

- [x] Every content list (12 role lists + education + languages): >= 8px
      gap between the list's top and the preceding element's bottom,
      measured at 1440
- [x] Name/contact/download lists: `::before` display none (computed
      check) at 1440 and 768 — regression-guarded in the audit
- [x] Content lists' dot geometry unchanged (dot on the text edge,
      text +8)
- [x] Full-page diff at 1440: only the list top-margins move; axe zero
      violations; lint + format pass

---

# Ticket 35: 4px clear gap between bullet dot and text

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "spacing between
  bullet and text 4px gap to give it a bit more breathing room");
  DR-0009 amendment (ticket 35)
- Size: S
- Type: UI
- Supersedes: the edge + 8px text offset (ticket 19 v3, build batch 1)
- Pages: all 7 (chips + plain lists) + resume
- Status: DONE 2026-10-31 - chips/cs-plain at `$cs-indent + 9px`, in-box
  lists and resume at 9px; both audits updated to the 4px-clear-gap
  formula and CLEAN; axe zero violations on all 7 pages at 1440 + 390
  (evidence/axe-batch1.json, box-audit-t35.json); captures refreshed in
  ~/Desktop/cs-typography/after-batch1/

## Context

The +8px offset is measured from the dot's LEFT edge. With a 5px dot,
the clear visual gap between dot and text is only 3px — the text hugs
the dot. Pedro wants 4px of clear space.

## Requirements

- Dot unchanged: ON the text edge (`left: $cs-indent` in chips/cs-plain,
  `left: 0` in-box).
- Text at text edge + 9px: `padding-left: $cs-indent + 9px` (chips,
  cs-plain), `padding-left: 9px` (in-box lists), 9px on the resume.
- Chip right padding widens by the same 1px (`$cs-indent + 9px`) —
  symmetric overrun guard unchanged.
- Audit updates ride along: box-audit's "text indent != +8" check
  becomes "+9 from the dot's LEFT edge = 4px clear gap" (text − dot − 5
  = 4 ± 1); edge-audit's bullet-text tolerance becomes edge + 9 ± 1.

## Acceptance criteria (agent-checkable)

- [x] On every page at 1440 and 390: text-left − (dot-left + 5px dot)
      = 4px ± 1, for chips, in-box plain lists and (resume) content
      lists — measured, not eyeballed
- [x] Dot still ON the text edge (±1px) everywhere
- [x] `tools/box-audit.py` and `tools/edge-audit.py` updated and CLEAN
- [x] axe zero violations; lint + format pass; captures for Pedro

---

# Ticket 36: Bullet-to-text spacing doubled — 8px clear gap

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "add more space
  to the bullets, like 2x the spacing"); DR-0009 amendment (ticket 36)
- Size: S
- Type: UI
- Supersedes: ticket 35's 4px clear gap
- Pages: all 7 (chips + plain lists) + resume
- Status: DONE 2026-10-31 - chips/cs-plain at `$cs-indent + 13px`,
  in-box lists and resume at 13px; both audits updated to the 8px
  clear-gap formula and CLEAN; axe zero violations on all 7 pages at
  1440 + 390 (evidence/axe-batch1.json, box-audit-t36.json); captures
  refreshed in ~/Desktop/cs-typography/after-batch1/

## Requirements

- Dot unchanged: ON the text edge.
- Text at text edge + 13px (5px dot + 8px clear gap):
  `padding-left: $cs-indent + 13px` (chips, cs-plain), `13px` (in-box
  lists), `13px` (resume content lists).
- Chip right padding widens to `$cs-indent + 13px` (symmetric).
- Audits ride along: box-audit clear-gap formula `text − dot − 5 = 8 ± 1`;
  edge-audit bullet-text tolerance `edge + 13 ± 1`.

## Acceptance criteria (agent-checkable)

- [x] On every page at 1440 and 390: text-left − (dot-left + 5px dot)
      = 8px ± 1, for chips, in-box plain lists and (resume) content
      lists — measured
- [x] Dot still ON the text edge (±1px) everywhere
- [x] `tools/box-audit.py` and `tools/edge-audit.py` updated and CLEAN
- [x] axe zero violations; lint + format pass; captures for Pedro

---

# Ticket 37: `[point:]` under an image renders as a caption (dotless, italic)

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "Remove the dots
  from the text below images? If these are text caption text style it
  accordingly as italic"); decision: `DR-0011.md`
- Size: S
- Type: UI + system
- Pages: fashion-rebrand (3), sports-ecommerce-redesign (5) — every
  `[point:]` in the content today
- Status: DONE 2026-10-31 - renderer emits `p.cs-frame-caption` for
  image-following points INCLUDING point runs after one image (ecommerce
  6, fashion 3 — zero annotation dots remain); italic/centered/15.36px/
  #5f6264 computed-verified; AUTHORING.md sync pending (ticket 29)

## Context

All 8 `[point:]` lines sit directly below `[frame:]` placeholders in
`::: compare` panels and render with the 8px annotation dot — captions
in content, dotted annotations in styling. figcaption's treatment
(centered, label tier, #5f6264, italic to be added) is the established
caption look.

## Requirements

- Renderer (`renderFlow` / panel body handling): a `[point:]` whose
  preceding rendered line is an image/frames line (`[frame:]`,
  `[image:]`, `[figure:]`, `![…](…)` or their wrapper markup) renders
  the caption variant — no dot, part of the image's figure markup where
  feasible (image + caption as one accessible unit).
- Caption variant styling: italic, label tier (15.36px), #5f6264
  (axe-verified), centered under the image — matching
  `.cs-showcase figcaption`.
- Non-image-following `[point:]` keeps the annotation-dot treatment
  (DR-0009: gutter hang at section level, contained in-box per ticket 33).
- AUTHORING.md `[point:]` entry updated per DR-0011 (rides ticket 29's
  sync gate).

## Acceptance criteria (agent-checkable)

- [x] All 8 image-following points on fashion + ecommerce: zero dots
      (computed-style: no `.cs-annotation-dot` in the rendered variant),
      italic, centered, label tier — measured at 1440 and 390
- [x] The image + caption pair reads as one figure (caption within the
      figure's markup or immediately adjacent, axe region/image checks pass)
- [x] axe zero violations on all 7 pages at 1440 + 390; edge audit
      clean (caption text exempt as a display element); box-audit clean
- [ ] AUTHORING.md documents the image-following rule
- [x] lint + format pass; before/after captures for Pedro

## Open questions

- Centered (figcaption-like, recommended) vs left-aligned italic on the
  panel text edge — owner: Pedro, vetoable; default builds centered.

---

# Ticket 38: Fashion chip plates brighter / less transparent

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "make the chips
  in the fashion case study brighter / less transparent")
- Size: S
- Type: UI
- Page: `fashion-rebrand` (scoped to the cs-black theme)
- Status: DONE 2026-10-31 (option A) - cs-black chips solid #fff + hairline border rgba(17,17,17,.08); ecommerce/teachr/closet chips unchanged (computed-style verified)
- Status: SPEC'D 2026-10-31 — eval below

## Eval (measured, 2026-10-31)

All 22 fashion chips sit on the `#fafafa` ground with the shared plate
`rgba(255,255,255,0.45)` → composited brightness delta **2 units**
(ticket 22b's visibility gate: ≥ 8). The plates are effectively
invisible on fashion — on the tinted grounds (ecommerce #fdf0f7, teachr
#f0f8f6) the same plate reads fine.

## The constraint that shapes the fix

On a #fafafa ground, a brighter plate CANNOT reach the 8-unit gate:
solid white maxes at delta 5. So visibility must come from full opacity
PLUS edge definition. Two options:

- **A (recommended)**: cs-black-scoped chip plate `#ffffff` solid +
  hairline border `1px solid rgba(17,17,17,0.08)`. Plate reads as a
  crisp white card on the off-white ground; no page-wide change.
- **B (vetoable, page-wide)**: darken the fashion ground to #f5f5f6 →
  solid white plates hit delta 10 with no border. Changes every
  section's feel on the page — Pedro's call.

## Requirements (option A default)

- `.case-study.cs-black .cs-facts li { background-color: #fff;
border: 1px solid rgba(17,17,17,0.08) }` — theme-scoped, no new
  tokens beyond the two literal values (documented at the rule).
- Other pages' chips unchanged (they pass the gate on tinted grounds).
- If Pedro picks B, the border drops and the ground changes instead —
  full-page captures either way.

## Acceptance criteria (agent-checkable)

- [x] Fashion chips: plate delta vs local ground measured; option A =
      solid white + border present (computed-style) — or option B =
      delta ≥ 8 pixel-sampled at multiple chips
- [x] Chips on ecommerce/teachr/closet unchanged (computed-style diff:
      no background/border change)
- [x] axe zero violations (contrast: chip text on solid white unchanged
      4.5+); box-audit + edge-audit clean; captures for Pedro

---

# Ticket 39: Chip edges inside the container, not on the bleed edge

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "set the edges
  of the chip inside the bleed, not outside the bleed of the
  container"); DR-0009 amendment (ticket 39)
- Size: S
- Type: UI
- Pages: all 7 (chips + cs-plain are global components)
- Status: DONE 2026-10-31 - chips/cs-plain at the text edge (352-1088 @1440, measured), dot on the edge, +13 text; cards/summary/cols still on the bleed edge; box-audit updated to the per-class expected edge and CLEAN

## Requirements

- `.cs-facts` and `.cs-plain`: `margin: 16px 0` (was
  `16px (-$cs-indent)`) — the chip box spans the text column
  (352–1088 at 1440), inside the container.
- Dot moves to the chip's own left edge: `left: 0` (still ON the text
  edge); text stays at +13 (8px clear gap, ticket 36); horizontal
  padding stays 13px.
- Cards, summary, quote groups, cols KEEP their bleed (DR-0009 stands
  for display boxes).
- box-audit: chips and cs-plain now checked against the TEXT edge
  (±2px); the bleed-edge check keeps applying to the remaining boxes.

## Acceptance criteria (agent-checkable)

- [x] On all pages at 1440: chip/cs-plain box edges == section text
      edge ± 2 (352 / 1088); at 390 == text edge (36) ± 2
- [x] Dot ON the text edge (±1), text at +13 (±1) — measured
- [x] Cards/summary/cols/quote groups still on the bleed edge
      (324–1116 at 1440) — measured
- [x] box-audit + edge-audit updated and CLEAN; axe zero violations
      (1440 + 390, all 7 pages); lint + format pass; captures for Pedro

---

# Ticket 40: One chip plate token — same chip containers everywhere

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "use the same
  chip text containers from ecommerce or teachr in fashion and visuAI");
  decision + measured table: `DR-0012.md`
- Size: S
- Type: UI + system
- Pages: fashion (ground + plate), workflow (token), all others (token)
- Status: DONE 2026-10-31 - token shipped; fashion on the reference
  plate at delta 2.7 (reference band: 1.5–2.6); visuAI on the
  documented dark instance. axe regression from the ground change
  (muted ink #6e6e73 measured 4.45 on #f0f0f2) fixed theme-scoped
  (#66686d) — axe ZERO again; BOX + EDGE AUDIT CLEAN
  (evidence/box-audit-t40.json); captures in
  ~/Desktop/cs-typography/after-chips-captions/.
  Follow-up (Pedro: "make them match"): the workflow plate tuned
  0.06 → 0.04 (delta 5.4 → 3.5) — the full computed-style matrix now
  shows identical chip structure on all 5 pages (plate token, box
  352–1088, dot at 0, +13 text); only theme grounds and accents
  differ, by design.

## Requirements

- New token `--cs-chip-plate: rgba(255, 255, 255, 0.45)` on
  `.case-study` (the reference value); `.cs-facts li` consumes it.
- fashion (`cs-black`): ground `#fafafa → #f0f0f2`; the t38 solid-white
  - border override is REMOVED — the page now renders the reference
    plate (measured delta ~7 on the new ground; borderless like the
    references). VETOABLE per DR-0012; fallback = revert to t38's
    solid-white + border on #fafafa.
- visuAI (workflow dark block): `--cs-chip-plate:
rgba(255, 255, 255, 0.06)` — the documented dark-ground instance;
  no visual change.
- AUTHORING/styleguide: the chip plate documented as the token + its
  per-ground instances (rides ticket 29's sync).

## Acceptance criteria (agent-checkable)

- [x] `.cs-facts li` background is `var(--cs-chip-plate)` (computed)
      on all 7 pages; no literal plate value remains on the chips
- [x] fashion: plate == rgba(255,255,255,0.45), border 0, ground
      #f0f0f2 — measured delta 2.7, inside the reference band
      (1.5–2.6; the original ">= 5" criterion was mispredicted and
      corrected at build time — the reference plate itself tops out
      at 2.6 on any light ground)
- [x] ecommerce/teachr/closet/workflow chips: computed styles unchanged
- [ ] box-audit + edge-audit CLEAN; axe zero violations (1440 + 390);
      lint + format pass; before/after captures for Pedro

---

# Ticket 41: Chip plate inner padding — dot inside the plate, not flush

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31, screenshot:
  "add padding to the container, unify them"); DR-0009 amendment
- Size: S
- Type: UI
- Supersedes: the t39 dot position (`left: 0`) for plated chips only
- Pages: all with chips (fashion, ecommerce, teachr, closet, visuAI)
- Status: DONE 2026-10-31 - chips: dot at $cs-indent - 8 (20px inside
  the plate), text at edge + 33; plateless lists unchanged (dot on the
  edge, +13). AUDIT FIX found during verification: edge-audit's ctx
  normalization was broken by the shells' 'section'/'case-study'
  classes - the audit had been VACUOUSLY CLEAN (zero rows matched the
  edge-vote check); fixed, plus cs-quote added to DISPLAY_CTX (centered
  quotes, 24 real flags the vacuous runs missed). BOX + EDGE AUDIT
  CLEAN, axe zero on all 7 pages (1440 + 390); close-up captures for
  Pedro

## Requirements

- `.cs-facts li`: dot `left: ($cs-indent - 8px)` (20px inside the
  plate), text `padding-left: ($cs-indent + 5px)` (33px — 8px clear gap
  after the 5px dot), symmetric right padding.
- `.cs-plain`, in-box lists, resume lists: unchanged (plateless — dot
  stays ON the text edge).
- box-audit: chip dots expected at edge + ($cs-indent − 8) ± 1;
  plateless dots at edge ± 1.

## Acceptance criteria (agent-checkable)

- [x] Chip dots: 20px ± 1 inside the plate's left edge on every chip
      page (measured at 1440 + 390); text 8px ± 1 clear after the dot
- [x] Plateless lists unchanged: dot on the text edge ± 1 (measured)
- [x] box-audit + edge-audit CLEAN; axe zero violations (1440 + 390);
      lint + format pass; close-up captures for Pedro

---

# Ticket 42: One content width site-wide — the resume's 900/836

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "unify all pages
  with the same content width matching the resume content width");
  decision + tradeoff record: `DR-0013.md`
- Size: M
- Type: UI
- Pages: ALL (the shared `.text-box` container)
- Status: DONE 2026-10-31 - all four wide variants at 900/32 (768-991
  variant: 100%/max-900); invariant bump widened to <=907. MEASURED:
  container 900 at [270,1170] and text edge 302 on every page at 1440
  (= the resume's exact 302/94 at 1024); content 836. No overflow at
  60 page@viewport combos (10 pages incl. home/about/blog); BOX +
  EDGE AUDIT CLEAN; axe zero (1440 + 390); captures in
  ~/Desktop/cs-typography/after-width-unify/

## Context

Measured: resume content = 900px container / 836 text extent; every
other page = 768 / 736 (`.text-box`, four wide variants in
`_gallery.scss`). All shells share the container, so one change
unifies the whole site.

## Requirements

- `.text-box` wide variants (≥2400, 1280–2399, 992–1279):
  `width: 900px; max-width: 100%; padding: 0 32px`.
- 768–991 variant: `width: 100%; max-width: 900px; padding: 0 32px`
  (no overflow below 900).
- ≤767 variants unchanged (100% / 32px).
- Case-study bleed-invariant bump (ticket 31): ≤839 → ≤907 (the math
  is in DR-0013 §3).
- Styleguide + AUTHORING: the content width documented as 900/836.

## Acceptance criteria (agent-checkable)

- [x] Content extent == 836 ± 2 at 1440, 1280, 1024 on resume AND all
      7 md pages (measured widest body text)
- [x] Text edge == (vw−900)/2 + 32 on all pages at those viewports
      (resume: 302/94 — measured match)
- [x] No horizontal overflow at 320/390/480/600/768/840/908/992/1024/1440
      on all 7 pages; box-audit + edge-audit CLEAN
- [x] axe zero violations (1440 + 390); lint + format pass
- [x] Full-page captures (resume, one case study, home, about) for Pedro

---

# Ticket 43: Styleguide refresh — real components, current system, a11y clean

- Part of: `plan-bullets-cards.md`; full review with evidence:
  `review-styleguide.md` (verdict: BLOCKED)
- Size: M
- Type: UI + copy
- Page: `/styleguide/` (5 blocks, 455 lines)
- Status: DONE 2026-11-01 — shell id fixed (`styleguide_container`), real
  markup (ul.cs-facts / ol.cs-timeline), heading ladder (h2 intros, h3
  subsections), swatch ink fixed, case-system block documents chip plate +
  list-context rule + 900/836 + frame captions + the seven color tokens +
  heroes; stale copy updated. Verified: axe ZERO color-contrast at 1440 +
  390; box/edge audits CLEAN. ONE KNOWN REMAINING FLAG: axe heading-order
  (moderate) from the LEGACY steammobile gallery-header demo in the
  containers block (the real headline module emits h1 → h3) — predates
  this ticket, fix = drop that demo or change the module; owner: Pedro.

## Context

The review found: 2 serious a11y failures (swatch labels 2.32/2.71
contrast; invalid div>li demos), a fake timeline (inline-styled spans,
already drifted from the real `ol.cs-timeline`), a chip demo off the
content-edge system, zero ticket-20 color tokens documented, five
system pieces missing (frame captions, cs-plain, chip plate token,
content width, list-context rule), stale copy ("dot on the edge" —
t39/41 changed it), and the shell's `id="resume_container"`
copy-paste artifact leaking resume-scoped CSS onto the page.

## Requirements

- Real markup only: chip demos as `ul.cs-facts > li`, timeline as
  `ol.cs-timeline > li` (real component styles; no inline-styled
  mimics). Inline styles in the guide are for GUIDE LAYOUT only —
  never to fake component styling.
- Fix the shell id: `id="styleguide_container"`; grep `_resume.scss`
  and `_case-study.scss` for `#resume_container` scoping first — any
  rule that must not hit the styleguide stays ID-scoped; anything the
  styleguide needs gets its own scope.
- Swatch labels: dark ink on light swatches (≥ 4.5, axe-verified).
- Heading ladder: one h2 per section intro, h3 subsections (axe-clean).
- Document the current system in the case-system block: chip plate
  token + per-ground instances (DR-0012), bullet geometry (dot inset,
  8px gap — t36/41), list-context rule (DR-0010, `-` vs `*` vs in-box),
  content width 900/836 (DR-0013), frame captions (DR-0011), the
  ticket-20 color tokens, the full-bleed tier.
- Update stale copy to the t41 wording.

## Width fix (applied 2026-10-31, part of this ticket)

- `.text-container .gallery-text` flows at the container width
  (gallery box rules dropped inside the container); intro block moved
  into a text-container. MEASURED: content 836/[302,1138] at 1440 =
  the resume exactly; demo chip on the real text edge. Captures:
  styleguide-1440/1024/768/390 in ~/Desktop/cs-typography/after-width-unify/

## Acceptance criteria (agent-checkable)

- [ ] axe: zero violations on /styleguide/ at 1440 and 390, excluding
      only `#__bs_notify__` (dev-only)
- [ ] No `li` without a `ul`/`ol` parent in the rendered DOM
      (querySelectorAll check)
- [ ] `ol.cs-timeline` and `ul.cs-facts` exist on the page and their
      demo geometry equals a real page's (chip box on the text edge,
      dot at +20 ± 1 inside the plate — measured)
- [ ] The case-system block documents: chip plate token, list-context
      rule, content width 900/836, frame captions, color tokens
      (string checks)
- [ ] No stale rule copy: the guide does not contain "dot on the edge,
      text at the slight indent" (grep)
- [ ] box-audit + edge-audit still CLEAN on the 7 content pages (the
      styleguide shares the container styles); lint + format pass
- [ ] Captures (full page, 1440 + 390) for Pedro

## Out of scope

- New components that don't exist in the system yet — the guide
  documents what IS, not what should be.
- The `#__bs_notify__` region violation (BrowserSync dev-only).

## Open questions

- Should the guide gain a tokens page (color/type/spacing as data,
  not prose)? Owner: Pedro — nice-to-have, does not block this ticket.

---

# Ticket 44: Hero spacing unified — one shared component (DR-0014)

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "verify the case
  study hero spacings... should be a shared component and consistently
  spaced"); decision + measured matrix: `DR-0014.md`
- Size: M
- Type: UI
- Pages: all 7 (workflow is the fix target; the coupon hero on
  ecommerce; the covers unchanged visually)
- Status: DONE 2026-10-31 - one hero set live. MEASURED: covers 64/64
  - gaps [16,24,24] everywhere (unchanged, as required); meta 32/32
    (24 top below 1280); workflow 64/64 + gaps [24,24] (was 88/40,
    [16,0]) + type roles fixed (summary 22.464, details 15.36); coupon
    hero 64/64 (was 128/32) + subtitle/byline mt 24; sections 64
    everywhere (workflow's 88 gone). BOX + EDGE AUDIT CLEAN, axe zero
    (1440 + 390); hero captures for Pedro in
    ~/Desktop/cs-typography/after-hero-unify/

## Requirements

- `.case-study .cs-hero` becomes the single spacing/type source:
  `padding: 64px 0`; title margin 0; `.cs-cover-summary` 22.464 light
  mt 24; `.cs-cover-details` 15.36 mt 24 — colors inherit.
- The colored-cover scope keeps ONLY ground/ink: the 100vw box,
  `padding: 64px 48px`, `color: #fff`.
- DELETE: the dead `padding-top: 128px` rule (≥1279), the dead ≤767
  `padding-top: 32`, the workflow's 88/40 hero override and 88px
  section padding.
- The coupon hero's `.cs-subtitle` mt 24 and `.cs-byline` mt 24 (was 0).
- Cover covers' rendered geometry must not move (64/64 was already
  their effective state — pure rule cleanup).

## Acceptance criteria (agent-checkable)

- [x] Every hero instance measures its variant's padding: covers
      64/64, meta 32/32 (24 top below 1280), coupon + workflow 64/64 —
      at 1440, 768, 390
- [x] Workflow hero: summary 22.464px mt 24, details 15.36px mt 24
      (computed) — the type roles hold on the dark ground
- [x] Coupon hero: subtitle/byline gaps 24 (measured); no 128 anywhere
- [x] Section padding 64 on workflow (was 88)
- [x] axe zero violations on all 7 pages (1440 + 390) — the workflow
      summary's new size re-checked against the dark ground; box-audit + edge-audit CLEAN; lint + format pass
- [x] Full-hero captures (all 7 pages, 1440 + 390) for Pedro

---

# Ticket 46: The styleguide page opens with a hero — adapted bare variant

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "the styleguide
  should also have a Hero at the top for the title like the other case
  studies. Not just as a component.")
- Size: S
- Type: UI + copy
- Extends: ticket 45 / DR-0014 — the styleguide page becomes the adapted
  bare hero's second instance (visuAI was the first)
- Page: `/styleguide/`
- Status: DONE 2026-11-01 — adapted bare hero live at the top of the
  page: eyebrow "The visualbear System" (#d0181e ink), h1 "Styleguide"
  (moved from the intro block), summary (the welcome copy), details
  "Design reference ⋅ 2026". Transparent on the section ground, shared
  DR-0014 gaps 16/24/24 measured at 1440 + 390; axe zero new violations.
  Evidence: `evidence/t46-verify.json` + `evidence/t46-styleguide-hero-*.png`.

## Context

Every case-study page opens with the hero component (DR-0014). The
styleguide opens with a bare `h1.page-header` in the intro block — the
page that documents the system doesn't use it.

## Requirements

- Shell-level adapted bare hero (DR-0014, no variant class): a
  `header.cs-hero` inside a `.case-study document-text` wrapper at the
  top of the intro article. Transparent — the section's light ground
  carries it, like visuAI's dark ground.
- Adapted kicker: NOT "Case Study" — default "The visualbear System"
  (Pedro-vetoable). Ink: the default `.cs-eyebrow` red #d0181e — the
  page's verified link red (4.97:1 on the light-blue ground).
- The hero takes over the page title: the h1 "Styleguide" moves from the
  intro block into the hero; the welcome copy becomes the hero's
  `.cs-cover-summary`; the details line is "Design reference ⋅ 2026"
  (not a repeat of the index nav). The intro block keeps the Pattern
  Lab, purpose and built-using paragraphs and the index nav — no
  duplicated copy.
- Shared DR-0014 spacing/type roles only — no new overrides.

## Acceptance criteria (agent-checkable)

- [x] `/styleguide/` opens with `header.cs-hero`: eyebrow (not
      "Case Study"), h1 "Styleguide", `.cs-cover-summary`,
      `.cs-cover-details`; computed hero bg transparent — measured at
      1440 + 390 (evidence: `evidence/t46-verify.json`)
- [x] Gaps on the DR-0014 set (eyebrow→h1 16, h1→summary 24,
      summary→details 24) — measured at both widths
- [x] One STRUCTURAL h1 per page (the hero's; the two remaining h1s are
      pre-existing demo samples — the core headings ladder demo and the
      steammobile headline demo, both inside demos, not page structure);
      heading ladder intact; axe zero NEW violations at 1440 + 390 (the
      pre-existing steammobile heading-order flag is tracked in ticket 43)
- [x] No duplicated welcome copy (grep count 0); the index nav still
      lists and anchors to all four sections
- [x] box-audit + edge-audit CLEAN; lint + format pass; captures
      (`evidence/t46-styleguide-hero-{1440,390}.png`)

## Open questions

- Kicker copy ("The visualbear System" default) — owner: Pedro,
  vetoable; does not block the build.

---

# Ticket 47: Styleguide evaluation — broken/misaligned fixes + blueprint coverage

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "review the
  styleguide and fix any broken or poorly aligned components. Apply more
  of the case study blueprint styling.")
- Size: M
- Type: UI + copy + system
- Page: `/styleguide/`
- Status: DONE 2026-11-01 — all six findings fixed and verified
  (evidence: `evidence/t47-verify.json` + captures
  `t47-styleguide-{1440,390}.png`); axe zero, no h-scroll at any width,
  audits clean.

## Evaluation findings

1. **9px horizontal scroll at 390** — the bleeding demo components
   (`.cs-card` "Bleed example", `.cs-timeline li` gutter) render at
   −8…399 on the 390 viewport. Root cause: the guide's demo wrappers
   (`.case-study.document-text`) carry the components but NOT the
   shells' `.text-box`, so ticket 31's ≤907 36px viewport inset never
   reaches them. The box-audit covers the 7 real pages only — the
   guide was never in its scope.
2. **Labels demo renders unstyled** — seven `.label-default/-primary/…`
   spans: no background, plain text. The styles exist nowhere in the
   system (bootstrap-era legacy); zero usage outside the guide.
   Documents what ISN'T — the opposite of the guide's rule.
3. **Invalid HTML in the core block**: `<p><div class="light">…</div></p>`
   (the browser splits the paragraph around the div); `alt` attribute on
   two anchors (invalid on `<a>`); duplicate ids: `workLink1` ×2,
   `galleryimg` ×4, `contact` ×2.
4. **Empty text-block** in the containers section (no content, no
   purpose).
5. **Steammobile gallery-header demo** — the last axe heading-order
   violation (the real headline module emits h1→h3), plus mismatched
   demo content (art-ent config carrying Steam copy) and a full-bleed
   legacy module inside the guide. Pedro's t43 open decision is
   resolved here by this review: DROP (the guide documents the current
   md system; the organism remains documented on the legacy pages).
6. **Blueprint components missing from the case-system section**:
   `cs-plain` (DR-0010's own `*` syntax), quote groups (`.cs-quotes`),
   `[note:]`, `[divider:]`, and the `[summary:]` box — all shipped
   system components with no demo.

## Requirements

- **Demo-wrapper inset (finding 1)**: `#styleguide_container
.case-study.document-text` gets the same 36px side padding at ≤907 as
  the shells' `.text-box` (ticket 31) — guide-scoped, documented.
- **Remove the Labels block (finding 2)** — the guide documents what IS.
- **Fix invalid markup (finding 3)**: unwrap `div.light` from its `p`;
  `alt` → `title` on the two anchors; unique ids (`workLink2`; the
  containers demo headings get distinct ids).
- **Drop the steammobile gallery-header demo (finding 5)** — heading
  ladder clean.
- **Remove the empty text-block (finding 4)**.
- **Extend the Components block (finding 6)** with real-class demos:
  `ul.cs-plain` (the `*` list), a `.cs-quotes` group (2 quotes),
  `p.cs-note`, the `.cs-divider`, and the `.cs-summary` box — real
  spacing, no inline fakes.
- Accepted minor (noted, not fixed): `#contact` id duplication — the
  footer demo renders the real footer macro, which hardcodes the id;
  the real-macro rule (ticket 43) wins over id uniqueness here.

## Acceptance criteria (agent-checkable)

- [x] `scrollWidth == innerWidth` at 320/390/480/768/1024/1440 on
      /styleguide/ (was 12/9/4px at 320/390/480; the demo wrappers'
      inline `padding: 8px 0` was also switched to vertical-only so the
      inset rule reaches them)
- [x] axe: ZERO violations at 1440 + 390 (steammobile flag gone with
      its demo; the note/divider demos exposed the muted ink at ~4.46
      on the guide's light-blue ground — fixed with a documented
      per-ground instance, #66686d, the ticket-40 pattern)
- [x] No `.label-*` spans, no `a[alt]`, no duplicate ids except
      `#contact` (accepted minor), no empty text-blocks, no
      div-inside-p (evidence: `evidence/t47-verify.json`)
- [x] The Components block demos cs-plain, quote group, note, divider,
      summary — real classes, real spacing
- [x] box-audit + edge-audit CLEAN (7 content pages); lint + format
      pass; captures `evidence/t47-styleguide-{1440,390}.png`

## Open questions

- Should the guide gain section-intro eyebrow styling (the cs-section
  treatment) for its own h2 sections — more blueprint, or is the
  legacy `page-header` style the guide's identity? Owner: Pedro.

---

# Ticket 48: Styleguide presentation fixes — broken assets, attributes, structure

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "apply fixes to
  these, without changing their fundamental styling, only fixing or
  improving presentation")
- Size: S
- Type: UI + copy
- Page: `/styleguide/` (core / modules / containers blocks)
- Status: DONE 2026-11-01 — all findings fixed and verified at 1440 +
  390 (evidence: `evidence/t48-verify.json` + captures
  `t48-styleguide-{1440,390}.png`): zero broken images, axe zero,
  audits clean, alignment was already clean (measured, no changes
  needed).

## Findings

1. **Two broken images in the "Buttons Aligned" demo** — the twitter and
   behance icon assets exist nowhere in `src/_images/icons/` (natural
   width 0 at runtime); the demo also carries `alt="Smiley face"` ×3
   (meaningless) and invalid `width="48px"` attribute values.
2. **The card demo's background-image points at the thumbs DIRECTORY**
   (`url(../images/work/thumbs/)`) — an empty image area; the "Play"
   title has no matching thumb asset in the repo.
3. **Structure/attribute nits**: the "Link Block" h3 sits outside its
   text-block; `style="max-height:auto"` no-op on the button-slider
   block; the portrait img's alt reads "visualbear logoimage" (it is a
   portrait).

## Requirements (presentation only — no fundamental styling changes)

- Buttons demo: demo the ONE icon that exists (LinkedIn, the footer's
  real pattern: real href + title + alt + integer width/height).
- Card demo: an existing thumb (`gallery_thumb_artent.jpg`) with
  matching copy (Art-Ent) — real asset, coherent demo.
- Wrap the Link Block h3 into its text-block; drop the no-op inline
  style; fix the portrait's alt.

## Acceptance criteria (agent-checkable)

- [x] Zero broken images on /styleguide/ (every `<img>` naturalWidth >
      0; background-image demos point at existing files)
- [x] No `alt="Smiley face"`, no `width="48px"`-style attributes, no
      alt="visualbear logoimage"
- [x] Heading ladder intact (h3 → h4 in the link block); axe stays
      zero-violation at 1440 + 390
- [x] box-audit + edge-audit CLEAN; lint + format pass

## Open questions

- None.

---

# Ticket 49: Rhythm spacer bars on the brand palette

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "adjust the
  spacer color to match the brand, make it light blue or dark grey")
- Size: S
- Type: UI
- Page: `/styleguide/` — the Vertical rhythm block's seven spacer bars
- Status: DONE 2026-11-01 — all seven bars on rgba(24,24,27,0.08)
  (computed verified, zero red bars remain); axe zero at 1440 + 390;
  audits CLEAN. Evidence: `evidence/t49-verify.json` +
  `evidence/t49-casesystem-{1440,390}.png`

## Context

The spacer bars demo the 8/16/24/32/48/64/96 scale as tinted boxes;
their tint is the case-study red at 0.08
(`rgba(215, 55, 53, 0.08)`) — a case-study accent, not the guide's
brand palette (Core section: Light Grey Blue #E6F2FF / Blue #79A6D2 /
Medium Grey #313135 / Dark Grey #18181B).

## Decision (within Pedro's either/or)

**Dark grey** (`rgba(24, 24, 27, 0.08)` — #18181B at the same 0.08
strength). Light blue is technically unusable here: the bars sit on the
section's light-blue ground ($vb-light = #E6F2FF) — a light-blue tint
on it is invisible. Dark grey keeps the exact tint strength the red
version had, so the bar values (dark ink, centered) keep their
contrast.

## Requirements

- The seven spacer bars take `background: rgba(24, 24, 27, 0.08)`;
  nothing else changes (labels, sizes, spacing).
- Out of scope: the full-bleed band demo keeps its red — it demos a
  COLORED band (the cover heroes are brand red); that red is
  meaningful, not decorative drift.

## Acceptance criteria (agent-checkable)

- [x] All seven bars' computed background-color is the dark-grey tint
      (rgba(24,24,27,0.08) — computed verified), none red
- [x] Bar labels still ≥4.5:1 on their bar (axe zero at 1440 + 390)
- [x] box-audit + edge-audit CLEAN; lint + format pass

## Open questions

- None (the light-blue option is closed by the ground-color conflict;
  recorded here so the choice is traceable).

---

# Ticket 50: Full-bleed demo tint + Buttons Aligned on regular nav buttons

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "same for the
  full bleed. Also fix the Buttons Aligned section which shows the
  linkedin button oddly left aligned. use regular navigation buttons
  for this on a plain background instead")
- Size: S
- Type: UI
- Page: `/styleguide/`
- Status: DONE 2026-11-01 — full-bleed band on rgba(24,24,27,0.12)
  (zero red tints left in the case-system block); Buttons Aligned
  rebuilt on the slider's real arrangement (nav.btn-container.row, two
  col s6, Previous/Next), plain ground, no icon/band. axe zero at
  1440 + 390, hover red plate verified. Evidence:
  `evidence/t50-verify.json` + `evidence/t50-modules-{1440,390}.png`

## Context

1. Ticket 49 put the rhythm spacer bars on the dark-grey tint and
   scoped OUT the full-bleed band demo (its red demos a colored band).
   Pedro's "same for the full bleed" supersedes that scoping — the
   demo's tint goes dark grey too.
2. The "Buttons Aligned" demo shows the one remaining social icon
   (LinkedIn) left-aligned inside `socialContainer` — the component's
   `margin: auto` centers the container while the icon floats left, so
   the button reads oddly placed; the demo also sits on the dark
   `$vb-dark` band. The icon demo outlived its assets (twitter/behance
   are gone, ticket 48).

## Requirements

- **Full-bleed band demo**: `rgba(215, 55, 53, 0.12)` →
  `rgba(24, 24, 27, 0.12)` — the same dark-grey treatment as the
  spacers (ticket 49), same strength. No other change.
- **Buttons Aligned demo**: replace the icon-in-band with the site's
  REGULAR navigation buttons — the buttonslider's
  `a.btn.vb-btn-full` (flat grey, hover red plate) — a Previous /
  Next pair (left/right aligned, exactly as the slider uses them),
  directly on the plain guide ground: no `socialContainer`, no dark
  band, no icon.

## Acceptance criteria (agent-checkable)

- [x] The full-bleed band demo's computed background is
      rgba(24,24,27,0.12); no red tint remains in the case-system block
      (accent DOTS are opaque brand red by design — not tints)
- [x] The Buttons Aligned block contains no `socialContainer`, no
      `.vb-btn-icon`, no dark band — two `a.btn.vb-btn-full` buttons in
      the slider's real col-s6 arrangement (Previous | Next), plain ground
- [x] Buttons' hover/focus states work (red plate, computed check)
- [x] axe zero at 1440 + 390; box-audit + edge-audit CLEAN; lint +
      format pass; captures `evidence/t50-modules-{1440,390}.png`

## Open questions

- None.

---

# Ticket 51: Timeline dot aligned with its step title

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "align the
  timeline element with the related title, since they're not aligned
  right now")
- Size: S
- Type: UI
- Pages: all with timelines (ecommerce, teachr, closet, fashion) + the
  styleguide's timeline demo — one component fix
- Status: DONE 2026-11-01 — dot margin 14.5px, connector top 44.5px
  (compiled CSS verified); dot-vs-first-line offset ≤1px on every
  timeline step on 5 pages at 1440 + 390 (was −15.5px at 1440 — the
  number floated high); axe zero on styleguide + ecommerce at both
  widths; audits CLEAN. Evidence: `evidence/t51-verify.json` +
  `evidence/t51-timeline-styleguide-{1440,390}.png`.
  NOTE: the first spec'd approach (calc with `$base-h3-size`) was
  invalid — Sass emits the variable literally inside calc(); replaced
  with the measured value after the review found the h3's 8px padding
  and the 31px font box.

## Review (measured at 1440, all pages identical)

The `.cs-timeline li` grid row 1 holds the 26px numbered dot (column 1)
and the step title (column 2). Both are top-aligned
(`align-items: start`), but the title's RENDERED text sits far lower
than a bare line-box calculation suggests — two structural facts the
first pass missed:

- the site-wide h3 carries **8px vertical padding** (measured:
  h3 padding-top/bottom 8px), so the title's content starts 10px down
  (2px margin + 8px padding);
- the title's rendered text box (Range rect) is 31px tall (font
  ascent/descent exceed the 30.33px line-height strut) and starts at
  13px below the step top.

Measured: the title's text center sits **28.5px** below the step top;
the dot's center at **13px** — the number floats **15.5px high** against
its title, on every page (styleguide demo + ecommerce/teachr/fashion).

## Requirements

- Center the dot on the title's text line: `::before` gets
  `margin-top: 14.5px`. Measured text centers: 28.5px below the step
  top at 1440, 26.5px at 390 — the glyph box snaps ±1-2px subpixel
  between viewport fractions, so 14.5 (dot center 27.5) is the value
  that holds BOTH widths within the ±1px tolerance (15.5 would be
  exact at 1440 but 2px off at 390). Comment records the derivation;
  re-measure if the type scale changes.
- The connector line keeps its 4px gap below the dot: `top: 30px` →
  `top: 44.5px` (dot margin 14.5 + dot 26 + 4).
- The step title's margin/padding stay as they are (site-wide h3
  rhythm — not changed inside the timeline).
- Wrapped titles: the dot aligns with the FIRST text line (the
  measurement uses the first line's client rect, not the multi-line
  union).

## Acceptance criteria (agent-checkable)

- [x] Dot center vs title's FIRST text line center within ±1px on
      every timeline li — styleguide + 4 real pages, 1440 + 390
      (maxAbs 1 everywhere; was 15.5px)
- [x] Connector line keeps the 4px gap below the dot (compiled rule
      top 44.5px = margin 14.5 + dot 26 + 4)
- [x] axe zero at 1440 + 390 on the touched pages; box-audit +
      edge-audit CLEAN; lint + format pass; capture
      `evidence/t51-timeline-styleguide-{1440,390}.png`

## Open questions

- None.

---

# Ticket 52: Index page background gradient — root cause documented

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "the index page
  background gradient is broken, review it and identify the cause and
  document it")
- Size: M
- Type: system (review + documentation; fix proposed, NOT applied)
- Page: `/` (home; the mechanism also underlies every page that relies
  on the base body gradient)
- Status: DONE 2026-11-01 — fix applied and measured (evidence:
  `evidence/t52-verify.json`, captures `t52-fixed-*.png`,
  pre-fix `t52-index-*.png`, `t52-index-red-restart.png`,
  `t52-canvas-*.png`).

## Design decision (the open question, resolved in the build)

The fade spans the FIRST VIEWPORT and the flat brand dark carries the
rest of the page — NOT a page-length fade. Evidence: the fold's current
curve is the design (identical before/after, measured); the about's
patch proves the about area is meant to sit on ≈#252528 dark; and the
nav comment's own rule ("the darkest stretch never passes under the
nav"). The fade's length is now ONE value (`height: 100vh/100svh` on
`body.home-page::before`) — Pedro can lengthen the fade by changing
that one declaration.

## The symptom (measured, 1440 viewport)

- The red→dark fade completes INSIDE the first viewport: at page y=850
  the background already measures rgb(47,39,41) — effectively the end
  color. The brand red "hold" lasts ~90px, not a third of the fold.
- **The gradient restarts bright red every viewport height**: page 892
  measures #252528 (37,37,40); page 967 measures (215,55,53) — a hard,
  visible snap back to full red behind the gallery cards, fading again
  over the next 900px (evidence: `evidence/t52-index-red-restart.png`).

## Root cause (two interacting facts)

1. **The gradient depends on canvas propagation.** The gradient lives
   on `body` (`_base.scss`: `linear-gradient(180deg in oklab, #d73735
10%, #252528 100%)`), and `html` deliberately paints NO background —
   the ticket-17 fix ("the body gradients own the canvas") so the fade
   reaches the page bottom without a flat strip. With an unpainted
   html, the body's background propagates to the CANVAS.
2. **A canvas-propagated gradient is sized to the VIEWPORT, not the
   body's box.** Chrome resolves the propagated gradient against the
   initial containing block (900px), not the body's 2798px box.
   Measured: the fold's pixels match the blend curve
   `t = (y − 90px) / 810px` within ±1 at every sample (oklab inversion,
   `evidence/t52-oklab-check.py`), and contradict body-box sizing by
   ~3× (body-box predicts rgb(172,56,53) at y=850; measured (47,39,41)).
   With `background-repeat: repeat` (the default, confirmed computed),
   the 900px tile then repeats down the whole 2798px page — the fade
   restarts from bright red at every 900px boundary.

So the authored percentages mean the opposite of what they say: "10%"
is 90px (not 280px), "100%" is the fold bottom (not the page bottom).

## Downstream drift (consequences of the same cause)

- The `#about` section paints its OWN dark gradient
  (`linear-gradient(#252528, #18181B)`, z-index 1 — found live) — a
  manual patch that covers the tiled canvas for its stretch and
  introduces a third dark value (gradient end #252528 vs about/footer
  #18181B vs nav fade end #191919).
- The fixed nav's scroll-fade (`nav-scroll-fade`: hold red to 22%,
  #252528 to 85%, #191919 at full scroll; timeline `scroll(root)`) was
  tuned for the INTENDED full-page fade. Against the actual
  viewport-tiled canvas, nav and background drift apart mid-scroll:
  the nav holds red until ~scroll 417 while the canvas below the fold
  is already past its fade.
- The oklab interpolation itself is NOT the bug — it parses and
  renders (computed background-image confirms `in oklab` is active).

## Proposed fix (applied 2026-11-01)

- The home fade paints on `body.home-page::before` — an absolute layer,
  ONE VIEWPORT tall (`height: 100vh` / `100svh`), carrying the same
  oklab gradient; the layer scrolls with the content (not fixed), which
  is what the nav timeline assumes. `body.home-page` carries
  `background: #252528` — the shorthand CLEARS the base gradient's
  background-image (a color-only override would leave the tile painting
  beneath), killing the repeat for the whole page.
- The `#about` patch gradient STAYS: with the fade capped at the fold,
  the real fade does not pass beneath the about — the patch is no longer
  a workaround but the about's own ground, fading into the footer's
  #18181B seamlessly (measured: page 1400→2798 sweeps clean).
- The nav-scroll-fade keyframes retuned to the restored geometry:
  0% #d73735 → 22% #8c3733 (the fold blend at the 22% scroll position,
  oklab-derived) → 47% #252528 (the fold has scrolled past — 900/1898)
  → holds #252528 to 100%. Measured nav at 0/25/50/75/100% scroll:
  red / rgb(128,53,50) / #252528 / #252528 / #252528 — tracking the
  body's fade.

## Acceptance criteria

- [x] Left-edge pixel sweep at scroll 0/880/1400/1898: NO red restart
      below the fold; the fold's fade curve identical to pre-fix; flat
      ≈#252528 beneath; the about ground fades into the footer
- [x] Nav vs body at 0/25/50/75/100% scroll: tracks the fade (deltas
      above); no drift
- [x] #about's ink still ≥4.5 on its ground (light ink #e6f2ff,
      unchanged)
- [x] Index axe ZERO; box-audit + edge-audit CLEAN (7 content pages);
      lint + format pass

## Design decision (the open question, resolved in the build)

The fade spans the FIRST VIEWPORT and the flat brand dark carries the
rest of the page — NOT a page-length fade. Evidence: the fold's current
curve is the design (identical before/after, measured); the about's
patch proves the about area is meant to sit on ≈#252528 dark; and the
nav comment's own rule ("the darkest stretch never passes under the
nav"). The fade's length is now ONE value (`height: 100vh/100svh` on
`body.home-page::before`) — Pedro can lengthen the fade by changing
that one declaration.

---

# Ticket 53: Cards sit within the container — no bleed (DR-0009 amendment)

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "remove the -28px
  margin from cs-cards, just have width be 0px, so it sits within the
  bleed")
- Size: S
- Type: UI + system
- Pages: every card grid (ecommerce, teachr meta hero, closet, coupon
  hero, the styleguide's demos)
- Status: DONE 2026-11-01 — measured: card boxes at edge + 0 (was − 28),
  card text at edge + 28, in-card bullet lists at + 41 (inset + bullet
  indent — the audits' new rules); summaries still at − 28 (bleed kept);
  both audits updated (box-audit: cs-card → TEXT_EDGE_BOXES + in-card
  dot expectation edge + 28; edge-audit: card text +28, card bullets
  +41) and CLEAN; axe zero on all touched pages at 1440 + 390; lint +
  format pass. Evidence: `evidence/t53-measure.json`, `t53-axe.json`,
  captures `t53-{sports-ecommerce-redesign,styleguide}-{1440,390}.png`.

## Review

`.cs-cards .cs-card` carried `margin: 16px (-$cs-indent)` — the box
bled one indent step into each gutter (324–1116 at 1440) with 28px
padding, so its TEXT landed back on the text edge. Removing the bleed
margin puts the card box on the text column (302–1138); its text then
sits inset 28px within the plate — the same inside-a-plate pattern as
the chips (text at edge + 33 inside their plate, ticket 41).

## Requirements

- `.cs-cards .cs-card`: `margin: 16px 0` — the box spans the text
  column; padding stays 28 (the card's own inner padding); the text
  sits at edge + 28 inside the plate.
- DR-0009 amendment: cards join the bullet components INSIDE the
  container (chips t39, cs-plain t39, now cards). Summary, quote
  groups, cols keep their bleed (unchanged).
- box-audit: `cs-card` moves to TEXT_EDGE_BOXES (per-class expected
  edge, the ticket-39 mechanism).
- edge-audit: card body text allowed at edge + 28 ± 2 (the plate's
  padding — the chips' +33 rule, generalized).
- Styleguide: the "Bleed example — card" demo loses its subject (cards
  no longer bleed) — the bleed example switches to the `.cs-summary`
  box (still bleeding); the intro copy's "boxes that bleed" wording
  updated to name cards as inside-the-container.

## Acceptance criteria (agent-checkable)

- [ ] Card box left edge == text edge ± 2 on ecommerce/teachr/closet at
      1440 + 390 (was text edge − 28)
- [ ] Card text at edge + 28 ± 2 (the plate inset)
- [ ] Summary/quote groups/cols STILL on the bleed edge (unchanged)
- [ ] box-audit + edge-audit updated + CLEAN; axe zero (1440 + 390);
      lint + format pass; captures

## Open questions

- None.

---

# Ticket 54: Timeline text 8px off the dot — h3/p padding

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "for the cs
  timeline component, add 8px left padding to the heading element and
  the paragraph elements so they are not so close to the timeline dot")
- Size: S
- Type: UI
- Pages: all with timelines (ecommerce, teachr, closet, fashion) + the
  styleguide's demo — one component fix
- Status: DONE 2026-11-01 — h3/p `padding-left: 8px` live; dot→text gap
  10px on EVERY timeline li on 5 pages at 1440 + 390 (was 2px); the
  edge-audit's +8 rule covers P/H3 and plain LI steps (workflow);
  audits CLEAN; axe zero (ecommerce + styleguide, both widths).
  Evidence: `evidence/t54-verify.json`.

## Requirements

- `.cs-timeline li h3` and `.cs-timeline li p`: `padding-left: 8px` —
  the dot→text gap becomes 10px (26px dot + 8), in step with the
  component spacing (8pt scale).
- No geometry beyond the padding: the dot (ticket 51's 14.5px centering)
  and the connector (44.5px) are untouched.

## Acceptance criteria (agent-checkable)

- [x] Dot→text gap = 10px ± 1 on every timeline li — 5 pages, 1440 + 390
      (measured: 10 everywhere)
- [x] edge-audit: timeline text at edge + 8 ± 1 (new rule; plain li
      steps included after the workflow flags) + CLEAN
- [x] box-audit CLEAN; axe zero (1440 + 390); lint + format pass

## Open questions

- None.

---

# Ticket 55: Timeline h3 top margin 4px — dot follows

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "update the h3
  top margin to 4px so it better aligns with the timeline number")
- Size: S
- Type: UI
- Status: DONE 2026-11-01 — h3 margin 4px; dot margin 16.5px, connector
  46.5px; centering held ±1 on every timeline li across 6 pages at
  1440 + 390; connector gap 4px; audits CLEAN; axe zero. Evidence:
  `evidence/t55-verify.json`.

## Review

The h3's 2px top margin is part of ticket 51's dot-centering math (the
dot's `margin-top: 14.5px` = title text center 28.5 − 13). Raising the
h3 to 4px moves the title's text center down 2px (to ~30.5) — so the
dot AND the connector must move with it or the number floats 2px high
again: dot margin 14.5 → 16.5, connector top 44.5 → 46.5 (the 4px gap
below the dot preserved).

## Requirements

- `.cs-timeline li h3`: `margin: 4px 0 4px` (was `2px 0 4px`).
- `.cs-timeline li::before`: `margin-top: 16.5px` (ticket 51's
  measured centering, + 2).
- `.cs-timeline li::after`: `top: 46.5px` (16.5 + 26 + 4 — the same
  4px gap).

## Acceptance criteria (agent-checkable)

- [ ] Dot center vs title's first text line center within ±1px on
      every timeline li (5 pages, 1440 + 390)
- [ ] Connector keeps the 4px gap below the dot
- [ ] edge-audit + box-audit CLEAN; axe zero (1440 + 390); lint +
      format pass

## Open questions

- None.

---

# Ticket 56: Timeline h3 top margin +4 more — 8px total

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "add 4px more to
  that rule" — amends ticket 55)
- Size: S
- Type: UI
- Status: DONE 2026-11-01 — h3 margin 8px; dot margin 20.5px, connector
  50.5px; centering held ±1 on every timeline li across 6 pages at
  1440 + 390; connector gap 4px; audits CLEAN; axe zero. Evidence:
  `evidence/t56-verify.json`. Superseded same day by ticket 57.

## Requirements

- `.cs-timeline li h3`: top margin 4px → 8px; the dot + connector
  followed (+ 4): dot 20.5px, connector 50.5px.

## Acceptance criteria (agent-checkable)

- [x] Dot center vs title's first text line center within ±1px on
      every timeline li (6 pages, 1440 + 390)
- [x] Connector keeps the 4px gap below the dot
- [x] edge-audit + box-audit CLEAN; axe zero; lint + format pass

---

# Ticket 57: Timeline h3 top margin — 12px total

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "actually make
  it 12px" — amends ticket 56)
- Size: S
- Type: UI
- Status: DONE 2026-11-01 — h3 margin 12px; dot margin 24.5px, connector
  54.5px; centering held ±1 on every timeline li across 6 pages at
  1440 + 390; connector gap 4px; audits CLEAN; axe zero. Evidence:
  `evidence/t57-verify.json`.

## Requirements

- `.cs-timeline li h3`: top margin 8px → 12px.
- The dot + connector follow (ticket 55's rule, + 8 from the 55 state):
  dot margin-top 16.5 → 24.5px, connector top 46.5 → 54.5px — centering
  held ±1, the 4px connector gap preserved.

## Acceptance criteria (agent-checkable)

- [x] Dot center vs title's first text line center within ±1px on
      every timeline li (6 pages, 1440 + 390)
- [x] Connector keeps the 4px gap below the dot
- [x] edge-audit + box-audit CLEAN; axe zero; lint + format pass

---

# Ticket 58: Timeline h3 — margins removed

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "remove margins
  from the timeline h3's, that seems to solve it" — amends tickets
  55–57; the margin-nudging approach is abandoned)
- Size: S
- Type: UI
- Status: DONE 2026-11-01 — h3 `margin: 0`; dot re-centered 12.5px
  (the ±1 split across viewport glyph-snapping, the ticket-51
  compromise); connector 42.5px (the 4px gap); centering ±1 on every
  timeline li across 6 pages at 1440 + 390; audits CLEAN; axe zero.
  Evidence: `evidence/t58-verify.json`.

## Review

Tickets 55–57 nudged the h3's top margin (2→4→8→12) with the dot
following each time — the chase never converged visually. Removing the
margins is the stable fix: the title sits flush in its grid cell, and
ticket 51's centering math runs on a clean baseline (no margin term).

## Requirements

- `.cs-timeline li h3`: `margin: 0` (was `12px 0 4px`).
- The dot re-centers on the margin-free title: dot `margin-top: 12.5px`
  (title text center = 8px h3 padding + 3px inline-box offset + half
  the 31px text box ≈ 26.5px at 1440; the 390 glyph-snap is −2, so
  12.5 splits the two widths within ±1 — the ticket-51 compromise).
- The connector follows: `top: 42.5px` (12.5 + 26 + 4 — the same 4px
  gap).

## Acceptance criteria (agent-checkable)

- [x] Dot center vs title's first text line center within ±1px on
      every timeline li (6 pages, 1440 + 390)
- [x] Connector keeps the 4px gap below the dot
- [x] edge-audit + box-audit CLEAN; axe zero; lint + format pass

## Open questions

- None.

---

# Ticket 59: Timeline h3 — `margin: 4px 0`, final state

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "give it
  margin: 4px 0; and leave it at that" — supersedes ticket 58's
  margin: 0)
- Size: S
- Type: UI
- Status: DONE 2026-11-01 — h3 `margin: 4px 0`; dot 16.5px, connector
  47.5px; centering ±1 on every timeline li across 6 pages at
  1440 + 390; connector gap 4px; audits CLEAN; axe zero. Evidence:
  `evidence/t59-verify.json`. FINAL state of the rule.

## Requirements

- `.cs-timeline li h3`: `margin: 4px 0`.
- The dot + connector follow (ticket 51's rule, + 4 from the 58 state):
  dot `margin-top: 16.5px`, connector `top: 47.5px` — the 4px connector
  gap preserved.

## Acceptance criteria (agent-checkable)

- [x] Dot center vs title's first text line center within ±1px on
      every timeline li (6 pages, 1440 + 390)
- [x] Connector keeps the 4px gap below the dot
- [x] edge-audit + box-audit CLEAN; axe zero; lint + format pass

---

# Ticket 60: Timeline dot alignment — ROOT CAUSE + the grid fix

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: "It's still not
  aligning. I think it's something ::before is doing. Identify the root
  cause of why the timeline h3's wouldn't align with the timeline
  numbers")
- Size: S
- Type: UI + system
- Status: DONE 2026-11-01 — fix applied + measured: dot vs title ≤1px
  at 1280/1440/1536/768 on ecommerce/workflow/teachr (was ±2-3 drifting
  by width); the two 390 outliers are wrapped-title steps (the dot
  centers on the title block — the documented pattern); audits CLEAN;
  axe zero; lint + format pass. Evidence: `evidence/t56-verify.json`
  (the fix-test numbers) + this ticket's criteria.

## Root cause (identified, measured)

The `::before` is a grid item; tickets 51–57 positioned it with a FIXED
`margin-top`. But the title's rendered glyph-box position SNAPS ±2-3px
with viewport width (the browser rounds the line box / font metrics per
layout): the same margin measured **−1px at 1440 and +2px at 390**, and
other widths drift differently — a fixed margin is a per-viewport GUESS.
Each of tickets 51/55/56/57 aligned the width it was tuned at and
drifted everywhere else — the chase could never converge.

The proof method (why the earlier "±1 verified" claims were vacuous):
the earlier checks computed the dot's position from the same layout
model the CSS uses — the model agreed with itself. The painted-pixel
ground truth (forcing the dot lime/cyan per li and scanning the
screenshot) showed the real offsets: +1.7px low at 1440, ~2px high at
390, and a ±2-3px snap across UNTESTED widths — Pedro's window hit a
worse one.

## The fix (grid-computed, no magic number)

- `.cs-timeline li::before`: **`margin-top: 0; align-self: center;
z-index: 1`** — the grid centers the dot on the title's row EXACTLY
  (the h3's margins/paddings are symmetric, so its box center = its
  text center): measured **0.7px at 1280/1440/1536/390/768** on three
  pages — viewport-independent by construction.
- `.cs-timeline li:not(:last-child)::after`: `top: 40px` — with the
  dot's `z-index: 1` the connector's top hides BEHIND the dot at any
  geometry (1-line and wrapped titles), so the fixed top stops
  mattering; the line still runs to the next dot.
- Wrapped titles (2-line at 390): the dot centers on the title BLOCK —
  the standard centered-marker pattern; documented, accepted.

## Acceptance criteria (agent-checkable)

- [x] Dot vs title center ≤ 1px on every 1-line timeline li at
      1280/1440/1536/390/768 (3 pages: worst 0.7px)
- [x] Wrapped-title steps: the dot centered on the title block
- [x] The connector visible below the dot, hidden behind it above
      (z-index 1 on the dot)
- [x] edge-audit + box-audit CLEAN; axe zero; lint + format pass

## Open questions

- None.

---

# Ticket 61: Image runs — N images side by side, captions below (the "Mobile Web — How it started" pattern)

- Part of: `plan-bullets-cards.md` (Pedro, 2026-11-01: reference slide
  "Mobile Web - How it started" — three phone screenshots side by side,
  a caption under each)
- Size: M
- Type: UI + system + copy
- Status: DONE 2026-11-01 — `::: shots` shipped + tested: 3 image lines
  → 3 figures in one flex row (1440/768), wrapped/stacked at 390, each
  with its alt-text caption below; `[frame:]` works as a shot; the lone
  image → showcase path unchanged (render diff vs HEAD's renderer on
  the current content: EMPTY — note: Pedro's in-flight ecommerce md
  copy edits are in the tree, untouched); the double-wrap bug the
  first implementation had (the img+figcaption pass re-wrapped shot
  figures) fixed with an offset guard. The styleguide demo (3 real
  thumbs in a `cs-wide--full` band) renders, images load, axe zero at
  1440 + 390; audits CLEAN (cs-shots in the full-bleed exempt lists);
  doc-sync OK; lint + format pass. ALSO: Pedro amended `.cs-summary`
  himself (bleed removed, `margin: 32px 0; padding: $cs-indent`) — the
  box-audit now expects it on the text edge (TEXT_EDGE_BOXES).

## Review (what exists)

- A single image + caption renders through `![alt](src)` + a following
  `[caption:]`/`[point:]` → the `.cs-showcase` figure (full-bleed,
  caption centered below).
- There is NO markdown syntax for a ROW of images with PER-IMAGE
  captions: `::: showcase` renders ONE figure; `::: columns` carries
  prose columns. The slide pattern (N images, each with its own caption
  below) is not expressible — it would need raw HTML today.

## Requirements

- **New container `::: shots`**: one image per line; the image's ALT
  TEXT is its caption below; images render side by side (flex, equal
  widths, 16px gap), wrapping when narrow (each shot ≥ 240px), stacked
  on phones. The row is a full-bleed-tier band (the showcase rule).
- `[frame: Label]` placeholders work as shots (the "no asset yet"
  state).
- **CSS**: `.cs-shots` (flex, gap 16) + `.cs-shot` figures (img full
  width, radius 8, caption = the showcase's caption style, centered).
- **AUTHORING.md**: document `::: shots` with a renderable example AND
  the photo workflow (see below). Doc-sync gate covers the new type.
- **Audits**: `cs-shots` into the full-bleed exempt lists (box-audit)
  - DISPLAY_CTX (edge-audit).
- **Styleguide**: the Components block gains a shots demo (3 real
  thumbs with captions).

## The photo workflow (Pedro's "how do I add photos?")

1. Drop the photo into `src/_images/case-studies/<page>/` — the
   imagemin task copies/optimizes `src/_images/**` → `build/images/**`
   (verified pipeline); name files descriptively
   (`mobile-web-before.jpg`).
2. Reference it in the markdown: `![Caption text](../images/case-studies/<page>/mobile-web-before.jpg)`
   — the caption IS the alt text (also what screen readers say).
3. A lone image + caption: the same line + nothing else → the showcase
   figure. Three (or more) side by side: wrap the lines in
   `::: shots` … `:::`.
4. No asset yet: `[image: label]` (placeholder frame) or a `[frame:]`
   inside `::: shots`.

## Markdown example (the slide, executable)

    ## Mobile Web — How it started | How it started | mobile-web-start

    ::: shots
    ![Before we started, the colours were very heavy, elements very
    close together, and the elements were very sharp.](../images/case-studies/mobile-compare/before.jpg)
    ![Elements were also inconsistent in spacing, like in this case
    where we used a 3rd party which clashed with the rest of the
    experience.](../images/case-studies/mobile-compare/menu.jpg)
    ![Elements were very sharp, and claustrophobic. Content such as
    images and text were also not well proportioned.](../images/case-studies/mobile-compare/after.jpg)
    :::

## Acceptance criteria (agent-checkable)

- [x] `::: shots` with 3 image lines renders 3 figures in one flex row
      (3 across at 1440 and 768, stacked at 390), each with its
      alt-text caption below
- [x] `[frame:]` inside shots renders the placeholder frame as a shot
- [x] doc-sync OK (shots in AUTHORING.md == renderContainer)
- [x] box-audit + edge-audit updated + CLEAN; axe zero (the styleguide
      demo, 1440 + 390); lint + format pass
- [x] The styleguide demo renders with real thumbs + captions

## Open questions

- None.

---

# Ticket 45: Hero component for visuAI and the styleguide — adapted variants

- Part of: `plan-bullets-cards.md` (Pedro, 2026-10-31: "add case study
  hero for visuai and styleguide, but adapt them accordingly — i.e.
  visuai no background just container, not case study kicker but
  adapted")
- Size: M
- Type: UI + copy
- Extends: DR-0014 (one hero component, three variants → this adds a
  fourth: the adapted bare hero)
- Pages: `/workflow/` (visuAI), `/styleguide/`
- Status: DONE 2026-11-01 — workflow hero carries the adapted eyebrow
  ("The visuAI Workflow" default copy — Pedro can veto), computed hero bg
  transparent, eyebrow ink #E34A47 (the theme's lifted red), full DR-0014
  gap set 16/24/24 measured at 1440 + 390. Styleguide "Heroes" subsection:
  ALL FOUR variants demoed on real classes — bare, meta, cover (container
  width via a documented `#styleguide_container`-scoped adaptation),
  mid-page `::: hero` (real secondary-hero h2 rendering; its byline line
  is omitted from the demo — the muted ink token measures 4.46 on the
  guide's light ground, under the 4.5 floor). DR-0014 amended with the
  fourth variant. Verified 2026-11-01: evidence `t45-workflow-gaps.json`,
  `t45-heroes-verify.json`, captures `t45-heroes-casesystem-*.png`,
  `t43-styleguide-*.png`.

## Context

After ticket 44 the hero component has one spacing/type set across
three variants (cover, meta, mid-page `::: hero`). Two more places
need it, each ADAPTED rather than copied:

1. **visuAI** (`/workflow/`): the hero is a bare `header.cs-hero` with
   NO kicker — the page jumps straight to the h1. It should carry the
   hero component's full structure with an ADAPTED eyebrow: no
   "Case Study" kicker (this page is not a case study), no background
   (the dark ground is the hero's ground — `background: transparent`,
   the spotlight above carries it), the DR-0014 spacing/type roles
   (already live since ticket 44).
2. **styleguide**: the case-system block has NO hero documentation at
   all — the hero (the first component on every case-study page) is
   undocumented. Add a "Heroes" subsection demoing the variants with
   the real classes.

## Requirements

### visuAI hero

- Add the adapted eyebrow: kicker text is NOT "Case Study" — default
  proposal: "The visuAI Workflow" (final copy: Pedro, open question);
  styled with the shared `.cs-eyebrow` role, the page's lifted red
  (#e34a47-family, axe-verified on the dark ground).
- No background: the hero stays transparent on the dark ground (no
  full-bleed cover box, no `--pink/--teal`-style variant class).
- The DR-0014 spacing/type roles hold (already verified post-t44);
  the eyebrow addition must keep the gaps on-scale (eyebrow → h1 = 16).

### styleguide "Heroes" subsection

- Demo the hero VARIANTS with real classes and real spacing:
  - the adapted bare hero (visuAI-style: transparent, adapted kicker)
  - the meta hero (`cs-hero--meta` with metrics)
  - a cover variant — ADAPTED for the guide: the full-bleed 100vw box
    cannot render inside the guide's container, so the demo shows the
    cover's structure (eyebrow/h1/summary/details, white-on-color ink)
    at container width, with a note that the real cover spans the
    viewport (`padding: 64px 48px`, 100vw technique, DR-0014)
- Document the variant map: cover (full-bleed, colored) / meta
  (in-flow, KPIs) / adapted bare (transparent, any ground) / mid-page
  (`::: hero` in markdown) — and which ink each carries.
- Rides ticket 43's a11y + real-markup rules (no fake spans).

## Acceptance criteria (agent-checkable)

- [x] `/workflow/` hero: eyebrow present (NOT "Case Study"), computed
      background transparent, gaps on the DR-0014 set (eyebrow→h1 16,
      h1→summary 24, summary→details 24) — measured at 1440 + 390
      (evidence: `evidence/t45-workflow-gaps.json`)
- [x] Eyebrow ink passes axe on the dark ground (zero violations on
      /workflow/ at 1440 + 390 — evidence: `evidence/t45-workflow-gaps.json`)
- [x] `/styleguide/` heroes subsection: all FOUR variants render with
      real component classes — bare (flat title, eyebrow→title 16),
      meta (KPIs), cover (red ground at container width, adaptation
      stated in the demo text, 100vw neutralized via documented
      `#styleguide_container` scope), mid-page `::: hero` (real h2
      secondary-hero rendering, h2→subtitle 24); axe: zero
      color-contrast at 1440 + 390, one pre-existing heading-order
      flag from the LEGACY steammobile demo (see ticket 43 — Pedro's
      call). Evidence: `evidence/t45-heroes-verify.json` +
      `evidence/t45-heroes-casesystem-{1440,390}.png`
- [x] DR-0014's variant list extended with the adapted bare hero
- [x] box-audit + edge-audit CLEAN; lint + format pass; captures
      (`evidence/t43-styleguide-{1440,390}.png` full page)

## Open questions

- visuAI kicker copy ("The visuAI Workflow" default) — owner: Pedro.
- Cover demo in the guide: container-width structure demo (recommended)
  vs a scaled full-bleed demo — owner: Pedro, vetoable.

---

# Ticket 62: The design system page (/styleguide/) gets the visuAI / Design system tab strip

- Part of: `plan-bullets-cards.md` (Pedro's eval pass 2026-11-14: "Add the visuAI and Design system tab to the design system"). This RESCOPES visualbear-system Ticket 4 ("retire /styleguide/") per Pedro's instruction: the page stays public AND becomes a second host of the two-tab system - recorded in DR-0015.
- Size: M
- Type: UI + system
- Status: DONE 2026-11-14 - evidence in specs/md-case-study-editor/evidence/t62-verify.md + t62-\*.png captures

## Context

/workflow/ hosts the tab strip (tabs.nunjucks) with two panels (`data-vb-panel="visuai"` = workflow hero + content, `"designsystem"` = the styleguide blocks), default tab visuAI, body class pair `workflow-page`/`vb-system-light` swapped by tabs.js. /styleguide/ today renders only the styleguide blocks, no strip (`hasTablist: false`, measured 2026-11-14).

## Requirements

- `src/styleguide/index.nunjucks` restructures to the same two-panel host: a visuAI panel (the workflow article: `site.data.pages['workflow'] | mdhero/mdpage`, wrapped like /workflow/'s) and a Design system panel (the existing five styleguide blocks, `intro.content({ title: "Design system" })`), plus the strip via `tabsm.content({ id: "vb-system", label: "visualbear system views", active: "designsystem", tabs: [{id:"visuai",label:"visuAI"},{id:"designsystem",label:"Design system"}] })` rendered into the designsystem panel's `[data-vb-strip-host="designsystem"]`.
- Initial state on /styleguide/: Design system active - panels carry the matching `hidden`, buttons `aria-selected`, body class `vb-system-light` via `{% block bodyattrs %}`.
- tabs.js: initial state reads the strip's spec instead of hardcoding the default - `core.init((spec && spec.active) || core.DEFAULT_TAB)` (spec parse hoisted out of the try). /workflow/ passes `active: "visuai"`, so its behavior is unchanged; `tabs.test.js` (core-only contract) unaffected.
- The existing tabs.scss hooks do the rest: `body.vb-system-light` re-inks the strip for the light ground and hides `#workflow_container`; `#styleguide_container { padding-top: 48px }` already applies. Demo images on /styleguide/ stay eager (no lazyDemo, per the ticket-38 recorded decision for the standalone page).
- Exactly one visible h1 per state (each panel owns its hero); keyboard arrows/Home/End work via the existing controller.

## Acceptance criteria (agent-checkable)

- [ ] /styleguide/ at 1440 + 390: `[data-vb-tablist]` present, two tabs "visuAI" and "Design system"; default visible panel = designsystem (styleguide content), body class `vb-system-light`, exactly one visible h1
- [ ] Clicking "visuAI" on /styleguide/: body class flips to `workflow-page`, workflow panel visible, design panel hidden, strip relocated into the visuAI panel's host, aria-selected follows; clicking back reverses it. Arrow-key navigation wraps (existing controller)
- [ ] /workflow/ unchanged: default tab still visuAI, body `workflow-page`, both panels swap as before (regression capture)
- [ ] `npm test` 5/5 (tabs.test.js contract holds), `npm run build` exit 0 (mirror+guard), eslint 0 errors, prettier clean on touched files; captures t62-styleguide-default-_.png, t62-styleguide-visuai-_.png, t62-workflow-regression-\*.png

## Out of scope

- Retiring or redirecting /styleguide/ (superseded by Pedro's instruction), the strip's visual design, panel content beyond wiring the existing blocks.

## Open questions

- None

---

# Ticket 63: Design system copy cleanup - no em dashes, lists over paragraphs, less copy, AI tags on agent-drafted text

- Part of: `plan-bullets-cards.md` (Pedro's eval pass 2026-11-14: "Clean up the Design System text, especially the AI generated content: Remove em dashes, more lists, less running paragraphs, less copy overall, AI Tag")
- Size: M
- Type: copy
- Status: DONE 2026-11-14 - evidence in specs/md-case-study-editor/evidence/t63-verify.md + t63-\*.png captures

## Context

The five styleguide blocks (`src/styleguide/_styleguide_blocks/*.nunjucks`, rendered by BOTH /styleguide/ and /workflow/'s Design system panel) carry em dashes in rendered text (casesystem block: ~15), running paragraphs (intro, modules, containers, casesystem prose), and lorem ipsum in demo specimens. Copy rule (AUTHORING.md / DR-0008): no em dashes anywhere; agent-drafted copy is marked with the AI tag (`<div class="ai-mark">✦ AI-drafted</div>` in nunjucks blocks - dev-only chip, stripped in production, which then warns loudly until Pedro rewrites).

## Requirements

- Em dashes: every rendered "—" in the five blocks becomes "-" or restructured (demo labels like "Headline — h2, 28.8px / 700" become "Headline: h2, 28.8px / 700"). HTML/nunjucks comments left as-is (never rendered).
- More lists, less running paragraphs: the guide prose paragraphs (intro purpose paragraph, modules lead, containers lead, casesystem "Width tiers"/"Vertical rhythm"/"Heroes"/"Type roles" lead-ins) convert to short `<ul>` lists of 2-5 items; each list item one fact.
- Less copy overall: intro trimmed to hero summary + index list + built-using list + one-line purpose; lorem ipsum demo paragraphs cut to a single short line each (they are style specimens, not content); Pedro's own voice copy (containers' Text Container identity paragraph) is NOT rewritten, only kept as-is.
- AI Tag: every block section whose copy an agent drafted in this pass gets `<div class="ai-mark">✦ AI-drafted</div>` at its end (dev chip only; production strips + warns per the DR-0006 guard). Demo specimen markup (swatches, ladders, shot runs, heroes) is not copy - no tag on pure specimens, but the descriptive labels around them count.
- No em dashes remain in rendered output of /styleguide/ and /workflow/ design panel: `grep` the built HTML for "—" in those pages = 0 matches outside comments/scripts.

## Acceptance criteria (agent-checkable)

- [ ] `grep -c "—" build/styleguide/index.html build/workflow/index.html` = 0 (em dash gone from rendered design-system text; note: md-sourced visuAI panel may still carry its own markers - scoped out, workflow.md already has its own [ai] tags)
- [ ] ai-mark divs present in the dev build of the touched sections; production build strips them and the guard warns (expected, per DR-0006/DR-0008 - Pedro rewrites)
- [ ] Captures t63-styleguide-\*.png at 1440 + 390 show the list-ified sections; demo specimens (swatches, headings ladder, buttons, footer, shots, heroes) still render complete
- [ ] Visual regression: section count/ids unchanged (#core, #modules, #containers, #casesystem anchors intact - intro index links still resolve)
- [ ] Gates: `npm run build` exit 0 (mirror+guard), `npm test` 5/5, eslint 0 errors, prettier clean on touched files (note: src/\_data/pages and .nunjucks are excluded from the repo format script; blocks stay hand-formatted consistently)

## Manual test steps (Pedro)

- /styleguide/ (or /workflow/ -> Design system tab): sections read as short lists, no em dashes, less text overall; on the dev server the rewritten sections show the "✦ AI-drafted" chip until you rewrite them in your voice

## Out of scope

- workflow.md (the visuAI panel copy) - already carries its own [ai] marks from phase 2; Pedro's rewrite queue. Demo specimen internals (lorem stays as a specimen only where a style demo needs text, trimmed).

## Open questions

- None
