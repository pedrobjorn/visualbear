'use strict';
/*
 * Ticket 2 (specs/visualbear-system/tickets.md): the hero tab shell for
 * the merged visualbear system view (DR-0001). Plain node asserts on the
 * pure state logic in the tabs molecule - the DOM wiring is verified in
 * the build (evidence/t2-verify.md). Run: npm test
 */
var assert = require('assert');
var core;
try {
  core = require('../../src/_modules/molecules/tabs/tabs-core');
} catch (e) {
  console.error('tabs.test: FAIL - tabs-core.js is missing: ' + e.message);
  process.exit(1);
}

// ── constants ────────────────────────────────────────────────────────────

assert.deepStrictEqual(core.TAB_IDS, ['visuai', 'designsystem'], 'two tabs, fixed order');
assert.strictEqual(core.DEFAULT_TAB, 'visuai', 'visuAI is the default tab (open question 3)');

// naming contract shared with the nunjucks macro
assert.strictEqual(core.tabId('visuai'), 'vb-system-tab-visuai', 'tab button naming');
assert.strictEqual(core.panelId('designsystem'), 'vb-system-panel-designsystem', 'panel naming');

// body ground pair (ticket 2): dark = workflow-page, light = vb-system-light
assert.strictEqual(core.bodyGroundClass('visuai'), 'workflow-page', 'visuAI tab keeps the dark ground');
assert.strictEqual(
  core.bodyGroundClass('designsystem'),
  'vb-system-light',
  'design system tab switches the body to the light ground class'
);
assert.notStrictEqual(
  core.bodyGroundClass('designsystem'),
  'workflow-page',
  'the two grounds are a real class pair, not the same value'
);

// ── state machine ────────────────────────────────────────────────────────

var state = core.init('visuai');
assert.strictEqual(state.activeId, 'visuai', 'init lands on the default tab');

// activate
state = core.reduce(state, { type: 'activate', id: 'designsystem' });
assert.strictEqual(state.activeId, 'designsystem', 'activate switches tabs');

// unknown ids are ignored (defensive, keeps the state honest)
state = core.reduce(state, { type: 'activate', id: 'bogus' });
assert.strictEqual(state.activeId, 'designsystem', 'unknown tab id is ignored');

// arrows wrap (roving focus)
assert.strictEqual(core.reduce(state, { type: 'arrow', dir: 1 }).activeId, 'visuai', 'next wraps to first');
assert.strictEqual(core.reduce(state, { type: 'home' }).activeId, 'visuai', 'home = first');
assert.strictEqual(core.reduce(core.init('visuai'), { type: 'arrow', dir: -1 }).activeId, 'designsystem', 'prev from first wraps to last');
assert.strictEqual(core.reduce(core.init('visuai'), { type: 'end' }).activeId, 'designsystem', 'end = last');

// ── wiring spec: what the DOM controller should paint ────────────────────

var wiring = core.wiring(state);
assert.strictEqual(wiring.length, 2, 'wiring covers both tabs');
assert.deepStrictEqual(
  wiring.map(function (t) { return t.selected; }),
  [false, true],
  'exactly the active tab is aria-selected'
);
assert.deepStrictEqual(
  wiring.map(function (t) { return t.tabindex; }),
  [-1, 0],
  'roving tabindex: only the active tab is a tab stop'
);

// ── single-h1 invariant: one hero, copy swapped per tab ──────────────────

var captured = { // what the controller taped from the rendered hero at boot
  eyebrow: 'The visuAI Workflow',
  title: 'My Agentic Design Workflow </br> visuAI',
  summary: 'Using research, discovery and decisions to create value through my Design AI workflow.',
  details: 'Design Lead \u22C5 Spec \u00B7 Skills \u00B7 Agents \u22C5 2026'
};
var specHero = { // the page shell's design-system copy
  eyebrow: 'The visualbear System',
  title: 'The visualbear System \u00B7 Design system',
  summary: 'A collection of all the individual components and rules used to build this site.',
  details: 'Design reference \u22C5 2026'
};

var heroDark = core.heroFor(core.init('visuai'), captured, specHero);
assert.deepStrictEqual(heroDark, captured, 'visuAI tab keeps its own hero copy (the captured one)');

var heroLight = core.heroFor(state, captured, specHero);
assert.deepStrictEqual(heroLight, specHero, 'design system tab shows its own hero copy');

// ── markup contract with the macro (keeps tabs.js and tabs.nunjucks in sync)

var macroSpec = {
  id: core.TABLIST_ID,
  active: core.DEFAULT_TAB,
  tabs: [
    { id: 'visuai', label: 'visuAI' },
    { id: 'designsystem', label: 'Design system' }
  ]
};
assert.strictEqual(typeof core.validateSpec(macroSpec), 'undefined', 'spec from the page shell validates');
assert.throws(function () {
  core.validateSpec({ id: 'vb-system', active: 'visuai', tabs: [{ id: 'visuai', label: 'one tab only' }] });
}, /two tab buttons/, 'spec must declare both tabs');

console.log('tabs.test: PASS');
