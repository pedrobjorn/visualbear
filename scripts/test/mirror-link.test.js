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

// ── ticket 10: touch target + hover pill ─────────────────────────────────

// 44x44 hit box on the link itself (the glyph stays bottom-left inside it)
assert.ok(html.indexOf('width:44px;height:44px') !== -1, 'the link is a 44x44 touch target');
assert.ok(
  html.indexOf('display:flex;align-items:flex-end;justify-content:flex-start') !== -1,
  'the glyph stays pinned to the box bottom-left - visual position as ticket 1 shipped'
);

// the glyph lives in its own span so the box can grow without moving it
assert.ok(html.indexOf('class="robot-glyph"') !== -1, 'glyph wrapped in a span');
assert.ok(html.indexOf('font-size:20px') !== -1, 'glyph keeps its reduced 20px size (ticket 18 - optically matches the bear)');

// the label pill: visual sugar only - aria-hidden, exact lowercase string
assert.ok(html.indexOf('class="robot-pill"') !== -1, 'pill label span present');
assert.strictEqual(
  (html.match(/class="robot-pill"/g) || []).length,
  1,
  'exactly one pill span in the link'
);
assert.ok(
  html.indexOf('>workflow &amp; design system</span>') !== -1,
  'pill text is the exact lowercase string Pedro wrote'
);
assert.ok(/<span class="robot-pill" [^>]*aria-hidden="true"/.test(html), 'pill is aria-hidden');

// the accessible name is unchanged from ticket 1
assert.ok(html.indexOf('aria-label="The visualbear system"') !== -1, 'accessible name unchanged');

// mirror copies of the public home carry the decorative public robot;
// the injector must swap it out so the mirror never renders two robots
var robotSpan = '<span class="floating-robot" aria-hidden="true">to-be-replaced</span>';
var home = '<main><p>content</p></main>\n' + robotSpan + '\n';
var stripped = link.stripFloatingRobot(home);
assert.ok(stripped.indexOf('floating-robot') === -1, 'strip removes the public floating robot');
assert.ok(stripped.indexOf('<p>content</p>') !== -1 && stripped.indexOf('<main>') !== -1, 'strip leaves everything else');
assert.strictEqual(link.stripFloatingRobot(stripped), stripped, 'strip is idempotent');

// ── ticket 20 (DR-0008) + ticket 30 (DR-0010): the public home's robot is
// the LINKED pill, now targeting the PUBLIC system page (href="workflow/",
// marker data-vb-public-pill). The mirror strip must take it out - targeted
// on the marker, NOT on the href: since DR-0010 the public href="workflow/"
// equals the mirror root's own injected robot href, so the marker is the
// only collision-free selector.

var publicPill =
  '<a class="robot" data-vb-public-pill href="workflow/" title="The visualbear system" aria-label="The visualbear system" ' +
  'style="position:fixed;bottom:12px;left:12px;width:44px;height:44px;z-index:3;">' +
  '<span class="robot-glyph" aria-hidden="true" style="font-size:20px;">R</span>' +
  '<span class="robot-pill" aria-hidden="true">workflow &amp; design system</span></a>';
var home2 = '<main><p>content</p></main>\n' + publicPill + '\n';
var stripped2 = link.stripFloatingRobot(home2);
assert.ok(stripped2.indexOf('class="robot"') === -1, 'strip removes the PUBLIC robot pill (tickets 20/30)');
assert.ok(stripped2.indexOf('data-vb-public-pill') === -1, 'strip removes the public pill marker too');
assert.ok(stripped2.indexOf('<p>content</p>') !== -1, 'strip leaves everything else (public pill case)');
assert.strictEqual(link.stripFloatingRobot(stripped2), stripped2, 'strip is idempotent (public pill case)');

// the mirror's own injected link survives the strip (re-run safety):
var injected = link.visuaiLinkFor(0);
var mirrorHome = '<main></main>\n' + injected + '\n';
assert.strictEqual(link.stripFloatingRobot(mirrorHome), mirrorHome, 'strip never eats the mirror-injected robot');

var withBoth = '<main></main>\n' + robotSpan + publicPill + '\n' + injected + '\n';
var withBothStripped = link.stripFloatingRobot(withBoth);
assert.ok(withBothStripped.indexOf('floating-robot') === -1, 'strip removes the decorative span when both are present');
assert.ok(withBothStripped.indexOf('data-vb-public-pill') === -1, 'strip removes the public pill when both are present');
assert.ok(withBothStripped.indexOf('href="workflow/"') !== -1, 'the mirror-injected link survives when both are present');

// ── ticket 8: walled garden - mirror nav goes depth-relative ─────────────

var navPage = '<nav><a href="/" id="logo">visualbear</a>' +
  '<a href="/#work">Work</a><a href="/#about">About</a><a href="#contact">Contact</a></nav>';
var rel0 = link.relativizeNavLinks(navPage, 0);
assert.ok(rel0.indexOf('href="./"') !== -1, 'depth 0: logo -> ./');
assert.ok(rel0.indexOf('href="#work"') !== -1, 'depth 0: work -> #work (in-page - the mirror home IS the work index)');
assert.ok(rel0.indexOf('href="#about"') !== -1, 'depth 0: about -> #about (in-page anchor, DR-0005 - not the about/ page)');
assert.ok(rel0.indexOf('href="about/"') === -1, 'depth 0: no about/ page link');
assert.ok(rel0.indexOf('href="#contact"') !== -1, 'contact stays in-page');

var rel1 = link.relativizeNavLinks(navPage, 1);
assert.ok(rel1.indexOf('href="../"') !== -1, 'depth 1: logo -> ../');
assert.ok(rel1.indexOf('href="../#work"') !== -1, 'depth 1: work -> ../#work');
assert.ok(rel1.indexOf('href="../#about"') !== -1, 'depth 1: about -> ../#about (the mirror home\'s about section, DR-0005)');
assert.ok(rel1.indexOf('href="about/"') === -1, 'depth 1: no about/ page link');
assert.ok(rel1.indexOf('href="#contact"') !== -1, 'depth 1: contact stays in-page');

// already-relative pages pass through untouched (idempotent re-run)
var deep = link.relativizeNavLinks(rel1, 1);
assert.strictEqual(deep, rel1, 're-running the rewrite changes nothing (idempotent)');

// asset links are NOT navigation: root-absolute styles/scripts keep their
// hrefs (zone-served - VERIFY on deploy, ticket 8 open question)
var withAssets = '<link href="/styles/main.css"><script src="/scripts/main.js"></script>' + navPage;
var rewritten = link.relativizeNavLinks(withAssets, 0);
assert.ok(rewritten.indexOf('href="/styles/main.css"') !== -1, 'asset hrefs untouched');
assert.ok(rewritten.indexOf('src="/scripts/main.js"') !== -1, 'asset srcs untouched');

// deeper absolute routes (not the nav trio) are left alone
assert.ok(
  link.relativizeNavLinks('<a href="/about/more/">x</a>', 0).indexOf('/about/more/') !== -1,
  'non-nav absolute routes untouched'
);

// ── ticket 19: the mirror home's in-copy anchors sit inside the garden ───

// depth 0 (the home): ../#anchor -> in-page, ../resume -> resume/
var homeCopy = '<p><a href="../#work">check out my work</a>' +
  '<a href="../#contact">contact</a><a href="../resume">resume</a>' +
  '<a href="https://www.visualbear.com">visualbear.com</a></p>';
var relHome = link.relativizeNavLinks(homeCopy, 0);
assert.ok(relHome.indexOf('href="#work"') !== -1, 'depth 0: ../#work -> #work (the home IS the work index)');
assert.ok(relHome.indexOf('href="#contact"') !== -1, 'depth 0: ../#contact -> #contact');
assert.ok(relHome.indexOf('href="resume/"') !== -1, 'depth 0: ../resume -> resume/ (inside the mirror)');
assert.ok(relHome.indexOf('https://www.visualbear.com') !== -1, 'external outbound links untouched');
assert.strictEqual(link.relativizeNavLinks(relHome, 0), relHome, 'home anchor rewrite is idempotent');

// depth 1+: ../#work already resolves to the mirror home - unchanged
var innerCopy = '<a href="../#work">work</a><a href="../resume">resume</a>';
assert.strictEqual(link.relativizeNavLinks(innerCopy, 1), innerCopy,
  'depth 1 in-copy ../ links already sit inside the mirror - untouched');
assert.strictEqual(link.relativizeNavLinks(innerCopy, 2), innerCopy,
  'depth 2 unchanged too');

// ── ticket 18: the glyph reads at the bear's size ─────────────────────────

assert.ok(html.indexOf('font-size:20px') !== -1, 'glyph is 20px (bears optical size)');
assert.ok(html.indexOf('font-size:22px') === -1, 'the 22px glyph size is gone');

// ── ticket 25 (amend pass 2026-11-13b): the closet card is public-only ────
// Pedro: "re-add the closet project at the bottom of the cards in the
// index, but leave it out in the selected works." Both zones render the
// same gallery from work.json, so the mirror-side pass strips the work
// gallery CARD (the <a href=<closet drive link> target="_blank"> block).
// The styleguide casesystem demo (a bare <figure><img> with the same
// thumb, no anchor) can never match; closed card shape = the strip can
// never swallow a neighboring card.

var CLOSET_HREF = 'https://drive.google.com/file/d/1rY9YPYkL4HQcolMwhOtlk25uNjkFSBiw/view?usp=sharing';
var FASHION_HREF = 'https://drive.google.com/file/d/1XeZi2BfcTFRr2HSVrUE8MFVx-JGd5hiu/view?usp=sharing';

function galleryCard(href) {
  return '<a href="' + href + '" target="_blank">\n' +
    '  <div class=" row">\n' +
    '    <div class="col s12 m12">\n' +
    '      <div class="card-container card medium">\n' +
    '        <div class="card-container card-image" style="background-image: url(../images/work/thumbs/x.jpg)"\n' +
    '             data-mobile-image="x.jpg">\n' +
    '          <span class="card-title"><h2>x</h2></span>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</a>\n';
}

var galPage =
  '<div class="content gallery">\n' +
  galleryCard(FASHION_HREF) +
  galleryCard(CLOSET_HREF) +
  galleryCard('https://drive.google.com/file/d/9999999/view?usp=link') +
  '</div>';

var galStripped = link.stripClosetCard(galPage);
assert.ok(galStripped.indexOf('1rY9YPYkL4HQcolMwhOtlk25uNjkFSBiw') === -1, 'strip removes the closet card (tickets 25/30)');
assert.ok(galStripped.indexOf(FASHION_HREF) !== -1, 'strip keeps the neighboring fashion card');
assert.ok(galStripped.indexOf('9999999') !== -1, 'strip keeps the card after the closet');
assert.strictEqual(link.stripClosetCard(galStripped), galStripped, 'closet strip is idempotent');

// the styleguide demo (<figure><img>, no anchor) is never touched
var demoPage = '<div class="cs-shots">' +
  '<a href="https://example.com/" target="_blank">a link before it</a>' +
  '<figure class="cs-shot"><img src="../images/work/thumbs/gallery_thumb_closet.jpg" alt="Digital Closet"></figure>' +
  '</div>';
assert.strictEqual(link.stripClosetCard(demoPage), demoPage, 'the styleguide demo thumb is untouched');

// a page with no closet content at all is unchanged
var plainPage = '<main><a href="workflow/">x</a></main>';
assert.strictEqual(link.stripClosetCard(plainPage), plainPage, 'no-op pages pass through byte-identical');

// ── play-subpages T2 (amended, DR-0003): the Play card is public-only ─────
// The Play card now renders INSIDE the index work gallery (unique
// id="play-teaser" on the anchor). /play/ is not mirrored, so from a
// mirrored page its ../play href would resolve OUTSIDE the air-locked zone
// (guard check 8). The strip is targeted on the anchor's id, never on the
// href alone, and leaves the gallery wrapper and sibling cards alone.

var teaserAnchor =
  '<a id="play-teaser" class="card--thin" href="../play" target="">' +
  '<div class=" row"><div class="col s12 m12"><div class="card-container card medium">' +
  '<div class="card-container card-image" style="background-image: url(../images/work/thumbs/gallery_thumb_prettyugly.jpg)">' +
  '<span class="card-title"><h2>Play</h2><p class="card-content">Stuff I do for fun</p></span>' +
  '</div></div></div></div></a>';
var galleryHome =
  '<div id="work"><div class="content gallery"><div style="width:100%">' +
  '<a href="https://drive.google.com/x">Fashion</a>' + teaserAnchor +
  '</div></div></div>\n';
var teaserStripped = link.stripPlayTeaser(galleryHome);
assert.ok(teaserStripped.indexOf('play-teaser') === -1, 'strip removes the in-gallery Play card anchor');
assert.ok(teaserStripped.indexOf('../play') === -1, 'strip removes the escaping ../play href');
assert.ok(teaserStripped.indexOf('drive.google.com/x') !== -1, 'strip leaves the sibling gallery cards');
assert.ok(teaserStripped.indexOf('content gallery') !== -1, 'strip leaves the gallery wrapper itself');
assert.strictEqual(link.stripPlayTeaser(teaserStripped), teaserStripped, 'teaser strip is idempotent');
assert.strictEqual(link.stripPlayTeaser(plainPage), plainPage, 'pages without the Play card pass through byte-identical');

console.log('mirror-link.test: PASS');
