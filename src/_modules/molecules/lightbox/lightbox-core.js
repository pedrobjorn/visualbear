'use strict';

// Lightbox pure logic (specs/play-subpages, ticket 12, DR-0002). The DOM
// controller lives in lightbox.js (ticket 15); the dialog markup lives in
// lightbox.nunjucks (ticket 13). This module only answers questions - it
// never touches the DOM - so the plain-node suite in
// scripts/test/lightbox.test.js can hold it to its contract.

// stepIndex: move from index i by dir (-1 | 1) within len items, wrapping
// in both directions. len 0 means "no selection" and returns -1; a single
// item always stays on 0.
function stepIndex(i, dir, len) {
  if (!Number.isInteger(len) || len <= 0) return -1;
  var cur = ((i % len) + len) % len;
  return (cur + dir + len) % len;
}

// normalizePhotos: the page embeds site.data.photogallery as JSON (ticket
// 14, #photogrid-data). Every entry must carry a non-empty img and title;
// anything else is rejected so the controller never renders a broken slide.
// Returns a clean [{ img, title }] list, extra fields stripped.
function normalizePhotos(list) {
  if (!Array.isArray(list)) {
    throw new Error('photogallery data must be an array');
  }
  return list.map(function (entry) {
    if (!entry || typeof entry.img !== 'string' || !entry.img) {
      throw new Error('every photo needs a non-empty img field');
    }
    if (typeof entry.title !== 'string' || !entry.title) {
      throw new Error('every photo needs a non-empty title field');
    }
    return { img: entry.img, title: entry.title };
  });
}

module.exports = {
  normalizePhotos: normalizePhotos,
  stepIndex: stepIndex
};
