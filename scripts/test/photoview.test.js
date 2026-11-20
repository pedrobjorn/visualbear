'use strict';
/*
 * play-consistency T3 (DR-0003): the photography view switch wears the
 * .vb-tabs strip look (chip-plate background, pill geometry) and hides on
 * scroll down past 120px, showing again on scroll up or at the page top.
 * The scroll decision is pure logic in photoview-core.js; the scss contract
 * is asserted on the source. Run: npm test
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var core;
try {
  core = require('../../src/_modules/organisms/gallery/photoview-core');
} catch (e) {
  console.error('photoview.test: FAIL - photoview-core.js is missing: ' + e.message);
  process.exit(1);
}

// ── nextHidden: scroll-down hides, scroll-up/top shows, jitter keeps state ──

assert.strictEqual(core.nextHidden(false, 500, 400), true, 'scrolling down past 120 hides');
assert.strictEqual(core.nextHidden(true, 500, 400), true, 'stays hidden while scrolling down');
assert.strictEqual(core.nextHidden(true, 300, 400), false, 'scrolling up shows');
assert.strictEqual(core.nextHidden(true, 400, 300), true, 'down again hides again');
assert.strictEqual(core.nextHidden(true, 120, 400), false, 'at the 120 threshold shows');
assert.strictEqual(core.nextHidden(true, 0, 400), false, 'page top always shows');
assert.strictEqual(core.nextHidden(false, 50, 0), false, 'near the top stays visible');
assert.strictEqual(core.nextHidden(true, 405, 400), true, 'delta > 4 hides');
assert.strictEqual(core.nextHidden(false, 404, 400), false, 'delta == 4 keeps visible');
assert.strictEqual(core.nextHidden(true, 404, 400), true, 'delta == 4 keeps hidden');
assert.strictEqual(core.nextHidden(false, 396, 400), false, 'delta == -4 keeps visible');

// ── scss contract: the strip mirrors .vb-tabs, buttons transparent on it ──

var SRC = path.join(__dirname, '../../src/_modules/organisms/gallery');
var scss = fs.readFileSync(path.join(SRC, 'gallery.scss'), 'utf8');

var stripRule = scss.match(/\.photoview-switch \{[^}]*\}/);
assert.ok(stripRule, '.photoview-switch rule exists');
assert.ok(/padding: 4px;/.test(stripRule[0]), 'strip has the vb-tabs 4px padding');
assert.ok(/border-radius: 999px;/.test(stripRule[0]), 'strip is a 999px pill');
assert.ok(/gap: 4px;/.test(stripRule[0]), 'strip gap is 4px like .vb-tabs');
assert.ok(/width: max-content;/.test(stripRule[0]), 'strip is max-content (centered by margin auto)');
assert.ok(/margin: [^;]*auto;/.test(stripRule[0]), 'strip is centered via margin auto');
assert.ok(/background-color: var\(--cs-chip-plate, rgba\(24, 24, 27, 0\.92\)\);/.test(stripRule[0]), 'strip takes the chip-plate background (locally overridden, see T6)');
assert.ok(/transition: transform 0\.2s ease, opacity 0\.2s ease, visibility 0\.2s ease;/.test(stripRule[0]), 'strip transitions transform/opacity/visibility');
assert.ok(/position: sticky;/.test(stripRule[0]) && /top: 80px;/.test(stripRule[0]), 'strip stays sticky 32px below the fixed nav (play-menu-hero T6: 48px nav + 32px gap)');

// play-consistency T6 (DR-0005): the strip must never hide behind the photos
// and must not be an opaque bar - it paints above the grid (z-index 1 over
// the cards' z-auto) and its plate stays translucent BUT dark enough that the
// option labels keep >= 4.5:1 over the brightest photo (measured on the
// shipped photos: a #18181b plate needs alpha >= 0.90; 0.92 ships for margin)
assert.ok(/z-index: 1;/.test(stripRule[0]), 'strip keeps z-index 1, above the positioned cards');
var plateOverride = stripRule[0].match(/--cs-chip-plate:\s*rgba\(24, 24, 27, (0?\.\d+)\);/);
assert.ok(plateOverride, 'strip overrides --cs-chip-plate locally to the dark page color');
var plateAlpha = parseFloat(plateOverride && plateOverride[1]);
assert.ok(plateAlpha < 1, 'plate is translucent (alpha < 1), not an opaque solid');
assert.ok(plateAlpha >= 0.9, 'plate alpha >= 0.9 so labels keep 4.5:1 over bright photos');
assert.ok(!/background-color: #[0-9a-fA-F]{3,8};/.test(stripRule[0]), 'strip has no opaque solid background-color');
var lightboxScss = fs.readFileSync(path.join(SRC, '../../molecules/lightbox/lightbox.scss'), 'utf8');
var lbZ = lightboxScss.match(/z-index: (\d+);/);
assert.ok(lbZ && parseInt(lbZ[1], 10) > 1, 'lightbox dialog (z-index ' + (lbZ && lbZ[1]) + ') stays above the strip');

var hiddenRule = scss.match(/\.photoview-switch--hidden \{[^}]*\}/);
assert.ok(hiddenRule, 'the hidden state rule exists');
assert.ok(/opacity: 0;/.test(hiddenRule[0]), 'hidden state fades out');
assert.ok(/visibility: hidden;/.test(hiddenRule[0]), 'hidden state leaves the tab order (visibility hidden)');
assert.ok(/transform: translateY\(-8px\);/.test(hiddenRule[0]), 'hidden state slides up');

var motionRule = scss.match(/@media \(prefers-reduced-motion: reduce\) \{\s*\.photoview-switch \{[^}]*\}/);
assert.ok(motionRule && /transition: none;/.test(motionRule[0]), 'reduced motion disables the strip transition');

var btnRule = scss.match(/\.photoview-btn \{[^}]*\}/);
assert.ok(btnRule, '.photoview-btn rule exists');
assert.ok(/background-color: transparent;/.test(btnRule[0]), 'buttons are transparent on the plate (vb-tab style)');
assert.ok(!/background(-color)?:\s*\$vb-dark/.test(btnRule[0]), 'the solid $vb-dark button fill declaration (DR-0008) is gone - the plate provides the background');
assert.ok(/border-radius: 999px;/.test(btnRule[0]) && /color: #a6adb8;/.test(btnRule[0]), 'button keeps the pill shape and muted ink');

// ── controller wiring: photoview.js drives the hidden class from scroll ──

var js = fs.readFileSync(path.join(SRC, 'photoview.js'), 'utf8');
assert.ok(/require\('\.\/photoview-core'\)/.test(js), 'photoview.js uses photoview-core for the scroll decision');
assert.ok(/addEventListener\('scroll'/.test(js), 'a scroll listener is registered');
assert.ok(/photoview-switch--hidden/.test(js), 'the controller toggles the hidden class');
assert.ok(/requestAnimationFrame/.test(js), 'scroll handling is rAF-throttled');
assert.ok(/passive: true/.test(js), 'the scroll listener is passive');

console.log('photoview.test: OK');
