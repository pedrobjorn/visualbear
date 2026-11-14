'use strict';
/*
 * Ticket 1 (specs/play-subpages/tickets.md): the /play/ gallery lists exactly
 * two cards, Blog then Photography, linking to the new sub-pages (DR-0001).
 * Plain node asserts on the data file - the rendered output is verified in
 * the build (build/play/index.html). Run: npm test
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var play = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../src/_data/play.json'), 'utf8')
);

assert.ok(Array.isArray(play), 'play.json is an array');
assert.strictEqual(play.length, 2, 'exactly two cards, not three');

assert.strictEqual(play[0].title, 'Blog', 'first card is Blog');
assert.strictEqual(play[0].href, '../play/blog', 'Blog links to /play/blog/');
assert.strictEqual(play[1].title, 'Photography', 'second card is Photography');
assert.strictEqual(play[1].href, '../play/photography', 'Photography links to /play/photography/');

play.forEach(function(card, i) {
  assert.ok(card.title && card.subtitle && card.img, 'card ' + i + ' has title, subtitle and img');
});

console.log('play-data.test: OK');
