// Main javascript entry point
// Should handle bootstrapping/starting application

'use strict';

import $ from 'jquery';

import Link from '../_modules/atom/link/link';
import Gallery from '../_modules/organisms/gallery/gallery';

// Smooth scrolling for anchor links
function initSmoothScroll() {
  $('a[href*="#"]').not('[href="#"]').on('click', function(e) {
    // Check if it's an anchor link to the same page
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') 
        && location.hostname === this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      
      if (target.length) {
        e.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 800);
        return false;
      }
    }
  });
}

// Animate case-study metric numbers from 0 to their target value.
// The final value is already in the markup, so no-JS users see real numbers.
function initCountUp() {
  var $metrics = $('[data-countup]');
  if (!$metrics.length) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate($el) {
    var target = parseInt($el.attr('data-countup'), 10);
    if (isNaN(target)) return;

    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      $el.text(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (reduceMotion || typeof IntersectionObserver === 'undefined') return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        animate($(entry.target));
      }
    });
  }, { threshold: 0.5 });

  $metrics.each(function() {
    var $el = $(this);
    // Reset to 0 so the number counts up when scrolled into view;
    // the final value stays in the markup for no-JS users
    $el.text('0');
    observer.observe(this);
  });
}

$(() => {
  new Link(); // Activate Link modules logic
  new Gallery(); // Activate Gallery modules logic
  
  initSmoothScroll(); // Initialize smooth scrolling

  initCountUp(); // Initialize case-study metric count-up animations
  
  console.log('Welcome to my Portfolio! I can do Javascript too, obviously');
});
