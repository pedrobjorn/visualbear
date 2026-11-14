# Ticket 2 verify - thinner Play card below the index gallery (2026-11-14)

RED -> GREEN on `scripts/test/card-thin.test.js` (renders the card macro
through nunjucks directly, spec passed via render context):

- RED: `card--thin` class absent without the flag implementation
- GREEN: `npm test` -> mirror-link PASS, tabs PASS, play-data OK, card-thin OK

Build + rendered output:

- headless `gulp --production --headless` exit 0; full `npm run build` exit 0, all 5 release-guard checks OK
- `build/index.html`: exactly one `card--thin` anchor (`id="play-teaser"`, href `../play`), DOM order `#work` < teaser < `#about`; work gallery has no in-gallery Play/Blog card
- `build/styles/main.css`: `.card--thin .card-container.medium.card{height:112px}` and `.play-teaser{margin-top:0;background:none}` present

Visual probes (Playwright, static serve of `build/`, captures filed):

- 1440x900 and 390x844: `teaser_count=1`, `height=112`, text "Play / Stuff I do for fun", href `../play`; click at 1440 -> `http://localhost:3999/play/`; zero console errors
- captures: `t2-index-1440.png`, `t2-index-390.png`

Air-lock amendment (found by guard check 8, fixed in this ticket):

- first release run exited 1: the teaser's `../play` href on the mirrored home resolves outside the mirror
- fix: `stripPlayTeaser` in `scripts/mirror-link.js` (targeted on `id="play-teaser"`), wired in `release-mirror.js`; asserted in `scripts/test/mirror-link.test.js` (removal, idempotency, no-op pages, rest of home intact)
- after fix: `build/selected-works/index.html` has 0 `play-teaser` / 0 `../play` references; public `build/index.html` keeps the teaser (2 marker occurrences, 1 `../play` href); release exit 0

Open items (not blockers): teaser img is the existing shipped thumb `gallery_thumb_prettyugly.jpg` (ASSUMPTION - Pedro to validate or replace; H2). Lint 0 errors (9 pre-existing tabs warnings); spec files prettier-clean.
