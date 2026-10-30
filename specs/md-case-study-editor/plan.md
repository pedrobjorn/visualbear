# Plan: Markdown authoring for case studies

- Date: 2026-10-29
- Status: phases 1-3 shipped (2026-10-29) - all tickets closed

## Next up (queue, agreed 2026-10-29 — this section is the live handoff)

1. [x] **Commit the work** — done 2026-10-29, commit `a8866d2` on `host-branch` (32 files, not pushed)
2. **Pedro rewrites AI-drafted copy** — 7 `[ai]` markers on `/workflow/`, 1 on each Teachr page; rewrite in own voice, delete markers. **Rule: only Pedro removes `[ai]` markers — agents never delete or add them.**
3. **Pedro visual pass** over the 7 migrated pages (workflow, teachr, teachr-agent, digital-closet, fashion-rebrand, sports-ecommerce-redesign, resume) — machine-verified pixel-identical, not human-reviewed.
4. [x] **Production build** — done 2026-10-29: `npm run build` (note: the task also starts watch/BrowserSync and never exits — let tasks finish, then kill; build/ is gitignored). Verified: zero `ai-mark` occurrences in `build/` (stripping works), all pages present. **Publish** itself still pending Pedro's review of `build/` + his publish flow.
5. **Backlog (phase 4, not started)** — migrate remaining hardcoded pages (about, art-ent, adhops, blog, steam-mobile, projecto-lynx, play, climate-clock); wire `mdmeta` frontmatter into shells' `<head>`; PDF download links on case studies; regenerate resume PDF (diverges by em-dashes).

## Next up added 2026-10-29: QA checks (see `tickets-phase3.md`)

- [x] Ticket 13 — Semantic HTML audit + fixes (all 7 content pages, generator-side; pixel-identical)
- [ ] Ticket 14 — Accessibility audit via axe-core on built pages (evidence for the visuaibear-review A11y gate)
- [x] Ticket 15 — Prettier (2.x, Node 10) + lint wired into npm (`format`, `format:check`, `lint`)
- [ ] Ticket 16 — Resume: role bullet lists stick out 14.4px left of the text column (verified; analysis in `tickets-phase3.md`)

(Note: 7 content pages exist, not 8 — count in older tickets was wrong.)

- Evidence: user request ("easy way to work in markdown for case studies") — ASSUMPTION, needs validation on scope of "editor"

## Problem / opportunity

Case-study pages are the core portfolio content, but only some are markdown-driven. Authoring a new case study today means knowing the pipeline conventions (which live only as comments in `gulp/markdown-render.js`) and hand-wiring a nunjucks page. Four original case studies exist only as PDFs in `src/case-studies/`.

## Goal

Adding or editing a case study = writing one markdown file in `src/_data/pages/` and seeing it live in the browser, with zero template work for standard layouts.

Measured by: a new case study goes from `.md` file to published page with no edits outside `src/_data/pages/`.

## What exists (audited 2026-10-29)

- **Transform pipeline** — `gulp/markdown-render.js`: `mdPage` (case studies/workflow) and `mdResume` (resume). marked + regex post-processing. Documented md conventions: `# Title` → hero, first paragraph → cover summary, short para before first `##` → cover details, `## Section` → section block + eyebrow, `1.` → timeline, `-` → fact chips, `>` → pull quote, tables → card grids, raw HTML passes through.
- **Filter wiring** — `gulp/nunjucks.js` registers `mdpage` / `mdresume` as nunjucks filters. Working.
- **Content files** — `src/_data/pages/`: `teachr.md`, `teachr-agent.md`, `workflow.md` (via `mdpage`), `resume.md` (via `mdresume`).
- **Dev loop** — gulp watch + BrowserSync + nunjucks rebuild: edit `.md`, page refreshes. This is the current "editor".
- **Source material** — 4 PDFs in `src/case-studies/` (My Closet Digital Closet, Redesigning Fashion eCommerce, Redesigning Sports Ecommerce, Redesigning ecommerce coupon experience).

## What's left

- Case-study pages `digital-closet`, `fashion-rebrand`, `sports-ecommerce-redesign` (and any others) are not markdown-driven — content is in nunjucks shells, not `_data/pages/*.md`.
- The 4 PDF case studies have no md pages at all.
- Authoring conventions exist only as code comments — no author-facing guide.
- No frontmatter/meta support (hero image, SEO title, etc. are derived by convention or hardcoded in the shell).
- No in-browser markdown editor UI. (Candidate non-goal — see below.)

## Non-goals

- **In-browser WYSIWYG/markdown editor UI.** The dev loop (edit file → BrowserSync refresh) already gives live preview; a custom editor UI is high-cost, low-marginal-value for a single author. Revisit only if authoring moves off this machine.
- CMS or database backend. Files stay in git.
- Changing the visual design of case-study pages — content migration only.

## Approach

Codify the authoring contract first (conventions doc + frontmatter decision), then migrate pages one at a time so each migration is verifiable against its current rendered output. Rejected alternatives: building a local editor app (see non-goals); migrating everything in one pass (unverifiable, high blast radius on live pages).

## Breakdown

- [x] Ticket 1 — Write the authoring guide (`docs/` or repo root) from the conventions in `markdown-render.js`; make it the single source of truth → `AUTHORING.md`
- [x] Ticket 2 — Decide + implement optional frontmatter (title/meta override) or formally reject it → DR-0002, `mdmeta` filter added
- [x] Ticket 3 — Migrate `digital-closet` to `_data/pages/digital-closet.md` + thin shell; diff rendered output against pre-migration → shipped, structure diff clean (whitespace/entity/comment-only deltas, visually identical)
- [x] Ticket 4 — Migrate `fashion-rebrand` (same pattern as Ticket 3) → shipped, structure diff clean (whitespace/entity-only deltas)
- [x] Ticket 5 — Migrate `sports-ecommerce-redesign` (two case studies on one page; includes restoring the `{% extends %}` line the WIP had dropped) → shipped, structure diffs clean on all three
- [x] Ticket 6 — Reconciled: all four PDF case studies already have live pages (the coupon deep-dive is case study 2 inside `sports-ecommerce-redesign`). Optional follow-up: link each page's original PDF as a download — a visual change, so out of scope here.

Build-log findings (2026-10-29): `nunjucks.js` was missing the import for the
filters (fixed); `mdPage` crashed on `slugify` undefined (fixed); card bodies
leaked `<td>` tags (fixed); marked 0.3.19 merges ol+ul across one blank line
(authoring rule added to `AUTHORING.md`); `.md` files were not watched by the
dev server (fixed in `gulp/watch.js`). The resume page was still wired to
`_resume_blocks/*.nunjucks` — now renders `resume.md` via `mdresume`,
pixel-identical to the block-based build.

## Decision records

- DR-0001 — The markdown conventions are the authoring contract (not a nunjucks concern)
- DR-0002 — Optional frontmatter is added for hero/meta overrides
- DR-0003 — Section overrides (`## H2 | Eyebrow | id`), renderer-scoped list classes, raw HTML for bespoke blocks, hero stays in shell for custom variants
- DR-0004 — Raw HTML extracted before marked, spliced back via placeholders

## Open questions

| Question                                         | Answer (Pedro, 2026-10-29)                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Migrated pages pixel-identical or light cleanup? | Pixel-identical — rendered HTML must diff clean against the pre-migration build                                   |
| Frontmatter for hero images / SEO meta?          | Yes — implement per DR-0002                                                                                       |
| 4 PDF case studies as live pages?                | Yes — author md pages, each linking the original PDF as download                                                  |
| AI-attribution marker on the visuai page?        | Yes — subtle marker on AI-written content (hero, quotes, first section); marker also recorded in the md (DR-0006) |

## Phase 2: The visuAI page (revised 2026-10-29 per DR-0007)

> First pass targeted the wrong page (visualbear) — reverted in full
> (shell restored via git, `visualbear.md` deleted). Target: `/workflow/`,
> the visuAI page.

- [x] Ticket 7 (rev) — AI-attribution marker: clearer placement (inline/above container), visuAI page only → `tickets-phase2.md`
- [x] Ticket 8 (rev) — Wire `src/workflow/` to its existing `workflow.md` (pixel-identical)
- [x] Ticket 9 (rev) — "How we work" (content workflow) section + AI marks on hero/quotes/first section

- DR-0004 — Raw HTML extracted before marked, spliced back via placeholders
- DR-0005 — Pure-markdown content files; container/directive syntax for visual components
- DR-0006 — AI-attribution marker (SUPERSEDED by DR-0007 — was aimed at the wrong page)
- DR-0007 — AI tag: visuAI page (`/workflow/`) only; inline/above-container label, not a corner chip

## Phase 3: Remaining wiring + image syntax (added 2026-10-29)

- [ ] Ticket 11 — Wire the Teachr pages to their markdown (see `tickets-phase2.md`): both shells hardcoded, md files exist; add the missing Outcomes section to `teachr.md`, move the workflow snippet from the shells into the md; pixel-identical
- [ ] Ticket 12 — Image syntax: placeholders + real images in markdown (spec below)

### Ticket 12 spec: image syntax in markdown

Content pages need images without raw HTML. Two cases:

1. **Placeholder (no image yet)** - a directive: `[image: label]` renders a
   styled placeholder block consistent with the existing `cs-frame`
   "pending" frames (e.g. "Mobile Web, final mockup pending"). Optional
   `| tall` variant matches `cs-frame--tall`. Replaces the raw-HTML frames
   currently hardcoded in the md files.
2. **Real image** - standard markdown `![alt](src)` stays passthrough;
   optionally rendered as the `cs-showcase` figure with the caption from
   `[caption: text]` when present.

Requirements:

- Renderer support for `[image: label | tall]` and `[caption: text]`
- Styling consistent with the design system (no new tokens)
- Documented in AUTHORING.md; used to de-raw-HTML the existing md files

Acceptance criteria:

- [ ] `[image: label]` renders the placeholder frame; `| tall` variant works
- [ ] Real markdown images pass through and render
- [ ] Guide documents both; existing raw-HTML frames in the md files replaced
- [ ] Passes `visuaibear-review` gates
