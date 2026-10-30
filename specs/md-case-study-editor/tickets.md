# Ticket 1: Write the markdown authoring guide

- Part of: specs/md-case-study-editor/plan.md
- Size: S
- Type: copy
- Status: DONE 2026-10-29 — guide at `AUTHORING.md` (repo root)

## Context

The md → page conventions exist only as comments at the top of `gulp/markdown-render.js`. Authors can't be expected to read build code. DR-0001 makes the guide the contract.

## Requirements

- Guide lives at repo root or `docs/authoring.md` (pick one, link from README)
- Documents every convention verbatim from `markdown-render.js`: `# Title` → hero, first paragraph → cover summary, short para before first `##` → cover details, `## Section` → section block + eyebrow, `1.` → timeline, `-` → fact chips, `>` → pull quote, tables → card grids, raw HTML passthrough
- Includes one minimal worked example (a full small case-study md file)
- States the resume variant (`mdresume`) conventions separately: `### Role — [Company](url) | dates`, `**Sub-title**` → h4.sub-title

## Acceptance criteria (agent-checkable)

- [x] Every transform in `mdPage` and `mdResume` has a corresponding guide line — no undocumented transforms (guide grew to cover the container/directive syntax per DR-0005)
- [x] The worked example renders without raw markdown leaking into the HTML output (verified in the renderer test run)
- [x] Guide links to specs/md-case-study-editor/DR-0001.md`

## Open questions

- None

---

# Ticket 2: Decide on optional frontmatter for hero/meta overrides

- Part of: specs/md-case-study-editor/plan.md
- Size: S
- Type: system
- Status: DONE 2026-10-29 — implemented per DR-0002 (Pedro: yes to frontmatter)

## Context

Hero title/summary/details are derived by position convention. SEO titles, hero images, and page meta can't be expressed in md today. Open question in the plan: does this stay convention-driven?

## Requirements

- If implementing: support a minimal frontmatter block (--- delimited) parsed in `renderMarkdown` before marked; keys used only for shell/meta injection, never rendered as body content
- If rejecting: record DR-0002 superseding the default and update the guide (Ticket 1) to say where meta lives

## Acceptance criteria (agent-checkable)

- [x] Decision recorded as DR-0002 (either outcome)
- [x] If implemented: a page with frontmatter renders with body identical to the same page with frontmatter stripped; meta values available to the shell via the `mdmeta` filter (verified — shell `<head>` wiring is left to each page's shell, which keeps hardcoded titles for now)
- [x] If implemented: frontmatter block never appears in rendered output (verified)
- [x] Guide updated to match (AUTHORING.md frontmatter section)

## Open questions

- Resolved 2026-10-29: Pedro chose "Yes, add frontmatter".

---

# Ticket 3: Migrate `digital-closet` to markdown-driven content

- Part of: specs/md-case-study-editor/plan.md
- Size: M
- Type: system
- Status: DONE 2026-10-29 — content in `src/_data/pages/digital-closet.md`, shell wired to the mdpage filter; later reworked pure-markdown per DR-0005

## Context

`src/digital-closet/` (or its nunjucks source) holds content inline; the md pipeline and `mdpage` filter are already working (see `src/_data/pages/teachr.md` as the pattern).

## Requirements

- Content moves to `src/_data/pages/digital-closet.md` following the guide (Ticket 1)
- Page shell keeps layout, meta, hero image handling; content renders via `mdpage` filter
- No visual changes unless the plan's open question says cleanup is allowed

## Acceptance criteria (agent-checkable)

- [x] `src/_data/pages/digital-closet.md` is the only content source; no duplicate content in the nunjucks file
- [x] Rendered page diffs clean against the pre-migration build (whitespace/entity-only deltas — verified per page)
- [x] BrowserSync live-reload shows the edit on `.md` save (verified live on the resume page and the visualbear md edit; required the .md watcher fix in gulp/watch.js)

## Open questions

- Pedro: pixel-identical required, or light cleanup allowed?

---

# Ticket 4: Migrate `fashion-rebrand` to markdown-driven content

- Part of: specs/md-case-study-editor/plan.md
- Size: M
- Type: system
- Status: DONE 2026-10-29 — content in `src/_data/pages/fashion-rebrand.md`, shell wired to the mdpage filter; later reworked pure-markdown per DR-0005
- Same requirements and acceptance criteria as Ticket 3, target `src/fashion-rebrand/` → `src/_data/pages/fashion-rebrand.md`.

---

# Ticket 5: Migrate `sports-ecommerce-redesign` to markdown-driven content

- Part of: specs/md-case-study-editor/plan.md
- Size: M
- Type: system
- Status: DONE 2026-10-29 (two case studies on one page; includes restoring the {% extends %} line the WIP had dropped) — content in `src/_data/pages/sports-ecommerce-redesign.md`, shell wired to the mdpage filter; later reworked pure-markdown per DR-0005
- Same requirements and acceptance criteria as Ticket 3, target `src/sports-ecommerce-redesign/` → `src/_data/pages/sports-ecommerce-redesign.md`.

---

# Ticket 6: Author md pages for the remaining PDF case studies

- Part of: specs/md-case-study-editor/plan.md
- Size: L
- Type: copy
- Status: CLOSED 2026-10-29 — reconciled: all four PDF case studies already have live pages (the coupon deep-dive is case study 2 inside sports-ecommerce-redesign). Optional follow-up: link each page's PDF as a download — a visual change, out of scope.

## Context

Four case studies exist only as PDFs in `src/case-studies/`: My Closet Digital Closet, Redesigning Fashion eCommerce, Redesigning Sports Ecommerce, Redesigning ecommerce coupon experience. Note: Tickets 3–5 may already cover some of these — reconcile titles against migrated pages before starting; only author what has no live page.

## Requirements

- One md file per PDF in `src/_data/pages/`, written to the guide's conventions
- Each page links the original PDF as a download
- Blocked by: Tickets 1–3 (pattern must be proven first)

## Acceptance criteria (agent-checkable)

- [ ] Each new page renders with a valid hero (title + summary + details) and at least one section — NOT APPLICABLE: no new pages needed (Ticket 6 reconciliation)
- [ ] PDF download link resolves in the built output — NOT APPLICABLE (optional follow-up, see status)
- [ ] Pages are reachable from the case-studies index/nav — NOT APPLICABLE (pages already exist)

## Open questions

- Pedro: are these still wanted as live pages, or is the PDF archive enough?
