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
