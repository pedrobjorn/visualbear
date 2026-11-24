'use strict';

// Verifier for text-to-md output (specs/text-to-md DR-0001, DR-0002).
// Usage: node verify-page-md.js <page.md> [source.txt]
//
// Gates:
//   1. front matter: hero key present with the bounded vocabulary
//      (variant/eyebrow/title/summary/details; meta items limited to
//      logo|needs|related|metrics|footnote|summary) - the renderer
//      skips unknown item keys with a console warning, we fail louder
//   2. em-dash rule: em dashes allowed ONLY when verbatim in the source
//      (Pedro's final copy is preserved; the skill must never add one)
//   3. image references: every ![alt](../images/...) resolves to a file
//      under src/images/ (warn-level: placeholder-only pages pass)
//   4. content accounting: every non-blank source line appears in the
//      output (structure chars ignored), or a `<!-- TODO: ... -->`
//      carries its excerpt - content is never silently dropped
//
// Exit 0 = all gates green. Node 10.

const fs = require('fs');
const path = require('path');
const yaml = require(path.join(process.cwd(), 'node_modules', 'js-yaml'));

const page = process.argv[2];
const sourcePath = process.argv[3];
if (!page || !fs.existsSync(page)) {
  console.log('verify-page-md: usage: node verify-page-md.js <page.md> [source.txt]');
  process.exit(1);
}

const src = fs.readFileSync(page, 'utf8');
const norm = function (s) {
  return String(s).replace(/\s+/g, ' ').trim();
};

// split front matter the same way markdown-render.js does
const fmMatch = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
const body = fmMatch ? src.slice(fmMatch[0].length) : src;
let meta = {};
if (fmMatch) {
  try {
    meta = yaml.safeLoad(fmMatch[1]) || {};
  } catch (e) {
    console.log('FAIL front-matter: invalid YAML: ' + e.message);
    process.exit(1);
  }
}

let failures = 0;
const fail = function (msg) {
  failures += 1;
  console.log('FAIL ' + msg);
};
const pass = function (msg) {
  console.log('ok   ' + msg);
};

// ── gate 1: hero front matter ────────────────────────────────────────────

const HERO_KEYS = ['variant', 'eyebrow', 'title', 'summary', 'details', 'meta'];
const META_KEYS = ['logo', 'needs', 'related', 'metrics', 'footnote', 'summary'];

if (!meta.hero || typeof meta.hero !== 'object') {
  fail('front-matter: no hero: block (text-to-md output must always carry one)');
} else {
  const hero = meta.hero;
  Object.keys(hero).forEach(function (k) {
    if (HERO_KEYS.indexOf(k) === -1) fail('front-matter: unknown hero key "' + k + '"');
  });
  if (!hero.title || !String(hero.title).trim()) {
    fail('front-matter: hero.title empty');
  }
  if (hero.meta !== undefined && !Array.isArray(hero.meta)) {
    fail('front-matter: hero.meta must be a list');
  } else if (Array.isArray(hero.meta)) {
    let i = 0;
    hero.meta.forEach(function (item) {
      i += 1;
      const keys = item && typeof item === 'object' ? Object.keys(item) : [];
      if (keys.length !== 1) {
        fail(
          'front-matter: meta item ' +
            i +
            ' must be a one-key mapping (got: ' +
            keys.join(',') +
            ')'
        );
        return;
      }
      if (META_KEYS.indexOf(keys[0]) === -1) {
        fail('front-matter: meta item ' + i + ' unknown key "' + keys[0] + '"');
      }
      if (!String(item[keys[0]]).trim()) {
        fail('front-matter: meta item ' + i + ' empty value');
      }
    });
  }
  if (failures === 0)
    pass(
      'front-matter: hero vocabulary valid (' + (hero.meta ? hero.meta.length : 0) + ' meta items)'
    );
}

// ── gate 1b: nav front matter (case-study-nav-v2 DR-0001, v3 DR-0003) ────
// Top-level `nav:` key: optional list of { label, id } (label/id only), max
// 5 entries, every id must match a `##` section id in the body (same pipe +
// slug rules as markdown-render.js parseH2Parts/slugify), and every label
// must be condensed: <= NAV_LABEL_MAX chars (v3 DR-0003/DR-0004 - long full
// section titles like "Future Improvements, Based on Learnings" must not
// become nav links).
const NAV_LABEL_MAX = 28; // v3 DR-0004: 28 so teachr's configured 26-char "Deepdive: Teachr Assistant" passes unedited

const slugify = function (s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
const sectionIds = [];
body.split('\n').forEach(function (l) {
  const h = l.match(/^##\s+(.*)$/);
  if (!h) return;
  const parts = h[1]
    .replace(/<[^>]*>/g, '')
    .split('|')
    .map(function (s) {
      return s.trim();
    });
  const heading = parts[0];
  const eyebrow = parts.length > 1 ? parts[1] : heading;
  sectionIds.push(parts[2] || slugify(eyebrow || heading));
});

if (meta.nav !== undefined) {
  if (!Array.isArray(meta.nav)) {
    fail('front-matter: nav must be a list of { label, id }');
  } else if (meta.nav.length > 5) {
    fail('front-matter: nav has ' + meta.nav.length + ' entries, max is 5');
  } else {
    let navOk = true;
    meta.nav.forEach(function (item, i) {
      const keys = item && typeof item === 'object' ? Object.keys(item).sort() : [];
      if (keys.join(',') !== 'id,label') {
        fail(
          'front-matter: nav entry ' +
            (i + 1) +
            ' must have exactly label+id keys (got: ' +
            keys.join(',') +
            ')'
        );
        navOk = false;
        return;
      }
      if (!String(item.label).trim() || !String(item.id).trim()) {
        fail('front-matter: nav entry ' + (i + 1) + ' has an empty label or id');
        navOk = false;
        return;
      }
      if (String(item.label).trim().length > NAV_LABEL_MAX) {
        fail(
          'front-matter: nav entry ' +
            (i + 1) +
            ' label "' +
            item.label +
            '" is ' +
            String(item.label).trim().length +
            ' chars, max is ' +
            NAV_LABEL_MAX +
            ' (condense the label - case-study-nav-v3 DR-0003)'
        );
        navOk = false;
      }
      if (sectionIds.indexOf(String(item.id).trim()) === -1) {
        fail(
          'front-matter: nav entry ' +
            (i + 1) +
            ' id "' +
            item.id +
            '" matches no ## section id (' +
            sectionIds.join(', ') +
            ')'
        );
        navOk = false;
      }
    });
    if (navOk)
      pass(
        'front-matter: nav valid (' +
          meta.nav.length +
          ' entr' +
          (meta.nav.length === 1 ? 'y' : 'ies') +
          ', all ids match ## sections)'
      );
  }
}

// ── gate 2: em-dash rule (source-verbatim allowance) ─────────────────────

const sourceText =
  sourcePath && fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
const emDashes = [];
// scan the WHOLE file - front-matter hero values carry copy too
let idx = src.indexOf('—');
while (idx !== -1) {
  emDashes.push(idx);
  idx = src.indexOf('—', idx + 1);
}
if (!emDashes.length) {
  pass('em-dash: none in output');
} else {
  const context = function (probe) {
    // a probe is verbatim-allowed when the words flanking it appear in the source
    const around = src
      .slice(Math.max(0, probe - 60), probe + 60)
      .replace(/—/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    const head = around.slice(0, 4).join(' ');
    const tail = around.slice(-4).join(' ');
    return norm(sourceText).indexOf(head) !== -1 && norm(sourceText).indexOf(tail) !== -1;
  };
  const introduced = emDashes.filter(function (pos) {
    return !sourceText || !context(pos);
  });
  if (introduced.length) {
    fail(
      'em-dash: ' +
        introduced.length +
        ' em dash(es) not present in the source text (the skill must never add one)'
    );
  } else {
    pass('em-dash: ' + emDashes.length + ' em dash(es), all verbatim from the source');
  }
}

// ── gate 3: image references ─────────────────────────────────────────────

// page md references images relative to the RENDERED page (src/<page>/):
// ../images/x → src/images/x
const repoRoot = process.cwd();
const refs = [];
const re = /!\[[^\]]*\]\(([^)]+)\)/g;
let m;
while ((m = re.exec(body))) refs.push(m[1]);
const badRefs = refs.filter(function (u) {
  if (/^https?:/.test(u)) return false;
  const file = u.replace(/^(\.\.\/)+/, '').replace(/^images\//, '');
  // source tree stores images under src/_images; imagemin strips the
  // underscore at build time (gulp/imagemin.js), so resolve both
  return (
    !fs.existsSync(path.join(repoRoot, 'src', '_images', file)) &&
    !fs.existsSync(path.join(repoRoot, 'src', 'images', file))
  );
});
if (!refs.length) {
  pass('images: no real image refs (placeholders only)');
} else if (badRefs.length) {
  fail('images: missing files: ' + badRefs.join(', '));
} else {
  pass('images: ' + refs.length + ' ref(s) resolve');
}

// ── gate 4: content accounting (source lines all accounted for) ─────────

if (!sourcePath || !fs.existsSync(sourcePath)) {
  console.log('skip content-accounting: no source.txt given');
} else {
  // textify: drop structure scaffolding (md markers, directive brackets)
  // so only text remains - applied to OUTPUT and SOURCE lines alike so
  // e.g. a source "15% | customer return rate ↑" matches its
  // ::: metrics rendering
  const textify = function (s) {
    return norm(
      String(s)
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/:::/g, ' ')
        .replace(/\[(?:card|col|panel|frame):/g, ' ')
        .replace(/\[(?:ai|byline|caption|figures?|h[23]|image|intro|note|point|summary)\s*:/g, ' ')
        .replace(/[#*_`:]/g, ' ')
        .replace(/\[|\]|\||\(|\)/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    );
  };
  // body + front-matter VALUES (hero copy comes from the source too);
  // scaffold chars stripped uniformly from both sides
  const outText = textify(body) + ' ' + (fmMatch ? textify(fmMatch[1]) : '');
  const srcLines = [];
  let inComment = false;
  sourceText.split('\n').forEach(function (l) {
    // lines inside HTML comments are dormant (never render, may be
    // commented-out old markup) - not part of the content accounting
    const t = l.trim();
    if (/^[Kk]ey\s*:/.test(t)) return; // Key: private notes - ignored, not content
    if (inComment) {
      if (/-->/.test(t)) inComment = false;
      return;
    }
    if (/^<!--/.test(t)) {
      if (!/^<!--.*-->/.test(t)) inComment = true;
      return;
    }
    // a Nav: head line maps to front matter `nav: - label: "X" id: y`, so
    // account for it in the same shape the output carries it (the generic
    // label strip below would leave "label outcomes" split across words)
    const navM = t.match(/^nav\s*:\s*(.*)$/i);
    if (navM) {
      const p = navM[1]
        .split('|')
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      if (p.length === 2) srcLines.push(textify('label: "' + p[0] + '" id: "' + p[1] + '"'));
      return;
    }
    // a leading signal word (Note:/Before:/Summary:/...) becomes
    // structure - the rendered text carries the rest of the line
    // a "Word: value" label prefix is signal, not content
    const text = textify(
      l.replace(
        /^\s*(variant|eyebrow|title|summary|details|logo|needs|related|metrics|footnote|takeaway|intro|note|point|figure|byline|wrap-up|caption|image|frame|divider|subtitle|hero|columns)\s*:\s*/i,
        ''
      )
    );
    if (text) srcLines.push(text);
  });
  const todos = norm(body.match(/<!--\s*TODO[^>]*>/g) || []);
  const outLower = outText.toLowerCase();
  const unaccounted = srcLines.filter(function (line) {
    if (outLower.indexOf(line.toLowerCase()) !== -1) return false;
    // carried as TODO? (only then is it accounted for)
    return todos.indexOf(line.slice(0, 25)) === -1;
  });
  if (unaccounted.length) {
    fail('content-accounting: ' + unaccounted.length + ' source line(s) missing from the output');
    unaccounted.slice(0, 5).forEach(function (l) {
      console.log('     missing: ' + l.slice(0, 80));
    });
  } else {
    pass('content-accounting: all ' + srcLines.length + ' source line(s) accounted for');
  }
}

process.exit(failures ? 1 : 0);
