'use strict';
/*
 * play-consistency T4 (DR-0004): smooth anchoring across all experience.
 * Contract asserted here:
 *  1. html has scroll-behavior: smooth with a prefers-reduced-motion opt-out
 *     (src/_styles/atoms/_base.scss) - the platform mechanism ticket 24 chose.
 *  2. Every live in-site anchor (an href with a fragment whose target id
 *     exists in src/) is in the explicit scroll-margin-top: 48px list, so
 *     targets land below the fixed nav instead of under it.
 * Demo links whose target does not exist (e.g. #visual in the styleguide
 * specimens) and commented-out links are ignored by the audit.
 * Run: npm test
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var SRC = path.join(__dirname, '../../src');

function walk(dir, out) {
  fs.readdirSync(dir).forEach(function (name) {
    var p = path.join(dir, name);
    var st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(nunjucks|json|yml)$/.test(name)) out.push(p);
  });
  return out;
}

var files = walk(SRC, []);

// collect existing element ids and live anchor fragments
var ids = {};
var fragments = {};
files.forEach(function (file) {
  var text = fs.readFileSync(file, 'utf8');
  var idRe = /id="([a-zA-Z][\w-]*)"/g;
  var m;
  while ((m = idRe.exec(text))) ids[m[1]] = true;

  var lines = text.split('\n');
  lines.forEach(function (line) {
    if (line.indexOf('<!--') !== -1) return; // commented-out markup (e.g. #templates)
    // matches nunjucks/yml href="..." and json "href": "..."
    var hrefRe = /["']?href["']?\s*[=:]\s*["']([^"']*)["']/g;
    var h;
    while ((h = hrefRe.exec(line))) {
      var frag = /#([a-zA-Z][\w-]*)$/.exec(h[1]);
      if (frag) fragments[frag[1]] = true;
    }
  });
});

var base = fs.readFileSync(path.join(SRC, '_styles/atoms/_base.scss'), 'utf8');

// 1. the CSS smooth-scroll mechanism is in place
assert.ok(/html\s*\{[^}]*scroll-behavior:\s*smooth;/.test(base), 'html has scroll-behavior: smooth');
assert.ok(
  /@media \(prefers-reduced-motion: reduce\) \{\s*scroll-behavior:\s*auto;/.test(base),
  'prefers-reduced-motion opts out to auto'
);

// 2. the explicit scroll-margin-top list covers every live anchor target
var marginRule = base.match(/([^{}]+)\{\s*scroll-margin-top:\s*48px;/);
assert.ok(marginRule, 'the scroll-margin-top: 48px rule exists (fixed nav height)');
var covered = {};
marginRule[1]
  .replace(/\/\/[^\n]*/g, '') // strip // comments before splitting selectors
  .split(',')
  .forEach(function (sel) {
    var id = sel.trim().replace(/^#/, '');
    if (id) covered[id] = true;
  });

var liveTargets = Object.keys(fragments).filter(function (frag) {
  return ids[frag]; // only fragments with a real target are live anchors
});
assert.ok(liveTargets.length >= 10, 'audit found the live anchor targets (got ' + liveTargets.length + ')');
liveTargets.forEach(function (frag) {
  assert.ok(covered[frag], 'anchor target #' + frag + ' is in the scroll-margin-top list');
});

// the planned ids from the plan.md audit table must all be covered
['work', 'about', 'contact', 'core', 'modules', 'containers', 'casesystem', 'play', 'discovery', 'definition', 'iteration', 'implementation'].forEach(
  function (id) {
    assert.ok(covered[id], 'planned target #' + id + ' has scroll-margin-top: 48px');
  }
);

// dead demo fragments must NOT force their way into the list
assert.ok(!covered.visual, '#visual is a dead styleguide demo link - not in the margin list');

console.log('anchors.test: OK (' + liveTargets.length + ' live targets covered: ' + liveTargets.join(', ') + ')');
