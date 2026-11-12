#!/usr/bin/env node
/*
 * Release 4.0 — the air-locked application path (specs/release-4.0).
 *
 * Reads src/_data/private-path.json (gitignored, DR-R4-0004), copies the
 * fresh build/ one level deeper into build/<mirrorPath>/, prunes the
 * secret pages from the public root, and injects `noindex, nofollow`
 * into every mirrored page.
 *
 * Idempotency: run against a FRESH gulp build (scripts/release.sh does
 * this in order). The merge-copy preserves a mirror's secret pages even
 * when the public copies were pruned by a previous run, so a double
 * run without a rebuild never loses teachr/workflow.
 *
 * Public-only builds (no private-path.json) skip this step with a loud
 * warning - `build:gulp` keeps working without the config.
 */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var BUILD = path.join(ROOT, 'build');
var CONFIG = path.join(ROOT, 'src', '_data', 'private-path.json');
var SECRET_DIRS = ['teachr', 'teachr-agent', 'workflow'];

function fail(msg) {
  console.error('release-mirror: ' + msg);
  process.exit(1);
}

function warn(msg) {
  console.warn('release-mirror: WARNING: ' + msg);
}

var config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
} catch (e) {
  console.warn('release-mirror: WARNING: no ' + path.relative(ROOT, CONFIG) + ' -');
  console.warn('release-mirror: WARNING: skipping the air-locked mirror. The build will be');
  console.warn('release-mirror: WARNING: PUBLIC-ONLY and teachr/workflow stay reachable. Not a release.');
  process.exit(0);
}

var mirrorPath = config.mirrorPath;
if (!mirrorPath || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(mirrorPath)) {
  fail('mirrorPath "' + mirrorPath + '" is not a safe lowercase path segment (DR-R4-0004).');
}
if (mirrorPath.length < 12) {
  fail('mirrorPath is too short to be unguessable (DR-R4-0004: platform phrase + >= 6 random chars).');
}

var mirror = path.join(BUILD, mirrorPath);
if (fs.existsSync(mirror) && !fs.statSync(mirror).isDirectory()) {
  fail('build/' + mirrorPath + ' exists but is not a directory.');
}
if (!fs.existsSync(mirror)) fs.mkdirSync(mirror, { recursive: true });

// 1. merge-copy build/ -> build/<mirrorPath>/
function copyOnto(from, to) {
  fs.readdirSync(from).forEach(function (name) {
    if (name === mirrorPath) return; // never recurse into the mirror itself
    var src = path.join(from, name);
    var dst = path.join(to, name);
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dst)) fs.mkdirSync(dst);
      copyOnto(src, dst);
    } else {
      fs.copyFileSync(src, dst);
    }
  });
}
copyOnto(BUILD, mirror);

// 2. prune the secret pages from the public root (their only home is the mirror)
SECRET_DIRS.forEach(function (dir) {
  var publicDir = path.join(BUILD, dir);
  if (fs.existsSync(publicDir)) {
    if (!fs.existsSync(path.join(mirror, dir))) {
      fail('refusing to prune build/' + dir + ' - the mirror copy is missing; nothing would serve the page.');
    }
    var removed = [];
    fs.readdirSync(publicDir).forEach(function (name) {
      fs.unlinkSync(path.join(publicDir, name));
      removed.push(name);
    });
    fs.rmdirSync(publicDir);
    console.log('release-mirror: pruned public build/' + dir + '/ (' + removed.join(', ') + ')');
  }
});

// 3. noindex, nofollow on every mirrored index.html (idempotent)
var META = '<meta name="robots" content="noindex, nofollow"/><!-- air-locked: specs/release-4.0 -->';
var injected = 0;
var already = 0;
function injectNoindex(dir) {
  fs.readdirSync(dir).forEach(function (name) {
    var p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      injectNoindex(p);
    } else if (name === 'index.html') {
      var html = fs.readFileSync(p, 'utf8');
      if (html.indexOf('air-locked: specs/release-4.0') !== -1) {
        already++;
        return;
      }
      if (html.indexOf('</head>') === -1) {
        fail('build/' + path.relative(BUILD, p) + ' has no </head> - cannot inject noindex.');
      }
      fs.writeFileSync(p, html.replace('</head>', '    ' + META + '\n</head>'));
      injected++;
    }
  });
}
injectNoindex(mirror);

// 4b. mirror-only cards: injected at the TOP of the mirror home's gallery
// (specs/release-4.0, R4-9). The public index.html never carries these.
// Data lives in src/_data/mirror-card.json - the same file the dev serve
// reads, so the mirror looks identical locally and in release.
var MIRROR_CARDS_FILE = path.join(ROOT, 'src', '_data', 'mirror-card.json');
var MIRROR_CARDS = [];
if (fs.existsSync(MIRROR_CARDS_FILE)) {
  try {
    MIRROR_CARDS = JSON.parse(fs.readFileSync(MIRROR_CARDS_FILE, 'utf8')).cards || [];
  } catch (e) {
    fail('src/_data/mirror-card.json is not valid JSON - ' + e.message);
  }
}
function cardHtml(card) {
  return '<a href="' + card.href + '"' + (card.target ? ' target="' + card.target + '"' : '') + '>\n' +
    '  <div class="row">\n' +
    '    <div class="col s12 m12">\n' +
    '      <div class="card-container card medium">\n' +
    '        <div class="card-container card-image" style="background-image: url(' + card.img + ')" data-mobile-image="' + card.img + '">\n' +
    '          <span class="card-title">\n' +
    '            <h2>\n' +
    '              ' + card.title + '\n' +
    '            </h2>\n' +
    '            <p class="card-content">\n' +
    '              ' + card.subtitle + '\n' +
    '            </p>\n' +
    '          </span>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</a>\n';
}
var HOME = path.join(mirror, 'index.html');
// inject INSIDE the gallery's card-grid wrapper - the same nesting the
// site's own cards use; one level up collapses the card CSS
var GALLERY_MARK = '<div style="width:100%">';
var homeHtml = fs.readFileSync(HOME, 'utf8');
var galleryAt = homeHtml.indexOf(GALLERY_MARK);
if (galleryAt === -1) fail('mirror home has no gallery - cannot inject mirror-only cards.');
var insertAt = galleryAt + GALLERY_MARK.length;
var cardsHtml = MIRROR_CARDS.map(cardHtml).join('\n');
if (cardsHtml) {
  homeHtml = homeHtml.slice(0, insertAt) + cardsHtml + '\n' + homeHtml.slice(insertAt);
}
fs.writeFileSync(HOME, homeHtml);
console.log('release-mirror: injected ' + MIRROR_CARDS.length + ' mirror-only card(s) into the home gallery.');

// 4b. the visuai workflow link (specs/release-4.0, R4-9b; ticket 1 /
// DR-0003 in specs/visualbear-system): every mirrored page gets a robot
// link into the mirror's own workflow pages; the public root keeps only
// the decorative index robot (DR-0004), which the injector swaps out so
// the mirror home never renders two robots. The href is depth-relative
// so the mirror stays airtight (mirror root -> workflow/, inner pages
// -> ../workflow/ etc). Markup lives in scripts/mirror-link.js (tested:
// scripts/test/mirror-link.test.js).
var mirrorLink = require('./mirror-link');
var VISUAI_MARK = mirrorLink.VISUAI_MARK;

function injectVisuai(dir, depth) {
  fs.readdirSync(dir).forEach(function (name) {
    var p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      injectVisuai(p, depth + 1);
      return;
    }
    if (name !== 'index.html') return;
    var html = fs.readFileSync(p, 'utf8');
    // the decorative public robot never renders next to the linked one
    html = mirrorLink.stripFloatingRobot(html);
    if (html.indexOf(VISUAI_MARK) !== -1) return; // idempotent
    if (html.indexOf('</body>') === -1) fail('mirror page has no </body>: ' + p);
    html = html.replace('</body>', mirrorLink.visuaiLinkFor(depth) + '</body>');
    fs.writeFileSync(p, html);
  });
}

injectVisuai(mirror, 0);
console.log('visuai link applied to all mirrored pages');
