'use strict';
/*
 * play-subpages T2 (amendment v4, DR-0005): in the work gallery the slim
 * Play card (id="play-teaser") is the LAST card - after the bottom-flagged
 * cards (e.g. the closet card). Renders the gallery macro through nunjucks
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
      showPlay: true,
      showBlog: false,
      content: [
        { title: 'Work A', subtitle: 'a', href: '#a', img: 'a.jpg' },
        { title: 'Closet', subtitle: 'c', href: '#closet', img: 'c.jpg', bottom: true }
      ]
    }
  }
);

var playIdx = html.indexOf('id="play-teaser"');
var closetIdx = html.indexOf('href="#closet"');
var workIdx = html.indexOf('href="#a"');

assert.ok(playIdx !== -1, 'the Play card renders when showPlay is true');
assert.ok(html.indexOf('card--thin') !== -1, 'the Play card is slim (card--thin)');
assert.ok(html.indexOf('../blog') === -1, 'the Blog card stays hidden (showBlog false)');
assert.ok(closetIdx !== -1 && workIdx !== -1, 'fixture cards render');
assert.ok(playIdx > closetIdx, 'Play card is the LAST card - after the bottom-flagged closet card');
assert.ok(playIdx > workIdx, 'Play card is after the regular work cards');

console.log('gallery-order.test: OK');
