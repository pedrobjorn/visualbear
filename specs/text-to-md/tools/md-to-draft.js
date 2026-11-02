'use strict';

// Inverse transform for reverse-engineering existing pages into drafts
// (specs/text-to-md, DR-0003): page md -> draft txt such that running
// the round-trip emitter (draft-to-md.js / the skill rules) on the txt
// reproduces the md.
//
//   - front matter hero -> labeled fields, one per line:
//     Variant/Eyebrow/Title/Summary/Details + meta items as
//     Logo/Needs/Related/Metrics/Footnote/Takeaway
//   - headings pass through verbatim ("## X | E | id", "### X") -
//     sections stay explicit so prose colon lines never collide
//   - "1. **X**" (fully bold timeline item, the template form) -> "1. X"
//     (the emitter re-adds the bold); items with inner bold pass as-is
//   - the leading page comment block is dropped (the emitter re-adds it);
//     other comments pass through - they never render
//   - inside ::: fences everything passes through untouched
//   - exactly one newline at EOF
//
// Usage: node md-to-draft.js src/_data/pages/<slug>.md > src/_data/drafts/<slug>.txt

const fs = require('fs');
const path = require('path');
const yaml = require(path.join(process.cwd(), 'node_modules', 'js-yaml'));

const src = fs.readFileSync(process.argv[2], 'utf8');
const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
const out = [];

if (m) {
  const hero = ((yaml.safeLoad(m[1]) || {}).hero) || {};
  const label = function (k, v) {
    if (v === undefined || v === null || String(v).trim() === '') return;
    out.push(k + ': ' + String(v).trim());
  };
  label('Variant', hero.variant);
  label('Eyebrow', hero.eyebrow);
  label('Title', hero.title);
  label('Summary', hero.summary);
  label('Details', hero.details);
  (hero.meta || []).forEach(function (item) {
    const k = Object.keys(item)[0];
    const map = {
      logo: 'Logo', needs: 'Needs', related: 'Related',
      metrics: 'Metrics', footnote: 'Footnote', summary: 'Takeaway'
    };
    label(map[k] || k, item[k]);
  });
}

// body: skip the leading page comment, map the rest in place
let body = m ? src.slice(m[0].length) : src;
body = body.replace(/^\s*<!--[\s\S]*?-->\s*/, '');

let fence = false;
let inComment = false;
body.split('\n').forEach(function (line) {
  const t = line.trim();
  if (inComment) {
    if (/-->/.test(t)) inComment = false;
    out.push(line);
    return;
  }
  if (/^<!--/.test(t)) {
    if (!/^<!--.*-->/.test(t)) inComment = true;
    out.push(line);
    return;
  }
  if (/^:::/.test(t)) fence = !fence;
  if (!fence) {
    // fully-bold timeline item: draft carries plain text, emitter re-adds
    const step = t.match(/^(\d+)\.\s+\*\*([\s\S]*?)\*\*$/);
    if (step) {
      out.push(step[1] + '. ' + step[2]);
      return;
    }
  }
  out.push(line);
});

process.stdout.write(out.join('\n').replace(/\s+$/, '') + '\n');
