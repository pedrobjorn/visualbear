'use strict';
/*
 * Ticket 2 (specs/play-subpages/tickets.md): the card molecule's `thin`
 * flag renders the `card--thin` class on the card anchor; without the flag
 * the class is absent and default cards are unchanged. Plain node asserts
 * rendering the macro through nunjucks directly - the page wiring is
 * verified in the build (evidence/t2-verify.md). Run: npm test
 */
var assert = require('assert');
var path = require('path');
var nunjucks = require('nunjucks');

var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.join(__dirname, '../../src/_modules/molecules'))
);

function renderCard(spec) {
  return env.renderString('{% import "card/card.nunjucks" as card %}{{ card.content(spec) }}', {
    spec: spec
  });
}

var card = { title: 'Play', subtitle: 'Stuff I do for fun', href: '../play', img: 'x.jpg' };

var thin = renderCard({ card: card, thin: true });
assert.ok(/card--thin/.test(thin), 'thin:true renders the card--thin class');
assert.ok(/href="\.\.\/play"/.test(thin), 'thin card keeps its href');
assert.ok(/Play/.test(thin) && /Stuff I do for fun/.test(thin), 'thin card keeps title and subtitle');

var plain = renderCard({ card: card });
assert.ok(!/card--thin/.test(plain), 'no thin flag -> no card--thin class (default cards unchanged)');

console.log('card-thin.test: OK');
