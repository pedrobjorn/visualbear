#!/usr/bin/env bash
# Release orchestrator (specs/release-4.0) - `npm run build`.
#
# Pipeline: headless production build (no BrowserSync/watch - a release never
# collides with the dev server's ports) -> air-locked mirror (release-mirror.js)
# -> guard (release-guard.sh). Ends with a build that is SAFE to upload in
# full (both zones).
#
# Supersedes the teachr-gate wrapper of the same name (DR-R4-0002).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f "src/_data/private-path.json" ]; then
  echo "release: src/_data/private-path.json is missing -" >&2
  echo "release: this is the RELEASE build path; it needs the air-locked mirror" >&2
  echo "release: (copy the .example, set the real path, see specs/release-4.0/DR-R4-0004)." >&2
  echo "release: for a public-only dev build use: npm run build:gulp" >&2
  exit 1
fi

NODE_ENV=production ./scripts/gulp.sh --production --headless || true
# The gulp CLI can exit while its async tasks are still writing (gulp 3).
# Completion is decided by a settle detector, not by gulp's exit: the
# build tree's newest mtime + file count stay stable, and the last page
# exists. Never relies on the process being quiescent.

PAGE="build/workflow/index.html"
SETTLED=0
LAST_SIG=""
STABLE=0
for _ in $(seq 1 90); do
  if [ -f "$PAGE" ]; then
    NEWEST=$(find build -type f -exec stat -f %m {} + 2>/dev/null | sort -n | tail -1)
    COUNT=$(find build -type f 2>/dev/null | wc -l | tr -d ' ')
    SIG="$COUNT:$NEWEST"
    if [ "$SIG" = "$LAST_SIG" ]; then
      STABLE=$((STABLE + 1))
      if [ "$STABLE" -ge 2 ]; then
        SETTLED=1
        break
      fi
    else
      STABLE=0
      LAST_SIG="$SIG"
    fi
  fi
  sleep 3
done

if [ "$SETTLED" != "1" ]; then
  echo "release: the build did not settle within the timeout -" >&2
  echo "release: the mirror + guard did NOT run; do not upload yet." >&2
  exit 1
fi
echo "release: build settled ($LAST_SIG)."

node scripts/release-mirror.js
exec ./scripts/release-guard.sh
