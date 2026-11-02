# Drafts inbox — the text-to-md entry point (specs/text-to-md)

- `inbox/<slug>.txt` — paste raw text here (final copy), run the
  `visuai-text-to-md` skill: structure-only conversion into
  `src/_data/pages/<slug>.md`, hero included, then self-verification.
- `processed/` — the skill archives the source here after a green run.

`.txt` never enters the build (the data loader's whitelist is
`json|ya?ml|md`).
