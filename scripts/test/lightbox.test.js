'use strict';
/*
 * Ticket 12 (specs/play-subpages/tickets.md): the pure lightbox logic in
 * src/_modules/molecules/lightbox/lightbox-core.js - wrap-around stepping
 * and input validation only, no DOM. Run: npm test
 */
var assert = require('assert');
var core;
try {
  core = require('../../src/_modules/molecules/lightbox/lightbox-core');
} catch (e) {
  console.error('lightbox.test: FAIL - lightbox-core.js is missing: ' + e.message);
  process.exit(1);
}

// ── stepIndex: wrap-around stepping ──────────────────────────────────────

assert.strictEqual(core.stepIndex(0, 1, 3), 1, 'forward steps');
assert.strictEqual(core.stepIndex(2, 1, 3), 0, 'forward wraps past the last item');
assert.strictEqual(core.stepIndex(0, -1, 3), 2, 'backward wraps before the first item');
assert.strictEqual(core.stepIndex(1, -1, 3), 0, 'backward steps');

// single item stays on 0 in both directions
assert.strictEqual(core.stepIndex(0, 1, 1), 0, 'single item stays on forward');
assert.strictEqual(core.stepIndex(0, -1, 1), 0, 'single item stays on backward');

// empty list is safe: no selection (-1), for any index/dir
assert.strictEqual(core.stepIndex(0, 1, 0), -1, 'empty list has no selection');
assert.strictEqual(core.stepIndex(5, -1, 0), -1, 'empty list safe for any index');

// ── normalizePhotos: clean list + reject bad input ───────────────────────

assert.deepStrictEqual(
  core.normalizePhotos([{ file: 'a.jpg', img: 'a.jpg', title: 'a' }]),
  [{ img: 'a.jpg', title: 'a' }],
  'strips extra fields (file etc.), keeps img + title'
);
assert.deepStrictEqual(core.normalizePhotos([]), [], 'empty array passes through as []');

assert.throws(function () {
  core.normalizePhotos('nope');
}, /array/, 'non-array input throws');
assert.throws(function () {
  core.normalizePhotos(null);
}, /array/, 'null throws');
assert.throws(function () {
  core.normalizePhotos([{ title: 'missing img' }]);
}, /img/, 'entry without img throws');
assert.throws(function () {
  core.normalizePhotos([{ img: 'a.jpg' }]);
}, /title/, 'entry without title throws');
assert.throws(function () {
  core.normalizePhotos([{ img: '', title: 'empty img' }]);
}, /img/, 'empty-string img throws');

console.log('lightbox.test: OK');
