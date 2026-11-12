'use strict';

import { init } from '../tabs';

describe('Tabs module', function () {

  it('exposes the init function', () => {
    expect(typeof init).toBe('function');
  });

});
