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

// ── T2/T3 CSS contract (specs/case-study-nav tickets 2-3, DR-0001) ─────────
// Asserted on the sources; runtime behavior (stuck at 48px, bg match, jump
// offsets) is measured by Playwright in Ticket 6.
var navScss = fs.readFileSync(
  path.join(__dirname, '../../src/_modules/molecules/nav/nav.scss'),
  'utf8'
);
var csScss = fs.readFileSync(
  path.join(__dirname, '../../src/_styles/templates/_case-study.scss'),
  'utf8'
);

// DR-0001: one variable drives both the fixed header and the stuck bar, so
// they can never diverge. Default on body, per-theme overrides on the
// case-study page classes; nav.site-nav consumes the variable.
assert.ok(
  /body\s*\{[^}]*--cs-head-bg:\s*#\{\$vb-primary\}/.test(navScss),
  'nav.scss: body defines the default --cs-head-bg ($vb-primary)'
);
assert.ok(
  /nav\.site-nav\s*\{[^}]*background-color:\s*var\(--cs-head-bg/.test(navScss),
  'nav.scss: nav.site-nav background-color uses var(--cs-head-bg)'
);
// libsass (gulp-sass 3.x) only substitutes #{} interpolation inside custom
// property values - a plain $var stays literal and var() then resolves to an
// invalid color. The braced form is required.
[
  ['cs-pink-page', 'cs-pink-ground'],
  ['cs-black-page', 'cs-black'],
  ['cs-teal-page', 'cs-teal-ground']
].forEach(function (pair) {
  var re = new RegExp(
    'body\\.' + pair[0] + '\\s*\\{[^}]*--cs-head-bg:\\s*#\\{\\$' + pair[1] + '\\}'
  );
  assert.ok(
    re.test(csScss),
    '_case-study.scss: body.' + pair[0] + ' sets --cs-head-bg: #{$' + pair[1] + '}'
  );
});

// T2: the sticky bar, scoped under .case-study .cs-index (placed right before
// the .cs-section block in the file, so this slice covers the whole block)
var barRegion = csScss.slice(csScss.indexOf('.cs-index'), csScss.indexOf('.cs-section {'));
assert.ok(barRegion.length > 0, '_case-study.scss: .cs-index block exists');
assert.ok(/position:\s*sticky;/.test(barRegion), 'cs-index: position sticky');
assert.ok(/top:\s*48px;/.test(barRegion), 'cs-index: sticks at top: 48px (nav.site-nav height)');
assert.ok(/z-index:\s*1;/.test(barRegion), 'cs-index: z-index 1 (under nav z-index 2)');
assert.ok(
  /background-color:\s*var\(--cs-head-bg\);/.test(barRegion),
  'cs-index: opaque background matches the header via --cs-head-bg (DR-0001)'
);
assert.ok(/width:\s*100vw;/.test(barRegion), 'cs-index: full-bleed like the header');
assert.ok(
  /margin-left:\s*calc\(50% - 50vw\);/.test(barRegion),
  'cs-index: full-bleed centering inside the text column'
);
assert.ok(
  /overflow-x:\s*auto;/.test(barRegion),
  'cs-index: horizontal scroll strip for long lists'
);
assert.ok(/white-space:\s*nowrap;/.test(barRegion), 'cs-index: links never wrap');
assert.ok(/line-height:\s*20px;/.test(barRegion), 'cs-index: link line-height pins the bar height');
assert.ok(
  /height:\s*auto;/.test(barRegion),
  'cs-index: height auto overrides Materialize element-level nav { height }'
);

// T3: anchored sections land below the stuck bar (48px nav + bar height)
var secRegion = csScss.slice(csScss.indexOf('.cs-section {'), csScss.indexOf('.cs-section-intro'));
assert.ok(
  /scroll-margin-top:\s*calc\(48px \+ var\(--cs-index-h/.test(secRegion),
  '.cs-section: scroll-margin-top = 48px + bar height'
);
assert.ok(
  /--cs-index-h:\s*\d+px/.test(csScss),
  '_case-study.scss: --cs-index-h is pinned to a measured px value'
);
[
  'fashion_rebrand_container',
  'sports_ecommerce_container',
  'digital_closet_container',
  'teachr_container'
].forEach(function (id) {
  var re = new RegExp(
    '#' + id + ' \\.cs-section[\\s\\S]*?scroll-margin-top:\\s*calc\\(48px \\+ var\\(--cs-index-h'
  );
  assert.ok(
    re.test(csScss),
    '_case-study.scss: #' +
      id +
      ' .cs-section override beats the ID-specific 48px anchor list in _base.scss'
  );
});

console.log(
  'cs-nav.test: PASS - mdtoc parity on ' +
    Object.keys(EXPECTED).length +
    ' case-study pages + T2/T3 CSS contract'
);
