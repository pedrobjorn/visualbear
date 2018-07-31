'use strict';

import Nav from '../nav';

describe('Nav View', function() {

  beforeEach(() => {
    this.nav = new Nav();
  });

  it('Should run a few assertions', () => {
    expect(this.nav);
  });

});
