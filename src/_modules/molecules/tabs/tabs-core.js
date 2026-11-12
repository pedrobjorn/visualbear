'use strict';

// visualbear system tab shell - pure state logic (specs/visualbear-system,
// ticket 2, DR-0001). One URL (/workflow/), two client-side tabs:
// the visuAI view on the dark ground and the design system on the light.
//
// The DOM wiring lives in tabs.js; the markup lives in tabs.nunjucks.
// This module only answers questions - it never touches the DOM - so the
// plain-node suite in scripts/test/tabs.test.js can hold both wiring
// halves (macro + controller) to the same naming contract.

var MARKER = 'vb-system';

var TAB_IDS = ['visuai', 'designsystem'];
var DEFAULT_TAB = 'visuai';

// The page keeps one URL, so the tab swap drives the existing class pair
// rather than new theme code: dark = the workflow ground, light = a plain
// body with the vb-system-light hook for the strip's ink overrides.
var BODY_GROUND_CLASS = {
  visuai: 'workflow-page',
  designsystem: 'vb-system-light'
};

// Hero fields the controller swaps on each switch. The design tab copies
// per ticket 2/3; the visuAI tab re-uses what the rendered hero already
// showed (tabbed back in, nothing gets re-typed here).
var HERO_FIELDS = ['eyebrow', 'title', 'summary', 'details'];

function tabId(id) {
  return MARKER + '-tab-' + id;
}

function panelId(id) {
  return MARKER + '-panel-' + id;
}

function bodyGroundClass(activeId) {
  return BODY_GROUND_CLASS[activeId] || BODY_GROUND_CLASS[DEFAULT_TAB];
}

function indexOf(id) {
  return TAB_IDS.indexOf(id);
}

// Normalized initial state; unknown ids fall back to the default.
function init(activeId) {
  return { activeId: indexOf(activeId) !== -1 ? activeId : DEFAULT_TAB };
}

// Actions: activate (click), arrow (dir -1|1, wraps), home, end.
function reduce(state, action) {
  var current = indexOf(state.activeId);
  var nextId = null;
  if (action.type === 'activate' && indexOf(action.id) !== -1) nextId = action.id;
  if (action.type === 'arrow') {
    nextId = TAB_IDS[(current + action.dir + TAB_IDS.length) % TAB_IDS.length];
  }
  if (action.type === 'home') nextId = TAB_IDS[0];
  if (action.type === 'end') nextId = TAB_IDS[TAB_IDS.length - 1];
  if (nextId === null) return state;
  return { activeId: nextId };
}

// What the controller should paint onto the two buttons for a state: the
// active tab carries aria-selected and the roving tab stop.
function wiring(state) {
  return TAB_IDS.map(function (id) {
    return {
      id: id,
      selected: state.activeId === id,
      tabindex: state.activeId === id ? 0 : -1
    };
  });
}

// Hero copy for a state: captured from the rendered hero at boot; the
// design tab's copy comes from the page shell's spec.
function heroFor(state, captured, specHero) {
  return state.activeId === DEFAULT_TAB ? captured : specHero;
}

// Validate the spec the page shell passes to the macro. Both tabs must be
// declared so the controller never has to invent one.
function validateSpec(spec) {
  var ids = (spec.tabs || []).map(function (t) { return t.id; });
  if (TAB_IDS.filter(function (id) { return ids.indexOf(id) !== -1; }).length !== TAB_IDS.length) {
    throw new Error('tabs spec must declare the two tab buttons: ' + TAB_IDS.join(', '));
  }
}

module.exports = {
  DEFAULT_TAB: DEFAULT_TAB,
  HERO_FIELDS: HERO_FIELDS,
  MARKER: MARKER,
  TAB_IDS: TAB_IDS,
  TABLIST_ID: MARKER + '-tablist',
  bodyGroundClass: bodyGroundClass,
  heroFor: heroFor,
  init: init,
  panelId: panelId,
  reduce: reduce,
  tabId: tabId,
  validateSpec: validateSpec,
  wiring: wiring
};
