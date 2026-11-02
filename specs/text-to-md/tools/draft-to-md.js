'use strict';

// Round-trip checker for the reverse-engineered drafts (specs/text-to-md,
// DR-0003): draft txt -> page md, mechanically applying the
// visuai-text-to-md emit rules. When the output diffed against the
// committed `src/_data/pages/<slug>.md` is empty, the draft is a faithful
// source for that page.
//
// Input conventions (the inverse mapping, documented in the drafts
// README and the skill):
//   - head block: labeled fields, consecutive from the first line -
//     Variant / Eyebrow / Title / Summary / Details + meta items
//     Logo / Needs / Related / Metrics / Footnote / Takeaway
//   - "Title | Eyebrow | id"  -> ## section with overrides
//   - "1. Step"               -> 1. **Step** (timeline template)
//   - fences (:::), directives [x: ...], tables, quotes, images,
//     bullets: pass through verbatim
//   - everything else: paragraph text
//
// Usage: node draft-to-md.js <draft.txt> [slug]   (slug for the header comment)

const fs = require('fs');

const path = require('path');

const file = process.argv[2];
const slug = (process.argv[3] || require('path').basename(file, '.txt')).trim();
const lines = fs.readFileSync(file, 'utf8').split('\n');

const META_FIELD = {
  Logo: 'logo', Needs: 'needs', Related: 'related',
  Metrics: 'metrics', Footnote: 'footnote', Takeaway: 'summary'
};
const HERO_FIELDS = ['Variant', 'Eyebrow', 'Title', 'Summary', 'Details'];
const KNOWN = HERO_FIELDS.concat(Object.keys(META_FIELD));

const yq = function (v) {
  return '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
};

// ── head block: labeled fields, consecutive from the first line ─────────

const hero = { meta: [] };
let headEnd = 0;
let started = false;
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (!started) {
    if (t === '') continue;
    started = true;
  }
  const m = t.match(/^([A-Za-z][A-Za-z ]*):\s*(.*)$/);
  if (started && m && KNOWN.indexOf(m[1]) !== -1 && m[2] !== '') {
    const key = m[1];
    if (META_FIELD[key]) {
      hero.meta.push([META_FIELD[key], m[2]]);
    } else {
      hero[key.toLowerCase()] = m[2];
    }
    headEnd = i + 1;
  } else if (started) {
    if (t === '') { headEnd = headEnd || i; break; }
    break; // first unlabeled content line ends the hero block
  } else {
    console.error('draft-to-md: no labeled hero head block in ' + file);
    process.exit(1);
  }
}

const out = [];
out.push('---');
out.push('# Hero from front matter (specs/text-to-md/DR-0001): the shell renders');
out.push('# it via the mdhero filter. Values are raw (entities allowed), the');
out.push('# vocabulary is bounded: variant, eyebrow, title, summary, details +');
out.push('# meta items (logo | needs | related | metrics | footnote | summary).');
out.push('hero:');
if (hero.variant) out.push('  variant: ' + yq(hero.variant));
if (hero.eyebrow) out.push('  eyebrow: ' + yq(hero.eyebrow));
out.push('  title: ' + yq(hero.title || ''));
if (hero.summary) out.push('  summary: ' + yq(hero.summary));
if (hero.details) out.push('  details: ' + yq(hero.details));
if (hero.meta.length) {
  out.push('  meta:');
  hero.meta.forEach(function (pair) {
    out.push('    - ' + pair[0] + ': ' + yq(pair[1]));
  });
}
out.push('---');
out.push('');
out.push('<!--');
out.push('/' + slug + '/ - rendered through the mdpage filter. The hero lives in');
out.push('the front matter above (DR-0001); this file owns the content sections.');
out.push('`## H2 | Eyebrow | id` sets section overrides - an empty eyebrow omits');
out.push('the eyebrow line. ::: blocks and [directives] are documented in');
out.push('AUTHORING.md.');
out.push('-->');
out.push('');
// ── body: in-place line mapping (spacing preserved from the draft) ──────

let firstContent = true;
let fence = false;
let inComment = false;
lines.slice(headEnd).forEach(function (raw) {
  const t0 = raw.trim();
  if (t0 !== '') firstContent = false;
  if (/^:::/.test(t0)) fence = !fence;
  // comment state: everything until --> passes through verbatim
  if (inComment) {
    if (/-->/.test(t0)) inComment = false;
    out.push(raw.replace(/\s+$/, ''));
    return;
  }
  if (/^<!--/.test(t0)) {
    if (!/^<!--.*-->/.test(t0)) inComment = true;
    out.push(raw.replace(/\s+$/, ''));
    return;
  }
  if (fence || /^#|^\[|^>/.test(t0)) { out.push(raw.replace(/\s+$/, '')); return; }
  const t = raw.trim();
  if (firstContent && t === '') return; // drop leading blanks after the head
  if (t !== '') firstContent = false;

  // 3-part section override: "Title | Eyebrow | id" (an empty middle
  // part keeps its slot: "Title | | id")
  const sec3 = t.match(/^([^|]+)\|([^|]+)\|([^|]+)$/);
  if (sec3) {
    const eyebrow = sec3[2].trim();
    const head = sec3[1].trim() + ' | ' + eyebrow + ' | ' + sec3[3].trim();
    out.push('## ' + head.replace(/ {2,}/g, ' '));
    return;
  }
  // timeline template re-adds the bold (items already carrying bold or
  // inner markup pass through verbatim)
  const step = t.match(/^(\d+)\.\s+(.+)$/);
  if (step && !/\*\*/.test(t)) {
    out.push(step[1] + '. **' + step[2] + '**');
    return;
  }
  // fences, directives, tables, quotes, images, bullets, prose: verbatim
  out.push(raw.replace(/\s+$/, ''));
});

process.stdout.write(out.join("\n").replace(/\s+$/, "") + "\n");
