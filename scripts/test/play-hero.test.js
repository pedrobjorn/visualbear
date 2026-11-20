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
  /\{\{hero\.content\(\{content:\s*site\.data\.photohero,\s*class:\s*'hero--fill hero--center'\s*\}\)\}\}/.test(photo),
  "photography renders hero.content({content:site.data.photohero, class:'hero--fill hero--center'}) (T7/DR-0004: fills header-to-content, replaces the unshipped hero--roomy)"
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
// play-menu-hero T7 (DR-0004): on the photography page the spacer moved to
// the .photoview CONTAINER so the switch sits between the title and the grid
// at rest; the gallery itself is zeroed (outranks the page-play rule below
// at 0,4,1 vs 0,3,1, so the spacer is not doubled).
assert.ok(
  /body\.play-photos \.photoview \{[^}]*margin-top: var\(--play-gallery-top\);/.test(scss),
  'body.play-photos .photoview gets margin-top: var(--play-gallery-top) (= end of the hero--fill region) - the switch flows between title and photogrid'
);
assert.ok(
  /body\.play-photos \.content\.gallery:has\(\.gallery-grid\) \{[^}]*margin-top: 0;/.test(scss),
  'body.play-photos .content.gallery:has(.gallery-grid) is zeroed (the container carries the spacer)'
);
var mqBlocks = scss.match(/@include mq\(\$until: mobile\) \{[\s\S]*?\n\}/g) || [];
assert.ok(mqBlocks.length > 0, 'mobile mq blocks exist in gallery.scss');
var mobilePhotoview = mqBlocks.filter(function(b) {
  return /body\.play-photos \.photoview \{[^}]*margin-top: 0;/.test(b);
});
assert.strictEqual(mobilePhotoview.length, 1, 'exactly one mobile mq block zeroes the .photoview spacer (margin-top: 0)');
assert.ok(
  scss.indexOf('body.play-photos .photoview') !== -1 && scss.indexOf('margin-top: var(--play-gallery-top)') < scss.indexOf(mobilePhotoview[0]),
  'the mobile override sits AFTER the --play-gallery-top .photoview rule in the file, so it wins at equal specificity (0,3,1)'
);

// play-menu-hero T7 (DR-0004), Pedro clarified: the title must be VISUALLY
// centered between the header bar and the body content. The play hero is
// that container: .hero--fill starts below the 48px nav and ends at 48vh
// (where the content spacer starts), so top: 50% centering lands the title
// at the middle of the header-to-content region. The rule must sit BEFORE
// the mobile mq in hero.scss so mobile's height: auto still wins.
var heroScss = fs.readFileSync(path.join(SRC, '_modules/organisms/hero/hero.scss'), 'utf8');
var fillIdx = heroScss.indexOf('.hero--fill');
var heroMqIdx = heroScss.indexOf('@include mq($until: mobile)');
assert.ok(/\.hero--fill \{[^}]*top: 48px;[^}]*height: calc\(48vh - 48px\);/s.test(heroScss), 'hero.scss declares .hero--fill { top: 48px; height: calc(48vh - 48px) } (header-to-content container)');
assert.ok(fillIdx !== -1 && heroMqIdx !== -1 && fillIdx < heroMqIdx, 'the .hero--fill rule sits BEFORE the mobile mq block');
// the title must be truly centered in the hero even when the content
// overflows it (flex auto margins clamp to 0 on overflow) - absolute centering,
// reset to static inside the mobile mq
assert.ok(
  /\.hero--fill \.content \{[^}]*position: absolute;[^}]*top: 50%;[^}]*transform: translateY\(-50%\);/s.test(heroScss),
  '.hero--fill .content is absolutely centered (top: 50% + translateY(-50%))'
);
var heroMqBlocks = (heroScss.match(/@include mq\(\$until: mobile\)\{[\s\S]*?\n\}/g) || []);
var mqReset = heroMqBlocks.filter(function(b) {
  return /\.hero \.content \{[^}]*position: static;[^}]*transform: none;/s.test(b);
});
assert.strictEqual(mqReset.length, 1, 'the mobile mq resets .hero .content to position: static (absolute centering undone where the hero flows)');
var playHero = fs.readFileSync(path.join(SRC, 'play/index.nunjucks'), 'utf8');
var blogIndex = fs.readFileSync(path.join(SRC, 'play/blog/index.nunjucks'), 'utf8');
assert.ok(/hero\.content\(\{content:\s*site\.data\.playhero,\s*class:\s*'hero-about hero--fill'\s*\}\)/.test(playHero), "/play/ hero call gets class 'hero-about hero--fill'");
assert.ok(/hero\.content\(\{content:\s*site\.data\.bloghero,\s*class:\s*'hero-about hero--fill'\s*\}\)/.test(blogIndex), "/play/blog/ hero call gets class 'hero-about hero--fill'");
assert.ok(
  /body\.page-play \.content\.gallery \{[^}]*margin-top: var\(--play-gallery-top\);/.test(scss),
  'body.page-play .content.gallery gets margin-top: var(--play-gallery-top) (= hero--fill region end, was the default 66vh) - content starts at the hero bottom edge'
);
var pagePlayMobile = mqBlocks.filter(function(b) {
  return /body\.page-play \.content\.gallery \{[^}]*margin-top: 0;/.test(b);
});
assert.strictEqual(pagePlayMobile.length, 1, 'exactly one mobile mq block zeroes the page-play spacer (margin-top: 0)');
assert.ok(
  scss.indexOf('margin-top: var(--play-gallery-top)') !== -1 && scss.indexOf('margin-top: var(--play-gallery-top)') < scss.indexOf(pagePlayMobile[0]),
  'the page-play mobile override sits AFTER the --play-gallery-top rule, so it wins at equal specificity (0,3,1)'
);

console.log('play-hero.test: OK');
