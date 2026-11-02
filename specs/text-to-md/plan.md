# Plan: visuai-text-to-md — raw text in, authoring markdown out

- Date: 2026-11-02
- Status: ready (open questions answered by Pedro 2026-11-02; no
  blockers)
- Evidence: user request, 2026-11-02 — "I'll paste text with basic
  instructions in a file; you create a skill called visuai-text-to-md
  that converts the text into the md format we established here; from
  there we use that md to build out to the site." Open questions
  answered by Pedro 2026-11-02 (see below): drafts in their own space
  in `src/_data/drafts/`, hero-meta vocabulary full from day one,
  pasted text is FINAL copy.

## Evaluation of the idea (asked for, before the spec)

**Verdict: worth doing. The idea is a good fit for this repo, with two
real risks that the spec must design away.**

What makes it fit:

1. The target format already exists as a machine-checkable contract
   (`AUTHORING.md` + `specs/md-case-study-editor/DR-0001`, verified by
   `doc-sync.sh`). "The md format we established here" is written down,
   testable, and stable. A converter skill has a real spec to hit —
   this is the single biggest success factor.
2. The live loop already exists: write `src/_data/pages/<slug>.md`,
   `npm run serve` hot-reloads. The skill slots in front of an
   existing, proven pipeline. No new runtime surface.
3. Quality gates already exist to bolt the output onto: prettier,
   `format:check`, `doc-sync.sh`, the em-dash rule, `[ai]` marking
   (DR-0008), image-placeholder convention.

Risks, and how the spec handles each:

1. **LLM nondeterminism breaks the "two near-identical case studies
   produce identical output" requirement.** An LLM improvising the
   mapping will drift (chips vs bullets, section naming, ordering).
   Mitigation: DR-0002 — the skill is a _rule executor, not a writer_.
   Every mapping decision is a fixed precedence table in the skill;
   ambiguity resolves to the plainest construct; output goes through a
   canonicalizer; a golden-file test suite is the executable proof.
2. **Judgment-prone mappings (which construct for which text) are
   where determinism actually dies.** Mitigation: bounded decision
   space. The skill recognises a fixed set of signals (metrics-like
   lines, before/after pairs, step language, quotes, captions) in a
   fixed precedence order. Anything unrecognized maps to the plainest
   construct with a `<!-- TODO -->` comment. The skill never invents
   structure the source does not signal, never drops content, never
   rewrites Pedro's voice (pure structural mapping = no `[ai]` marker;
   any expanded copy gets `[ai]` per DR-0008).
3. **The hero does not live in markdown today.** Heroes + hero-meta
   (metrics, Needs card, related link) are hardcoded in each
   `src/<page>/index.nunjucks`, with bespoke variants (`cs-hero--teal`,
   `--black`, DR-0014). "Hero included in the markdown process"
   therefore needs a pipeline change, not just a skill change:
   DR-0001 moves hero data into page front matter, shells render from
   it. This is a prerequisite ticket, buildable and verifiable with
   pixel diffs before the skill ever runs.

Silky-smooth additions (the ergonomics that make the loop feel free):

- **Inbox convention**: drop a file in `src/_data/drafts/inbox/<slug>.txt`,
  run the skill, get `src/_data/pages/<slug>.md`, dev server reloads,
  the processed input is archived to `src/_data/drafts/processed/`.
  (Resolved 2026-11-02: Pedro chose "own space in data". The data
  loader's whitelist `json|ya?ml|md` ignores `.txt`, so drafts never
  enter `site.data` or the build.) One mental move: "text in folder,
  page appears."
- **Idempotence**: running the skill on an already-converted page is a
  detected no-op, not a mangled rewrite. Re-runs after Pedro edits the
  md by hand are refused with a diff summary unless he passes a
  `--force`-equivalent instruction.
- **Self-verifying finish**: the skill ends every run by running the
  existing gates (`format:check`, `doc-sync.sh`, em-dash check) and
  reporting pass/fail, so "converted" always means "converted and
  clean".
- **Hero draft included**: the skill emits the front-matter hero from
  the source text (title/summary/details it finds there), with the
  full hero-meta vocabulary from day one; missing hero fields become
  explicit TODOs rather than silent defaults.
- **Structure only, never content**: Pedro's pasted text is final
  copy (resolved 2026-11-02). The skill restructures; it does not
  reword, reorder into different meaning, summarize, or expand -
  content changes only when Pedro explicitly instructs them.

## Goal

A new case study goes from a pasted raw-text file to a live, verified
page with no hand-written markdown: the skill's output is
deterministic (same-shape inputs → byte-identical output, proven by
golden-file tests) and includes the hero.

Measured by: two structurally near-identical input texts produce
byte-identical `.md` files modulo names/dates/copy; hero renders from
markdown with zero edits in the page shell.

## Non-goals

- No new visual components or CSS — the skill maps onto the existing
  `AUTHORING.md` contract only.
- No copywriting: the skill structures Pedro's words, it does not
  rewrite voice (expanded copy is marked `[ai]` and stays his to
  rewrite).
- No migration of the remaining hardcoded pages (phase-4 backlog,
  tracked in `specs/md-case-study-editor/plan.md`).
- No resume support (`mdresume` is a different contract; out of scope
  until asked).
- No interactive editor / UI — this is a skill + scripts, not an app.

## Approach

Three layers, in dependency order (cross-links: DR-0001, DR-0002):

1. **Hero into markdown (DR-0001)** — page `.md` gains front matter
   (`hero:` block: variant, eyebrow, title, summary, details, meta).
   `mdpage` parses it; shells render hero + hero-meta from it. Pilot
   on one page, pixel-diff verified, then migrate the rest.
2. **The skill (DR-0002)** — `visuai-text-to-md`: inbox convention,
   fixed precedence mapping table, canonicalizer, self-verification,
   `[ai]` rules, idempotence guard.
3. **Proof (eval)** — golden-file suite: input texts + expected
   outputs in the skill; the determinism gate is "re-running the skill
   reproduces the goldens byte-for-byte". This is also the regression
   net when the mapping table evolves.

Rejected alternative: a deterministic parser-only script (no LLM)
would be maximally deterministic but cannot handle messy free-form
input ("basic instructions" in Pedro's words) — the LLM interprets,
then the rules + canonizer pin the output. Rejected alternative 2:
skill writes prose directly into page shells — rejected, it breaks the
one-source-of-truth content model (DR-0001).

## Breakdown

- [ ] Ticket 1 — Hero front matter: renderer + shells read hero from
      page md (DR-0001), pilot page pixel-verified
- [ ] Ticket 2 — Migrate remaining md-page heroes to front matter
- [ ] Ticket 3 — Create the `visuai-text-to-md` skill (mapping table,
      precedence, inbox convention, idempotence)
- [ ] Ticket 4 — Canonicalizer + verify script (gates bundled)
- [ ] Ticket 5 — Golden-file eval set + determinism gate
- [ ] Ticket 6 — Wire into the visuAI workflow (visuaibear-core hub
      entry, routed after spec, before build) + AUTHORING.md doc-sync

## Open questions

| Question                                                                                                                                                          | Owner | Blocks build? |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------- |
| ~~Where do draft files live~~ — RESOLVED 2026-11-02: own space in `src/_data/drafts/` (`inbox/` → `processed/`); `.txt` is ignored by the data loader's whitelist | Pedro | no            |
| ~~Hero-meta day-one vocabulary~~ — RESOLVED 2026-11-02: full vocabulary (logo, needs, related, metrics, footnote) from day one                                    | Pedro | no            |
| ~~Final copy vs rough notes~~ — RESOLVED 2026-11-02: pasted text is FINAL copy; the skill modifies structure only, never content, unless explicitly instructed    | Pedro | no            |
