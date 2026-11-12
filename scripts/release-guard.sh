#!/usr/bin/env bash
# Release guard (specs/release-4.0, ticket R4-4).
#
# Runs before any publish. Asserts the air-lock actually holds:
#   1. the mirror exists and carries the secret pages
#   2. the secret pages are GONE from the public root
#   3. the mirror path appears NOWHERE a crawler or visitor can discover:
#      sitemap.xml, robots.txt, or any HTML outside the mirror
#   4. no index.php anywhere in the build (the retired gate must not ship)
#   5. every mirrored page carries the noindex marker
# Exits non-zero on any failure - the publish must not happen.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONFIG="src/_data/private-path.json"
SECRET_PAGES="teachr teachr-agent workflow"

fail() { echo "release-guard: FAIL: $1" >&2; exit 1; }

if [ ! -f "$CONFIG" ]; then
  fail "$CONFIG missing - this is the release path; a release needs the air-locked mirror."
fi

MIRROR="$(node -e "console.log(JSON.parse(require('fs').readFileSync('$CONFIG','utf8')).mirrorPath)")"
case "$MIRROR" in
  [a-z0-9]*[a-z0-9-]) ;; # loose check; release-mirror.js enforces the strict pattern
  *) fail "mirrorPath '$MIRROR' is not a safe path segment." ;;
esac

# 1. the mirror carries the secret pages
for page in $SECRET_PAGES; do
  [ -f "build/$MIRROR/$page/index.html" ] \
    || fail "build/$MIRROR/$page/index.html missing - rebuild (npm run build) before publishing."
done

# 2. the secret pages are gone from the public root
for page in $SECRET_PAGES; do
  [ ! -d "build/$page" ] || fail "public build/$page/ still exists - the mirror/prune step did not run."
done

# 3. the mirror path leaks nowhere
for f in build/sitemap.xml build/robots.txt; do
  if [ -f "$f" ] && grep -q "$MIRROR" "$f"; then
    fail "$f mentions the mirror path."
  fi
done
if grep -rl "$MIRROR" build --include="*.html" | grep -v "^build/$MIRROR/" > /tmp/r4-leak.$$ 2>/dev/null; then
  if [ -s "/tmp/r4-leak.$$" ]; then
    echo "release-guard: FAIL: the mirror path appears in public HTML:" >&2
    cat "/tmp/r4-leak.$$" >&2
    rm -f "/tmp/r4-leak.$$"
    exit 1
  fi
fi
rm -f "/tmp/r4-leak.$$"

# 4. no index.php anywhere in the build
if find build -name "*.php" -print -quit | grep -q .; then
  find build -name "*.php" >&2
  fail "php files in the build - the retired gate must not ship (DR-R4-0002)."
fi

# 5. every mirrored index.html is noindexed
TOTAL=$(find "build/$MIRROR" -name index.html | wc -l | tr -d ' ')
MARKED=$(grep -rl "air-locked: specs/release-4.0" "build/$MIRROR" --include="index.html" | wc -l | tr -d ' ')
[ "$TOTAL" = "$MARKED" ] || fail "only $MARKED of $TOTAL mirrored pages carry noindex - re-run release-mirror.js."

# 6. the visuai link (R4-9b): on every mirrored page, on no public page
TOTAL=$(find "build/$MIRROR" -name index.html | wc -l | tr -d ' ')
VISUAI=$(grep -rl "mirror-visuai: specs/release-4.0" "build/$MIRROR" --include="index.html" | wc -l | tr -d ' ')
[ "$TOTAL" = "$VISUAI" ] || fail "visuai link on $VISUAI of $TOTAL mirrored pages - re-run release-mirror.js."
grep -q 'mirror-visuai' build/index.html && fail "the visuai link leaked into the PUBLIC home page."
# the mirror ROOT's link must stay inside the mirror (../ would 404 publicly)
grep -q 'href="workflow/"' "build/$MIRROR/index.html" \
  || fail "the mirror home's visuai link must be relative (workflow/) to stay inside the mirror."

# 7. the walled garden (specs/visualbear-system, ticket 8): navigation in
# the mirror is depth-relative. Root-absolute hrefs in mirrored pages may
# only be zone-served assets - styles/scripts/images - never page links
# (logo "/", "/#work", "/#about", ...).
LEAK_FILES=$(find "build/$MIRROR" -name index.html | while read -r f; do
  if grep -o -E 'href="/[^"]*"' "$f" 2>/dev/null | grep -qvE 'href="/(styles|scripts|images|fonts)/'; then
    echo "$f"
  fi
done)
[ -z "$LEAK_FILES" ] || { echo "release-guard: FAIL: mirror pages keep public-root nav links:" >&2; echo "$LEAK_FILES" >&2; exit 1; }
NAVABS=$(grep -rh --include="index.html" -o -E 'href="/(styles|scripts|images|fonts)/[^"]*"' "build/$MIRROR" | wc -l | tr -d ' ')
echo "release-guard: OK - walled garden holds ($NAVABS zone-served absolute asset links, no root nav links)."

echo "release-guard: OK - air-lock holds at build/$MIRROR/ ($MARKED noindexed pages),"
echo "release-guard: OK - secret pages absent from the public root, mirror path leaks nowhere."
echo "release-guard: upload build/ as-is (both zones)."
