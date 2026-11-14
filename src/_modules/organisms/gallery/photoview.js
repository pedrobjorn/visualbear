'use strict';

// View switch for /play/photography/ (specs/play-subpages, ticket 17).
// Toggles the two containers the gallery's photogrid branch renders
// (.gallery-grid / .gallery-full) and the aria-pressed state of the switch
// buttons. Booted from src/_scripts/main.js; a no-op on pages without the
// switch. No persistence - grid is always the default view.

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
}

module.exports = { init: init };
