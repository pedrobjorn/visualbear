# Golden-file eval set — the determinism gate (DR-0002)

Each case: `input.txt` (raw pasted text) + `expected.md` (the golden
conversion, hand-verified against AUTHORING.md before commit).

The gate, run by `run-goldens.sh` from the repo root:

1. canonicalize over every `expected.md` is a fixed point (idempotent)
2. every golden passes `verify-page-md.js <expected.md> <input.txt>`
3. the structurally-identical pair (`pair-a/`, `pair-b/`) produces
   byte-identical output after the substitution manifest
   (`pair.substitutions`) is applied to A - the user's core requirement
4. when converting the eval inputs live (agent-run): the produced md must
   equal `expected.md` byte-for-byte

When the precedence table evolves, update goldens in the same change: the
diff line IS the audit trail for "why did my conversion change".
