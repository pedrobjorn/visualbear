# Plan: Bullets and card/text alignment unification across case studies

- Date: 2026-10-31
- Status: draft — open questions for Pedro at the bottom
- Reference set (Pedro, 2026-10-31): `sports-ecommerce-redesign`, `teachr`, `digital-closet`
- Evidence: renderer audit (2026-10-31, `node` render of all 5 md-driven
  pages), `src/_styles/templates/_case-study.scss` (r1280), existing
  `evidence/edge-align.json` + `axe-align.json` (Ticket 23)

## Problem / opportunity

The alignment system itself is already unified and verified: DR-0009
(one text edge, bleeding boxes, full-bleed tier) is edge-audit-clean on
all 7 pages. What is NOT unified is the **list system** and a set of
**component gaps** the reference set exposes:

1. **The same markdown renders as two different components depending on
   context — by renderer accident, not decision.**
   - Section-level `- item` → `ul.cs-facts` fact chip (plate, bleed,
     dot 8px before text).
   - The identical `- item` inside `::: cards`, `::: columns` or
     `::: compare` → bare `<ul>` (plain dot on the edge, text +8px, no
     plate), because `renderFlow` renders container bodies with a fresh
     `marked.Renderer()` while top-level lists get `listRenderer()`.
   - Usage across the reference set: ecommerce = 8 chip lists / 47 chip
     items, in-card lists plain; closet = 1 chip list (Ideation), column
     lists plain; teachr = 1 chip list (Research findings).
2. **Chip geometry is hard-coded and asymmetric**: `.cs-facts li::before`
   sits at `left: 20px; top: 23.5px` (magic numbers), and the chip's
   padding is `14px 20px 14px $cs-indent` — text can overrun the right
   text edge by 8px while the left is exact. Cards/cols use symmetric
   `$cs-indent`.
3. **AUTHORING.md documents a container that does not exist**:
   `::: quotes full` renders `<!-- unknown container: quotes -->` — the
   quote silently disappears (reproduced 2026-10-31). Ticket 18d settled
   that `quotes` is not a container type; the guide never caught up.
4. **Section-level closing summary has no markdown syntax.**
   `[summary:]` only works inside `::: hero` containers. Both ecommerce
   (cs-note + Takeaways twocol) and closet (cs-summary) carry
   commented-out raw HTML for exactly this — and those comments ship in
   the built HTML.
5. **No quote-byline syntax.** `.cs-byline` exists (hero containers
   only); ecommerce's quote byline ("- E-commerce Department") is inline
   quote text.
6. **Dead CSS**: `.cs-pullquote` and `.cs-steps` are never emitted by any
   renderer path (audit across all 5 pages).
7. **Boxes spill the viewport at 768–~791 — on ALL case-study pages**
   (Playwright probe, 2026-10-31): at 768 every bleeding box
   (`.cs-card`, `.cs-facts li`, `.cs-summary`, `.cs-col`) renders at
   −12…780 on a 768 viewport → 12px horizontal scroll; at 780 → 6px;
   clean from 800. Cause: the 28px `$cs-indent` bleed exceeds the
   container's 16px side inset in the window between `$break-medium`
   (767) and where `.container`'s auto margins grow past 28px (~791).
   DR-0009's "never touch the viewport edge" was verified at 390 only —
   the 768 band was never measured. Fashion matches ecommerce and
   teachr EXACTLY at 1440/1024 (boxes 324–1116 / 116–908): the
   wide-viewport geometry is not the difference.
8. **Fashion-specific spill: the `::: table` overflows on mobile**
   (`fashion-rebrand.md` line 145, the only `::: table` in the repo):
   `table.cs-table` min-content width is 496px on a 390 viewport →
   106px horizontal scroll (fashion@390 `scrollWidth` 496 vs ecommerce
   and teachr, both clean at 390). Ecommerce's markdown tables never
   render as tables (mdPage converts them to card grids), so the
   references never hit this; fashion's container-level table has no
   overflow handling. At 768 the table itself is fine (it spans 0–768
   inside its `cs-wide--full` wrapper) — the 768 spill there is finding 7.
9. **Near-edge below 767**: boxes sit 4px from the viewport edge at
   480–767 (probe: teachr chip box [4, 763] at 767, [4, 476] at 480)
   — violates ticket 18c's "no box within 8px of the viewport edge".
10. **Tool gap that let both ship**: `tools/edge-audit.py` measures text
    elements only (p/li/headings/quotes) — no `<table>`, no box
    outlines, no `scrollWidth` check. Both spills are invisible to it.

### Addendum 2026-10-31 (webapp-testing run on fashion, teachr, resume)

11. **Chip bullets violate the ticket-19 bullet rule — on every
    case-study page** (fashion 22 chips, ecommerce 26, teachr 3, closet
    2). Measured at 1440: the chip's dot sits at 344 — 8px LEFT of the
    text edge (352), in the gutter — and the chip text sits ON the edge
    (0 indent). Pedro, 2026-10-31: "the bullets still don't indent but
    spill out of bleed". Ticket 19's rule is the opposite: dot ON the
    text edge, text +8px. The plain bullets in fashion's `::: columns`
    DO comply (dot 352, text 360) — so the two bullet treatments on the
    same page disagree by 8px. Ticket 25 (revised) unifies: dot at
    `$cs-indent` inside the plate (= the text edge), text +8, symmetric
    36px padding; the plate keeps its approved bleed.
12. **Annotation dots escape their box (fashion only — the only page
    with `[point:]`s)**: the dot rect measures 336–344 while its panel
    plate spans 352–1088 — the dot floats 16px OUTSIDE the panel box,
    visually "spilling out of the container". At 768 the annotation dot
    lands at 0–8 — ON the viewport edge. Markers may hang in the open
    section gutter (DR-0009) but never outside a box. Ticket 33.
13. **Resume: flush lists (dot-leak claim CORRECTED).** A re-measure
    with rendered pseudo-element checks disproved the dot leaks: the
    name/contact/download pseudo-elements are `display: none` — ticket
    22a's exclusion HOLDS in the built DOM. The earlier 0px/157px/300px
    "gaps" were a probe artifact (it read ::before geometry without
    checking display). The real, confirmed issue: content lists sit
    FLUSH — `margin-top` 0, measured gap above every content ul = 0px
    (they touch the preceding title row; only the 9.6px li margin gives
    air). Pedro: "resume bullets have no spacing". Ticket 34 (revised:
    rhythm only + a rendered-pseudo regression check).

## Build batch 1 (2026-10-31, approved by Pedro: "yes fix these")

Scope: tickets 24, 25, 30, 31, 33, 34 — the unified bullet geometry
(chip rules applied to general bullets: dot ON the text edge, text +8,
lists/plates on the bleed edge), the spill fixes (table, 768–791 band),
and the audit tooling. Reference-set application to the non-reference
pages (fashion-rebrand, workflow, teachr-agent) happens through the
shared system + the full 7-page audit sweep, since all pages render
from the same components.

**Ticket 31 implementation decision (recorded here, verified by
measurement):** DR-0009's "reduced bleed below $break-small" was never
implemented — one rule (box = text edge − 28px) runs at every width;
at 390 boxes sit 4px from the viewport edge, at 768–791 they cross it.
Rather than per-component breakpoint surgery, the fix enforces the
invariant **text edge ≥ 36px (28px bleed + 8px viewport margin) at
every viewport** by bumping the shared text-box padding in the two
narrow bands (≤767: 32→36; 768–839: 16→36). One rule, no component
changes, the full-bleed tier stays safe everywhere.

## Goal

One bullet system and one box system, defined by the reference set, that
every current and future case-study page gets by default — measured by a
renderer unit audit (component per context), the edge-audit tool, and
axe staying at zero violations.

## Non-goals

- No new visual design for chips or cards — the reference look IS the
  target; we codify it.
- Timeline / annotation markers unchanged (gutter hang, DR-0009).
- Phase-4 page migrations, frontmatter→head, PDF links (existing backlog).
- `resume.md` — Pedro's in-flight edit; untouched.
- Content-component adoption (metrics/note/point on teachr/closet) —
  content choices, not system gaps.

## Approach

Codify the reference behavior as a rule (DR-0010), make it explicit in
the renderer and the authoring guide, then close the component gaps
(summary, byline, dead CSS). Rejected alternative: rendering chips inside
boxes too (plate-in-plate, no reference page does it, doubles visual
noise); and removing chips in favor of plain bullets (contradicts all
three references).

## The unified rule (from the references)

- `- item` at **section level** → fact chip (plate, dot 8px before text).
  All three references use this for standalone point lists.
- `- item` **inside a box** (card, col, panel) → plain bullet: dot on the
  text edge, text +8px, no plate. Ecommerce card lists, closet column
  lists.
- `1. step` → numbered timeline everywhere (both contexts).
- `* item` (new) → plain bullet list at section level — the explicit
  opt-out when a list should not be a chip.

## Breakdown

- [ ] Ticket 24 — Renderer: plain-bullet syntax + list-context rule (`*` vs `-`)
- [ ] Ticket 25 — Chip geometry unified with the bullet rule (dot on the text edge, text +8) — REVISED 2026-10-31
- [ ] Ticket 26 — `[summary:]` directive at section level + migrate commented raw HTML
- [ ] Ticket 27 — Quote byline syntax
- [ ] Ticket 28 — Dead CSS removal (`.cs-pullquote`, `.cs-steps`)
- [ ] Ticket 29 — AUTHORING.md sync + doc-sync gate
- [ ] Ticket 30 — Fashion `::: table` mobile overflow (spills 106px at 390)
- [ ] Ticket 31 — Bleed vs container inset: kill the 768–791 spill band, restore the 8px viewport margin
- [ ] Ticket 32 — Box-audit tool: measure boxes, tables and horizontal overflow (closes the tool gap)
- [ ] Ticket 33 — Annotation dots stay inside their box (fashion `[point:]`s)
- [ ] Ticket 34 — Resume: unmark name/contact/download lists, add list rhythm

## Open questions

| Question                                                                                                                    | Owner | Blocks build?            |
| --------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------ |
| Ecommerce "KPIs" and "Key issues" lists: confirm they stay chips (reference look)                                           | Pedro | No (default: chips)      |
| Migrate the commented-out cs-summary / cs-twocol blocks into rendered content (changes live pages), or delete the comments? | Pedro | Ticket 26 migration half |
| Quote bylines wanted? (ticket 27 builds the syntax either way)                                                              | Pedro | Ticket 27 adopt half     |
