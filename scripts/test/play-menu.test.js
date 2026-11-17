'use strict';
/*
 * play-menu-hero T1 (DR-0001, amended): the PLAY NAV menu gets its own
 * variant - Blog, Photos, Contact - without touching the visualbear nav
 * (site.data.sitemap) and without touching the /play/ hero (playhero.yml
 * keeps its original About/Work links). Mechanism: base.nunjucks wraps the
 * nav in {% block nav %} defaulting to sitemap; the play layouts
 * (_layouts/play.nunjucks over gallery, _layouts/play-work.nunjucks over
 * work) override it with site.data.playsitemap; the 7 play pages extend
 * those layouts. Plain node asserts on the sources. Run: npm test
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var SRC = path.join(__dirname, '../../src');

// the hero is UNCHANGED - About/Work links stay in playhero.yml
var hero = fs.readFileSync(path.join(SRC, '_data/playhero.yml'), 'utf8');
assert.ok(hero.indexOf('href="../about"') !== -1, 'hero keeps its original About link (../about)');
assert.ok(hero.indexOf('href="#play"') !== -1, 'hero keeps its original Work link (#play)');
assert.ok(hero.indexOf("I'm Pedro") !== -1, 'hero keeps the original "I\'m Pedro" item');

// the play nav variant data: Blog, Photos, Contact - no Work, no About
var play = JSON.parse(fs.readFileSync(path.join(SRC, '_data/playsitemap.json'), 'utf8'));
var names = play.map(function (l) { return l.linkname; });
assert.deepStrictEqual(names, ['Blog', 'Photos', 'Contact'], 'play nav is exactly Blog, Photos, Contact (got ' + names.join(', ') + ')');
assert.strictEqual(play[0].href, '/play/blog/', 'Blog hrefs /play/blog/');
assert.strictEqual(play[1].href, '/play/photography/', 'Photos hrefs /play/photography/');
assert.strictEqual(play[2].href, '#contact', 'Contact stays as the same-page #contact anchor');
assert.ok(names.indexOf('Work') === -1 && names.indexOf('About') === -1, 'no Work/About in the play nav');

// the visualbear nav data is untouched
var site = JSON.parse(fs.readFileSync(path.join(SRC, '_data/sitemap.json'), 'utf8'));
assert.deepStrictEqual(site.map(function (l) { return l.linkname; }), ['Work', 'About', 'Contact'], 'sitemap.json still Work/About/Contact');

// base.nunjucks: nav wrapped in an overridable block, default = sitemap
var base = fs.readFileSync(path.join(SRC, '_layouts/base.nunjucks'), 'utf8');
assert.ok(
  /\{% block nav %\}\{\{nav\.content\(\{links: site\.data\.sitemap\}\)\}\}\{% endblock %\}/.test(base),
  'base.nunjucks wraps the nav in {% block nav %} defaulting to site.data.sitemap'
);

// the two play layouts override the nav block with the play variant
['_layouts/play.nunjucks', '_layouts/play-work.nunjucks'].forEach(function (rel) {
  var tpl = fs.readFileSync(path.join(SRC, rel), 'utf8');
  assert.ok(/\{% block nav %\}/.test(tpl), rel + ' overrides the nav block');
  assert.ok(tpl.indexOf('site.data.playsitemap') !== -1, rel + ' renders the nav with site.data.playsitemap');
});

// all 7 play pages extend a play layout; home keeps the plain gallery layout
var playPages = [
  'play/index.nunjucks',
  'play/blog/index.nunjucks',
  'play/blog/blog1/index.nunjucks',
  'play/blog/blog2/index.nunjucks',
  'play/blog/blog3/index.nunjucks',
  'play/blog/hello-world/index.nunjucks',
  'play/photography/index.nunjucks'
];
playPages.forEach(function (rel) {
  var tpl = fs.readFileSync(path.join(SRC, rel), 'utf8');
  assert.ok(/extends ['"]_layouts\/play(-work)?\.nunjucks['"]/.test(tpl), rel + ' extends a play layout');
});
var home = fs.readFileSync(path.join(SRC, 'index.nunjucks'), 'utf8');
assert.ok(home.indexOf("extends '_layouts/gallery.nunjucks'") !== -1, 'home still extends the plain gallery layout (visualbear nav)');

console.log('play-menu.test: OK');
