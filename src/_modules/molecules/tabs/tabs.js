'use strict';

// visualbear system tab shell - DOM wiring (specs/visualbear-system,
// ticket 2, DR-0001). The tab strip and the swap of ground (body class
// pair), hero copy and visible panel; tabs-core.js owns the state
// machine and naming, tabs.nunjucks renders the strip and the copy
// spec. Booted from src/_scripts/main.js; a no-op on pages without a
// strip.

var core = require('./tabs-core');

var ENTER_MS = 160; // the swap fade; the CSS keyframe runs the same length

// Plain CJS: this module is loaded through the browserify bundle, and the
// babel interop for mixed ESM/require flagged in the t2 verification. The
// consumer (main.js) requires it directly.

// Hero field targets: the mdhero markup's stable classes/tag inside the
// [data-vb-hero] wrapper. Title takes innerHTML - the copy carries raw
// markup (the vogue `</br>` run); the rest swap as plain text.
var HERO_TARGETS = {
  eyebrow: '.cs-eyebrow',
  title: 'h1',
  summary: '.cs-cover-summary',
  details: '.cs-cover-details'
};

var GROUND_CLASSES = ['workflow-page', 'vb-system-light'];

// Boot the tab shell when a page carries one; a no-op everywhere else.
function init() {
  var root = document.querySelector('[data-vb-tablist]');
  if (!root) return;

  var spec = null;
  var specScript = root.querySelector('[data-vb-tab-spec]');
  try {
    spec = specScript ? JSON.parse(specScript.textContent) : null;
  } catch (e) {
    spec = null;
  }
  if (spec) core.validateSpec(spec);

  // The rendered hero is the single source for the default (visuAI)
  // tab's copy; tape it before any swap can touch the DOM.
  var heroRoot = document.querySelector('[data-vb-hero]');
  var captured = captureHero(heroRoot);
  var state = core.init(core.DEFAULT_TAB);

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-vb-tab]');
    if (btn) {
      activate(core.reduce(state, { type: 'activate', id: btn.getAttribute('data-vb-tab') }));
    }
  });

  root.addEventListener('keydown', function (e) {
    var action = null;
    if (e.key === 'ArrowRight') action = { type: 'arrow', dir: 1 };
    else if (e.key === 'ArrowLeft') action = { type: 'arrow', dir: -1 };
    else if (e.key === 'Home') action = { type: 'home' };
    else if (e.key === 'End') action = { type: 'end' };
    // Activation follows focus (WAI-ARIA tabs pattern)
    if (action) {
      e.preventDefault();
      var next = core.reduce(state, action);
      var btn = root.querySelector('#' + core.tabId(next.activeId));
      if (btn) btn.focus();
      activate(next);
    }
  });

  function activate(next) {
    state = next;
    paint(state, captured, spec, heroRoot);
  }
}

function captureHero(heroRoot) {
  if (!heroRoot) return null;
  var captured = {};
  core.HERO_FIELDS.forEach(function (field) {
    var el = heroRoot.querySelector(HERO_TARGETS[field]);
    captured[field] = el ? (field === 'title' ? el.innerHTML : el.textContent) : '';
  });
  return captured;
}

// Paint one state: buttons, body ground pair, hero copy, visible panel.
function paint(state, captured, spec, heroRoot) {
  var ground = core.bodyGroundClass(state.activeId);
  GROUND_CLASSES.forEach(function (cls) {
    document.body.classList.toggle(cls, cls === ground);
  });

  document.querySelectorAll('[data-vb-tab]').forEach(function (btn) {
    var id = btn.getAttribute('data-vb-tab');
    btn.setAttribute('aria-selected', id === state.activeId ? 'true' : 'false');
    btn.tabIndex = id === state.activeId ? 0 : -1;
    btn.classList.toggle('vb-tab--active', id === state.activeId);
  });

  var hero = core.heroFor(state, captured, specHeroFor(spec, state.activeId));
  if (heroRoot && hero) {
    core.HERO_FIELDS.forEach(function (field) {
      var el = heroRoot.querySelector(HERO_TARGETS[field]);
      if (!el) return;
      if (field === 'title') {
        el.innerHTML = hero[field];
      } else {
        el.textContent = hero[field];
      }
    });
  }

  document.querySelectorAll('[data-vb-panel]').forEach(function (panel) {
    var isActive = panel.getAttribute('data-vb-panel') === state.activeId;
    panel.hidden = !isActive;
    panel.classList.remove('vb-panel--enter');
    if (isActive && !prefersReducedMotion()) {
      void panel.offsetWidth; // restart the enter fade
      panel.classList.add('vb-panel--enter');
      setTimeout(function () {
        panel.classList.remove('vb-panel--enter');
      }, ENTER_MS + 40);
    }
  });
}

function specHeroFor(spec, activeId) {
  if (!spec || !spec.tabs) return null;
  for (var i = 0; i < spec.tabs.length; i++) {
    if (spec.tabs[i].id === activeId) return spec.tabs[i].hero || null;
  }
  return null;
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

module.exports = { init: init };
