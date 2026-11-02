# Tickets — text-to-md (plan.md, DR-0001, DR-0002)

Constraint carried over from `tickets-phase3.md`: the toolchain runs on
Node 10 — any new dev dependency must support Node 10.

---

- Status marked below
## Ticket 1 — Hero front matter: renderer + one pilot shell

Status: DONE 2026-11-02 (pilot: fashion-rebrand, pixel-identical both viewports)

- Part of: plan.md, DR-0001
- Size: M
- Type: system

### Context

Heroes and hero-meta are hardcoded in `src/<page>/index.nunjucks`
(see `src/teachr/index.nunjucks`, `src/fashion-rebrand/index.nunjucks`).
`mdpage` (`markdown-render.js`) currently reads body markdown only.

### Requirements

- `mdpage` parses YAML-ish front matter from page `.md` and exposes it
  as data to the template (hero variant, eyebrow, title, summary,
  details, meta list per DR-0001's bounded vocabulary: logo, needs,
  related, metrics, footnote — full vocabulary from day one, per
  Pedro 2026-11-02).
- One pilot page (recommend `fashion-rebrand`: cover + metrics meta,
  no gated access) renders its hero + hero-meta from front matter.
- Pages without front matter render exactly as today (no regression).

### Acceptance criteria (agent-checkable)

- [ ] Pilot page's rendered HTML is pixel-identical to pre-change
      (Playwright full-page diff, per repo practice).
- [ ] Removing the front-matter block from the pilot page reproduces
      the pre-change DOM minus the hero (no crash, no empty header).
- [ ] All other pages byte-identical in `build/` output.
- [ ] `npm run lint` and `format:check` pass.

### Out of scope

- Migrating the remaining shells (ticket 2). Front-matter authoring
  docs land with ticket 6.

---

## Ticket 2 — Migrate remaining md-page shells to hero front matter

Status: DONE 2026-11-02 (all six pages; DOM + geometry identical, same-session captures bit-stable)

- Part of: plan.md, DR-0001
- Size: M
- Type: system

### Requirements

- All md-page shells (`teachr`, `teachr-agent`, `digital-closet`,
  `sports-ecommerce-redesign`, `workflow`, plus any page with a
  `::: hero`) move hero + hero-meta into page front matter.
- `bodyattrs` variant class derives from `hero.variant`.

### Acceptance criteria (agent-checkable)

- [ ] Every migrated page pixel-identical (full-page diff per page).
- [ ] No hardcoded `cs-hero` markup remains in migrated shells.
- [ ] Full `npm run build` passes; `build/` diff shows only the
      expected pages.

---

## Ticket 3 — Create the `visuai-text-to-md` skill

Status: DONE 2026-11-02 (skill at ~/.vibe/skills/visuai-text-to-md; golden rehearsal byte-identical)

- Part of: plan.md, DR-0002
- Size: L
- Type: system

### Requirements

- Skill at `~/.vibe/skills/visuai-text-to-md/` (visuAI suite
  convention, alongside `visuaibear-*`).
- SKILL.md contains, verbatim-checkable: the inbox convention
  (`src/_data/drafts/inbox/<slug>.txt` in → `src/_data/pages/<slug>.md`
  out, input archived to `src/_data/drafts/processed/`; `.txt` is
  safe there — the data loader's `json|ya?ml|md` whitelist ignores
  it), the fixed precedence table (DR-0002 step 2, every row with its
  trigger signal and target construct), the tiebreak rule, the emit
  templates, the hard rules (never drop content; structure only,
  never content — pasted text is Pedro's final copy, content changes
  only on explicit instruction and then `[ai]` per DR-0008; idempotence
  guard), and the hero extraction rules (DR-0001 front matter with the
  full meta vocabulary; missing hero fields → explicit TODO comments,
  never silent defaults).
- The skill ends every run by running the bundled verify gates and
  reporting pass/fail with file paths.

### Acceptance criteria (agent-checkable)

- [ ] Running the skill on a sample input in
      `src/_data/drafts/inbox/` produces a valid `src/_data/pages/<slug>.md`
      (passes `doc-sync.sh`, no em dashes, valid front matter per DR-0001)
      with hero included.
- [ ] Every source line of the input is accounted for in the output
      (content or TODO comment) - checked by the verify gate.
- [ ] Content-preservation check: the output's body text is a subset
      of the input's text (structure added, no words changed) - no `[ai]`
      markers on a default run.
- [ ] Re-running on an already-converted, hand-edited page refuses
      with a diff summary (idempotence guard demonstrably works).
- [ ] Output is prettier-formatted (`format:check` passes).

---

## Ticket 4 — Canonicalizer + bundled verify script

Status: DONE 2026-11-02 (five seeded-failure fixtures each caught; fixed-point verified)

- Part of: plan.md, DR-0002
- Size: M
- Type: system

### Requirements

- `specs/text-to-md/tools/canonicalize.js` (Node 10): normalizes
  emitted markdown (prettier-compatible formatting, directive spacing,
  trailing whitespace, em-dash replacement is NOT auto-fixed - it
  fails loudly instead, per the standing copy rule).
- `specs/text-to-md/tools/verify-page-md.sh`: bundles `doc-sync.sh`,
  front-matter validation (DR-0001 vocabulary), em-dash check, image
  reference existence, content-accounting check (source lines vs
  output lines + TODOs).

### Acceptance criteria (agent-checkable)

- [ ] Running canonicalize twice on any input yields identical bytes
      (fixed-point property).
- [ ] verify-page-md.sh fails on each seeded bad fixture (em dash,
      unknown container, broken image ref, dropped source line) and
      passes on all current `src/_data/pages/*.md`.
- [ ] Both are invoked by the skill's finish step (ticket 3 wiring).

---

## Ticket 5 — Golden-file eval set + determinism gate

Status: DONE 2026-11-02 (run-goldens.sh: PASS; perturbation check fails as required)

- Part of: plan.md, DR-0002
- Size: M
- Type: system

### Requirements

- `specs/text-to-md/eval/`: ≥5 input text cases covering the
  precedence table (metrics, compare, timeline, quotes/captions,
  plain sections) including one pair that is structurally identical
  modulo names/dates/copy, each with a golden expected `.md`
  (hand-verified against AUTHORING.md before first commit).
- A runner script: converts each input via the skill's rules, diffs
  against the golden, exits non-zero on any drift; the structurally
  identical pair must be byte-identical after substitution.

### Acceptance criteria (agent-checkable)

- [ ] Runner passes on the committed goldens (determinism
      demonstrated, not asserted).
- [ ] Deliberately perturbing one golden (seeded diff) makes the
      runner fail - the gate can actually fail.
- [ ] The structurally-identical pair produces byte-identical output
      modulo the substitutions - the user's core requirement, proven.

---

## Ticket 6 — Wire into the visuAI workflow + doc-sync

Status: DONE 2026-11-02 (visuaibear-core routing after spec, before build; AUTHORING.md front-matter + inbox docs)

- Part of: plan.md
- Size: S
- Type: system

### Requirements

- `visuaibear-core` hub gains the routing entry: after a page's
  content exists as raw text, `visuai-text-to-md` runs between spec
  and build; build/review consume the resulting `.md`.
- `AUTHORING.md` gains the front-matter section (DR-0001) and the
  inbox convention; doc-sync rule extended to cover front matter.
- The skill appears in the visuAI suite's skill list.

### Acceptance criteria (agent-checkable)

- [ ] `doc-sync.sh` passes with the new front-matter docs.
- [ ] `visuaibear-core/SKILL.md` lists the skill with its position in
      the workflow (after spec, before build).
- [ ] AUTHORING.md's live loop mentions the inbox path as the
      no-hand-markdown entry point.

---

## Out of scope (all tickets)

- Resume pages (`mdresume`), phase-4 page migrations, new visual
  components, copy rewriting.
