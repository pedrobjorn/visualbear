'use strict';
/*
 * case-study-nav v2 Ticket 1 (specs/case-study-nav-v2): position, curated
 * nav config, button anchors. Contract asserted here:
 *  1. mdToc(src) returns `<nav class="cs-index" aria-label="Case study sections">`
 *     whose links come from the page md's `nav:` front-matter list
 *     (`{ label, id }`, max 5, config order). Pages without `nav:` fall back
 *     to the first 5 `##` sections in document order, label = primary title.
 *  2. Every nav entry id MUST match an id mdPage assigns to a .cs-section on
 *     the same source (unknown id throws; >5 entries throws) - the nav can
 *     never drift from the rendered sections.
 *  3. Every anchor carries class="btn" (design-system button, v2 DR-0003);
 *     hrefs are in-page `#` anchors only (parent Ticket 5 must never add
 *     target=_blank to these). No whitespace between tags (bar height pin).
 *  4. every case-study page renders exactly its 5 configured condensed links
 *     (v3 DR-0003): teachr starts at Outcomes (Summary explicitly removed per
 *     Pedro 2026-11-24), the other four use the v3 Ticket 1 lists; labels are
 *     capped at 28 chars by the verify-page-md gate (v3 DR-0004), asserted
 *     here per page and on a synthetic over-cap fixture.
 *  5. Position (v2 DR-0004): the case-study shells render
 *     mdcover -> mdtoc -> mdherometa -> mdpage (nav directly under the hero
 *     cover, before the .cs-hero--meta band); mdhero is unchanged there.
 *  6. mdHero stays byte-identical to the pre-split output on every page md
 *     (fixture scripts/test/fixtures/mdhero-sha256.json, captured 2026-11-24
 *     before the split); mdCover + mdHeroMeta compose to exactly mdHero.
 *  7. T2/T3 CSS contract from specs/case-study-nav (sticky bar at top 48px,
 *     --cs-head-bg parity, scroll-margin-top) - unchanged by v2 Ticket 1.
 * Run: npm test
 */
var assert = require('assert');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var render;
try {
  render = require('../../markdown-render.js');
} catch (e) {
  console.error('cs-nav.test: FAIL - markdown-render.js is missing: ' + e.message);
  process.exit(1);
}

['mdToc', 'mdCover', 'mdHeroMeta'].forEach(function (name) {
  assert.strictEqual(
    typeof render[name],
    'function',
    name + ' must be exported from markdown-render.js (v2 Ticket 1)'
  );
});

var PAGES = path.join(__dirname, '../../src/_data/pages');
// all five case-study pages (teachr-agent joined in v2 Ticket 4 per parent
// DR-0003 sequencing - last, after Tickets 1-3 verified on the other four)
var SLUGS = [
  'fashion-rebrand',
  'sports-ecommerce-redesign',
  'digital-closet',
  'teachr',
  'teachr-agent'
];
var SECTION_COUNTS = {
  'fashion-rebrand': 6,
  'sports-ecommerce-redesign': 10, // 11 `##` lines, one is the ::: hero coupon-hero title
  'digital-closet': 5,
  teachr: 15,
  'teachr-agent': 7
};
// v3 DR-0003: every case-study page now has an explicit condensed nav: list
// (teachr's from v2, unchanged; the other four added in v3 Ticket 1). Labels
// are capped at 28 chars by verify-page-md gate 1b (v3 DR-0004).
var PAGE_NAV = {
  'fashion-rebrand': [
    ['Context', 'context'],
    ['Deep-Dive', 'deep-dive'],
    ['Process', 'process'],
    ['Outcomes', 'outcomes'],
    ['Future & Learnings', 'future']
  ],
  'sports-ecommerce-redesign': [
    ['Problems', 'definition'],
    ['Brand & Process', 'exploration'],
    ['Site Redesign', 'site-redesign'],
    ['Rollout', 'site-delivery'],
    ['Outcome', 'site-outcome']
  ],
  'digital-closet': [
    ['Problem', 'definition'],
    ['Research', 'research'],
    ['Flows & Validation', 'discovery'],
    ['Design System', 'delivery'],
    ['Outcome', 'outcome']
  ],
  teachr: [
    ['Outcomes', 'outcomes'],
    ['Context', 'process'],
    ['Discovery & Validation', 'discovery'],
    ['Design & Delivery', 'decisions'],
    ['Deepdive: Teachr Assistant', 'assistant']
  ],
  'teachr-agent': [
    ['Outcomes', 'outcomes'],
    ['Process', 'process'],
    ['Problem', 'problem'],
    ['Research', 'research'],
    ['Discovery', 'discovery']
  ]
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

// nav items as mdToc renders them: <li><a class="btn" href="#id">Label</a></li>
function tocItems(nav) {
  var out = [];
  var re = /<li><a class="btn" href="([^"]*)">([\s\S]*?)<\/a><\/li>/g;
  var m;
  while ((m = re.exec(nav))) out.push({ href: m[1], text: stripTags(m[2]) });
  return out;
}

function readPage(slug) {
  return fs.readFileSync(path.join(PAGES, slug + '.md'), 'utf8');
}

// ── 6. mdHero byte-identical + mdCover/mdHeroMeta composition ────────────
var fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures/mdhero-sha256.json'), 'utf8')
);
fs.readdirSync(PAGES)
  .filter(function (f) {
    return f.slice(-3) === '.md';
  })
  .forEach(function (f) {
    var src = fs.readFileSync(path.join(PAGES, f), 'utf8');
    var hash = crypto.createHash('sha256').update(render.mdHero(src)).digest('hex');
    assert.strictEqual(
      hash,
      fixture[f],
      f + ': mdHero output must be byte-identical to the pre-split fixture'
    );
    var cover = render.mdCover(src);
    var meta = render.mdHeroMeta(src);
    assert.strictEqual(
      render.mdHero(src),
      meta ? cover + '\n' + meta : cover,
      f + ': mdHero must equal mdCover (+ newline + mdHeroMeta when meta exists)'
    );
  });

// ── 1-4. nav config contract per case-study page ──────────────────────────
SLUGS.forEach(function (slug) {
  var src = readPage(slug);
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
  assert.ok(
    nav.indexOf('<ul><li>') !== -1,
    slug + ': no whitespace between <ul> and <li> (bar height pin)'
  );

  var sections = mdPageSections(page);
  var sectionIds = sections.map(function (s) {
    return s.id;
  });
  var items = tocItems(nav);

  assert.strictEqual(
    sections.length,
    SECTION_COUNTS[slug],
    slug + ': mdPage section count must be the known ' + SECTION_COUNTS[slug]
  );

  var hasNavCfg = /\nnav:\n/.test(src.slice(0, src.indexOf('---', 3) + 3)) || /^nav:\n/m.test(src);
  assert.ok(
    hasNavCfg,
    slug + ': every case-study page must carry an explicit nav: list (v3 Ticket 1)'
  );
  assert.strictEqual(
    items.length,
    5,
    slug + ': nav link count must be 5 (configured list, max 5 - v2 DR-0001 / v3 DR-0003)'
  );
  assert.ok(items.length <= 5, slug + ': hard cap - nav never renders more than 5 links');

  items.forEach(function (item, i) {
    assert.ok(item.href.charAt(0) === '#', slug + ': nav hrefs are in-page anchors only');
    assert.ok(
      sectionIds.indexOf(item.href.slice(1)) !== -1,
      slug +
        ': nav link ' +
        i +
        ' href ' +
        item.href +
        ' must match a mdPage .cs-section id (parity)'
    );
    assert.ok(
      /<a class="btn" /.test(nav),
      slug + ': every anchor carries class="btn" (v2 DR-0003)'
    );
  });

  assert.deepStrictEqual(
    items.map(function (it) {
      return [it.text, it.href.slice(1)];
    }),
    PAGE_NAV[slug],
    slug + ': nav must render exactly the configured condensed links in config order (v3 DR-0003)'
  );
  items.forEach(function (it) {
    assert.ok(
      it.text.length <= 28,
      slug + ': nav label "' + it.text + '" within the 28-char cap (v3 DR-0004)'
    );
  });
  if (slug === 'teachr') {
    assert.ok(
      items.every(function (it) {
        return it.text !== 'Summary';
      }),
      'teachr: no Summary link (Pedro 2026-11-24: skip the summary, start with outcomes)'
    );
  }
});

// ── 2. throw cases: >5 entries, unknown id ────────────────────────────────
function synthSrc(navYaml, body) {
  return '---\nhero:\n  title: "T"\n' + navYaml + '---\n\n' + body;
}
var sixNav =
  'nav:\n' +
  ['a', 'b', 'c', 'd', 'e', 'f']
    .map(function (id) {
      return '  - label: "L-' + id + '"\n    id: ' + id;
    })
    .join('\n') +
  '\n';
var sixBody = '## A | | a\n\n## B | | b\n\n## C | | c\n\n## D | | d\n\n## E | | e\n\n## F | | f\n';
assert.throws(
  function () {
    render.mdToc(synthSrc(sixNav, sixBody));
  },
  /max is 5/,
  'mdToc must throw when nav: has more than 5 entries'
);
var badNav = 'nav:\n  - label: "Nope"\n    id: nope\n';
assert.throws(
  function () {
    render.mdToc(synthSrc(badNav, '## A | | a\n'));
  },
  /nope/,
  'mdToc must throw when a nav: id matches no ## section id'
);
// a valid 5-entry config renders in config order, labels as given
var okNav = 'nav:\n  - label: "Second first"\n    id: b\n  - label: "A"\n    id: a\n';
var okItems = tocItems(render.mdToc(synthSrc(okNav, '## A | | a\n\n## B | | b\n')));
assert.deepStrictEqual(
  okItems.map(function (it) {
    return [it.text, it.href];
  }),
  [
    ['Second first', '#b'],
    ['A', '#a']
  ],
  'mdToc renders nav: entries in config order with the configured labels'
);
// no nav: key -> fallback = first 5 sections in document order, label = primary title
var noNavItems = tocItems(render.mdToc(synthSrc('', sixBody)));
assert.deepStrictEqual(
  noNavItems.map(function (it) {
    return [it.text, it.href];
  }),
  [
    ['A', '#a'],
    ['B', '#b'],
    ['C', '#c'],
    ['D', '#d'],
    ['E', '#e']
  ],
  'mdToc falls back to the first 5 sections with primary-title labels when no nav: key exists'
);

// ── 2b. v3 DR-0003/DR-0004: label cap enforced by the verify-page-md gate ──
// All 5 real page mds must pass the gate; a synthetic label over 28 chars must
// fail it (fixture: scripts/test/fixtures/nav-label-over-cap.md).
var execFileSync = require('child_process').execFileSync;
var VERIFY = path.join(__dirname, '../../specs/text-to-md/tools/verify-page-md.js');
SLUGS.forEach(function (slug) {
  var out = execFileSync(process.execPath, [VERIFY, path.join(PAGES, slug + '.md')], {
    encoding: 'utf8'
  });
  assert.ok(
    /nav valid \(5 entries/.test(out),
    slug + ': verify-page-md gate 1b must pass with 5 valid nav entries'
  );
});
var capFailed = false;
var capOut = '';
try {
  capOut = execFileSync(
    process.execPath,
    [VERIFY, path.join(__dirname, 'fixtures/nav-label-over-cap.md')],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
} catch (e) {
  capFailed = true;
  capOut = String(e.stdout || '') + String(e.stderr || '');
}
assert.ok(capFailed, 'verify-page-md must reject a nav label over the 28-char cap');
assert.ok(
  /max is 28/.test(capOut),
  'verify-page-md rejection must name the cap (max is 28): ' + capOut
);

// ── 5. template order: mdcover -> mdtoc -> mdherometa -> mdpage ───────────
var SRC = path.join(__dirname, '../../src');
SLUGS.forEach(function (slug) {
  var tpl = fs.readFileSync(path.join(SRC, slug, 'index.nunjucks'), 'utf8');
  assert.ok(
    !/\|\s*mdhero\s*\|/.test(tpl),
    slug + ': template must not call mdhero anymore (v2 DR-0004)'
  );
  var iCover = tpl.indexOf('| mdcover');
  var iToc = tpl.indexOf('| mdtoc');
  var iMeta = tpl.indexOf('| mdherometa');
  var iPage = tpl.indexOf('| mdpage');
  assert.ok(
    iCover !== -1 && iToc !== -1 && iMeta !== -1 && iPage !== -1,
    slug + ': template must render mdcover, mdtoc, mdherometa, mdpage'
  );
  assert.ok(
    iCover < iToc && iToc < iMeta && iMeta < iPage,
    slug +
      ': order must be mdcover -> mdtoc -> mdherometa -> mdpage (nav directly under the hero cover)'
  );
});

// ── 7. T2/T3 CSS contract (specs/case-study-nav tickets 2-3, DR-0001) ─────
// Asserted on the sources; runtime behavior (stuck at 48px, bg match, jump
// offsets) is measured by Playwright in the verify ticket.
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

// v2 T2 (DR-0002/DR-0003/DR-0005): bar left edge on the body edge (ul padding
// 0 at all widths), buttons touch + centered group, full-height ghost
// buttons at 2/3 size with underline (not fill) feedback
assert.ok(
  /ul\s*\{[^}]*padding:\s*0;/.test(barRegion),
  'cs-index ul: padding 0 at all widths (bar left edge = body left edge, DR-0002)'
);
assert.ok(/ul\s*\{[^}]*gap:\s*0;/.test(barRegion), 'cs-index ul: gap 0 (buttons touch, DR-0005)');
assert.ok(
  /ul\s*\{[^}]*justify-content:\s*center;/.test(barRegion),
  'cs-index ul: justify-content center (group centered, DR-0005)'
);
assert.ok(
  /li\s*\{[^}]*display:\s*flex;/.test(barRegion),
  'cs-index li: display flex (kills Materialize nav ul li float)'
);
assert.ok(
  /a\.btn\s*\{[^}]*padding:\s*7px 8px;/.test(barRegion),
  'cs-index a.btn: padding 7px 8px (2/3 size, DR-0005)'
);
assert.ok(
  /a\.btn\s*\{[^}]*height:\s*100%;/.test(barRegion),
  'cs-index a.btn: height 100% (anchor as tall as the bar, DR-0003)'
);
assert.ok(
  /a\.btn\s*\{[^}]*background-color:\s*transparent;/.test(barRegion),
  'cs-index a.btn: transparent background (ghost, DR-0005)'
);
assert.ok(
  /a\.btn[^{]*\{[\s\S]*?&:(hover|focus)[\s\S]*?background-color:\s*transparent;[\s\S]*?text-decoration:\s*underline;/.test(
    barRegion
  ),
  'cs-index a.btn: hover/focus = transparent + underline (no fill, DR-0005)'
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
  'teachr_container',
  'teachr_agent_container'
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
  'cs-nav.test: PASS - v2/v3 nav config (all 5 pages exact condensed 5-link lists, 28-char label cap gate) + btn anchors + ' +
    'mdcover/mdherometa split (mdHero byte-identical) + template order + T2/T3 CSS contract'
);
