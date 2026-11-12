#!/usr/bin/env node
/*
 * Mirror leak scan (specs/visualbear-system, ticket 19): every mirrored
 * page's hrefs must resolve INSIDE the mirror. Outbound references are
 * allowed: https://, http://, mailto:, tel:, protocol-relative (//).
 * In-page fragments (#) and relative hrefs (../, ./) are resolved
 * structurally: a fragment is always in-page; a relative href escapes
 * only when it climbs past the mirror root. Root-absolute hrefs resolve
 * against the WEB ROOT - inside only when they name the mirror itself
 * (the non-mirror ones are guard check 7's domain: root nav links).
 *
 * Prints each escaping href as "<page>: <href> -> <reason>" and exits
 * 0 when the mirror holds, 1 otherwise.
 */
'use strict';

var fs = require('fs');
var path = require('path');

var root = path.resolve(process.argv[2] || 'build');
var mirrorName = path.basename(root);
var escapes = [];

// returns null = inside the mirror (or an outbound reference), a string
// reason = the href escapes and was resolved to the public zone.
function escapeReason(pageDepth, href) {
  if (/^(https?:|mailto:|tel:|\/\/)/.test(href)) return null;
  if (href.charAt(0) === '#') return null; // in-page fragment
  var path_ = href.replace(/#.*$/, '');
  if (path_ === '') return null; // bare-fragment form ('#x' handled above)

  if (href.charAt(0) === '/') {
    var abs = path_.replace(/^\/+/, '').replace(/\/+$/, '');
    // zone-served assets (guard check 7's whitelist) + the mirror itself
    if (/^(styles|scripts|images|fonts)\b/.test(abs)) return null;
    if (abs === mirrorName || abs.indexOf(mirrorName + '/') === 0) return null;
    return 'root-absolute -> public zone ' + href;
  }

  // relative: count the ups; more ups than the page depth = escape
  var ups = 0;
  var rest = [];
  path_.split('/').forEach(function (seg) {
    if (seg === '..') ups++;
    else if (seg === '.' || seg === '') { /* keep */ }
    else rest.push(seg);
  });
  if (ups > pageDepth) {
    return 'relative escapes the mirror root -> /' + rest.join('/') +
      ' (climbs ' + ups + ' from depth ' + pageDepth + ')';
  }
  return null;
}

function walk(dir, rel) {
  fs.readdirSync(dir).forEach(function (name) {
    var p = path.join(dir, name);
    var r = rel ? path.join(rel, name) : name;
    if (fs.statSync(p).isDirectory()) return walk(p, r);
    if (name !== 'index.html') return;
    var pageDepth = path.dirname(r) === '.' ? 0 : path.dirname(r).split(path.sep).length;
    var html = fs.readFileSync(p, 'utf8');
    var matches = html.match(/href="([^"]+)"/g) || [];
    matches.forEach(function (m) {
      var href = m.slice(6, -1);
      var reason = escapeReason(pageDepth, href);
      if (reason) escapes.push(r + ': ' + href + ' -> ' + reason);
    });
  });
}
walk(root, '');

if (escapes.length) {
  escapes.forEach(function (e) { console.log(e); });
  process.exit(1);
}
