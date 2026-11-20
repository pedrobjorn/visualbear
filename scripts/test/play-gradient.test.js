'use strict';
/*
 * play-consistency T2 (DR-0002): every /play/ page (index, blog index,
 * all posts, photography) carries the single shared dark gradient class
 * body.page-play. _base.scss defines that rule exactly once (the dark
 * grey gradient photography shipped with, DR-0006) and no
 * page-blog / page-photography selectors remain there. The home red fade
 * (body.home-page) is untouched.
 * AMENDED play-menu-hero T2 (DR-0002): the section classes play-photos
 * (photography) and play-blog (blog index + posts) now ride on top of
 * page-play in the body class; page-play stays the first class so the
 * shared gradient still applies everywhere. Plain node asserts on the
 * sources - rendered output is verified in the build. Run: npm test
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var SRC = path.join(__dirname, '../../src');

var playPages = [
  'play/index.nunjucks',
  'play/blog/index.nunjucks',
  'play/blog/blog1/index.nunjucks',
  'play/blog/blog2/index.nunjucks',
  'play/blog/blog3/index.nunjucks',
  'play/blog/hello-world/index.nunjucks',
  'play/photography/index.nunjucks'
];

playPages.forEach(function(rel) {
  var tpl = fs.readFileSync(path.join(SRC, rel), 'utf8');
  assert.ok(
    /\{% block bodyattrs %\} class="page-play[ "]/.test(tpl),
    rel + ' keeps page-play as its first body class (the shared dark gradient)'
  );
  assert.ok(tpl.indexOf('page-photography') === -1, rel + ' no longer references page-photography');
});

// play-menu-hero T2 (DR-0002): section classes on top of page-play
var photoPage = fs.readFileSync(path.join(SRC, 'play/photography/index.nunjucks'), 'utf8');
assert.ok(
  photoPage.indexOf('{% block bodyattrs %} class="page-play play-photos"{% endblock %}') !== -1,
  'photography adds play-photos on top of page-play'
);
var blogPages = [
  'play/blog/index.nunjucks',
  'play/blog/blog1/index.nunjucks',
  'play/blog/blog2/index.nunjucks',
  'play/blog/blog3/index.nunjucks',
  'play/blog/hello-world/index.nunjucks'
];
blogPages.forEach(function(rel) {
  var tpl = fs.readFileSync(path.join(SRC, rel), 'utf8');
  assert.ok(
    tpl.indexOf('{% block bodyattrs %} class="page-play play-blog"{% endblock %}') !== -1,
    rel + ' adds play-blog on top of page-play'
  );
});
var playIndex = fs.readFileSync(path.join(SRC, 'play/index.nunjucks'), 'utf8');
assert.ok(
  playIndex.indexOf('{% block bodyattrs %} class="page-play"{% endblock %}') !== -1,
  '/play/ keeps the plain page-play class (no section class)'
);

var base = fs.readFileSync(path.join(SRC, '_styles/atoms/_base.scss'), 'utf8');
var pagePlayRules = base.match(/body\.page-play\s*\{/g) || [];
assert.strictEqual(pagePlayRules.length, 1, 'exactly one body.page-play rule - the single shared gradient');
assert.ok(/body\.page-play \{[\s\S]*?#3a3a41/.test(base), 'page-play gradient starts at #3a3a41');
assert.ok(/body\.page-play \{[\s\S]*?#18181b/.test(base), 'page-play gradient ends on the flat #18181b base');
assert.ok(base.indexOf('page-blog') === -1, 'no page-blog selector or reference remains in _base.scss');
assert.ok(base.indexOf('page-photography') === -1, 'no page-photography selector or reference remains in _base.scss');
assert.ok(/body\.home-page[\s,{]/.test(base), 'home keeps its own body.home-page rule');
assert.ok(/body\.home-page \{[\s\S]*?#d73735/.test(base), 'home red fade (#d73735) is untouched');

// the fixed nav must not cap a dark play page with the solid brand red
var nav = fs.readFileSync(path.join(SRC, '_modules/molecules/nav/nav.scss'), 'utf8');
assert.ok(
  /body\.page-play nav\.site-nav \{\s*background-color: #3a3a41;/.test(nav),
  'body.page-play nav.site-nav takes the gradient top stop #3a3a41 (no red bar on play pages)'
);

// the gallery's plate is the mask that hides the fixed hero title behind the
// gallery on scroll (the gallery is position:relative, so its plate paints
// above the z-index:0 hero). Amended 2026-11-17: the plate CONTINUES the
// body's own page-anchored fade (body.page-play::before, #3a3a41 -> #18181b
// over one 100vh layer at document top) instead of a static transparent->solid
// gradient, so it is pixel-identical to the ground at every scroll position -
// no visible panel (the old plate's solid edge landed above the fold once the
// gallery moved to 48vh). The fade layer is re-anchored to document top via
// background-position against --play-gallery-top; a flat #18181b layer covers
// below the fold.
var galleryScss = fs.readFileSync(path.join(SRC, '_modules/organisms/gallery/gallery.scss'), 'utf8');
var baseScss = fs.readFileSync(path.join(SRC, '_styles/atoms/_base.scss'), 'utf8');
assert.ok(
  /--play-gallery-top:\s*48vh;/.test(baseScss),
  'body.page-play declares --play-gallery-top: 48vh (the gallery document-top, shared with the plate)'
);
assert.ok(
  /body\.page-play \.content\.gallery\s*\{[^}]*background-position:\s*0 calc\(0px - var\(--play-gallery-top\)\), 0 0;/s.test(
    galleryScss
  ) && /linear-gradient\(180deg in oklab, #3a3a41 0%, #18181b 100vh\)/.test(galleryScss),
  'body.page-play .content.gallery plate continues the body fade page-anchored (oklab #3a3a41 -> #18181b over 100vh, positioned by --play-gallery-top) + flat #18181b below - masks the hero title, invisible against the ground'
);
// on mobile the hero flows with the content, so the plate is dropped there
// (same as home) - the override must outrank the desktop plate rule
var mobileBlock = galleryScss.match(/@include mq\(\$until: mobile\) \{[\s\S]*?\n\}/);
assert.ok(mobileBlock, 'the mobile gallery override block exists');
assert.ok(
  /body\.page-play \.content\.gallery\s*\{\s*background: none;/.test(mobileBlock[0]),
  'mobile: body.page-play .content.gallery is background:none (hero is in flow, no plate needed)'
);

console.log('play-gradient.test: OK');
