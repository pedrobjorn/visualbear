'use strict';

import Gallery from '../gallery';

describe('Gallery View', function() {

  beforeEach(() => {
    this.gallery = new Gallery();
  });

  it('Should run a few assertions', () => {
    expect(this.gallery);
  });

});
