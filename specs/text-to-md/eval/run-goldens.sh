#!/usr/bin/env bash
# Determinism gate for the text-to-md goldens (specs/text-to-md, DR-0002).
# Usage (from repo root): bash specs/text-to-md/eval/run-goldens.sh
# Checks, per case:
#   1. canonicalize is a fixed point on expected.md (idempotent)
#   2. expected.md passes verify-page-md.js against its input.txt
#   3. the structurally-identical pair (pair-a/pair-b): applying pair-a's
#      substitution manifest to pair-a/expected.md yields pair-b/expected.md
#      byte-for-byte - the core determinism requirement, proven

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
EVAL="$(cd "$(dirname "$0")" && pwd)"
FAILED=0

for d in "$EVAL"/case-* "$EVAL"/pair-*; do
  name=$(basename "$d")
  exp="$d/expected.md"
  [ -f "$exp" ] || { echo "FAIL $name: no expected.md"; FAILED=1; continue; }

  # 1 + 2 on a copy: canonicalize must not change the golden, verify must pass
  cp "$exp" /tmp/vb-golden.md
  node specs/text-to-md/tools/canonicalize.js /tmp/vb-golden.md | grep -q "already canonical" \
    || { echo "FAIL $name: golden not canonical (canonicalize would change it)"; FAILED=1; }
  node specs/text-to-md/tools/verify-page-md.js /tmp/vb-golden.md "$d/input.txt" >/dev/null \
    || { echo "FAIL $name: golden fails verify gates"; FAILED=1; }
done

# 3: the structurally-identical pair
if [ -f "$EVAL/pair-a/expected.md" ] && [ -f "$EVAL/pair-b/expected.md" ]; then
  node -e "
const fs = require('fs');
let a = fs.readFileSync('$EVAL/pair-a/expected.md', 'utf8');
const subs = fs.readFileSync('$EVAL/pair-a/substitutions.txt', 'utf8')
  .split('\n').filter(Boolean)
  .map(function (l) { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; });
subs.forEach(function (s) { a = a.split(s[0]).join(s[1]); });
const b = fs.readFileSync('$EVAL/pair-b/expected.md', 'utf8');
if (a === b) { console.log('ok   determinism pair: byte-identical after substitutions'); }
else { console.log('FAIL determinism pair: outputs differ after substitutions'); process.exit(1); }
" || FAILED=1
else
  echo "FAIL determinism pair: pair-a/pair-b expected.md missing"
  FAILED=1
fi

if [ "$FAILED" = "0" ]; then echo "GOLDENS: PASS"; else echo "GOLDENS: FAIL"; fi
exit $FAILED
