# Drafts — the copy source of truth (specs/text-to-md, DR-0003)

`<slug>.txt` here is the page's copy source. You edit THIS file; the
`visuai-text-to-md` skill re-converts it into the derived page md
(`src/_data/pages/<slug>.md`, hero included) whenever the txt changes.

- The md is derived: deterministic output of the rules (DR-0002), never
  hand-edited. Copy edits go in the txt, then re-convert.
- One txt per page, permanently - no staging, no archiving.
- `.txt` never enters the build (the data loader's whitelist is
  `json|ya?ml|md`).

Example: `teachr-one-page.txt` → `src/_data/pages/teachr-one-page.md`
(evaluate pair-a golden).
