'use strict';
/*
 * Ticket 1 (specs/visualbear-system/tickets.md): the floating mirror
 * link is a robot, layered above every z-index: 1 content surface
 * (DR-0003). Plain node asserts - the repo has no test runner, so run:
 *   npm test
 */
var assert = require('assert');
var link;
try {
  link = require('../mirror-link');
}
catch (e) {
  console.error('mirror-link.test: FAIL - scripts/mirror-link.js is missing: ' + e.message);
  process.exit(1);
}

var ROBOT = '\uD83E\uDD16';
var BEAR = '\uD83D\uDC3B';

var html = link.visuaiLinkFor(0);
assert.strictEqual(typeof html, 'string', 'visuaiLinkFor must return a string');
assert.ok(html.indexOf('class="robot"') !== -1, 'class must be robot (got class="bear")');
assert.ok(html.indexOf('class="bear"') === -1, 'no bear class may remain');
assert.ok(html.indexOf(ROBOT) !== -1, 'emoji must be the robot U+1F916');
assert.ok(html.indexOf(BEAR) === -1, 'the bear emoji must be gone');
assert.ok(html.indexOf('z-index:3') !== -1, 'must layer above the z-index:1 content surfaces (DR-0003)');
assert.ok(html.indexOf('aria-label="The visualbear system"') !== -1, 'must carry the accessible name');
assert.ok(html.indexOf('title="The visualbear system"') !== -1, 'title must name the destination view');
assert.ok(html.indexOf('/>') === -1, 'no stray surrogate halves from a wrong escape');

// href stays depth-relative (mirror root -> workflow/, inner pages -> ../workflow/)
assert.ok(link.visuaiLinkFor(0).indexOf('href="workflow/"') !== -1, 'depth 0 hrefs the mirror-root workflow');
assert.ok(link.visuaiLinkFor(2).indexOf('href="../../workflow/"') !== -1, 'depth 2 hrefs ../../workflow/');

// idempotency: the marker comment must survive for injectVisuai's guard
assert.ok(html.indexOf(link.VISUAI_MARK) !== -1, 'marker comment must be present');

// mirror copies of the public home carry the decorative public robot;
// the injector must swap it out so the mirror never renders two robots
var robotSpan = '<span class="floating-robot" aria-hidden="true">to-be-replaced</span>';
var home = '<main><p>content</p></main>\n' + robotSpan + '\n';
var stripped = link.stripFloatingRobot(home);
assert.ok(stripped.indexOf('floating-robot') === -1, 'strip removes the public floating robot');
assert.ok(stripped.indexOf('<p>content</p>') !== -1 && stripped.indexOf('<main>') !== -1, 'strip leaves everything else');
assert.strictEqual(link.stripFloatingRobot(stripped), stripped, 'strip is idempotent');

console.log('mirror-link.test: PASS');
