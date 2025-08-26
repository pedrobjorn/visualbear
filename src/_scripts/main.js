// Main javascript entry point
// Should handle bootstrapping/starting application

'use strict';

import $ from 'jquery';

import Link from '../_modules/atom/link/link';
import Gallery from '../_modules/organisms/gallery/gallery';

$(() => {
  new Link(); // Activate Link modules logic
  new Gallery(); // Activate Gallery modules logic
  
  console.log('Welcome to my Portfolio! I can do Javascript too, obviously');
});
