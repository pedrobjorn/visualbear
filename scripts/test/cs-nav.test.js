'use strict';
/*
 * case-study-nav Ticket 1: the `mdtoc` filter derives the in-page section
 * nav from the same `## Title | Eyebrow | id` lines that mdPage renders as
 * .cs-section blocks. Contract asserted here:
 *  1. mdToc(src) returns `<nav class="cs-index" aria-label="Case study sections">`
 *     with one `<li><a href="#id">Title</a></li>` per section, in document order.
 *  2. Parity: the nav's hrefs are exactly the ids mdPage assigns to
 *     .cs-section blocks on the same source, same order, same count
 *     (the two filters share one H2 parser, so they cannot drift).
 *  3. Known section counts on the four case-study pages (2026-11-23):
 *     fashion-rebrand 6, sports-ecommerce-redesign 10 (its 11th `##` line,
 *     "Redesigned Coupon System", is the `::: hero coupon-hero` title, not
 *     a section), digital-closet 5, teachr 15.
 *  4. Link text is the primary title (first pipe field, tags stripped).
 *  5. Every href starts with `#` (in-page anchor; Ticket 5 must never add
 *     target=_blank to these).
 * Run: npm test
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var render;
try {
  render = require('../../markdown-render.js');
} catch (e) {
  console.error('cs-nav.test: FAIL - markdown-render.js is missing: ' + e.message);
  process.exit(1);
}

assert.strictEqual(
  typeof render.mdToc,
  'function',
  'mdToc must be exported from markdown-render.js (Ticket 1)'
);

var PAGES = path.join(__dirname, '../../src/_data/pages');
var EXPECTED = {
  'fashion-rebrand': 6,
  'sports-ecommerce-redesign': 10, // 11 `##` lines, one is the ::: hero coupon-hero title
  'digital-closet': 5,
  teachr: 15
};

function stripTags(s) {
  return s.replace(/<[^>]*>/g, '');
}

// sections as mdPage renders them: <section class="cs-section" id="...">...<h2>..</h2>
function mdPageSections(html) {
  var out = [];
  var re = /<section class="cs-section" id="([^"]*)">[\s\S]*?<h2>([\s\S]*?)<\/h2>/g;
  var m;
  while ((m = re.exec(html))) out.push({ id: m[1], title: stripTags(m[2]) });
  return out;
}

// nav items as mdToc renders them: <li><a href="#id">Title</a></li>
function tocItems(nav) {
  var out = [];
  var re = /<li><a href="([^"]*)">([\s\S]*?)<\/a><\/li>/g;
  var m;
  while ((m = re.exec(nav))) out.push({ href: m[1], text: stripTags(m[2]) });
  return out;
}

Object.keys(EXPECTED).forEach(function (slug) {
  var src = fs.readFileSync(path.join(PAGES, slug + '.md'), 'utf8');
  var page = render.mdPage(src);
  var nav = render.mdToc(src);

  assert.ok(
    nav.indexOf('<nav class="cs-index"') === 0,
    slug + ': mdToc output must start with <nav class="cs-index"'
  );
  assert.ok(
    nav.indexOf('aria-label="Case study sections"') !== -1,
    slug + ': nav must carry aria-label="Case study sections"'
  );

  var sections = mdPageSections(page);
  var items = tocItems(nav);

  assert.strictEqual(
    sections.length,
    EXPECTED[slug],
    slug + ': mdPage section count must be the known ' + EXPECTED[slug]
  );
  assert.strictEqual(
    items.length,
    sections.length,
    slug + ': nav link count must equal mdPage section count'
  );

  for (var i = 0; i < sections.length; i++) {
    assert.strictEqual(
      items[i].href,
      '#' + sections[i].id,
      slug + ': nav link ' + i + ' href must be #' + sections[i].id + ' (parity with mdPage id)'
    );
    assert.ok(items[i].href.charAt(0) === '#', slug + ': nav hrefs are in-page anchors only');
    assert.strictEqual(
      items[i].text,
      sections[i].title,
      slug + ': nav link ' + i + ' text must equal the section primary title'
    );
  }
});

console.log(
  'cs-nav.test: PASS - mdtoc parity on ' + Object.keys(EXPECTED).length + ' case-study pages'
);
