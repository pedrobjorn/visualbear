# Plan: Simplify the markdown authoring language

- Date: 2026-11-01
- Status: PROPOSAL — Pedro reads before anything is built
- Evidence: read-through of all 7 md files (920 lines) + the renderer
  audit, 2026-11-01; real before/after examples below are from
  `sports-ecommerce-redesign.md` verbatim

## The principle

**Name the component once, then write plain markdown inside it.**

A container's name already says what it is (`::: cards`, `::: shots`,
`::: metrics`). What's INSIDE should be readable markdown — headings,
paragraphs, lists — not mini-syntax (pipes, empty-header tables,
context-dependent directives).

## What's obtuse today (real examples, all from the current files)

1.  **Empty-header tables as cards** — the worst offender. A card grid
    is authored as a table with EMPTY headers:

         | | |
         |---|---|
         | Stagnating growth | We were not bringing in as many new customers, or retaining the ones we wanted to keep, having a "leaky bucket". |
         | Site usability issues | Impacting both the user experience and SEO. |

    Hard to read, brutal to edit (pipe alignment), and it's a TABLE
    pretending to be cards. Pedro: "avoid tables".

2.  **Pipe headings** — `## Problems & Opportunities | Definition |
definition` — three fields where one is usually enough; the ids are
    noise on every line.

3.  **Pipe directives** — `[panel: How it started | Mobile Web · Before]`,
    `[frame: Mobile Web · Before | Final mockup pending | tall]` — the
    pipe-count varies and the meaning of each slot is memorized, not
    visible.

4.  **Context-dependent captions** — `[point: text]` under an image is a
    caption; the same directive beside content is an annotation dot. Two
    behaviors, one syntax, decided by what came before.

5.  **Directive-per-paragraph** — `[intro: …]`, `[note: …]`,
    `[h2: Lessons]` — bracket-noise where plain markdown would do.

## The simplified language (proposed)

### 1. Cards: `###` heading + paragraph — no tables

    ::: cards
    ### Stagnating growth
    We were not bringing in as many new customers, or retaining the ones
    we wanted to keep, having a "leaky bucket".

    ### Site usability issues
    Impacting both the user experience and SEO.
    :::

A `###` inside `::: cards` starts a new card; the text under it is the
card's body. Readable as plain markdown, editable without alignment.
**The empty-header table syntax keeps working (legacy), so migration is
per-file and gradual — but it leaves the guide.**

### 2. Sections: `## Title` — the pipes become optional

    ## Problems & Opportunities

The eyebrow defaults to the title (already true in the renderer); the
id auto-slugs (already true). The full form `## Title | Eyebrow | id`
STAYS as the escape hatch for when the eyebrow really differs — used
sparingly, not on every line.

### 3. Captions: one explicit directive, no context magic

    [frame: Mobile Web · Before]
    [caption: Before we started, the colours were very heavy, elements
    were very close together, and the elements were very sharp.]

`[caption:]` is ALWAYS a caption. `[point:]` goes back to meaning only
"annotation dot" — no more "it's a caption if it follows an image"
rule (the renderer's context magic is retired once the files migrate;
DR-0011 amended).

### 4. Panels: `[panel: Title]` — the tag moves into the title or drops

    ::: compare
    [panel: Mobile Web · Before]
    Much like on mobile, there was an inconsistency of elements…

    [panel: Mobile Web · After]
    We retained the information density…
    :::

The rendered tag (e.g. "How it started") becomes optional as a second
pipe `[panel: Title | Tag]` — same as today, but the common case is
one field.

### 5. Frames: `[frame: Label]` — sub-label optional, tall on request

The common case is one field: `[frame: Mobile Web · Before]`. The full
form stays: `[frame: Label | sub-label | tall]`.

### 6. Notes and intros become plain markdown where possible

- `[note: …]` stays (a one-liner, fine) — but italic text inside a
  section could also just be `*…*`; decide per case.
- `[h2: Lessons]` — replaced by a real `### Lessons` (the h2-directive
  exists only to dodge the section machinery; `###` inside a section
  already renders as a sub-heading without opening a section).
- `[intro: …]` stays for now (it styles a specific role) — candidate
  for later: first italic paragraph of a section = intro.

### 7. Metrics keep the one-line pipe

    ::: metrics
    15% | customer return rate ↑
    #1 | Sports Site of the Year
    :::

`value | label` on one line is compact, unambiguous, and not a table —
the one pipe that stays. (Alternative if Pedro prefers: `- **15%**
customer return rate ↑` bold-value list items.)

### 8. The hero keeps its directives

`::: hero` blocks are rare and bespoke (one per extra case study); the
`[eyebrow:]`/`[subtitle:]`/`[byline:]`/`[summary:]` list inside stays —
not worth a second syntax.

## Migration

- The renderer supports BOTH grammars during the transition (the
  empty-header table → cards conversion stays as legacy); the guide
  (AUTHORING.md) documents only the NEW syntax.
- The existing files migrate file-by-file (ecommerce first — it has
  the two empty-header tables) — mechanical, verifiable by render-diff:
  old syntax and new syntax must render byte-identical output.
- `[point:]`-as-caption usages migrate to `[caption:]` (a find-replace
  per file, ~10 lines on ecommerce).

## Acceptance criteria (when built)

- [ ] Every `| | |` empty-header table is gone from the md files; cards
      render identical (render-diff old vs new syntax: empty)
- [ ] Section headings are bare `## Title` unless the eyebrow genuinely
      differs
- [ ] `[point:]` renders a dot in every remaining usage; captions are
      `[caption:]`
- [ ] AUTHORING.md documents the new syntax only; doc-sync OK
- [ ] All 7 pages: pixel-identical captures before/after the migration
- [ ] box/edge audits CLEAN; axe zero; lint + format pass

## Non-goals

- No build-step or toolchain changes; no new dependencies (Node 10
  stands).
- The `[ai]` markers (DR-0008) and the frontmatter (DR-0002) are
  untouched.
- No multi-column layout language changes (`::: columns` keeps
  `[col:]` — it's a delimiter, readable).

## Open questions (Pedro)

| #   | Question                                                         | Default if unanswered                           |
| --- | ---------------------------------------------------------------- | ----------------------------------------------- |
| 1   | Metrics: keep `value \| label` lines, or bold-value list items?  | keep the pipe (one line, not a table)           |
| 2   | Notes: keep `[note:]` or allow plain italic paragraphs as notes? | keep `[note:]`                                  |
| 3   | Migrate all 7 files in one pass, or start with ecommerce?        | ecommerce first, others follow the same pattern |

---

## Applying it across ALL md case studies (inventory + build sequence)

Audited 2026-11-01, per file (grep counts, real lines):

### The inventory

| File                  | Tables → cards          | Pipe headings | Panels w/ 2 fields | Frames w/ 3 fields | `[point:]`                                        | `[h2:]` | Raw HTML blocks                                                     | Other                                                                                                         |
| --------------------- | ----------------------- | ------------- | ------------------ | ------------------ | ------------------------------------------------- | ------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| sports-ecommerce      | **3**                   | 10            | 4                  | 1                  | 7 (captions under images)                         | 1       | **1 live block** (cs-cards div, coupon section) + commented cs-note | 2 metrics, 1 hero, 4 hero directives                                                                          |
| workflow              | **2** (one holds LINKS) | 7             | 0                  | 0                  | 0                                                 | 0       | 1 raw frame                                                         | **7 `[ai]` markers — Pedro's, untouchable**                                                                   |
| fashion-rebrand       | 0                       | 6             | 4                  | 2                  | 3 — VERIFY each: real annotation dots vs captions | 0       | commented block                                                     | 4 notes, 3 intros                                                                                             |
| digital-closet        | 0                       | 5             | 3                  | 1                  | 0                                                 | 0       | commented cs-summary (ticket 26's open question)                    | 1 intro                                                                                                       |
| teachr / teachr-agent | 0                       | 4 / 4         | 0                  | 0                  | 0                                                 | 0       | comment headers only                                                | 1 `[ai]` each                                                                                                 |
| resume                | —                       | —             | —                  | —                  | —                                                 | —       | —                                                                   | **EXCLUDED**: `mdResume` has its own grammar (`## Title \|` = the quiet-section rule — not part of this plan) |

### Renderer changes needed (so the grammar holds everywhere)

1. **`::: cards` gains the `###`-pair grammar** — `###` opens a card, the
   following flow content (paragraph, LIST, links — workflow's table
   cards contain links, ecommerce's raw block contains a `ul`) is the
   body until the next `###`/`:::`. The empty-header table conversion
   STAYS (legacy) — both grammars must render byte-identical cards.
2. **`[caption:]` guard**: a `[caption:]` that lands WITHOUT a preceding
   image currently emits a bare `<figcaption>` (invalid HTML, orphaned).
   The renderer warns and renders it as a `p.cs-frame-caption` instead —
   the new explicit syntax must be SAFE to edit.
3. **`[point:]`'s context magic retires ONLY after migration** — the
   renderer's "point after an image = caption" logic is removed once the
   files' captions are `[caption:]` (sequenced below, behind the
   render-diff gate).
4. **`## Title` bare headings** need NO renderer change (the eyebrow
   default + auto-slug already exist) — verified.
5. **AUTHORING.md** rewrites to the new grammar only; doc-sync covers the
   containers (no new types — cards/shots exist).

### The verification gate (what makes "applies properly" checkable)

- A migration diff tool: `tools/migration-diff.sh <page>` — renders
  `git show HEAD:src/_data/pages/<page>.md` and the migrated file
  through the SAME renderer and diffs. **The migration is only valid if
  the diff is empty** (or contains exactly the intended render changes,
  reviewed).
- Pixel captures per page before/after the migration (1440 + 390) — the
  pages must be visually identical.
- The `[ai]` markers (DR-0008) must survive every migration untouched:
  grep-gate per file (7 on workflow, 1 per teachr page).

### Build sequence

- **S1 — additive renderer work**: the `###`-cards grammar + the
  `[caption:]` guard + `tools/migration-diff.sh`. No breaking changes;
  the legacy paths keep working. Render-diff EMPTY on all 7 pages.
- **S2 — ecommerce pilot**: tables → `###` cards, headings → bare `##`,
  panels → 1-field, the raw cs-cards block → `::: cards`,
  `[point:]`-captions → `[caption:]`, `[h2: Lessons]` → `### Lessons`.
  migration-diff EMPTY + pixel captures identical.
- **S3 — the rest, file-by-file**: workflow (careful: 7 `[ai]` markers +
  the linked cards), closet, fashion (verify each `[point:]` is an
  annotation, not a caption, BEFORE converting), teachr ×2.
  migration-diff EMPTY per file.
- **S4 — retire the old paths**: the renderer's point-as-caption magic
  removed; AUTHORING.md rewritten to the new grammar; the guide's
  examples re-rendered (the styleguide's demos stay as they are — they
  already use real markup).
- **S5 — full verification**: all 7 pages pixel-identical vs
  pre-migration; box/edge audits CLEAN; axe zero; doc-sync OK; lint +
  format pass.

### Migration rules per pattern (the find-replace map)

- `| | |` + `|---|---|` + rows → `### Title` + body lines inside the
  surrounding `::: cards` (introduce the container around the table's
  content where missing).
- `## Title | Eyebrow | id` → `## Title` (drop when Eyebrow == Title
  modulo case/wording; KEEP the pipe when the eyebrow genuinely differs
  — e.g. `## Site Redesign: Mobile & Desktop | Discovery`).
- `[panel: Tag | Title]` → `[panel: Title]` when the tag is decorative;
  keep the second field when the tag carries meaning (ecommerce's "How
  it started" tags DO — decision at S2 with Pedro).
- `[frame: A | B | tall]` → `[frame: A]` when B is boilerplate ("Final
  mockup pending" appears 6× — keep as the sub-label where it matters,
  drop where repeated noise).
- `[point: x]` after an image/frame → `[caption: x]`; `[point: x]`
  beside real annotations → stays.
