# Plan: freda.com recorded as external motion reference

- Date: 2026-11-20
- Status: draft
- Evidence: `evidence/freda-motion-analysis.md` (live fetch of https://freda.com/ + /about and all JS chunks, 2026-11-20; static code analysis, not browser-observed - ASSUMPTION: runtime behavior inferred from minified code, needs validation by watching the live site)

## Problem / opportunity

visualbearweb has hovers and transitions decided ad hoc per ticket (e.g. `visualbear-system/DR-0007` robot hover), but no catalogued external reference for motion: easing palette, durations, reveal choreography, disclosure animation. freda.com is a strong, current reference: a Framer-built marketing site with a disciplined, small motion vocabulary (one signature hero moment, quiet reveals, two spring flavors, three beziers).

## Goal

Keep a checked-in, citable analysis of freda.com's animations and transitions (`evidence/freda-motion-analysis.md`) so any future motion ticket can reference patterns by section number instead of re-deriving them. Measured by: future motion tickets link to `specs/freda-reference/evidence/freda-motion-analysis.md` sections rather than starting from zero.

## Non-goals

- No page of visualbearweb changes because of this spec. This is a reference, not a build order.
- No copying of freda's brand assets, copy, or the Framer stack itself; only motion patterns (timings, easings, choreography shapes).
- Not a full competitor audit; only https://freda.com/ and /about were analyzed.

## Approach

- Catalog the patterns as evidence (done: 8 sections in the evidence file: hero intro timeline, looping CSS keyframe mocks, appear reveals, scroll parallax, disclosure grid-rows, hover micro-interactions, /about signature + SMIL, token table).
- Any feature spec that adopts one of these patterns links to the evidence section and records its own DR (per `visuaibear-spec`: link, don't duplicate). Adoption decisions are not made here.
- Rejected alternative: porting freda's actual code (Framer chunks) - wrong stack, and the value is the pattern, not the implementation.

## Foundational checks

H1: no destructive operations in this spec (read-only analysis, two new files). H2: no assets requested. H3: the one material uncertainty (where to adopt these patterns) is batched in Open questions below with an owner.

## Breakdown

No build tickets yet; this spec is evidence-only. When a motion feature is picked up, it gets its own plan + tickets under its own `specs/<feature>/` folder and cites this evidence.

## Open questions

| Question | Owner | Blocks build? |
|---|---|---|
| Which visualbear surfaces should adopt which freda patterns (hero intro, reveal easing, disclosure animation, motion tokens)? | Pedro | yes, for any ticket citing this spec |
| Should visualbear get a written motion-token table of its own (durations/easings) derived from this reference? | Pedro | no |
