# Plan: The visualbear system - one view, two tabs; robot replaces the floating bear

- Date: 2026-11-12
- Status: draft
- Evidence: Pedro's request 2026-11-12 (this spec change IS the requirement; no analytics/research attached - ASSUMPTION: the two reference views are under-used because they are split and hard to point at)

## Problem / opportunity

Two sibling reference views tell one story in two places:

- visuAI (`/workflow/`) - the agentic design workflow, dark ground + spotlight, mirror-only, content from `src/_data/pages/workflow.md`.
- Styleguide (`/styleguide/`) - the design system, light ground, hand-written blocks in `src/styleguide/_styleguide_blocks/`.

A visitor pointed at one cannot discover the other, and neither page names what they together are: the visualbear system. Separately, the mirror's floating 🐻 link (`scripts/release-mirror.js`, `visuaiLinkFor()`) reads as a bear in a product story about AI, and it paints BEHIND page surfaces: it is `position:fixed` with no z-index, so any `z-index: 1` layer (`.foot`, `#about` - both with opaque backgrounds) covers it as you scroll.

## Goal

One view - **the visualbear system** - whose hero carries a tab strip near the top switching between **visuAI** and **Design system** (content, ground and title all follow the active tab); and a floating robot link on `/selected-works` pages that always sits above every page surface.

## Non-goals

- No rewrite of the visuAI content (`workflow.md`) or the styleguide blocks - they move/regroup, copy stays Pedro's (the two renamed strings below are the only copy changes).
- No markdown-format changes; `AUTHORING.md` and the text-to-md pipeline are untouched.
- No changes to the public home, case studies, or the 404.
- No custom robot artwork in this pass - the replacement is a unicode glyph matching how the bear shipped (see DR-0003; an SVG can be an asset request later).

## Approach

Merge the two views into one page at the existing `/workflow/` URL, with a tab strip in the hero. Rejected alternatives and the full reasoning: DR-0001 (route), DR-0002 (visibility), DR-0003 (robot placement).

### How the merge works (evaluation summary)

- **Route:** keep `/workflow/` as the canonical URL. Both source pages already live at depth 1, so every relative asset path (`../images/...`) stays valid the moment the styleguide blocks render inside `/workflow/`. No route renames, no mirror-script href rewrites beyond the one the robot change needs anyway. A new `/system/` route was considered (clearer name) and rejected: it strands the existing `/workflow/` references (release-4.0 mirror hrefs, DR-0007) and buys nothing the eyebrow + tab labels can't say.
- **Visibility:** the merged page inherits the strictest of its two halves - mirror-only. Per-tab visibility (design system public, visuAI in the mirror) was rejected: a client-side tab pair is one DOM read away from leaking, and DR-R4-0002's whole posture is that gated content lives behind the air-lock, not inside it. Consequence: the public `/styleguide/` route disappears - flagged as Pedro's call (open question 1).
- **Grounds:** the two tabs keep their own grounds (visuAI keeps the dark ground + spotlight; Design system keeps the light ground) because the design system's previews are built against the light page. Both looks are already expressed as body-scoped classes (`body.workflow-page`, `#styleguide_container`), so the tab toggles a body class - the nav already re-skins off that same class.
- **Tabs:** a real tab widget (`role="tablist"`, two `role="tab"` buttons, arrow-key roving focus, `aria-selected`, panels as `role="tabpanel"`) - not the `buttonslider` molecule, which is prev/next pagination, not tabs. Tab labels sit on the hero's ground, so on the dark tab they take the page's contrast-tested inks (white label, active state `#E34A47`-lifted red at 4.5:1, muted `#A6ADB8` at 7.8:1 - all measured against `#18181B` in `_case-study.scss`).
- **Active tab default:** visuAI (the page's current identity and the mirror robot's destination).

### Robot instead of bear (evaluation summary)

One-line change in `visuaiLinkFor()` plus a z-index: emoji `\uD83D\uDC3B` → `\uD83E\uDD16` (🤖), `z-index: 3` (above the nav's 2 and the content surfaces' 1; it lives bottom-left, it never overlaps the 48px nav row), `title`/`aria-label` updated to the merged view, class `bear` → `robot`. Full reasoning: DR-0003. Plus Pedro's 2026-11-12 addendum (DR-0004): the public index gets the robot too, as a decorative unlinked span - the mirror injector strips it so page copies stay one-robot. Full reasoning: DR-0003. This ticket is independent of the merge and can ship first.

## Asset requests (foundational heuristics, H2)

| Asset | Position in design                | Min size / format | Status             |
| ----- | --------------------------------- | ----------------- | ------------------ |
| -     | Unicode 🤖 glyph, no asset needed | -                 | provided (unicode) |

If Pedro later wants a brand-consistent robot mark (SVG, robot-with-bear-ears?) it becomes a pending asset blocking the visual polish pass on the floating link - not the z-index/behaviour work.

## Foundational checks

Applied from `visuaibear-core/foundational-heuristics.md`: H1 - no destructive ops without instruction: retiring the `/styleguide/` route deletes `src/styleguide/` (its blocks are re-homed first, and the deletion is explicitly gated on open question 1). H2/H3 - uncertainties batched below under Open questions; nothing in the robot ticket blocks on them.

## Breakdown

- [x] Ticket 1 - Robot on the mirror: swap the floating bear for a robot above every surface
- [x] Ticket 2 - Tab shell: the hero's tab strip switching grounds and content
- [x] Ticket 3 - Design system tab: move the styleguide blocks in, rename to Design system (2026-11-12, delivered by amended ticket 6: the panel renders the styleguide PAGE - blocks + own hero + pinned light ground; placeholder route retired)
- [ ] Ticket 4 - Retire `/styleguide/`, wire the references (gated on open question 1)

## Amendment pass 2026-11-12 (Pedro's six follow-on items)

Review feedback on the shipped tab shell + robot, spec'd as amendments
and four new tickets (5-10). Facts measured 2026-11-12, listed per ticket.

| #   | Item                                                   | New ticket | Amends                  |
| --- | ------------------------------------------------------ | ---------- | ----------------------- |
| 1   | Tabs touch the header (0px gap measured at 1440 + 390) | T5         | T2                      |
| 2   | Design system tab = the styleguide page, same styling  | T6         | T3 (and effectively T4) |
| 3   | Tab adapts to the (light) styleguide context           | T7         | T2                      |
| 4   | Mirror nav stays in the walled garden                  | T8         | -                       |
| 5   | Mobile gallery background cut-off                      | T9         | -                       |
| 6   | Robot touch target + hover label                       | T10        | T1                      |

Open question 1 note: ticket 6 effectively answers it - once the
styleguide page lives inside the merged view, the public `/styleguide/`
copy is redundant. Ticket 4's gate stays until Pedro confirms.

## Amendment pass 2026-11-12b (Pedro's mirror review - three regressions)

Tickets 11-13, background and decisions in DR-0005. Measured on the
built mirror the same day: design panel inside the case-study column
(512px image cap, dark-ground instances leaking), robot pill flex-shrunk
to a 28px sliver, About a page visit instead of the site's in-page
anchor behavior.

## Open questions

| Question                                                                                                                                                                                              | Owner | Blocks build?                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------- |
| 1. The merged page is mirror-only (DR-0002) - does the public site lose `/styleguide/` on purpose? If the design system should stay public, the shape changes (see DR-0002) and Ticket 4 is rescoped. | Pedro | Tickets 3–4 only (Ticket 1 ships regardless) |
| 2. Tab labels: "visuAI" and "Design system" as drafted - Pedro's voice may want different strings.                                                                                                    | Pedro | No (labels are one-line swaps)               |
| 3. Default tab on arrival: visuAI (recommended - the page's current identity) or Design system?                                                                                                       | Pedro | No                                           |

## Amendment pass 2026-11-13 (Pedro's mobile eval - 360-375, Firefox Android)

Measured evidence: evidence/mobile-eval-2026-11-13.md. Facts measured on
the Nov-12 build: the nav row fits 360 EXACTLY (Contact box right edge =
the viewport edge, zero slack), the tab strip's "Design system" label
wraps into two lines at both 360 and 375, and the about paragraphs'
rhythm is bare `<br>` line boxes (23px each) with one gap flush (0px).
No document-level horizontal overflow was measured anywhere at 360/375 -
"looks zoomed out" = the wrapped/misaligned strip, not page width.

| # | Item                                                                                                                        | New ticket                    | Amends |
| - | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------ |
| 1 | Header nav overflows on Firefox Android at ~360: exact-fit budget + a nonstandard text-size-adjust pair (root-cause ASSUMPTION, needs on-device validation) | T21 (fix is budget-safe)      | -      |
| 2 | Design System tab wraps to 2 lines inside the strip (also Chrome Android): nowrap labels + a compact strip envelope at small widths | T22                           | T2, T7 |
| 3 | About paragraphs: uniform gap instead of bare `<br>`; dead inline scroller handlers removed in the same markup              | T23                           | -      |
| 4 | JS disposition (inventory in the evidence file): tabs init and countup KEEP; smooth scroll replaceable by CSS                | T24 (optional, gated)         | -      |
