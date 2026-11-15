# Tickets: resume CV refresh (2026-11-15 CV)

- Part of: specs/resume-cv/plan.md
- Copy source: Pedro's pasted CV, 2026-11-15 - verbatim, no [ai] markers (DR-0001)
- Copy rule: no em dashes in content files; the en dash in education entries
  matches the existing file and stays
- Live files: `src/resume/_resume_blocks/resume.title.nunjucks` (header),
  `src/_data/pages/resume.md` (body, rendered by the `mdresume` filter,
  `markdown-render.js:931`; conventions in AUTHORING.md). Dead macros stay
  untouched (DR-0002)

## STRICT RULES - binding on every ticket (Pedro, 2026-11-15, DR-0003)

1. **DO NOT CHANGE THE COPY I ADDED.** Every string below comes from the pasted
   CV verbatim: no typo fixes ("webb" stays), no rewording, no repunctuation,
   no reordering inside a pasted block, no joining/splitting of pasted lines.
2. **DO NOT CHANGE THE STYLING IN THE RESUME.** No `.scss`/`.css` edits, no new
   classes, no inline styles. Markup additions reuse existing classes only.
3. **Adapt = structural mapping only**: pasted content goes into the existing
   constructs (title block, `mdresume` sections). If a criterion below seems to
   require editing a pasted string, stop and raise it as an open question
   instead.

---

# Ticket 1: Title block - headline, Location, Portfolio label

- Part of: specs/resume-cv/plan.md
- Size: S
- Type: UI + copy
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-verbatim.txt + t6-diff.txt + captures

## Context

`src/resume/index.nunjucks` renders `{{ title.content() }}` in the header row.
Current block: h1 "Pedro Björn" + plain line "Product Design Lead" on the left;
right column has mailto hello@visualbear.com, "Website" ->
https://visualbear.com/, "LinkedIn" -> the LinkedIn URL.

## Requirements

- Left column: keep `<h1 class="name-title">Pedro Björn</h1>`; replace the
  plain "Product Design Lead" line with the exact headline
  `Lead Product Designer | Scalable Systems & AI-Native Design` (in the
  template write `&amp;` for the ampersand; the pipe is literal text).
- Right column, in this order:
  1. `Stockholm, Sweden` - plain `<li>` text, no link (ASSUMPTION - open
     question in plan.md)
  2. `<a href="mailto:hello@visualbear.com">hello@visualbear.com</a>` (unchanged)
  3. `<a href="https://visualbear.com/" target="_blank">Portfolio</a>` (label
     changes Website -> Portfolio, href unchanged)
  4. `<a href="https://www.linkedin.com/in/pedro-johan-bjorn-7417324b" target="_blank">LinkedIn</a>` (unchanged)
- Keep the existing classes (`col m6 small-title`, `inline-links`,
  `right-title`) - strict rule 2: no style changes, no new classes, no inline
  styles; the Location `<li>` reuses the existing `inline-links` pattern as
  plain text.

## Design references

- Hooks used: resume.title macro (existing). Principles: bespoke hero stays in
  the page shell (AUTHORING.md); copy verbatim from Pedro's CV (DR-0001).

## Acceptance criteria (agent-checkable)

- [ ] `build/resume/index.html` contains the exact strings "Lead Product
      Designer | Scalable Systems & AI-Native Design" (as `&amp;` in source HTML
      text), "Stockholm, Sweden", and link text "Portfolio" with
      `href="https://visualbear.com/"`
- [ ] Exactly one `<h1` on the built page (the name title); header has 4
      `inline-links` list items, 3 of them anchors with the hrefs above
- [ ] Copy: no em dash introduced; no `[ai]` marker in the template
- [ ] A11y: link texts discernible ("Portfolio", "LinkedIn", the email);
      contrast untouched (no CSS change)
- [ ] Gates: build exit 0, lint 0 problems, format:check clean; captures of
      /resume/ header at 1440 + 390 in specs/resume-cv/evidence/

## Out of scope

- The Download Resume row (`resume.end.nunjucks`), all body content, styles.

## Open questions

- None blocking (Location-as-plain-text assumption recorded in plan.md).

---

# Ticket 2: About paragraph - 12+ years

- Part of: specs/resume-cv/plan.md
- Size: S
- Type: copy
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-verbatim.txt + t6-diff.txt + captures

## Context

First paragraph of `src/_data/pages/resume.md` (the mdresume intro, renders
bare before the first `##`). Current text says "10+ years"; the 2026-11-15 CV
says "12+ years". The rest of the paragraph is identical in both sources.

## Requirements

- Change exactly `10+ years` -> `12+ years` in that paragraph; everything else
  byte-identical to the pasted CV About me.

## Acceptance criteria (agent-checkable)

- [ ] `build/resume/index.html` contains "12+ years of experience" and does
      NOT contain "10+ years" (grep over the built resume page only - the dead
      macros may still contain it, DR-0002)
- [ ] The intro still renders as the pre-section paragraph (one bare
      paragraph before the Core Skills section in the built HTML)
- [ ] Copy: no em dash; no `[ai]` marker
- [ ] Gates: build + lint + format:check clean

## Out of scope

- Rewording any other sentence of the About paragraph.

## Open questions

- None.

---

# Ticket 3: Core Skills - group order + leadership items

- Part of: specs/resume-cv/plan.md
- Size: S
- Type: copy
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-verbatim.txt + t6-diff.txt + captures

## Context

`## Core Skills` section in `resume.md`: nested list, `**Group**` heads render
as `h3.sub-title`, items as `ul.no-bullets`. Current group order is Design
Leadership / Product Design / Technical; the 2026-11-15 CV orders them
Technical / Product Design / Design Leadership.

## Requirements

- Reorder the three groups to: **Technical**, **Product Design**,
  **Design Leadership**.
- Technical items (pasted): "Agentic Design and Prototyping (Claude Code,
  Cursor, Figma AI, etc)", "Figma", "Front-end fundamentals (HTML, CSS,
  JavaScript)", "Notion, Jira" (one item - the pasted CV joins them).
- Product Design items (unchanged): "User Experience (UX)", "User Interfaces
  (UI)", "Design Systems", "Usability Research".
- Design Leadership items (pasted, exact, all four, in pasted order):
  - "AI-design standards, enabling non-designers to design and designers to
    deliver"
  - "Leading and coaching Product Designers in growth and craft"
  - "Setting product and brand design principles, both experience and ways of
    working"
  - "Design Ops, setting research, critique and delivery standards"

## Acceptance criteria (agent-checkable)

- [ ] Built page renders three `h3.sub-title` groups in the order Technical,
      Product Design, Design Leadership, each with a `ul.no-bullets`
- [ ] All four leadership strings above appear verbatim in
      `build/resume/index.html`; "Notion, Jira" is a single list item
- [ ] Copy: no em dash; no `[ai]`
- [ ] Gates: build + lint + format:check clean

## Out of scope

- Adding/removing skills beyond the pasted list; styling of the skills tree.

## Open questions

- None.

---

# Ticket 4: Quizrr + H&M roles - responsibilities/achievements in pasted order

- Part of: specs/resume-cv/plan.md
- Size: S
- Type: copy
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-verbatim.txt + t6-diff.txt + captures

## Context

The `### Design Lead - [Quizrr AB](https://www.quizrr.se/) | 2024 / 09 -
Current` block in `resume.md`. The 2026-11-15 CV keeps the same text but orders
Key Responsibilities and Key Achievements differently.

## Requirements

- Key Responsibilities order: "AI Best practices and workflows", "Design
  Leadership", "Design Strategy", "Design Operations".
- Key Achievements order (pasted):
  1. "Established AI-native workflows, including design guidelines, user
     research and component libraries, enabling non-developers to contribute
     to feature delivery."
  2. "Advanced prototyping capabilities using Figma and AI-coding agents for
     rapid iteration and testing."
  3. "Led the end-to-end user experience for Quizrr's global SaaS eLearning
     platform on app and web, from discovery to delivery, raising the design
     maturity improving our user onboarding and adoption rates by 10%
     year-on-year." (keep the curly apostrophe)
  4. "Established the design direction, process and principles, leading to a
     reduction in design debt by 50%, and enabling discovery workflows,
     allowing for rapid explorations which increased the delivery speed of new
     users experienced by 2x."
  5. "Implemented a design system from the ground up to cover massive SaaS
     Learning Management System, connecting it with code and accessibility
     standards"
- The intro paragraph of the role is identical in both sources - untouched.
- H&M: achievements reorder to the pasted order (Design AI Circle first, then
  the global UX revamp, Digital Closet, Digital Stylist); everything else in
  the block is identical, including the "webb" typo (strict rule 1 forbids
  fixing it).
- Sportamore, Granditude, Plotagon blocks: identical in both sources -
  verify-only, byte-identical.

## Acceptance criteria (agent-checkable)

- [ ] In `build/resume/index.html`, the Quizrr block's responsibilities `li`
      order is exactly the four items above, and the achievements `li` order
      is exactly the five items above (grep -n order check)
- [ ] `git diff src/_data/pages/resume.md` touches only the sections named in
      tickets 2-4 (Core Skills, About, Quizrr block, H&M achievements order);
      no Sportamore/Granditude/Plotagon/Education/Languages/Interests lines
      changed
- [ ] Copy: no em dash; no `[ai]`
- [ ] Gates: build + lint + format:check clean

## Out of scope

- Rewording achievements; touching the other four roles.

## Open questions

- None. Strict rule 1 settles it: the pasted copy stays verbatim, "webb"
  included.

---

# Ticket 5: Education + Languages - verify-only mapping

- Part of: specs/resume-cv/plan.md
- Size: S
- Type: copy
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-verbatim.txt + t6-diff.txt + captures

## Context

The pasted CV lists the four degrees under a stray "Key Achievements" heading.
Adaptation (strict rule 3) maps the degrees to the existing `## Education |`
quiet section, whose entries already match the pasted CV verbatim; the stray
heading label itself is not rendered as a sixth "Key Achievements" (DR-0001);
if Pedro wants that label shown verbatim instead, that is the one open
question below. Languages match the current `## Languages |` section. So this
ticket verifies, and edits only if a diff appears.

## Requirements

- `## Education |` keeps its 4 entries, matching the pasted CV: 2011
  Professional Degree in Game Design - Future Games | Sweden; 2009 Bachelors
  in Design, Erasmus - IUAV Universita de Venezia | Italy; 2006 Bachelors in
  Design - IADE University | Portugal; 2002 GCSE & IB Diplomas - St. Julian's
  School | Portugal (en dash + links as in the current file).
- `## Languages |` keeps: English Fluent, Portuguese Fluent, Swedish
  Proficient, Spanish Minimum.
- No "Key Achievements" heading is added outside the five roles.

## Acceptance criteria (agent-checkable)

- [ ] Built page has exactly one `sub-title` "Education" with 4 `li` entries
      (links to futuregames.se, iuav.it, iade.pt, stjulians.com) and one
      "Languages" sub-title with 4 `li` entries in the order above
- [ ] Count of `Key Achievements` sub-titles on the built page = 5 (one per
      role), i.e. the pasted stray heading did not become a section
- [ ] Gates: build + lint + format:check clean

## Out of scope

- Interests section (kept as-is, plan.md open question); the Download Resume
  row.

## Open questions

- Show the pasted "Key Achievements" label verbatim over the degrees instead of
  the resume's "Education" sub-title? (default: no - DR-0001; strict rule 3
  makes this Pedro's call, not the agent's) - Pedro, non-blocking

---

# Ticket 6: Gates, evidence, regression

- Part of: specs/resume-cv/plan.md
- Size: S
- Type: system
- Status: DONE 2026-11-15 - see evidence/t6-verify.md + t6-verbatim.txt + t6-diff.txt + captures

## Context

Closes the plan: proves the whole change and that nothing else moved.

## Requirements

- Run the full gate set and store captures under `specs/resume-cv/evidence/`.

## Acceptance criteria (agent-checkable)

- [ ] `npm run build` exit 0 with all 5 release-guard lines OK (the [ai]
      warning count does NOT increase - grep resume.md for `[ai]` = 0 hits)
- [ ] `npm test` 5/5 PASS/OK; `npm run lint` 0 problems; `npm run
format:check` clean
- [ ] Em-dash grep over `src/_data/pages/resume.md` and
      `resume.title.nunjucks` = 0 hits in rendered text (HTML comments
      stripped before counting, as in the t63 convention; the one pre-existing
      em dash in the resume.md header comment is not rendered copy)
- [ ] Strict rule 1 (copy verbatim): every pasted CV string from tickets 1-5
      is present byte-for-byte in `build/resume/index.html` (script the check,
      store the output in `specs/resume-cv/evidence/`)
- [ ] Strict rule 2 (no styling changes): `git diff --name-only` contains no
      `.scss`/`.css` file and no new class or inline style was added to the
      two live files (`git diff` on them shows text-only changes reusing
      existing classes)
- [ ] Full-page captures of /resume/ at 1440 + 390 (and scrolled, to cover
      Education/Languages) saved as `specs/resume-cv/evidence/*.png`
- [ ] Worktree diff limited to: `src/resume/_resume_blocks/resume.title.nunjucks`,
      `src/_data/pages/resume.md`, `specs/resume-cv/**` - no other page,
      nav, sitemap or footer file changed
- [ ] Passes the `visuaibear-review` checklist on /resume/

## Out of scope

- The mirror/walled-garden behaviour (resume is a public page; guards cover it).

## Open questions

- None.

---

# Ticket 7: Red bullets on the Core Skills list (explicit Pedro styling request)

- Part of: specs/resume-cv/plan.md
- Size: S
- Type: UI (styling)
- Status: DONE 2026-11-15 - probed at 1440+390: leaf li ::before 5px red rgb(208,24,30), groups unmarked; captures t7-resume-{1440,390}.png

## Context

Pedro, 2026-11-15: "Add the red bullets to the core skills bullets". This
supersedes strict rule 2 for this one item only (DR-0004); strict rule 1
(copy verbatim) still holds in full. The Core Skills tree renders as
`ul.no-bullets > li > h3.sub-title + ul.no-bullets > li` (mdresume), so its
leaf items carry no marker; every other list on the page (Key
Responsibilities, Key Achievements, Education, Languages) already gets the
standard red dot via `#resume_container ul:not(.no-bullets)` in
`src/_styles/templates/_resume.scss` (5px round `::before`, `#d0181e`).

## Requirements

- Extend that existing rule's selector with `ul.no-bullets ul.no-bullets` so
  the Core Skills leaf items get the identical dot treatment. No new values,
  no new properties, no other selector changes.
- Group titles (`h3.sub-title` items in the parent list) stay unmarked.
- No copy change, no markup change, no other page affected.

## Design references

- Hooks used: existing resume dot treatment (`_resume.scss` ticket 22a/34/36
  block). Tokens/colors: the page's own `#d0181e` (resume link red), not
  `$vb-primary`. DR-0004 records why.

## Acceptance criteria (agent-checkable)

- [ ] Visual: at 1440 and 390, each Core Skills leaf `li` computes a `::before`
      of 5px x 5px, `border-radius: 50%`, `background-color: rgb(208, 24, 30)`;
      group `h3.sub-title` `li`s compute no `::before` dot (probed via
      getComputedStyle in headless Chromium)
- [ ] Regression: Key Responsibilities / Key Achievements / Education /
      Languages dots unchanged (same computed values as before the change);
      header `.small-title` lists still unmarked
- [ ] Copy: `git diff src/_data/pages/resume.md src/resume/` is empty for this
      ticket
- [ ] Gates: `npm run build` exit 0 + 5/5 release-guards OK; `npm test` 5/5;
      `npm run lint` 0 problems; `npm run format:check` clean
- [ ] Captures `specs/resume-cv/evidence/t7-resume-{1440,390}.png` (skills
      area visible); diff limited to `src/_styles/templates/_resume.scss` +
      `specs/resume-cv/**`

## Out of scope

- Any other styling, any markup/renderer change, any copy change.

## Open questions

- None.
