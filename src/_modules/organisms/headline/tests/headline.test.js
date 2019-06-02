'use strict';

import Headline from '../headline';

describe('Headline View', function() {

  beforeEach(() => {
    this.headline = new Headline();
  });

  it('Should run a few assertions', () => {
    expect(this.headline);
  });

});
