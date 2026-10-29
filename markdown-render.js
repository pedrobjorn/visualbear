'use strict';

// Markdown → page HTML renderers for the content files in
// src/_data/pages/. Pages keep their shell (layout, meta, wrapper) in
// nunjucks; the editable content lives in markdown and is rendered
// through the `mdpage` (case studies, workflow) or `mdresume` (resume)
// filters.
//
// Conventions (same for both):
//   # Title        → hero: page title
//   first paragraph → hero cover summary
//   last short line before the first ## → hero details
//   ## Section     → full-width section block with its label
//   1. step        → numbered timeline
//   - item         → fact chips
//   > quote        → centred italic pull quote
//   tables         → card grids (one card per row)
//   raw HTML passes through untouched

const marked = require('marked');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// ── text helpers ─────────────────────────────────────────────────────────

// escape for HTML text nodes, leaving existing entities intact
function esc(text) {
  return String(text)
    .replace(/&(?![a-zA-Z#][a-zA-Z0-9]{1,7};)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ↑ / ↓ in labels become the phosphor arrow icons
function iconify(text) {
  return String(text)
    .replace(/↑/g, '<i class="ph ph-arrow-up"></i>')
    .replace(/↓/g, '<i class="ph ph-arrow-down"></i>');
}

// named partials for one-off graphics that cannot be markdown
// (src/_data/patterns/<name>.html), referenced as [figure: name]
function loadPattern(name) {
  const p = path.join(__dirname, 'src', '_data', 'patterns', name + '.html');
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  console.log('markdown: pattern not found: ' + name);
  return '<!-- missing pattern: ' + name + ' -->';
}

// [intro: …] [note: …] [figure: …] [frame: …] [point: …] — single-line
// directives, valid anywhere
function expandDirective(line) {
  let m = line.match(/^\[intro:\s*(.*)\]$/);
  if (m) return '<p class="cs-section-intro">' + esc(m[1]) + '</p>';
  m = line.match(/^\[note:\s*(.*)\]$/);
  if (m) return '<p class="cs-note">' + iconify(esc(m[1])) + '</p>';
  m = line.match(/^\[figure:\s*([\w-]+)\s*\]$/);
  if (m) return loadPattern(m[1]);
  m = line.match(/^\[frame:\s*(.*?)\s*\]$/);
  if (m) {
    const parts = m[1].split('|').map(function(s) { return s.trim(); });
    const tall = parts.indexOf('tall') !== -1 ? ' cs-frame--tall' : '';
    return '<div class="cs-frame' + tall + '"><span class="cs-frame-label"><strong>' + esc(parts[0]) + '</strong>' + esc(parts[1] || '') + '</span></div>';
  }
  m = line.match(/^\[point:\s*(.*)\]$/);
  if (m) return '<div class="cs-annotation"><span class="cs-annotation-dot"></span><p>' + esc(m[1]) + '</p></div>';
  m = line.match(/^\[divider:\s*(.*)\]$/);
  if (m) return '<div class="cs-divider" role="separator"><span>' + esc(m[1]) + '</span></div>';
  m = line.match(/^\[h([1-6]):\s*(.*?)\s*(?:\|\s*([\w- ]*))?\]$/);
  if (m) return '<h' + m[1] + (m[3] ? ' class="' + m[3].trim() + '"' : '') + '>' + esc(m[2]) + '</h' + m[1] + '>';
  // [image: label | sub-label | tall] — image placeholder frame (no asset yet)
  m = line.match(/^\[image:\s*(.*?)\s*\]$/);
  if (m) {
    const parts = m[1].split('|').map(function(s) { return s.trim(); });
    const tall = parts.indexOf('tall') !== -1 ? ' cs-frame--tall' : '';
    const labels = parts.filter(function(p) { return p !== 'tall'; });
    return '<div class="cs-frame' + tall + '"><span class="cs-frame-label"><strong>' + esc(labels[0] || '') + '</strong>' + esc(labels[1] || '') + '</span></div>';
  }
  // [caption: text] — a caption; pairs with a preceding image into a figure
  m = line.match(/^\[caption:\s*(.*)\]$/);
  if (m) return '<figcaption>' + esc(m[1]) + '</figcaption>';
  return null;
}

// ── container blocks (::: type … :::) ───────────────────────────────────
// See AUTHORING.md. Parsed before marked runs; the output is final HTML
// that passes through the rest of the pipeline untouched.

function renderFlow(lines) {
  // markdown blocks (paragraphs, lists) interleaved with directives,
  // in source order
  const out = [];
  let buf = [];
  const flush = function() {
    if (!buf.length) return;
    out.push(marked(buf.join('\n'), { renderer: new marked.Renderer() }));
    buf = [];
  };
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { flush(); continue; }
    const dir = expandDirective(t);
    if (dir) { flush(); out.push(dir); continue; }
    buf.push(t);
  }
  flush();
  return out.join('\n');
}

function renderMetrics(lines) {
  let out = '<div class="cs-metrics">';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split('|');
    const value = (parts[0] || '').trim();
    const label = iconify(esc((parts.slice(1).join('|') || '').trim()));
    let valueHtml;
    const m = value.match(/^(\d+)(.+)$/);
    if (m) {
      valueHtml = '<span class="cs-metric-value" data-countup="' + m[1] + '">' + m[1] + '</span><span class="cs-metric-suffix">' + esc(m[2]) + '</span>';
    } else {
      valueHtml = '<span class="cs-metric-value">' + esc(value) + '</span>';
    }
    out += '<div class="cs-metric">' + valueHtml + '<span class="cs-metric-label">' + label + '</span></div>';
  }
  return out + '</div>';
}

function renderCompare(lines) {
  const panels = [];
  let cur = null;
  for (const raw of lines) {
    const m = raw.match(/^\[panel:\s*(.*?)\s*\|\s*(.*?)\s*\]$/);
    if (m) {
      cur = { tag: m[1], title: m[2], body: [] };
      panels.push(cur);
      continue;
    }
    if (cur) cur.body.push(raw);
  }
  let out = '<div class="cs-comparison">';
  for (const p of panels) {
    out += '<div class="cs-panel">' +
      '<span class="cs-tag">' + esc(p.tag) + '</span>' +
      '<h3>' + esc(p.title) + '</h3>' +
      renderFlow(p.body) +
      '</div>';
  }
  return out + '</div>';
}

function renderColumns(lines) {
  const cols = [];
  let cur = null;
  for (const raw of lines) {
    const m = raw.match(/^\[col:\s*(.*?)\s*\]$/);
    if (m) {
      cur = { title: m[1], body: [] };
      cols.push(cur);
      continue;
    }
    if (cur) cur.body.push(raw);
  }
  let out = '<div class="cs-twocol">';
  for (const c of cols) {
    out += '<div class="cs-col"><h3>' + esc(c.title) + '</h3>' + renderFlow(c.body) + '</div>';
  }
  return out + '</div>';
}

function renderCards(lines) {
  const cards = [];
  let cur = null;
  for (const raw of lines) {
    const m = raw.match(/^\[card:\s*(.*?)\s*\]$/);
    if (m) {
      cur = { title: m[1], body: [] };
      cards.push(cur);
      continue;
    }
    if (cur) cur.body.push(raw);
  }
  let out = '<div class="cs-cards">';
  for (const c of cards) {
    out += '<div class="cs-card"><h3>' + esc(c.title) + '</h3>' + renderFlow(c.body) + '</div>';
  }
  return out + '</div>';
}

function renderShowcase(lines) {
  let inner = '';
  let hasFrame = false;
  const caption = [];
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    let m = t.match(/^\[frame:\s*(.*?)\s*\]$/);
    if (m) {
      const parts = m[1].split('|').map(function(s) { return s.trim(); });
      const tall = parts.indexOf('tall') !== -1 ? ' cs-frame--tall' : '';
      inner += '<div class="cs-frame' + tall + '"><span class="cs-frame-label"><strong>' + esc(parts[0]) + '</strong>' + esc(parts[1] || '') + '</span></div>';
      hasFrame = true;
      continue;
    }
    const dir = expandDirective(t);
    if (dir) { inner += dir; continue; }
    caption.push(t);
  }
  // framed showcases get the wide wrapper; bare graphics sit inline
  const inner_ = '<figure class="cs-showcase">' + inner +
    '<figcaption>' + esc(caption.join(' ')) + '</figcaption></figure>';
  return hasFrame ? '<div class="cs-wide">' + inner_ + '</div>' : inner_;
}

function renderHero(lines) {
  let out = '<header class="cs-hero">';
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    let m;
    if ((m = t.match(/^\[eyebrow:\s*(.*)\]$/))) out += '<p class="cs-eyebrow">' + esc(m[1]) + '</p>';
    else if ((m = t.match(/^#\s+(.*)$/))) out += '<h1>' + esc(m[1]) + '</h1>';
    else if ((m = t.match(/^\[subtitle:\s*(.*)\]$/))) out += '<p class="cs-subtitle">' + esc(m[1]) + '</p>';
    else if ((m = t.match(/^\[byline:\s*(.*)\]$/))) out += '<p class="cs-byline">' + esc(m[1]) + '</p>';
    else if ((m = t.match(/^\[summary:\s*(.*)\]$/))) out += '<p class="cs-summary"><em>' + esc(m[1]) + '</em></p>';
    else if (/^</.test(t)) out += t; // nested container output
    else out += '<p>' + esc(t) + '</p>';
  }
  return out + '</header>';
}

// markdown table → real data table with the cs-table class, wide wrapper
function renderTable(lines) {
  const src = lines.join('\n');
  const html = marked(src, { renderer: new marked.Renderer() });
  return '<div class="cs-wide">' + html.replace(/<table>/, '<table class="cs-table">') + '</div>';
}

function renderContainer(type, id, lines) {
  let html;
  if (type === 'metrics') html = renderMetrics(lines);
  else if (type === 'compare') html = renderCompare(lines);
  else if (type === 'columns') html = renderColumns(lines);
  else if (type === 'cards') html = renderCards(lines);
  else if (type === 'showcase') html = renderShowcase(lines);
  else if (type === 'hero') html = renderHero(lines);
  else if (type === 'table') html = renderTable(lines);
  else {
    console.log('markdown: unknown container ::: ' + type);
    html = '<!-- unknown container: ' + type + ' -->';
  }
  if (id) html = html.replace(/^(<\w+ class="[^"]*")/, '$1 id="' + id + '"');
  return html;
}

// walk the source, replacing ::: blocks (nestable) with their HTML
function parseContainers(src) {
  const lines = src.split('\n');
  const out = [];
  const stack = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = line.match(/^:::\s*([a-z-]+)(?:\s+([\w-]+))?\s*$/);
    if (open) {
      stack.push({ type: open[1], id: open[2] || '', lines: [] });
      continue;
    }
    if (/^:::\s*$/.test(line) && stack.length) {
      const c = stack.pop();
      const html = renderContainer(c.type, c.id, c.lines);
      if (stack.length) stack[stack.length - 1].lines.push(html);
      else {
        if (out.length && out[out.length - 1].trim() !== '') out.push('');
        out.push(html);
        out.push('');
      }
      continue;
    }
    if (stack.length) {
      stack[stack.length - 1].lines.push(line);
      continue;
    }
    const dir = expandDirective(line.trim());
    if (dir) {
      if (out.length && out[out.length - 1].trim() !== '') out.push('');
      out.push(dir);
      out.push('');
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}


// Optional leading frontmatter block (--- delimited YAML). Keys feed the
// page shell (title/description/image meta) and are stripped from the body —
// never rendered as content. See specs/md-case-study-editor/DR-0002.
function splitFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: src };
  let meta = {};
  try {
    meta = yaml.safeLoad(m[1]) || {};
  } catch (e) {
    console.log('markdown frontmatter: invalid YAML, ignoring keys');
    console.log(e);
  }
  return { meta: meta, body: src.slice(m[0].length) };
}

// Split block-level raw HTML out of the markdown before marked sees it and
// splice it back afterwards, via placeholders. marked 0.3's html-block state
// machine can swallow a following heading when raw blocks grow large, so the
// markdown engine only ever sees clean markdown; raw HTML passes through
// byte-for-byte (the documented passthrough contract).
function extractRawBlocks(src) {
  const raws = [];
  const lines = src.split('\n');
  const out = [];
  let depth = 0;
  let buf = null;
  // a placeholder must sit alone between blank lines, or marked folds it
  // into a paragraph with the neighbouring content
  const emitPlaceholder = function() {
    if (out.length && out[out.length - 1].trim() !== '') out.push('');
    out.push('@' + '@RAW' + (raws.length - 1) + '@@');
    out.push('');
  };
  const BLOCK_OPEN = /<(div|p|ol|ul|li|figure|figcaption|section|header|blockquote|table|thead|tbody|tr|th|td|h[1-6]|span|em|strong|i|figure)\b[^>]*\/?>/g;
  const BLOCK_CLOSE = /<\/(div|p|ol|ul|li|figure|figcaption|section|header|blockquote|table|thead|tbody|tr|th|td|h[1-6]|span|em|strong|i|figure|header)>/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (depth === 0) {
      // HTML comments (including multi-line ones) are raw, whatever they hold
      if (/^\s{0,3}<!--/.test(line) && !line.includes('-->', 4)) {
        buf = [line];
        depth = 1;
        continue;
      }
      if (/^\s{0,3}<!--/.test(line)) {
        raws.push(line);
        emitPlaceholder();
        continue;
      }
      if (/^\s{0,3}</.test(line) && !/^\s{0,3}<!DOCTYPE/i.test(line)) {
        buf = [line];
        const opens = (line.match(BLOCK_OPEN) || []).length;
        const closes = (line.match(BLOCK_CLOSE) || []).length;
        depth = opens - closes;
        // void elements and self-closed tags don't open a block
        if (/\/>\s*$/.test(line)) depth = Math.max(depth, 0);
        if (depth > 0) continue;
        raws.push(buf.join('\n'));
        emitPlaceholder();
        buf = null;
        depth = 0;
        continue;
      }
      out.push(line);
      continue;
    }
    // inside a raw block: everything until depth returns to 0 belongs to it
    buf.push(line);
    if (/-->/.test(line)) {
      depth = 0;
      raws.push(buf.join('\n'));
      emitPlaceholder();
      buf = null;
      continue;
    }
    const opens = (line.match(BLOCK_OPEN) || []).length;
    const closes = (line.match(BLOCK_CLOSE) || []).length;
    depth += opens - closes;
    if (depth <= 0) {
      depth = 0;
      raws.push(buf.join('\n'));
      emitPlaceholder();
      buf = null;
    }
  }
  if (buf) {
    raws.push(buf.join('\n'));
    emitPlaceholder();
  }
  return { md: out.join('\n'), raws: raws };
}

// the marked renderer with list classes (shared by mdPage and renderMarkdown)
function listRenderer() {
  const renderer = new marked.Renderer();
  renderer.list = function(body, ordered) {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'cs-timeline' : 'cs-facts';
    return '<' + tag + ' class="' + cls + '">\n' + body + '</' + tag + '>\n';
  };
  return renderer;
}

function renderMarkdown(src, opts) {
  const split = extractRawBlocks(parseContainers(src));
  const renderer = opts && opts.plainLists ? new marked.Renderer() : listRenderer();
  let html = marked(split.md, { headerIds: false, renderer: renderer });
  html = html.replace(/ id="[^"]*"/g, '');
  // splice the raw HTML blocks back in (marked wraps a lone placeholder
  // line in a paragraph — unwrap it)
  html = html.replace(/<p>\s*@@RAW(\d+)@@\s*<\/p>/g, function(m, n) {
    return typeof split.raws[n] !== 'undefined' ? split.raws[n] : m;
  });
  html = html.replace(/@@RAW(\d+)@@/g, function(m, n) {
    return typeof split.raws[n] !== 'undefined' ? split.raws[n] : m;
  });

  // [ai] markers: the marker line after a block attributes that block to
  // AI drafting — chip badge via CSS [data-ai]
  html = applyAiMarkers(html);

  return html;
}

// deep rule: AI-drafted copy must never ship unreviewed — warn loudly on
// production builds
function applyAiMarkers(html) {
  // the [ai] marker line becomes a standalone label element exactly where
  // the author placed it (at the end of the content it attributes)
  html = html.replace(/<p>\s*\[ai\]\s*<\/p>/g, '<div class="ai-mark">✦ AI-drafted</div>');
  // an image followed by a [caption:] wraps into the showcase figure
  // (the image arrives wrapped in a paragraph — the wrapper is dropped)
  html = html.replace(/(?:<p>\s*)?(<img[^>]*>)(?:\s*<\/p>)?\s*<figcaption>([\s\S]*?)<\/figcaption>/g, function(m, img, caption) {
    return '<figure class="cs-showcase">' + img + '<figcaption>' + caption + '</figcaption></figure>';
  });
  const aiCount = (html.match(/class="ai-mark"/g) || []).length + (html.match(/data-ai="true"/g) || []).length;
  if (aiCount && process.argv.includes('--production')) {
    console.log('');
    console.log('  ⚠️  AI-ATTRIBUTED CONTENT WILL SHIP: ' + aiCount + ' block(s) marked [ai] on this page.');
    console.log('     Rewrite as your own and remove the [ai] markers before publishing.');
    console.log('');
  }
  return html;
}

// ── case-study / workflow pages ──────────────────────────────────────────

// 'Design & Delivery' → 'design-delivery' (matches the hand-written ids)
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mdPage(src) {
  // raw HTML stays out of the markdown engine until the section logic has
  // run: raw <h2>s must not split sections, and raw hero/divider blocks must
  // be able to sit between sections (DR-0004)
  const split = extractRawBlocks(parseContainers(splitFrontmatter(src).body));
  let html = marked(split.md, { headerIds: false, renderer: listRenderer() });
  html = html.replace(/ id="[^"]*"/g, '');

  // tables → card grids: first row is the heads, every body row is a card
  html = html.replace(/<table>[\s\S]*?<\/table>/g, function(table) {
    const rows = table.match(/<tr>[\s\S]*?<\/tr>/g) || [];
    if (rows.length < 2) return table;
    let cards = '';
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].match(/<td>[\s\S]*?<\/td>/g) || [];
      const head = cells.length ? cells[0].replace(/<\/?td>/g, '') : '';
      const body = cells.length > 1 ? cells.slice(1).join(' ').replace(/<\/p>|<p>|<\/?td>/g, ' ').trim() : '';
      cards += '<div class="cs-card"><h3>' + head.trim() + '</h3><p>' + body.trim() + '</p></div>';
    }
    return '<div class="cs-cards">' + cards + '</div>';
  });

  // blockquotes → centred italic pull quotes
  html = html.replace(/<blockquote>\s*(?:<p>)?([\s\S]*?)(?:<\/p>)?\s*<\/blockquote>/g, function(m, inner) {
    return '<p class="cs-quote">' + inner.trim() + '</p>';
  });

  // runs of 2+ quotes become a quote group (inner <p> loses its class);
  // a lone quote stays a plain p.cs-quote, matching the pages' markup
  // (tempered so a quote's body can't span elements)
  const Q = '<p class="cs-quote">(?:(?!<p class="cs-quote">)(?!</p>)[\\s\\S])*?</p>';
  html = html.replace(new RegExp(Q + '(?:\\s*' + Q + ')+', 'g'), function(group) {
    const items = group.match(new RegExp(Q, 'g')) || [];
    return '<div class="cs-quotes">' + items.map(function(q) {
      return '<div class="cs-quote">' + q.replace(/ class="cs-quote"/, '') + '</div>';
    }).join('') + '</div>';
  });

  // timeline items: `1. **Title** — text` → li with h3 + p
  html = html.replace(/<ol class="cs-timeline">([\s\S]*?)<\/ol>/g, function(m, inner) {
    return '<ol class="cs-timeline">' + inner.replace(/<li><strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/li>/g, function(m2, title, rest) {
      const body = rest.replace(/^\s*(?:—|–|-)\s*/, '').trim();
      return '<li><h3>' + title + '</h3>' + (body ? '<p>' + body + '</p>' : '') + '</li>';
    }) + '</ol>';
  });

  // split into hero (up to first h2) and sections
  const out = [];
  let rest = html;
  const firstH2 = rest.indexOf('<h2>');
  let hero = '';
  if (firstH2 !== -1) {
    hero = rest.slice(0, firstH2);
    rest = rest.slice(firstH2);
  } else {
    hero = rest;
    rest = '';
  }

  // pages headed entirely by directives (no md-level h1/h2 — e.g. pages
  // that keep their own section styling) pass straight through: no hero
  // derivation, no cs-section machinery
  if (!hero.match(/<h1>/) && firstH2 === -1) {
    return applyAiMarkers(html
      .replace(/<p>\s*@@RAW(\d+)@@\s*<\/p>/g, function(m, n) {
        return typeof split.raws[n] !== 'undefined' ? split.raws[n] : m;
      })
      .replace(/@@RAW(\d+)@@/g, function(m, n) {
        return typeof split.raws[n] !== 'undefined' ? split.raws[n] : m;
      }));
  }

  // hero: h1 + first paragraph as summary + a short meta line as details
  const h1 = hero.match(/<h1>([\s\S]*?)<\/h1>/);
  if (h1) {
    const paras = hero.slice(h1.index + h1[0].length).match(/<p>([\s\S]*?)<\/p>/g) || [];
    const summary = paras.length ? paras[0] : '';
    const meta = paras.length > 1 ? paras[paras.length - 1] : '';
    out.push('<header class="cs-hero">');
    out.push('<h1>' + h1[1] + '</h1>');
    if (summary) out.push('<p class="cs-cover-summary">' + summary.replace(/^<p>|<\/p>$/g, '') + '</p>');
    if (meta) out.push('<p class="cs-cover-details">' + meta.replace(/^<p>|<\/p>$/g, '') + '</p>');
    out.push('</header>');
  }

  // sections: every h2 opens a section block with its label as the eyebrow.
  // `## H2 title | Eyebrow | id` overrides the eyebrow label and/or the
  // section id; an explicitly empty eyebrow (`## H2 | | id`) omits the
  // eyebrow line for sections that carry their heading only.
  rest = rest.replace(/<h2>([\s\S]*?)<\/h2>/g, function(m, title) {
    const parts = title.replace(/<[^>]*>/g, '').split('|').map(function(s) { return s.trim(); });
    const heading = parts[0];
    const eyebrow = parts.length > 1 ? parts[1] : heading;
    const id = parts[2] || slugify(eyebrow || heading);
    return '</section><section class="cs-section" id="' + id + '">' +
      (eyebrow ? '<p class="cs-eyebrow">' + eyebrow + '</p>' : '') + '<h2>' + heading + '</h2>';
  });

  // splice the raw HTML back (unwrap the <p> a lone placeholder gets)
  rest = rest.replace(/<p>\s*@@RAW(\d+)@@\s*<\/p>/g, function(m, n) {
    return typeof split.raws[n] !== 'undefined' ? split.raws[n] : m;
  });
  rest = rest.replace(/@@RAW(\d+)@@/g, function(m, n) {
    return typeof split.raws[n] !== 'undefined' ? split.raws[n] : m;
  });

  // raw hero/divider blocks between sections: the next section's closing
  // tag lands after them — move it in front so they sit between sections
  rest = rest.replace(/((?:<div class="cs-divider"[\s\S]*?<\/div>\s*|<header class="cs-hero[\s\S]*?<\/header>\s*|<section class="cs-hero[\s\S]*?<\/section>\s*)+)(<\/section>)/g, '$2$1');

  // close the final section and drop the stray close before the first
  out.push(rest.replace(/^\s*<\/section>/, ''));
  out.push('</section>');

  // AI markers + the production guard, applied to the assembled body
  const body = out.join('\n');
  return applyAiMarkers(body);
}

// ── resume ───────────────────────────────────────────────────────────────

function mdResume(src) {
  const lines = renderMarkdown(parseContainers(splitFrontmatter(src).body), { plainLists: true }).split('\n');
  const out = [];
  let inList = false;
  let subOpen = false;
  let listDepth = 0;      // marked's own nesting depth inside a list
  let openCol = false;    // a quiet section's col m12 is still open
  let barePara = false;   // next paragraph renders bare (interests style)
  let seenSection = false; // paragraphs before the first section are the intro

  const closeList = function() {
    if (inList) { out.push('</ul>'); inList = false; }
    listDepth = 0;
  };
  const closeCol = function() {
    if (openCol) { out.push('</div>'); out.push('</div>'); openCol = false; }
  };
  const openList = function() {
    if (!inList) { out.push('<ul>'); inList = true; listDepth = 1; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '') { closeList(); closeCol(); subOpen = false; continue; }

    // section: ## Title → section row with heading.
    // `## Title |` (quiet) keeps the section's own sub-title style: a
    // following list renders inside col m12 (education/languages), a
    // following paragraph gets the col m4 title row (interests).
    let m = line.match(/^<h2>([\s\S]*?)<\/h2>$/);
    if (m) {
      closeList(); closeCol(); subOpen = false;
      seenSection = true;
      const quiet = /\|\s*$/.test(m[1]);
      const title = m[1].replace(/\|\s*$/, '').trim();
      // col m12 row holds the heading and everything after it
      out.push('<div class="row">');
      out.push('<div class="col m12">');
      out.push(quiet ? '<div class="sub-title">' + title + '</div>' : '<h3>' + title + '</h3>');
      openCol = true;
      continue;
    }

    // experience row: ### Role — [Company](url) | dates
    m = line.match(/^<h3>([\s\S]*?)<\/h3>$/);
    if (m) {
      closeList(); closeCol(); subOpen = false;
      seenSection = true;
      const parts = m[1].split('|');
      const title = parts[0].trim();
      const date = (parts[1] || '').trim();
      out.push('<div class="row">');
      out.push('<div class="col m8 s12"><h3>' + title + '</h3></div>');
      if (date) out.push('<div class="col m4 s12"><h3 class="right-title">' + date + '</h3></div>');
      out.push('</div>');
      continue;
    }

    // marked's list tags — nested lists are the skills pattern
    if (line === '<ul>') {
      if (inList) {
        // nested list: the parent li's **bold** head becomes the skill
        // title, and both list levels render as no-bullets
        for (let j = out.length - 1; j >= 0; j--) {
          const sm = typeof out[j] === 'string' ? out[j].match(/^<strong>([\s\S]*?)<\/strong>$/) : null;
          if (sm) { out[j] = '<h4 class="sub-title">' + sm[1] + '</h4>'; break; }
        }
        for (let j = out.length - 1; j >= 0; j--) {
          if (out[j] === '<ul>') { out[j] = '<ul class="no-bullets">'; break; }
        }
        out.push('<ul class="no-bullets">');
        listDepth++;
      } else {
        openList();
      }
      continue;
    }
    if (line === '</ul>' || line === '</ol>') {
      if (listDepth > 1) {
        out.push('</ul>');
        listDepth--;
      } else {
        closeList();
      }
      continue;
    }
    if (line === '<ol>') { openList(); continue; }

    // education/languages item: **title** – [link](url) | note
    m = line.match(/^<li><strong>([\s\S]*?)<\/strong>\s*[–—-]\s*<a href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>\s*(?:\|\s*(.*?)|—\s*(.*))?<\/li>$/);
    if (m && openCol) {
      openList();
      const note = (m[5] || m[6] || '').trim();
      out.push('<li><b>' + m[1] + '</b> – <a href="' + m[2] + '" target="_blank">' + m[4] + '</a>' +
        (note ? ', <span class="side-text">' + note + '</span>' : '') + '</li>');
      continue;
    }
    // languages item: **language** | level
    m = line.match(/^<li><strong>([\s\S]*?)<\/strong>\s*\|\s*(.*?)<\/li>$/);
    if (m && openCol) {
      openList();
      out.push('<li><b>' + m[1] + '</b> <span class="side-text">' + m[2] + '</span></li>');
      continue;
    }

    // list items
    m = line.match(/^<li>([\s\S]*?)<\/li>$/);
    if (m) {
      openList();
      out.push('<li>' + m[1] + '</li>');
      continue;
    }
    // multi-line li open — marked glues a nested <ul> to the head line:
    // `<li><strong>Skill</strong><ul>` is the skills pattern
    if (/^<li>/.test(line) && !/<\/li>/.test(line)) {
      openList();
      const splitUl = line.match(/^(<li>[\s\S]*?)\s*(<ul>.*)$/);
      if (splitUl && /<strong>/.test(splitUl[1])) {
        // skill group: the strong head becomes the h4 title, the parent
        // ul becomes no-bullets, and the nested list opens under it
        const head = splitUl[1].replace(/^<li>/, '').replace(/<strong>([^<]*)<\/strong>/, '<h4 class="sub-title">$1</h4>');
        for (let j = out.length - 1; j >= 0; j--) {
          if (out[j] === '<ul>') { out[j] = '<ul class="no-bullets">'; break; }
        }
        out.push('<li>');
        out.push(head);
        out.push('<ul class="no-bullets">');
        listDepth++;
      } else {
        out.push('<li>');
        out.push((splitUl ? splitUl[1] : line).replace(/^<li>/, ''));
        if (splitUl) out.push(splitUl[2]);
      }
      continue;
    }

    // **Sub-title** → h4.sub-title (checked before the generic paragraph)
    m = line.match(/^<p><strong>([\s\S]*?)<\/strong><\/p>$/);
    if (m) {
      closeList(); closeCol(); subOpen = false;
      out.push('<div class="row"><div class="col m12"><h4 class="sub-title">' + m[1] + '</h4></div></div>');
      continue;
    }

    // paragraphs
    m = line.match(/^<p>([\s\S]*?)<\/p>$/);
    if (m) {
      closeList(); subOpen = false;
      if (barePara) {
        out.push('<p class="col m12">' + m[1] + '</p>');
        barePara = false;
      } else if (openCol) {
        out.push('<p>' + m[1] + '</p>');
      } else if (!seenSection) {
        // intro: col m12 wrapping a bare paragraph
        out.push('<div class="row"><div class="col m12"><p>' + m[1] + '</p></div></div>');
      } else {
        out.push('<div class="row"><p class="col m12">' + m[1] + '</p></div>');
      }
      continue;
    }

    out.push(line);
  }
  closeList();
  closeCol();
  return out.join('\n');
}

// frontmatter keys as an object, for the page shell (meta, hero image)
function mdMeta(src) {
  return splitFrontmatter(src).meta;
}

module.exports = { mdPage: mdPage, mdResume: mdResume, mdMeta: mdMeta };
