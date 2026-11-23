'use strict';

// Round-trip checker + reference implementation of the skill's [rule]
// (specs/text-to-md, DR-0002 + DR-0003): SUPER PLAIN draft txt -> page md.
//
// The plain format (what survives in a draft):
//   # heading marks (## sections, ### sub-heads), **bold**,
//   "Label: value" lines, paragraphs, "- " bullets, "1. " steps,
//   pipe table rows, lines starting with a quotation mark ("), [ai]
//
// The [rule] - how plain signals map back to authoring markdown:
//
//   1. HEAD BLOCK: the first consecutive labeled lines are the hero
//      front matter (Variant/Eyebrow/Title/Summary/Details + Logo/
//      Needs/Related/Metrics/Footnote/Takeaway).
//
//   2. LABEL LINES become directives: Intro:/Note:/Point:/Figure:/
//      Byline:/Wrap-up:/Caption: -> [intro:]/[note:]/[point:]/[figure:]/
//      [byline:]/[summary:]/[caption:]; Image: X | Y -> [image: X | Y];
//      Frame: X | Y [| Z] -> [frame: X | Y [| Z]]; Divider: X ->
//      [divider: X]; Hero: <modifier> opens a mid-page ::: hero block
//      (closed by the next ## heading); Callout: T | href | link opens a
//      ::: callout tile ([callout: T | href | link] + following lines as
//      the tile body, closed by a blank line or the next heading/label).
//
//   3. BOLD-GROUP RULE: a bold-ONLY line ("**X**") is a block title;
//      "**Label:** more" (bold + more text) is a normal paragraph. A run
//      of 2+ bold-only blocks becomes exactly one container:
//        - side-titled ("**Before: X**" / "**After: X**" / Old / New) ->
//          ::: compare with [panel: Side | name]
//        - any member contains "- " bullets          -> ::: columns
//        - otherwise                                 -> ::: cards
//      A lone bold-only line stays a bold paragraph.
//
//   4. SUBTITLE RULE: "Subtitle: X" under a heading inside a hero emits
//      [subtitle: X].
//
//   5. QUOTE RULE: a line starting with a quotation mark (") is a pull
//      quote.
//
//   6. METRIC RULE: 2+ consecutive pipe lines whose first cell starts
//      with a value token -> ::: metrics.
//
//   7. TABLE RULE: other pipe runs -> card-grid table (no fence) or,
//      when the first row is a text header -> ::: table.
//
//   8. Everything else (bullets, steps, images, [ai]) passes through.
//
// Usage: node draft-to-md.js <draft.txt> [slug]

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
const slug = (process.argv[3] || require('path').basename(file, '.txt')).trim();
const lines = fs.readFileSync(file, 'utf8').split('\n');

// "Key: text" - Pedro's private notes: ignored END TO END (converter +
// md + verify); may appear anywhere, including inside the head block
const KEY_LINE = /^[Kk]ey\s*:\s*(.*)$/;

const HEAD_FIELDS = ['Variant', 'Eyebrow', 'Title', 'Summary', 'Details'];
const META_FIELD = {
  Logo: 'logo', Needs: 'needs', Related: 'related',
  Metrics: 'metrics', Footnote: 'footnote', Takeaway: 'summary'
};
const KNOWN = HEAD_FIELDS.concat(Object.keys(META_FIELD));
const SIDES = ['Before', 'After', 'Old', 'New'];
let pendingBlanks = 0;

const yq = function (v) {
  return '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
};

// ── 1. head block ────────────────────────────────────────────────────────

const hero = { meta: [] };
let headEnd = 0;
let started = false;
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (!started) {
    if (t === '') continue;
    started = true;
  }
  if (KEY_LINE.test(t)) {
    // a Key line inside/after the head advances the head boundary, so
    // trailing Key lines never leak into the body scan
    if (started) headEnd = i + 1;
    continue;
  } // Key: private notes, ignored
  const m = t.match(/^([A-Za-z][A-Za-z ]*):\s*(.*)$/);
  if (m && KNOWN.indexOf(m[1]) !== -1 && m[2] !== '') {
    if (META_FIELD[m[1]]) hero.meta.push([META_FIELD[m[1]], m[2]]);
    else hero[m[1].toLowerCase()] = m[2];
    headEnd = i + 1;
  } else if (started) {
    break;
  } else {
    console.error('draft-to-md: no head block in ' + file);
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
pendingBlanks = Math.max(pendingBlanks, 1); // the canonical blank after the comment

// ── the [rule]: plain signals -> authoring markdown ─────────────────────

const DIRECTIVE = {
  Intro: 'intro', Note: 'note', Point: 'point', Figure: 'figure',
  Byline: 'byline', 'Wrap-up': 'summary', Caption: 'caption',
  Divider: 'divider', Eyebrow: 'eyebrow', Subtitle: 'subtitle'
};
const LABEL_RE = /^(Intro|Note|Point|Figure|Byline|Wrap-up|Caption|Image|Frame|Subtitle|Divider|Eyebrow|Hero|Columns|Callout):\s*(.*)$/;
const flushBlanks = function () {
  while (pendingBlanks > 0) { out.push(''); pendingBlanks -= 1; }
};
const emit = function (line) { flushBlanks(); out.push(line); };
const emitLabel = function (line) {
  const m = line.match(LABEL_RE);
  if (!m) return false;
  const label = m[1];
  const parts = m[2].split('|').map(function (s) { return s.trim(); }).filter(Boolean);
  if (label === 'Wrap-up') emit('[summary: ' + parts.join(' | ') + ']');
  else if (label === 'Callout') emit('[callout: ' + parts.join(' | ') + ']');
  else if (label === 'Image' || label === 'Frame') {
    emit('[' + label.toLowerCase() + ': ' + parts.join(' | ') + ']');
  } else emit('[' + DIRECTIVE[label] + ': ' + m[2].trim() + ']');
  return true;
};

const isBoldOnly = function (line) {
  return /^\*\*[^*]+\*\*$/.test(line.trim());
};
const sideOf = function (line) {
  const m = line.trim().match(/^\*\*([A-Za-z]+):\s*(.+)\*\*$/);
  return m && SIDES.indexOf(m[1]) !== -1 ? m : null;
};
const isQuoted = function (line) {
  return /^["\u201c]/.test(line.trim());
};
const isBullet = function (line) {
  return /^-\s/.test(line.trim());
};

// scan line-wise, grouping bold blocks on the fly
let i = headEnd;
let seenBody = false;
let inHero = false;
let nextGroupColumns = false;
let group = null; // buffered member lines of an open bold group
let groupType = null;
const closeGroup = function () {
  if (!group || !group.parts.length) { group = null; groupType = null; return; }
  const panelTitles = group.titles.filter(function (t) {
    return !!t.match(/^\*\*[^*]+:\s*[^*]+\*\*$/);
  });
  const emitPart = function (chunk, kind) {
    if (chunk.title) {
      if (kind === 'panel') {
        const t = chunk.title.match(/^\*\*([^*]+):\s*([^*]+)\*\*$/);
        out.push('[panel: ' + t[1] + ' | ' + t[2] + ']');
      } else {
        out.push('[' + kind + ': ' + chunk.title.slice(2, -2) + ']');
      }
    }
    chunk.body.forEach(function (l) {
      if (!emitLabel(l)) out.push(l);
    });
    if (!chunk.body.length) out.push('');
  };
  let surplus = 0;
  const trimTrailing = function () {
    while (out.length && out[out.length - 1] === '') { out.pop(); surplus += 1; }
  };
  if (group.titles.length >= 2 && panelTitles.length === group.titles.length) {
    flushBlanks();
    out.push('::: compare');
    group.parts.forEach(function (chunk) { emitPart(chunk, 'panel'); });
    trimTrailing();
    emit(':::');
    pendingBlanks = surplus;
  } else if (group.columns) {
    flushBlanks();
    out.push('::: columns');
    group.parts.forEach(function (chunk) { emitPart(chunk, 'col'); });
    trimTrailing();
    emit(':::');
    pendingBlanks = surplus;
  } else {
    flushBlanks();
    out.push('::: cards');
    group.parts.forEach(function (chunk) { emitPart(chunk, 'card'); });
    trimTrailing();
    emit(':::');
    pendingBlanks = surplus;
  }
  group = null;
  groupType = null;
};
const openGroup = function () {
  group = { titles: [], parts: [], columns: !!nextGroupColumns };
};

while (i < lines.length) {
  const raw = lines[i];
  const t = raw.trim();
  if (t !== '') seenBody = true;

  if (t === '') {
    if (!seenBody) { i += 1; continue; } // skip blanks between head and body
    if (group) {
      // in-group blank = member separator, carried inside the member
      const last = group.parts[group.parts.length - 1];
      if (last) last.body.push('');
    } else pendingBlanks += 1;
    i += 1; continue;
  }

  // [ai] marker passes
  if (t === '[ai]' && !group) { flushBlanks(); out.push(t); i += 1; continue; }

  // Key: private notes - ignored body-wide, never emitted, never counted
  if (KEY_LINE.test(t)) { i += 1; continue; }

  // head-style label line (body directives)
  if (LABEL_RE.test(t)) {
    // a Callout: label OUTSIDE any group opens a ::: callout tile: the label
    // becomes [callout: Title | href | Link text], the following plain lines
    // (until a blank/heading/label/bold) are the tile body
    if (!group && /^Callout:/.test(t)) {
      flushBlanks();
      out.push('::: callout');
      emitLabel(t);
      i += 1;
      while (i < lines.length && lines[i].trim() !== '' && !LABEL_RE.test(lines[i].trim()) && !isBoldOnly(lines[i].trim()) && !/^#{1,6}\s/.test(lines[i].trim())) {
        emit(lines[i].replace(/\s+$/, ''));
        i += 1;
      }
      emit(':::');
      continue;
    }
    // a Frame: label OUTSIDE any group is a standalone showcase: the
    // frame plus the next plain paragraph (its caption) inside one fence
    if (!group && /^(Frame|Figure):/.test(t)) {
      flushBlanks();
      out.push('::: showcase');
      emitLabel(t);
      i += 1;
      while (i < lines.length && lines[i].trim() !== '' && !LABEL_RE.test(lines[i].trim()) && !isBoldOnly(lines[i].trim()) && !/^#{1,6}\s/.test(lines[i].trim())) {
        emit(lines[i].replace(/\s+$/, ''));
        i += 1;
      }
      emit(':::');
      continue;
    }
    if (group && /^(Frame|Figure):/.test(t)) {
      const last = group.parts[group.parts.length - 1];
      let lastBody = '';
      if (last) for (let k = last.body.length - 1; k >= 0; k--) { if (last.body[k].trim() !== '') { lastBody = last.body[k].trim(); break; } }
      if (/^(Point|Note):/.test(lastBody)) {
        closeGroup();
        emit('::: showcase');
        emitLabel(t);
        i += 1;
        while (i < lines.length && lines[i].trim() !== '' && !LABEL_RE.test(lines[i].trim()) && !isBoldOnly(lines[i].trim()) && !/^#{1,6}\s/.test(lines[i].trim())) {
          emit(lines[i].replace(/\s+$/, ''));
          i += 1;
        }
        emit(':::');
        continue;
      }
    }
    if (/^Columns:/.test(t) && !group) {
      nextGroupColumns = true;
      i += 1; continue;
    }
    if (/^Hero:/.test(t) && !group) {
      const mod = t.replace(/^Hero:\s*/, '').trim();
      emit('::: hero' + (mod ? ' ' + mod : ''));
      inHero = true;
      i += 1; continue;
    }
    if (group) {
      if (group.parts.length && group.parts[group.parts.length - 1].title) {
        group.parts[group.parts.length - 1].body.push(t);
      } else {
        // label between members: attach to the previous member
        group.parts.push({ title: null, text: '' });
        group.parts[group.parts.length - 1].body = [t];
      }
    } else {
      emitLabel(t);
      if (inHero && /^Wrap-up:/.test(t)) { emit(':::'); inHero = false; }
    }
    i += 1;
    continue;
  }

  // heading
  if (/^#{1,6}\s/.test(t)) {
    closeGroup();
    emit(t);
    i += 1;
    continue;
  }

  // group member title?
  if (isBoldOnly(t)) {
    if (!group) openGroup();
    group.titles.push(t);
    group.parts.push({ title: t, body: [] });
    i += 1;
    continue;
  }

  // group member body line
  if (group) {
    const last = group.parts[group.parts.length - 1];
    if (last) {
      if (isBullet(t)) group.hasBullets = true;
      last.body.push(t);
    }
    i += 1;
    continue;
  }

  // quote line?
  if (/^["\u201c]/.test(t)) {
    emit('> ' + t);
    i += 1;
    continue;
  }

  // METRIC RULE: 2+ consecutive value-first lines (pipe prefix optional)
  const METRIC_RE = /^(\d|#|\u2191|\u2193|%|<|>)\s*[^|]*\|/;
  if (METRIC_RE.test(t)) {
    flushBlanks();
    out.push('::: metrics');
    while (i < lines.length && METRIC_RE.test(lines[i].trim())) {
      out.push(lines[i].trim());
      i += 1;
    }
    emit(':::');
    continue;
  }

  // pipe run (tables: text header -> ::: table; empty header -> card grid)
  if (/^\|/.test(t)) {
    const hasHeader = !/^\|\s*\|/.test(t) && !/^\|\s*-{2,}/.test(t);
    if (hasHeader) {
      flushBlanks();
      out.push('::: table');
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        out.push(lines[i].trim());
        i += 1;
      }
      out.push(':::');
    } else {
      flushBlanks();
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        out.push(lines[i].trim());
        i += 1;
      }
    }
    continue;
  }

  // image reference ![...](...) — rule 6b (specs/text-to-md/DR-0004):
  // 2+ consecutive image lines (no blank line, no [caption:] between)
  // are one image run -> one ::: wide band (the Wide images container,
  // 75% of the viewport width on desktop), alt text as each caption.
  // A solo image keeps the existing behaviour: it pairs with a following
  // [caption:] line as a showcase figure.
  if (/^!\[/.test(t)) {
    const run = [];
    while (i < lines.length && /^!\[/.test(lines[i].trim())) {
      run.push(lines[i].trim());
      i += 1;
    }
    if (run.length >= 2) {
      flushBlanks();
      out.push('::: wide');
      run.forEach(function (l) { out.push(l); });
      emit(':::');
    } else {
      emit(run[0]);
    }
    continue;
  }

  // anything else: plain paragraph line (indent preserved: raw HTML
  // blocks are the escape hatch and must survive byte-for-byte)
  emit(raw.replace(/\s+$/, ""));
  i += 1;
}
closeGroup();

process.stdout.write(out.join('\n').replace(/^\n+/, '').replace(/\s+$/, '') + '\n');
