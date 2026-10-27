// Main javascript entry point
// Should handle bootstrapping/starting application

'use strict';

const NAV_HEIGHT = 48;

// Smooth scrolling for same-page anchor links. Targets stop below the fixed
// nav (48px) instead of hiding underneath it.
function initSmoothScroll() {
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="#"]');
    if (!link || link.getAttribute('href') === '#') return;

    if (link.pathname.replace(/^\//, '') !== location.pathname.replace(/^\//, '') ||
        link.hostname !== location.hostname) return;

    const target = document.getElementById(link.hash.slice(1)) ||
                   document.getElementsByName(link.hash.slice(1))[0];
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: top,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  });
}

// Animate case-study metric numbers from 0 to their target value.
// The final value is already in the markup, so no-JS users see real numbers.
function initCountUp() {
  const metrics = document.querySelectorAll('[data-countup]');
  if (!metrics.length) return;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || typeof IntersectionObserver === 'undefined') return;

  function animate(el) {
    const target = parseInt(el.getAttribute('data-countup'), 10);
    if (isNaN(target)) return;

    const duration = 1200;
    let startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        animate(entry.target);
      }
    });
  }, { threshold: 0.5 });

  metrics.forEach(function(el) {
    // Reset to 0 so the number counts up when scrolled into view;
    // the final value stays in the markup for no-JS users
    el.textContent = '0';
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initSmoothScroll();
  initCountUp();
});
