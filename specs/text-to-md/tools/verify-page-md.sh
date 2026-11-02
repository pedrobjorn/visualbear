#!/usr/bin/env bash
# Verification bundle for text-to-md output (specs/text-to-md, DR-0002).
# Usage (from repo root): verify-page-md.sh <page.md> [source.txt]
# Gates: front-matter vocabulary, em-dash (source-verbatim allowance),
# image refs, content accounting, format, doc-sync.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

PAGE="$1"
SOURCE="${2:-}"

if [ -z "$PAGE" ]; then
  echo "usage: verify-page-md.sh <page.md> [source.txt]"
  exit 1
fi

FAILED=0

node specs/text-to-md/tools/verify-page-md.js "$PAGE" $SOURCE || FAILED=1

# formatting (prettier on md; excludes src/_data/pages copy-in-flight per repo config)
./scripts/prettier.sh --check "$PAGE" >/dev/null 2>&1 \
  || { echo "FAIL format: prettier check on $PAGE"; FAILED=1; }

# doc-sync: every ::: type documented in AUTHORING.md is a known container
if [ -x specs/md-case-study-editor/tools/doc-sync.sh ]; then
  bash specs/md-case-study-editor/tools/doc-sync.sh || FAILED=1
else
  echo "skip doc-sync: script not present"
fi

if [ "$FAILED" = "0" ]; then
  echo "VERIFY: PASS ($PAGE)"
else
  echo "VERIFY: FAIL ($PAGE)"
fi
exit $FAILED
