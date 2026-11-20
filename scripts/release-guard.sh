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
SECRET_PAGES="teachr teachr-agent teachr-app workflow"
# DR-0010 (ticket 30): workflow is PUBLIC at the root since 2026-11-13 -
# it must exist in the mirror AND at the public root; the teachr case
# study, teachr-agent and the teachr-app prototype are pruned from the
# public root.
PRUNED_PAGES="teachr teachr-agent teachr-app"

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

# 2. the pruned secret pages are gone from the public root (workflow is
#    public since DR-0010 - asserted PRESENT here, absent only for teachr*)
for page in $PRUNED_PAGES; do
  [ ! -d "build/$page" ] || fail "public build/$page/ still exists - the mirror/prune step did not run."
done
[ -f "build/workflow/index.html" ] || fail "public build/workflow/index.html missing - DR-0010 says the system page ships at the root."

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

# 6. the visuai link (R4-9b): on every mirrored page EXCEPT the training
#    app (teachr-app - release-mirror strips the robot there; the fixed
#    pill would overlap the app's own action bar), and on no public page
PAGES=$(find "build/$MIRROR" -name index.html -not -path "build/$MIRROR/teachr-app/*")
TOTAL=$(printf '%s\n' "$PAGES" | wc -l | tr -d ' ')
VISUAI=$(printf '%s\n' "$PAGES" | xargs grep -l "mirror-visuai: specs/release-4.0" 2>/dev/null | wc -l | tr -d ' ')
[ "$TOTAL" = "$VISUAI" ] || fail "visuai link on $VISUAI of $TOTAL mirrored pages - re-run release-mirror.js."
grep -q 'mirror-visuai\|robot-glyph' "build/$MIRROR/teachr-app/index.html" \
  && fail "the training app page must not carry the robot link (teachr-app is robot-free)."
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

# 8. no internal href resolves OUTSIDE the mirror (specs/visualbear-system,
# ticket 19): resolve every href against its page and require the result
# to stay under build/<MIRROR>/. External page references (https://, mailto,
# protocol-relative) are outbound references - allowed. The scan that
# found the escape (the home's ../#work, ../#contact, ../resume) is this
# check's logic.
OUT=$(node "$ROOT/scripts/mirror-leak-scan.js" "build/$MIRROR" 2>&1)
if [ -n "$OUT" ]; then
  echo "release-guard: FAIL: internal links resolve outside the mirror:" >&2
  echo "$OUT" >&2
  exit 1
fi
echo "release-guard: OK - in-copy anchors stay inside the mirror (leak scan clean)."

# 9. the three WIP case-study cards (fashion-rebrand, sports-ecommerce-
#    redesign, digital-closet) link to their PAGES in BOTH zones: the
#    public index and the mirror home must each carry the relative card
#    href (work.json renders on the home only, depth 0, so the relative
#    href resolves inside each zone: /fashion-rebrand/ publicly,
#    /selected-works/fashion-rebrand/ in the mirror).
for card in fashion-rebrand/ sports-ecommerce-redesign/ digital-closet/; do
  grep -q "href=\"$card\"" build/index.html \
    || fail "the public index lost the $card card."
  grep -q "href=\"$card\"" "build/$MIRROR/index.html" \
    || fail "the mirror home lost the $card card."
done
echo "release-guard: OK - fashion / sports-ecommerce / closet cards link to their pages in both zones."

echo "release-guard: OK - air-lock holds at build/$MIRROR/ ($MARKED noindexed pages),"
echo "release-guard: OK - secret pages absent from the public root, mirror path leaks nowhere."
echo "release-guard: upload build/ as-is (both zones)."
