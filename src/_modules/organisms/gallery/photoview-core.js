'use strict';

// Pure scroll-visibility logic for the photography view switch
// (specs/play-consistency T3, DR-0003). The DOM controller lives in
// photoview.js; this module never touches the DOM, so the plain-node suite
// in scripts/test/photoview.test.js can hold it to its contract.

var TOP_THRESHOLD = 120; // never hide at/near the page top (no flicker)
var DELTA = 4; // ignore sub-pixel / momentum jitter

// nextHidden(hidden, scrollY, lastY) -> boolean: the switch's next hidden
// state. Scrolling down past TOP_THRESHOLD hides the bar; scrolling up, or
// being at the top, shows it; deltas within DELTA keep the current state.
function nextHidden(hidden, scrollY, lastY) {
  if (scrollY <= TOP_THRESHOLD) return false;
  if (scrollY - lastY > DELTA) return true;
  if (lastY - scrollY > DELTA) return false;
  return hidden;
}

module.exports = {
  nextHidden: nextHidden,
  TOP_THRESHOLD: TOP_THRESHOLD,
  DELTA: DELTA
};
