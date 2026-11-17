'use strict';
/*
 * play-menu-hero T2 (DR-0002): /play/photography/ adopts the shared hero
 * organism so the page matches /play/blog/ structurally - new
 * src/_data/photohero.yml rendered via hero.content with class
 * 'hero--roomy hero--center' (the height/centering modifiers themselves
 * land in T3/T4), the bare h1.photoview-title is deleted (the hero h1 keeps
 * exactly one h1 per page), the body class becomes "page-play play-photos",
 * .photoview loses its 48px nav padding (the hero occupies the top), and
 * the full-bleed photogrid gets the 74vh hero-clearing spacer on desktop
 * while mobile keeps margin-top: 0. The blog pages (index + 4 posts) get
 * body class "page-play play-blog"; /play/ keeps the plain "page-play".
 * Plain node asserts on the sources. Run: npm test
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var SRC = path.join(__dirname, '../../src');

// photohero.yml mirrors bloghero.yml's shape
var photoheroPath = path.join(SRC, '_data/photohero.yml');
assert.ok(fs.existsSync(photoheroPath), 'src/_data/photohero.yml exists');
var photohero = fs.readFileSync(photoheroPath, 'utf8');
assert.ok(/^name: photo$/m.test(photohero), 'photohero.yml name: photo');
assert.ok(/^title: Photography$/m.test(photohero), 'photohero.yml title: Photography');

// photography page: hero organism in, bare h1 out, before .photoview
var photo = fs.readFileSync(path.join(SRC, 'play/photography/index.nunjucks'), 'utf8');
assert.ok(
  /import ["']_modules\/organisms\/hero\/hero\.nunjucks["'] as hero/.test(photo),
  'photography template imports the hero macro'
);
assert.ok(
  /\{\{hero\.content\(\{content:\s*site\.data\.photohero,\s*class:\s*'hero--roomy hero--center'\s*\}\)\}\}/.test(photo),
  "photography renders hero.content({content:site.data.photohero, class:'hero--roomy hero--center'})"
);
assert.ok(
  photo.indexOf('hero.content') < photo.indexOf('class="photoview"'),
  'the hero renders before .photoview'
);
assert.ok(!/<h1 class="photoview-title">/.test(photo), 'the bare h1.photoview-title element is deleted from the template');
assert.ok(
  photo.indexOf('{% block bodyattrs %} class="page-play play-photos"{% endblock %}') !== -1,
  'photography body class is "page-play play-photos"'
);
// regression guards: the photogrid machinery is untouched
assert.ok(photo.indexOf("contentType: 'photogrid'") !== -1, 'the photogrid gallery call is still there');
assert.ok(photo.indexOf('id="photogrid-data"') !== -1, 'the #photogrid-data JSON is still there');
assert.ok(photo.indexOf('lightbox.content') !== -1, 'the lightbox dialog is still included');

// body classes: blog pages get play-blog, /play/ keeps the plain page-play
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
    rel + ' sets bodyattrs class="page-play play-blog"'
  );
});
var playIndex = fs.readFileSync(path.join(SRC, 'play/index.nunjucks'), 'utf8');
assert.ok(
  playIndex.indexOf('{% block bodyattrs %} class="page-play"{% endblock %}') !== -1,
  '/play/ keeps the plain class="page-play" (no section class)'
);

// gallery.scss contract
var scss = fs.readFileSync(path.join(SRC, '_modules/organisms/gallery/gallery.scss'), 'utf8');
assert.ok(scss.indexOf('.photoview-title') === -1, 'the now-unused .photoview-title rule is deleted from gallery.scss');
var photoviewRule = scss.match(/\.photoview \{[^}]*\}/);
assert.ok(!photoviewRule || !/padding-top/.test(photoviewRule[0]), '.photoview no longer pads 48px under the nav (the hero occupies the top)');
assert.ok(
  /body\.play-photos \.content\.gallery:has\(\.gallery-grid\) \{[^}]*margin-top: 74vh;/.test(scss),
  'desktop spacer: body.play-photos .content.gallery:has(.gallery-grid) gets margin-top: 74vh (roomy hero 48vh + the standard 26vh gap)'
);
var mqBlocks = scss.match(/@include mq\(\$until: mobile\) \{[\s\S]*?\n\}/g) || [];
assert.ok(mqBlocks.length > 0, 'mobile mq blocks exist in gallery.scss');
var mobileOverride = mqBlocks.filter(function(b) {
  return /body\.play-photos \.content\.gallery:has\(\.gallery-grid\) \{[^}]*margin-top: 0;/.test(b);
});
assert.strictEqual(mobileOverride.length, 1, 'exactly one mobile mq block zeroes the photogrid spacer (margin-top: 0)');
assert.ok(
  scss.indexOf('margin-top: 74vh') !== -1 && scss.indexOf('margin-top: 74vh') < scss.indexOf(mobileOverride[0]),
  'the mobile override sits AFTER the 74vh rule in the file, so it wins at equal specificity (0,4,1)'
);

console.log('play-hero.test: OK');
