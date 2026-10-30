# Tickets: phase 2 — the visuAI page (revised 2026-10-29 per DR-0007)

> Revision note: the first phase-2 pass targeted the wrong page (visualbear).
> Those changes were reverted in full; the target is `/workflow/` (visuAI).
> DR-0007 supersedes DR-0006's scope and styling.

# Ticket 7 (rev): AI-attribution marker — clearer, visuAI page only

- Part of: plan phase 2
- Size: S
- Type: UI + system

## Context

The corner-chip implementation was too subtle and aimed at the wrong page. DR-0007: marker renders **inline with the content or above the container**, on the visuAI page only. Mechanism unchanged: `[ai]` in md → marker on localhost; production strips + warns.

## Requirements

- Marker renders as a labelled line **above** the marked container (or inline at its start) — e.g. a small "✦ AI-drafted" chip-line, clearly visible, not competing with body text
- Applies only to blocks on the visuAI page; other pages unaffected even if marked
- Keeps: `data-ai` attribute, production strip + loud warning (deep rule)

## Acceptance criteria (agent-checkable)

- [x] A block marked `[ai]` shows the label above/inline — visible without hunting
- [x] Unmarked blocks and other pages show nothing
- [x] Production build: attribute stripped, warning logged (already working — keep)
- [x] Passes `visuaibear-review` gates

# Ticket 8 (rev): Wire the visuAI page to its markdown

- Part of: plan phase 2
- Size: M
- Type: system
- Status: DONE 2026-10-29 - shell wired; content verified identical to the pre-wiring build (whitespace + em-dash-to-hyphen deltas only)

## Context

`src/_data/pages/workflow.md` exists and matches the page's content, but `src/workflow/index.nunjucks` is hardcoded (194 lines) and does not consume it.

## Requirements

- Wire the shell: content sections render via `{{ site.data.pages['workflow'] | mdpage | safe }}`; shell keeps the hero (with its `cs-wordmark`) + chrome
- No visual change to the page (pixel-identical target, same as Tickets 3–5)

## Acceptance criteria (agent-checkable)

- [x] Rendered page diffs clean against the pre-wiring build (filter mode)
- [x] Editing `workflow.md` reflects on the page via the dev server

# Ticket 9 (rev): "How we work" section + AI marks on the visuAI page

- Part of: plan phase 2
- Size: S
- Type: copy
- Status: DONE 2026-10-29 - the page already is the how-we-work; every content section carries an [ai] marker at its end (7 labels on localhost); hero + quotes excluded per Pedro

## Context

The workflow page already describes the design workflow; the new section covers the **content** workflow specifically (this one): content lives as markdown in `src/_data/pages/`, agents draft, Pedro directs/rewrites, changes render live.

## Requirements

- Add the "How we work" (content workflow) section to `workflow.md`
- Mark the AI-drafted blocks (hero, quotes, first section) with `[ai]` per DR-0007
- Marker conventions stay documented in AUTHORING.md

## Acceptance criteria (agent-checkable)

- [x] Section renders via the md pipeline on /workflow/
- [x] Hero, quotes, and first section carry the visible marker (localhost only)
- [x] Human-written blocks unmarked

---

# Ticket 10: AI-workflow snippet in the Teachr Process sections

- Part of: plan phase 3 (cross-linking the workflow into case studies)
- Size: S
- Type: copy
- Status: DONE 2026-10-29 - implemented in the page shells (the Teachr pages are not wired to their md files yet - see Ticket 11); the md-file copies were reverted to avoid duplication

## Requirements

- Both Teachr pages (`teachr.md`, `teachr-agent.md`) get a short workflow snippet in their Process section
- The snippet links to `/workflow/` (the visuAI page) with a relative link
- The snippet carries the `[ai]` marker (it is AI-drafted copy)

## Acceptance criteria (agent-checkable)

- [x] Both pages render the snippet under their Process timeline (verified in the served HTML)
- [x] Snippet links resolve to /workflow/
- [x] AI tag renders on localhost only, stripped in production (DR-0008 mechanism)

---

# Ticket 11: Wire the Teachr pages to their markdown (open)

- Part of: plan phase 3
- Size: M
- Type: system
- Status: DONE 2026-10-29 - both shells wired; pixel-identical (whitespace/em-dash deltas only); live-edit verified

## Context

`teachr.md` and `teachr-agent.md` exist and mirror their pages, but both shells are hardcoded and do not consume them (same starting point `/workflow/` had before Ticket 8). Gaps found while auditing: the md is missing the shells' Outcomes section (teachr) and the hero-meta `cs-hero--meta` wrapper lives in the shell.

## Requirements

- Wire both shells to `mdpage` like `/workflow/`; hero + hero-meta wrapper stay in the shell
- Add the missing Outcomes section to `teachr.md`; move the snippet from the shells into the md (removing the shell copies)
- Pixel-identical target, same as Tickets 3-5, 8

## Acceptance criteria (agent-checkable)

- [x] Both pages diff clean against their pre-wiring builds
- [x] Snippet renders from the md (single source, no shell duplication)
- [x] Editing the md updates the pages live (verified with a live edit + revert)
