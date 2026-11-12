'use strict';
/*
 * The floating mirror link (specs/visualbear-system, Ticket 1, DR-0003):
 * a robot, fixed at the viewport's bottom-left, layered above every
 * content surface (z-index: 3 beats the nav's 2 and the z-index: 1
 * plates like .foot and #about, which used to paint over the unlayered
 * link). Pure string transform, extracted here so the injected markup
 * has a test: scripts/test/mirror-link.test.js.
 */

// keep injectVisuai's idempotency guard marker (was inline in
// scripts/release-mirror.js, release-4.0 R4-9b)
var VISUAI_MARK = 'mirror-visuai: specs/release-4.0';

function visuaiLinkFor(depth) {
  var href = new Array(depth + 1).join('../') + 'workflow/';
  // Ticket 10: the link is a 44x44 touch target (visuaibear-review's
  // a11y gate). The glyph keeps ticket 1's exact visual position - the
  // box's bottom-left - by flex-pinning the glyph span there: the hit
  // area grows up and toward the page center. The pill label is
  // decoration (aria-hidden, the accessible name stays the aria-label +
  // title); it expands on hover/focus via the .robot rules in
  // _pages.scss (state styling cannot be inline).
  return '\n<!-- ' + VISUAI_MARK + ' -->\n' +
    '<a class="robot" href="' + href + '" title="The visualbear system" ' +
    'aria-label="The visualbear system" ' +
    'style="position:fixed;bottom:12px;left:12px;width:44px;height:44px;' +
    'z-index:3;display:flex;align-items:flex-end;justify-content:flex-start;' +
    'text-decoration:none;line-height:1;">' +
    '<span class="robot-glyph" aria-hidden="true" style="font-size:20px;">' +
    '\uD83E\uDD16</span>' +
    '<span class="robot-pill" aria-hidden="true">workflow &amp; design system</span>' +
    '</a>\n';
}

// The public home carries a decorative, unlinked robot (src/index.nunjucks).
// The mirror home must not render two robots stacked at the same spot,
// so the injector swaps the decorative span out before its own link
// goes in.
function stripFloatingRobot(html) {
  return html.replace(/<span class="floating-robot"[^>]*>[\s\S]*?<\/span>\n?/g, '');
}

// Ticket 8 - the walled garden: the mirrored pages keep the site's nav,
// whose logo/work/about links point at the PUBLIC zone's root (href="/",
// "/#work", "/#about"). Rewritten depth-relative so navigation lands
// inside the mirror; #contact is in-page and stays as-is (the footer
// carries it on every page). Exact-quoted matches only: asset links
// (href="/styles/main.css", script srcs) and deeper absolute routes
// never match, and root-relative fragments (#contact) are not in scope.
// Already-relative output cannot match again, so a re-run
// changes nothing (idempotent).
//
// Ticket 12 (DR-0005): the site's About is an ANCHOR, not a page - the
// public nav's /#about scrolls to the home's #about section, and the
// mirror behaves the same: depth-relative mirror home + #about (the
// mirror home carries that section; #work targets it too). The about/
// page still ships but no nav link points at it.
//
// Ticket 19: the mirror HOME's in-copy anchors (the hero title link and
// the #about copy) escape at depth 0: ../#work, ../#contact resolve to
// the PUBLIC root, ../resume leaves the zone. Depth 0 only - at depth 1+
// every ../ href already lands inside the mirror (../#work from a
// section page = the mirror home's gallery). Idempotent: an in-page
// anchor no longer matches, and the already-in-page forms cannot recur.
function relativizeNavLinks(html, depth) {
  var up = new Array(depth + 1).join('../');
  if (depth === 0) {
    html = html
      .replace(/href="\.\.\/#([a-z-]+)"/g, 'href="#$1"')
      .replace(/href="\.\.\/resume"/g, 'href="resume/"');
  }
  return html
    .replace(/href="\/#work"/g, 'href="' + up + '#work"')
    .replace(/href="\/#about"/g, 'href="' + up + '#about"')
    .replace(/href="\/"/g, 'href="' + (up || './') + '"');
}

module.exports = {
  VISUAI_MARK: VISUAI_MARK,
  relativizeNavLinks: relativizeNavLinks,
  stripFloatingRobot: stripFloatingRobot,
  visuaiLinkFor: visuaiLinkFor
};
