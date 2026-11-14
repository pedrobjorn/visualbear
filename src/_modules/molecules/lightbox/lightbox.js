'use strict';

// Lightbox DOM controller (specs/play-subpages, ticket 15, DR-0002).
// lightbox-core.js owns stepping + input validation (no DOM there);
// lightbox.nunjucks renders the hidden dialog; the grid anchors carry
// data-lb-index / data-lb-img / data-lb-title (ticket 10) and the page
// embeds the photo list as #photogrid-data JSON (ticket 14). Booted from
// src/_scripts/main.js; a no-op on pages without #photogrid-data.

var core = require('./lightbox-core');

function init() {
  var dataEl = document.getElementById('photogrid-data');
  if (!dataEl) return;

  var photos;
  try {
    photos = core.normalizePhotos(JSON.parse(dataEl.textContent));
  }
  catch (e) {
    // broken embedded data: leave the grid as plain image links (the no-JS
    // fallback from ticket 10) instead of a half-wired modal
    return;
  }

  var dialog = document.querySelector('.lightbox');
  var grid = document.querySelector('.gallery-grid');
  if (!dialog || !grid) return;

  var img = dialog.querySelector('.lightbox-img');
  var caption = dialog.querySelector('.lightbox-caption');
  var btnPrev = dialog.querySelector('.lightbox-prev');
  var btnNext = dialog.querySelector('.lightbox-next');
  var btnClose = dialog.querySelector('.lightbox-close');
  var backdrop = dialog.querySelector('.lightbox-backdrop');

  // The JSON carries bare filenames (img = "beach-day.jpg"); resolve them
  // against the image directory the grid anchors already point at.
  var anchors = grid.querySelectorAll('a[data-lb-index]');
  var base = '';
  if (anchors.length) {
    var full = anchors[0].getAttribute('data-lb-img');
    base = full.slice(0, full.lastIndexOf('/') + 1);
  }

  var current = -1;
  var lastTrigger = null;

  function render() {
    var photo = photos[current];
    if (!photo) return;
    img.src = base + photo.img;
    img.alt = photo.title;
    caption.textContent = photo.title;
  }

  function open(index, trigger) {
    current = index;
    lastTrigger = trigger || null;
    render();
    dialog.hidden = false;
    document.body.style.overflow = 'hidden'; // scroll lock while open
    btnClose.focus();
  }

  function close() {
    dialog.hidden = true;
    document.body.style.overflow = '';
    current = -1;
    if (lastTrigger) lastTrigger.focus(); // focus returns to the card
  }

  function step(dir) {
    current = core.stepIndex(current, dir, photos.length);
    if (current === -1) return; // empty grid: stay closed
    render();
  }

  // delegated: one listener covers every grid anchor, present and future
  grid.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-lb-index]');
    if (!a) return;
    e.preventDefault();
    var i = parseInt(a.getAttribute('data-lb-index'), 10);
    if (isNaN(i) || i < 0 || i >= photos.length) return;
    open(i, a);
  });

  btnPrev.addEventListener('click', function () {
    step(-1);
  });
  btnNext.addEventListener('click', function () {
    step(1);
  });
  btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (dialog.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
    else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    }
    else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  });
}

module.exports = { init: init };
