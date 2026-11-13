'use strict';

// visualbear system tab shell - DOM wiring (specs/visualbear-system,
// ticket 2, DR-0001; ticket 6 retires the hero copy swap - each panel
// owns its hero, the controller only toggles ground, buttons, panels).
// The tab strip and the swap of ground (body class pair) and visible
// panel; tabs-core.js owns the state machine and naming, tabs.nunjucks
// renders the strip. Booted from src/_scripts/main.js; a no-op on pages
// without a strip.

var core = require('./tabs-core');

var ENTER_MS = 160; // the swap fade; the CSS keyframe runs the same length

// Plain CJS: this module is loaded through the browserify bundle, and the
// babel interop for mixed ESM/require flagged in the t2 verification. The
// consumer (main.js) requires it directly.

var GROUND_CLASSES = ['workflow-page', 'vb-system-light'];

// Boot the tab shell when a page carries one; a no-op everywhere else.
function init() {
  var root = document.querySelector('[data-vb-tablist]');
  if (!root) return;

  try {
    var specScript = root.querySelector('[data-vb-tab-spec]');
    var spec = specScript ? JSON.parse(specScript.textContent) : null;
    if (spec) core.validateSpec(spec);
  } catch (e) {
    // a broken spec only skips validation; the strip still works
  }

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
    // Activation follows focus (WAI-ARIA tabs pattern). Paint first, then
    // focus: the strip relocates into the active panel's host during the
    // paint (ticket 14) and a focused node detaches on move - focusing a
    // button that is about to be re-parented would drop it (DR-0006).
    if (action) {
      e.preventDefault();
      var next = core.reduce(state, action);
      activate(next);
      var btn = root.querySelector('#' + core.tabId(next.activeId));
      if (btn) btn.focus();
    }
  });

  function activate(next) {
    state = next;
    paint(state, root);
  }
}

// Paint one state: buttons, body ground pair, visible panel, and the
// strip's host (ticket 14, DR-0006: the strip lives inside the ACTIVE
// panel's hero - its design panel host slots into #styleguide_container).
// All synchronous, one paint frame - no flash - so the click handler and
// the keyboard path share this order.
function paint(state, root) {
  var ground = core.bodyGroundClass(state.activeId);
  GROUND_CLASSES.forEach(function (cls) {
    document.body.classList.toggle(cls, cls === ground);
  });

  // relocate first: the strip must already sit in its host before focus
  // and the enter animation run
  var host = document.querySelector('[data-vb-strip-host="' + state.activeId + '"]');
  if (host && root && root.parentElement !== host) host.appendChild(root);

  document.querySelectorAll('[data-vb-tab]').forEach(function (btn) {
    var id = btn.getAttribute('data-vb-tab');
    btn.setAttribute('aria-selected', id === state.activeId ? 'true' : 'false');
    btn.tabIndex = id === state.activeId ? 0 : -1;
    btn.classList.toggle('vb-tab--active', id === state.activeId);
  });

  document.querySelectorAll('[data-vb-panel]').forEach(function (panel) {
    var isActive = panel.getAttribute('data-vb-panel') === state.activeId;
    panel.hidden = !isActive;
    if (isActive) {
      // Ticket 38: the design panel ships [hidden], so its demo images
      // carry loading="lazy" and would never hydrate on their own (and a
      // below-the-fold row would wait for a scroll - ticket 16's bug).
      // On activation - first open included - flip them eager in this
      // same paint, so the row renders complete the moment the tab opens.
      panel.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
        img.loading = 'eager';
      });
    }
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

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

module.exports = { init: init };
