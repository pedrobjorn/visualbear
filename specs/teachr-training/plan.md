# Plan: Teachr training case study — content & structure update (summary-PDF portfolio)

- Date: 2026-11-09
- Status: reviewed — decisions recorded 2026-11-09 (DR-0001, DR-0002), ready for build
- Evidence: pasted summary-PDF draft text (portfolio export, pages 03–09); current `src/_data/drafts/teachr.txt` + `src/_data/pages/teachr.md` (stub-heavy, both pending images)

## Problem / opportunity

The live `/teachr/` case study is a skeleton: metrics read "WIP - results pending" and design sections are empty image slots. The PDF portfolio export carries the finished copy — outcomes with real numbers, before/after comparisons, registration walkthrough, assistant, completion, AI-workflow story. The site version needs that content, structured for a summary-PDF portfolio.

## Goal

`src/_data/drafts/teachr.txt` holds the full PDF content in authoring format → regenerated `src/_data/pages/teachr.md` via `visuai-text-to-md`, verifiable live at `/teachr/` and usable as the summary-PDF source.

## Non-goals

- No shell/template changes (`src/teachr/index.nunjucks` untouched), no new components.
- No changes to the `teachr-agent` companion page beyond the existing Related link.
- No image processing beyond listing requested assets (H2) — files are placed only when supplied.

## Content & structure spec

Copy source: `src/_data/drafts/teachr.txt` (DR-0003 flow). PDF chrome stripped: page numbers, "Portfolio · Pedro Björn · Lead Product Designer" running headers, "Redesigning the learning experience" repeats. Format mapping per AUTHORING.md / `teachr.txt` Key block. Proposed section order:

1. **Head (hero front matter)** — keep `variant: teal`; eyebrow/title switch to Quizrr (DR-0001), summary per PDF; `Details` keeps the current site byline; agent shebang becomes a Project-meta footnote (DR-0002). Update `Needs`/`Takeaway` to match the new content scope (design system + workflow, not vibe-coded mockups).
2. **Outcomes & Impact** — 4-value metrics block (Key rule 6): `-80% | Customer support issues`, `+20% | Started training after registering`, `~3% | Increase in completion rate`, `x4 | Delivery speed of new features`, plus the `*** medium confidence` footnote. Replaces the current "WIP - results pending" slot.
3. **Problem & Goal** — low-digital-literacy participants, little lesson time, registration errors; the challenge/goal paragraph pair from the draft.
4. **Registration, step by step** — timeline (`1. Step` lines): native tongue → worker ID with hard validation → full option lists per step → back-step auto-advance → verification step. Plus Before/After compare panels: **Before:** long single page, confusion and errors · **After:** split steps, smoother experience.
5. **Training library** — courses as a list (replacing stacked carousels / mixed scroll actions); lesson card contents (time, questions, summary, status); locked-until-complete behaviour.
6. **Lessons** — video-first intro + mid-lesson videos; single unified page (Before/After: redundant jumps → one page with question review); centered narrow column for focus and device parity; scroll-to-next-question button.
7. **Teachr Assistant** — AI chat support for questions about answers/progress/wrong flags; guardrail: calibrated to not give right answers.
8. **Feedback & reviewing** — Before/After: binary correct/incorrect → clearer feedback, two wrong picks emphasise the right answer; easy review of answers and videos.
9. **Completion** — stats + closure + saved-answers assurance; keep the honest caveat that this page "isn't special yet" and more work is planned.
10. **AI-workflow & Design System** — spec-first → agents → design system as foundation → Playwright visual review → refine loop; purely in code, no Figma; design-system consistency at low agent effort.
11. **Project meta + footnotes** — 1-week build, weaker-but-sustainable model vs frontier model note; footnotes: \* NDA mock approximation, \*\* 2026 October vs previous-year October, \*\*\* medium confidence, \* agent shebang (GLM-5.3 Flash line — see open questions).

Format notes: strings starting with number/%/x in `value | label` runs become the metrics block; `**Before:/​**After:` runs become compare panels; numbered lines become the timeline; no em dashes anywhere (copy rule); any copy I draft beyond the PDF source carries `[ai]`.

## Foundational checks

Applied from `visuaibear-core/foundational-heuristics.md`: H1 — this plan touches only draft/page/spec files; no deletions. H2 — asset requests table below, batched question sent, pending assets block their section. H3 — uncertainties batched below, answers recorded here on return.

## Asset requests (assignment OCR-verified 2026-11-09)

OCR (macOS Vision) over all 17 curated assets replaced the first-pass dimension guesses; every `![]()` below is now content-identified, not inferred. All files sit in `src/_images/work/fullsize/teachr/` (sanitized names, originals untouched on the Desktop).

| Asset (OCR content)                                                            | Section                     | Tier (DR-0004) |
| ------------------------------------------------------------------------------ | --------------------------- | -------------- |
| `teachr_logo.png`                                                              | Hero meta                   | existing       |
| `frame-181.png` — registration steps 1–5 (language, Worker ID, age, education) | Registration                | full-bleed     |
| `screenshot-…10.04.30-2-1.png` — training library, desktop, locked lessons     | Training library            | full-bleed     |
| `screenshot-…10.08.03-2.png` — training library, mobile                        | Training library            | tall/narrow    |
| `screenshot-…10.48.57-1.png` — avatar pop-out (details / settings / log out)   | Training library            | default        |
| `screenshot-…11.06.28-1.png` — settings screen                                 | Training library            | tall/narrow    |
| `frame-184.png` — lesson questions + Watch video                               | Lessons                     | full-bleed     |
| `screenshot-…10.01.57-2.png` — question, desktop                               | Lessons                     | tall/narrow    |
| `screenshot-…10.08.19-2.png` — question, mobile, submit                        | Lessons                     | tall/narrow    |
| `screenshot-…10.08.53-2.png` — question, mobile, scroll-to-next button         | Lessons                     | tall/narrow    |
| `screenshot-…10.01.42-2.png` — assistant chat pop-out ("Need a hand?")         | Quizrr Assistant            | default        |
| `screenshot-…10.02.56-2.png` — question with right-answer emphasis             | Feedback                    | tall/narrow    |
| `screenshot-…11.46.30-1.png` — lesson-complete stats, desktop                  | Completion                  | full-bleed     |
| `screenshot-…11.46.12-1.png` — lesson-complete stats, mobile                   | Completion                  | tall/narrow    |
| `frame-187.png` — design system type scale + motion tokens                     | AI-workflow & Design System | tall/narrow    |

Surplus provided, not slotted (near-duplicates by OCR): `screenshot-…10.04.30-2.png`, `screenshot-…10.02.06-2.png`, `screenshot-…10.05.22-1.png`. They stay in the folder; slot or drop them when the PDF pages get final curation.

## Breakdown

- [x] Ticket 1 — Merge pasted PDF content into `src/_data/drafts/teachr.txt` per the structure spec above (chrome stripped, only supplied copy; previous draft preserved as `teachr.txt.bak`)
- [x] Ticket 2 — Run `visuai-text-to-md` on the draft; regenerate `src/_data/pages/teachr.md`; verify gates PASS (front-matter ✓, em-dash ✓, 9 image refs resolve ✓, 95/95 source lines accounted ✓)
- [x] Ticket 3 — Place supplied images into `src/_images/work/` (fullsize; 17 curated files copied from `Desktop/Teachr Study` with sanitized names)
- [x] Ticket 4 — Visually verify `/teachr/` via `visuaibear-prototype`; Pedro re-checks the image↔section mapping first-try guesses and PDF rendering
- [x] Ticket 5 — Restructure per the pasted figma case-study structure: registration intro restored, "Avatar menu" its own detail section (`Detail` eyebrows, ids stable), related desktop/mobile captures grouped into `::: shots` runs, gaps: none structurally missing (3 surplus near-duplicates stay unslotted, listed above)
- [x] Ticket 6 — Image-run rule in the converter (`specs/text-to-md/DR-0004.md` + `draft-to-md.js` + skill [rule] 6b): 2+ consecutive un-captioned `![alt](src)` lines → one full-bleed `::: shots` band — the mechanism that made the grouping derivable instead of hand-edited

## Open questions

| Question                                                                                                                                                                                          | Owner | Blocks build?                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------ |
| Brand: the PDF draft says "Quizrr"; the site uses "Teachr (mock brand)". Which name runs through this page?                                                                                       | Pedro | **Answered (DR-0001):** Quizrr copy; `/teachr/` route and filenames kept                                     |
| Byline/agent line: current site line or the PDF's line + GLM-5.3 Flash footnote?                                                                                                                  | Pedro | **Answered (DR-0002):** merged — current byline + agent footnote                                             |
| Which of the 8 detail assets are already exported, and from which folder?                                                                                                                         | Pedro | **Answered:** all in a folder — **folder path still needed from Pedro** to unlock asset placement (Ticket 3) |
| Metrics pairing: `-80% customer support, +20% started-after-registering, ~3% completion increase, x4 delivery speed` the intended value↔label pairing? (source order scrambled by PDF extraction) | Pedro | **Answered:** yes, as listed                                                                                 |
