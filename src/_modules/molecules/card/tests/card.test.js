'use strict';

import Card from '../card';

describe('Card View', function() {

  beforeEach(() => {
    this.card = new Card();
  });

  it('Should run a few assertions', () => {
    expect(this.card);
  });

});
