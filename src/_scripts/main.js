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

$(() => {
  new Link(); // Activate Link modules logic
  new Gallery(); // Activate Gallery modules logic
  
  initSmoothScroll(); // Initialize smooth scrolling
  
  console.log('Welcome to my Portfolio! I can do Javascript too, obviously');
});
