'use strict';

// Case-study section nav scroll-spy (specs/case-study-nav-v3 Ticket 3,
// DR-0002 + DR-0008; lands parent specs/case-study-nav Ticket 4).
// Booted from src/_scripts/main.js; a no-op on pages without a
// `.cs-index` bar (blog / workflow / home never get aria-current).
//
// Vanilla IntersectionObserver over the section containers (`.cs-section`
// on the md case studies, `.cs-nav-target` on the legacy pages, DR-0007).
// The active zone is the viewport minus the fixed header (48px) minus the
// stuck bar (--cs-index-h, read from the `.case-study` computed style so
// the bar height stays the single source). Exactly one link carries
// aria-current="true" - the topmost intersecting section's anchor - and
// none when no section intersects (hero zone). Anchor clicks set it
// immediately for snappy feedback; the observer confirms on landing.

function init() {
  var bar = document.querySelector('.cs-index');
  if (!bar) return;
  if (typeof IntersectionObserver === 'undefined') return;

  var root = bar.closest('.case-study') || document.body;
  var barH = parseFloat(getComputedStyle(root).getPropertyValue('--cs-index-h')) || 35;

  var links = Array.prototype.slice.call(bar.querySelectorAll('a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    if (id && !byId[id]) byId[id] = a;
  });
  var sections = Array.prototype.slice.call(
    root.querySelectorAll('.cs-section, .cs-nav-target')
  ).filter(function (el) {
    return el.id && byId[el.id];
  });
  if (!sections.length) return;

  function setCurrent(id) {
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  var intersecting = [];
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var i = intersecting.indexOf(entry.target);
        if (entry.isIntersecting) {
          if (i === -1) intersecting.push(entry.target);
        } else if (i !== -1) {
          intersecting.splice(i, 1);
        }
      });
      if (!intersecting.length) {
        setCurrent(null);
        return;
      }
      // the section under the stuck bar wins: the intersecting section with
      // the largest top that has crossed under the header+bar (48 + barH);
      // if none has crossed yet (first section still below), the topmost one
      var line = 48 + barH;
      var current = null;
      var currentTop = -Infinity;
      intersecting.forEach(function (el) {
        var t = el.getBoundingClientRect().top;
        if (t <= line + 1 && t > currentTop) {
          current = el;
          currentTop = t;
        }
      });
      if (!current) {
        current = intersecting.slice().sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        })[0];
      }
      setCurrent(current.id);
    },
    { rootMargin: '-48px 0px -' + barH + 'px 0px' }
  );
  sections.forEach(function (el) {
    observer.observe(el);
  });

  links.forEach(function (a) {
    a.addEventListener('click', function () {
      setCurrent(a.getAttribute('href').slice(1));
    });
  });
}

// Plain CJS: loaded through the browserify bundle; main.js requires it.
module.exports = { init: init };
