'use strict';
/*
 * play-consistency T1 (DR-0001): the work gallery renders ONLY the data
 * cards - the Play teaser tile (id="play-teaser") is removed. The
 * bottom-flagged cards (e.g. the closet card) still render after the
 * regular work cards. Renders the gallery macro through nunjucks
 * directly. Run: npm test
 */
var assert = require('assert');
var path = require('path');
var nunjucks = require('nunjucks');

var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.join(__dirname, '../../src'))
);

var html = env.renderString(
  '{% import "_modules/organisms/gallery/gallery.nunjucks" as gallery %}{{ gallery.content(spec) }}',
  {
    spec: {
      contentType: 'work',
      showBlog: false,
      content: [
        { title: 'Work A', subtitle: 'a', href: '#a', img: 'a.jpg' },
        { title: 'Closet', subtitle: 'c', href: '#closet', img: 'c.jpg', bottom: true }
      ]
    }
  }
);

var closetIdx = html.indexOf('href="#closet"');
var workIdx = html.indexOf('href="#a"');

assert.ok(html.indexOf('id="play-teaser"') === -1, 'no Play teaser card renders in the work gallery');
assert.ok(html.indexOf('card--thin') === -1, 'no slim teaser card class renders');
assert.ok(html.indexOf('../play') === -1, 'no link to /play/ renders from the work gallery');
assert.ok(html.indexOf('../blog') === -1, 'the Blog card stays hidden (showBlog false)');
assert.ok(closetIdx !== -1 && workIdx !== -1, 'fixture cards render');
assert.ok(closetIdx > workIdx, 'bottom-flagged card renders after the regular work cards');

console.log('gallery-order.test: OK');
