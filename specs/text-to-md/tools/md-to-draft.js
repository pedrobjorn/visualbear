'use strict';

// Inverse transform, plain format v2 (specs/text-to-md, DR-0003):
// page md -> SUPER PLAIN draft txt. Only these survive:
//   - # heading marks (sections keep their optional pipe overrides)
//   - **bold** (block titles become bare bold-only lines)
//   - plain "Label: value" lines (Note:/Intro:/Frame:/... announcements)
//   - paragraphs, "- " bullets, "1. " steps, pipe table rows, "> " quotes
// Everything structural is carried by signals the skill's [rule]
// interprets (see draft-to-md.js, the reference implementation):
//   ::: fences          -> dropped; rebuilt from bold-line groups
//   ::: columns         -> a "Columns:" hint line
//   ::: hero <mods>     -> a "Hero: <mods>" hint line
//   [card: X] [col: X]  -> **X**          (bold-only line)
//   [panel: A | B]      -> **A: B**       (bold-only line)
//   [frame: X | Y | Z]  -> Frame: X | Y (| Z)
//   [image: X | Y]      -> Image: X | Y
//   [intro: X]          -> Intro: X
//   [note: X]           -> Note: X
//   [point: X]          -> Point: X
//   [figure: x]         -> Figure: x
//   [byline: X]         -> Byline: X
//   [summary: X]        -> Wrap-up: X
//   [divider: X]        -> Divider: X
//   [eyebrow: X]        -> Eyebrow: X (in-body)
//   [subtitle: X]       -> Subtitle: X
//   1. **X**            -> 1. X           (the emitter re-adds bold)
//   <!-- comments -->   -> dropped (never render; dormant markup dies)
//   front matter        -> the labeled head block (Variant/Eyebrow/...)
//   blank-line runs pass through EXACTLY (a two-blank-line run before a
//   fact list is load-bearing for the parser)
//
// Usage: node md-to-draft.js src/_data/pages/<slug>.md > src/_data/drafts/<slug>.txt

const fs = require('fs');
const path = require('path');
const yaml = require(path.join(process.cwd(), 'node_modules', 'js-yaml'));

const src = fs.readFileSync(process.argv[2], 'utf8');
const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
const out = [];

if (m) {
  const meta = yaml.safeLoad(m[1]) || {};
  const hero = meta.hero || {};
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
  // case-study-nav-v2 DR-0001: the `nav:` front-matter list maps back to
  // repeatable "Nav: Label | id" head lines
  (meta.nav || []).forEach(function (item) {
    if (item && item.label && item.id) out.push('Nav: ' + item.label + ' | ' + item.id);
  });
}

// body: drop the leading page comment, map the rest in place
let body = m ? src.slice(m[0].length) : src;

// drop every HTML comment (never renders; the plain draft keeps no markup)
body = body.replace(/<!--[\s\S]*?-->/g, '').replace(/\n{4,}/g, '\n\n');

const DIRECTIVE_LABEL = {
  intro: 'Intro', note: 'Note', point: 'Point', figure: 'Figure',
  byline: 'Byline', summary: 'Wrap-up', caption: 'Caption',
  image: 'Image', frame: 'Frame', divider: 'Divider',
  eyebrow: 'Eyebrow', subtitle: 'Subtitle'
};

const fenceStack = [];
body.split('\n').forEach(function (line) {
  const t = line.trim();

  const fenceOpen = t.match(/^:::\s*([a-z-]+)\s*(.*)$/);
  if (fenceOpen) {
    fenceStack.push(fenceOpen[1]);
    // hints the plain draft carries so the [rule] can rebuild:
    // columns groups and hero blocks (with modifier) get a label line
    if (fenceOpen[1] === 'columns') out.push('Columns:');
    if (fenceOpen[1] === 'hero') out.push('Hero: ' + fenceOpen[2].trim());
    return; // the fence line itself dies; the [rule] rebuilds it
  }
  if (fenceStack.length && t === ':::') {
    fenceStack.pop();
    return;
  }

  // [card: X] / [col: X] / [panel: A | B] -> bold-only line
  const titled = t.match(/^\[(card|col|panel):\s*(.+?)\s*\]$/);
  if (titled) {
    if (titled[1] === 'panel') {
      const parts = titled[2].split('|').map(function (s) { return s.trim(); });
      out.push('**' + parts[0] + ': ' + parts.slice(1).join(' | ') + '**');
    } else {
      out.push('**' + titled[2].trim() + '**');
    }
    return;
  }

  // single-line directives -> labeled lines
  const dir = t.match(/^\[(intro|note|point|figure|byline|summary|caption|image|frame|divider|eyebrow|subtitle):\s*([\s\S]*?)\s*\]$/);
  if (dir) {
    out.push(DIRECTIVE_LABEL[dir[1]] + ': ' + dir[2]);
    return;
  }

  out.push(line);
});

// blank-line runs pass through EXACTLY - only the edges are trimmed
process.stdout.write(out.join('\n').replace(/\s+$/, '') + '\n');
