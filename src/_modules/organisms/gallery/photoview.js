'use strict';

// View switch for /play/photography/ (specs/play-subpages, ticket 17).
// Toggles the two containers the gallery's photogrid branch renders
// (.gallery-grid / .gallery-full) and the aria-pressed state of the switch
// buttons. Booted from src/_scripts/main.js; a no-op on pages without the
// switch. No persistence - grid is always the default view.
//
// play-consistency T3 (DR-0003): the switch bar also hides on scroll down
// and returns on scroll up - the decision lives in photoview-core.js, the
// class toggle lands on .photoview-switch--hidden (gallery.scss).

var core = require('./photoview-core');

function init() {
  var sw = document.querySelector('.photoview-switch');
  if (!sw) return;

  var grid = document.querySelector('.gallery-grid');
  var full = document.querySelector('.gallery-full');
  if (!grid || !full) return;

  var btns = sw.querySelectorAll('.photoview-btn');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var view = btn.getAttribute('data-view');
      grid.hidden = view !== 'grid';
      full.hidden = view !== 'full';
      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
    });
  });

  var lastY = window.scrollY || 0;
  var hidden = false;
  var ticking = false;

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      hidden = core.nextHidden(hidden, y, lastY);
      lastY = y;
      sw.classList.toggle('photoview-switch--hidden', hidden);
      ticking = false;
    });
  }, { passive: true });
}

module.exports = { init: init };
