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
  return '\n<!-- ' + VISUAI_MARK + ' -->\n' +
    '<a class="robot" href="' + href + '" title="The visualbear system" ' +
    'aria-label="The visualbear system" ' +
    'style="position:fixed;bottom:12px;left:12px;font-size:22px;' +
    'z-index:3;text-decoration:none;line-height:1;">' +
    '\uD83E\uDD16</a>\n';
}

// The public home carries a decorative, unlinked robot (src/index.nunjucks).
// The mirror home must not render two robots stacked at the same spot,
// so the injector swaps the decorative span out before its own link
// goes in.
function stripFloatingRobot(html) {
  return html.replace(/<span class="floating-robot"[^>]*>[\s\S]*?<\/span>\n?/g, '');
}

module.exports = {
  VISUAI_MARK: VISUAI_MARK,
  visuaiLinkFor: visuaiLinkFor,
  stripFloatingRobot: stripFloatingRobot
};
