#!/bin/bash
# Ticket 29 (doc-sync gate): the set of ::: container types documented in
# AUTHORING.md must equal the set handled in renderContainer
# (markdown-render.js). Run from the repo root:
#   sh specs/md-case-study-editor/tools/doc-sync.sh
set -e
docs=$(grep -oE '^ *::: [a-z-]+' AUTHORING.md | awk '{print $2}' | sort -u)
code=$(grep -oE "type === '[a-z]+'" markdown-render.js | sed "s/type === '//;s/'//" | sort -u)
if [ "$docs" = "$code" ]; then
  echo "doc-sync OK: $(echo "$docs" | tr '\n' ' ')"
else
  echo "doc-sync FAILED — AUTHORING.md vs renderContainer:" >&2
  diff <(echo "$docs") <(echo "$code") >&2
  exit 1
fi
