# Plan: resume CV refresh - Pedro's 2026-11-15 CV details into /resume/

- Date: 2026-11-15
- Status: shipped 2026-11-15 (tickets 1-6 done; open questions below answered by defaults, recorded)
- Evidence: Pedro's pasted CV details, 2026-11-15 (verbatim source of copy, this
  conversation). Live page: `/resume/` = `src/resume/index.nunjucks` (title + end
  blocks) + `src/_data/pages/resume.md` through the `mdresume` filter
  (`markdown-render.js:931`, conventions in `AUTHORING.md` "mdresume").

## Strict rules (Pedro, 2026-11-15 - binding on every ticket, see DR-0003)

1. **DO NOT CHANGE THE COPY I ADDED.** The pasted 2026-11-15 CV is verbatim:
   no typo fixes, no rewording, no repunctuation, no reordering inside a
   pasted block, no joining or splitting of pasted lines. Consequence: the
   "webb" typo in the H&M line stays.
2. **DO NOT CHANGE THE STYLING IN THE RESUME.** No `.scss`/`.css` edits, no new
   classes, no inline styles; markup additions reuse the existing classes and
   patterns only.
3. **"Adapt it to the Resume" means structural mapping only**: place the pasted
   content into the existing constructs (title block + `mdresume` sections).
   Anything that would edit or drop a pasted string is an open question for
   Pedro, never silently resolved.

## Problem / opportunity

The CV Pedro pasted on 2026-11-15 is newer than what `/resume/` renders:
"12+ years" (page says 10+), a headline ("Lead Product Designer | Scalable
Systems & AI-Native Design") and Location (Stockholm, Sweden) missing from the
title block, a reordered/expanded Core Skills leadership group, and a reordered
Quizrr responsibilities/achievements list. Education and Languages already
match. The page should render exactly the pasted CV.

## Goal

`/resume/` renders the 2026-11-15 CV verbatim: one sentence of measurement -
built HTML diff limited to the resume title block + `resume.md`, all gates green,
captures at 1440 + 390 stored under `specs/resume-cv/evidence/`.

## Non-goals

- No changes to the legacy `src/resume/_resume_blocks/` macros other than
  `resume.title.nunjucks`: `index.nunjucks` imports only `title` and `end`;
  `intro/skills/experience/education/languages/interests` blocks are dead code
  and stay untouched (DR-0002).
- No renderer changes (`markdown-render.js`), no style changes (the resume
  stylesheet already renders every construct used).
- The Interests section stays even though the pasted CV omits it - it is
  Pedro's existing published copy, not something this spec deletes (open
  question below).
- The Download Resume PDF is not regenerated here (asset request below).
- No `[ai]` markers anywhere: this copy is Pedro's own pasted text, and the
  DR-0008 contract marks only agent-drafted copy (DR-0001).

## Approach

Two-file edit: the contact/title header lives in the nunjucks shell (AUTHORING.md
rule: bespoke hero stays in the page shell), everything below it lives in
`src/_data/pages/resume.md`. Alternatives rejected: moving the header into the
md (breaks the shell/md split the page already uses), or editing the dead
resume_blocks macros (they render nowhere). Decisions in DR-0001, DR-0002.

## Delta (pasted CV vs current live files) - the build list

1. Title block: add headline + Location; relabel "Website" to "Portfolio".
2. About paragraph: "10+ years" -> "12+ years" (rest identical).
3. Core Skills: group order Technical / Product Design / Design Leadership;
   leadership items expanded (see ticket 3).
4. Quizrr role: responsibilities + achievements reordered to the pasted order.
5. Education: pasted under a mislabeled "Key Achievements" heading - placement
   maps to the existing `## Education |` quiet section (DR-0001, DR-0003);
   entry strings verbatim, entries already match.
6. H&M / Sportamore / Granditude / Plotagon / Languages: pasted text matches
   current - verify-only, byte-identical.

## Asset requests (foundational heuristics, H2)

| Asset                                         | Position in design                                                                                                | Min size / format | Status          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------- | --------------- |
| Updated Resume PDF matching the 2026-11-15 CV | Download link at the bottom of /resume/ (`resume.end.nunjucks` -> `../images/work/resume/Resume-Pedro-Bjorn.pdf`) | PDF, A4           | pending - Pedro |

`pending` blocks nothing here: the HTML page ships with the existing PDF link.

## Foundational checks

- H1: no destructive file operations anywhere in this plan (edits only, no
  deletes/renames).
- H2: asset table above; the only asset (PDF) is Pedro's call.
- H3: open questions batched below, all non-blocking, all owned by Pedro.

## Breakdown

- [x] Ticket 1 - Title block: headline, Location, Portfolio label (tickets.md)
- [x] Ticket 2 - About paragraph: 12+ years (tickets.md)
- [x] Ticket 3 - Core Skills: group order + leadership items (tickets.md)
- [x] Ticket 4 - Quizrr + H&M roles: responsibilities/achievements in pasted order (tickets.md)
- [x] Ticket 5 - Education + Languages verify-only mapping (tickets.md)
- [x] Ticket 6 - Gates, captures, regression diff (tickets.md)
- [x] Ticket 7 - Red bullets on the Core Skills list (explicit styling request,
      supersedes strict rule 2 for this item only - DR-0004) (tickets.md)

## Open questions

| Question                                                                                       | Owner | Blocks build? |
| ---------------------------------------------------------------------------------------------- | ----- | ------------- |
| Pasted "Key Achievements" heading above the degrees = Education? (assumed yes, DR-0001)        | Pedro | No            |
| Keep the Interests section although the pasted CV omits it? (assumed keep)                     | Pedro | No            |
| "Stockholm, Sweden" as plain text, not a link? (assumed plain - placement only, strict rule 3) | Pedro | No            |
| Updated Resume PDF to replace `Resume-Pedro-Bjorn.pdf`?                                        | Pedro | No            |
