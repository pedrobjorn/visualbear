// Ticket 6 evidence: byte-for-byte presence check of every pasted 2026-11-15 CV
// string in the built /resume/ page (strict rule 1), plus order, count and
// absence checks. Run from the repo root after `npm run build`:
//   node specs/resume-cv/tools/verbatim-check.js
'use strict';

const fs = require('fs');

const html = fs.readFileSync('build/resume/index.html', 'utf8');

// strip tags, unescape the entities the renderer/marked emit, collapse space
const text = html
  .replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ');

let failures = 0;
function check(label, ok) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + label);
  if (!ok) failures++;
}
function present(s) {
  return text.indexOf(s) !== -1;
}
function absent(s) {
  return text.indexOf(s) === -1;
}
// index of first occurrence in the stripped text (for order checks)
function idx(s) {
  return text.indexOf(s);
}

// ── header (ticket 1) ──────────────────────────────────────────────────────
check('headline verbatim', present('Lead Product Designer | Scalable Systems & AI-Native Design'));
check('location verbatim', present('Stockholm, Sweden'));
check('portfolio label + href', /<a href="https:\/\/visualbear\.com\/"[^>]*>Portfolio<\/a>/.test(html));
check('mailto unchanged', /<a href="mailto:hello@visualbear\.com">hello@visualbear\.com<\/a>/.test(html));
check('linkedin href unchanged', html.indexOf('https://www.linkedin.com/in/pedro-johan-bjorn-7417324b') !== -1);
check('old "Website" label gone', !/<a href="https:\/\/visualbear\.com\/"[^>]*>Website<\/a>/.test(html));
check('exactly one h1', (html.match(/<h1[\s>]/g) || []).length === 1);

// ── about (ticket 2) ───────────────────────────────────────────────────────
check('about: 12+ years present', present('I\'m a Product Design Lead with 12+ years of experience in digital product design and 2+ years managing designers.'));
check('about: 10+ years absent', absent('10+ years'));

// ── core skills (ticket 3) ─────────────────────────────────────────────────
// scope order checks to the section, not the whole page (words like "Technical"
// and "Design Leadership" recur in role titles)
function section(from, to) {
  const a = text.indexOf(from);
  const b = text.indexOf(to, a === -1 ? 0 : a);
  return a === -1 ? '' : text.slice(a, b === -1 ? undefined : b);
}
// end marker must not collide with list item text ("User Experience (UX)")
const skillsSection = section('Core Skills', 'Design Lead - Quizrr');
const sIdx = function (s) {
  return skillsSection.indexOf(s);
};
const groups = ['Technical', 'Product Design', 'Design Leadership'];
check('skills groups in pasted order', sIdx('Technical') !== -1 && sIdx('Technical') < sIdx('Product Design') && sIdx('Product Design') < sIdx('Design Leadership'));
[
  'Agentic Design and Prototyping (Claude Code, Cursor, Figma AI, etc)',
  'Front-end fundamentals (HTML, CSS, JavaScript)',
  'Notion, Jira',
  'User Experience (UX)',
  'User Interfaces (UI)',
  'Design Systems',
  'Usability Research',
  'AI-design standards, enabling non-designers to design and designers to deliver',
  'Leading and coaching Product Designers in growth and craft',
  'Setting product and brand design principles, both experience and ways of working',
  'Design Ops, setting research, critique and delivery standards'
].forEach(function (s) {
  check('skill verbatim: ' + s.slice(0, 50), present(s));
});
check('"Notion" and "Jira" are one item (no standalone "Notion," item)', absent('Notion, Jira') === false && !/\bNotion, <\/li>/.test(html) && present('Notion, Jira'));

// ── quizrr (ticket 4) ──────────────────────────────────────────────────────
const quizrrSection = section('Design Lead - Quizrr', 'Staff Product Designer');
const qIdx = function (s) {
  return quizrrSection.indexOf(s);
};
const quizrrResp = ['AI Best practices and workflows', 'Design Leadership', 'Design Strategy', 'Design Operations'];
let orderOk = true;
for (let i = 1; i < quizrrResp.length; i++) {
  if (!(qIdx(quizrrResp[i - 1]) !== -1 && qIdx(quizrrResp[i - 1]) < qIdx(quizrrResp[i]))) orderOk = false;
}
check('quizrr responsibilities in pasted order', orderOk);
const quizrrAch = [
  'Established AI-native workflows, including design guidelines, user research and component libraries, enabling non-developers to contribute to feature delivery.',
  'Advanced prototyping capabilities using Figma and AI-coding agents for rapid iteration and testing.',
  'Led the end-to-end user experience for Quizrr’s global SaaS eLearning platform on app and web, from discovery to delivery, raising the design maturity improving our user onboarding and adoption rates by 10% year-on-year.',
  'Established the design direction, process and principles, leading to a reduction in design debt by 50%, and enabling discovery workflows, allowing for rapid explorations which increased the delivery speed of new users experienced by 2x.',
  'Implemented a design system from the ground up to cover massive SaaS Learning Management System, connecting it with code and accessibility standards'
];
quizrrAch.forEach(function (s, i) {
  check('quizrr achievement ' + (i + 1) + ' verbatim', present(s) && qIdx(s) !== -1);
});
orderOk = true;
for (let i = 1; i < quizrrAch.length; i++) {
  if (!(qIdx(quizrrAch[i - 1]) !== -1 && qIdx(quizrrAch[i - 1]) < qIdx(quizrrAch[i]))) orderOk = false;
}
check('quizrr achievements in pasted order', orderOk);

// ── h&m (ticket 4) ─────────────────────────────────────────────────────────
const hmAch = [
  'Co-founding the Design AI Circle and driving AI usage in design processes such as research summaries.',
  'Lead the global UX revamp of the web experience, aligning dozens of teams around Web & Desktop redesigns, providing coordination of usability studies and implementation, leading to an increase of 27% in sessions moving onto other pages, and a drop of 11% in single-page sessions on the index page.',
  'Lead the ideation-to-prototype for a Digital Close feature for app and webb at record speed for the company, with a time to market under 6 months and learnings at low risk.',
  'Revamped and improved the Digital Stylist project in the app, reaching 200% more activations.'
];
const hmSection = section('Staff Product Designer', 'Product Designer - Sportamore');
const hIdx = function (s) {
  return hmSection.indexOf(s);
};
hmAch.forEach(function (s, i) {
  check('h&m achievement ' + (i + 1) + ' verbatim (incl. "webb")', present(s) && hIdx(s) !== -1);
});
orderOk = true;
for (let i = 1; i < hmAch.length; i++) {
  if (!(hIdx(hmAch[i - 1]) !== -1 && hIdx(hmAch[i - 1]) < hIdx(hmAch[i]))) orderOk = false;
}
check('h&m achievements in pasted order', orderOk);

// ── education + languages (ticket 5, verify-only) ─────────────────────────
check('education sub-title present', present('Education'));
[
  '2011 - Professional Degree in Game Design',
  '2009 - Bachelors in Design, Erasmus',
  '2006 - Bachelors in Design',
  '2002 - GCSE & IB Diplomas'
].forEach(function (s) {
  check('education entry: ' + s, present(s));
});
['English', 'Portuguese', 'Swedish', 'Spanish'].forEach(function (l) {
  check('language entry: ' + l, present(l));
});
['Fluent', 'Proficient', 'Minimum'].forEach(function (l) {
  check('language level: ' + l, present(l));
});
check('Key Achievements count = 5 (one per role, no stray section)', (text.match(/Key Achievements/g) || []).length === 5);

// ── global copy gates (ticket 6) ───────────────────────────────────────────
const srcMd = fs.readFileSync('src/_data/pages/resume.md', 'utf8');
const srcTitle = fs.readFileSync('src/resume/_resume_blocks/resume.title.nunjucks', 'utf8');
const renderedMd = srcMd.replace(/<!--[\s\S]*?-->/g, ''); // comments never render
check('no [ai] marker in resume.md', srcMd.indexOf('[ai]') === -1);
check('no em dash in rendered resume.md text', renderedMd.indexOf('—') === -1);
check('no em dash in title template', srcTitle.indexOf('—') === -1);
check('no em dash in built resume text', text.indexOf('—') === -1);

console.log(failures === 0 ? '\nALL CHECKS PASS' : '\n' + failures + ' CHECK(S) FAILED');
process.exit(failures === 0 ? 0 : 1);
