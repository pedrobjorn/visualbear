// Main javascript entry point
// Should handle bootstrapping/starting application

'use strict';

import $ from 'jquery';
import Nunjucks from 'Nunjucks';

import Link from '../_modules/atom/link/link';
import Gallery from '../_modules/organisms/gallery/gallery';

$(() => {
  new Link(); // Activate Link modules logic
  new Gallery(); // Activate Link modules logic
  

  console.log('Welcome to Yeogurt!');
});
