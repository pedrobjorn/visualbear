'use strict';

// Canonicalizer for the text-to-md workflow (specs/text-to-md DR-0002).
// Normalizes emitted page markdown to one canonical byte form:
//   - LF line endings
//   - no trailing whitespace on any line
//   - exactly one \n at EOF
//   - directive spacing: one space after the bracket-colon, no padding
//     before the closing bracket:  [image: label | sub | tall]
// Markdown links ([text](url)) and table lines are untouched; inside
// front-matter values only trailing spaces are handled (values are raw).
//
// Node 10. Fixed-point property: canonicalize(canonicalize(f)) ==
// canonicalize(f). Idempotent by construction (each rule is stable).

const fs = require('fs');

function canonicalize(src) {
  let out = String(src).replace(/\r\n?/g, '\n');
  // directive spacing - [word: ...] single-line directives only
  out = out.replace(
    /(\[)([a-z][a-z0-9-]*):\s*([^\][]*?)\s*(\])/g,
    function (m, open, word, body, close) {
      return open + word + ': ' + body + close;
    }
  );
  // no trailing whitespace
  out = out
    .split('\n')
    .map(function (line) {
      return line.replace(/[ \t]+$/, '');
    })
    .join('\n');
  // exactly one trailing newline
  out = out.replace(/\n+$/, '') + '\n';
  return out;
}

// ── CLI ──────────────────────────────────────────────────────────────────

let failed = false;
process.argv.slice(2).forEach(function (file) {
  if (!fs.existsSync(file)) {
    console.log('canonicalize: not found: ' + file);
    failed = true;
    return;
  }
  const before = fs.readFileSync(file, 'utf8');
  const after = canonicalize(before);
  if (before !== after) {
    fs.writeFileSync(file, after, 'utf8');
    console.log('canonicalized: ' + file);
  } else {
    console.log('already canonical: ' + file);
  }
});
process.exit(failed ? 1 : 0);
