'use strict';

export default class Card {
  constructor() {
    this.name = 'card';
    console.log('%s module', this.name.toLowerCase());
    this.initResponsiveImages();
  }

  initResponsiveImages() {
    // Set up responsive images for mobile variants
    const cardImages = document.querySelectorAll('.card-image[data-mobile-image]');
    
    cardImages.forEach(cardImage => {
      const mobileImageUrl = cardImage.getAttribute('data-mobile-image');
      if (mobileImageUrl) {
        cardImage.style.setProperty('--mobile-image', `url(${mobileImageUrl})`);
      }
    });
  }
}
