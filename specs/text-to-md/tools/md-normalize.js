'use strict';

// Normalizes the six migrated page mds to the canonical byte form the
// round-trip expects (comment-only + whitespace-only changes, zero
// rendering impact):
//   - front matter: all hero scalars double-quoted, keys in fixed order
//   - the canonical page comment block (with slug)
//   - exactly one blank line around the comment, exactly one \n at EOF
//
// Usage: node md-normalize.js

const fs = require('fs');
const path = require('path');
const yaml = require(path.join(process.cwd(), 'node_modules', 'js-yaml'));

const PAGES = [
  'fashion-rebrand',
  'teachr',
  'teachr-agent',
  'digital-closet',
  'sports-ecommerce-redesign',
  'workflow'
];

const yq = function (v) {
  return '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
};

PAGES.forEach(function (slug) {
  const f = 'src/_data/pages/' + slug + '.md';
  const s = fs.readFileSync(f, 'utf8');
  const m = s.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) {
    console.log('normalize: no front matter, skipped: ' + f);
    return;
  }
  const hero = ((yaml.safeLoad(m[1]) || {}).hero) || {};

  const fm = ['---'];
  fm.push('# Hero from front matter (specs/text-to-md/DR-0001): the shell renders');
  fm.push('# it via the mdhero filter. Values are raw (entities allowed), the');
  fm.push('# vocabulary is bounded: variant, eyebrow, title, summary, details +');
  fm.push('# meta items (logo | needs | related | metrics | footnote | summary).');
  fm.push('hero:');
  if (hero.variant) fm.push('  variant: ' + yq(hero.variant));
  if (hero.eyebrow) fm.push('  eyebrow: ' + yq(hero.eyebrow));
  fm.push('  title: ' + yq(hero.title));
  if (hero.summary) fm.push('  summary: ' + yq(hero.summary));
  if (hero.details) fm.push('  details: ' + yq(hero.details));
  if (hero.meta && hero.meta.length) {
    fm.push('  meta:');
    hero.meta.forEach(function (it) {
      const k = Object.keys(it)[0];
      fm.push('    - ' + k + ': ' + yq(it[k]));
    });
  }
  fm.push('---');

  let body = s.slice(m[0].length);
  body = body.replace(/^[\s\S]*?-->[ \t]*\n?/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\n+/, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/\n+$/, '\n');

  const comment = [
    '<!--',
    '/' + slug + '/ - rendered through the mdpage filter. The hero lives in',
    'the front matter above (DR-0001); this file owns the content sections.',
    '`## H2 | Eyebrow | id` sets section overrides - an empty eyebrow omits',
    'the eyebrow line. ::: blocks and [directives] are documented in',
    'AUTHORING.md.',
    '-->'
  ].join('\n');

  fs.writeFileSync(f, fm.join('\n') + '\n\n' + comment + '\n\n' + body);
  console.log('normalized: ' + f);
});
