# Tickets — phase 3.5: QA checks (added 2026-10-29)

Adds machine-checkable quality gates for the markdown pipeline output:
semantic HTML, accessibility, and formatting/lint wired into npm.

Constraint: the toolchain runs on Node 10 (`.nvmrc`, `./scripts/gulp.sh`).
Any new dev dependency must support Node 10 (e.g. prettier@2.x, not 3.x).

---

## Ticket 13 — Semantic HTML audit + fixes

Status: DONE 2026-10-29

Findings and fixes (all generator/CSS-side; every page pixel-identical to
its pre-fix capture, verified with Playwright full-page diffs):

- sports-ecommerce-redesign had two h1s (two case studies on one page) →
  `::: hero` now supports `## title` emitting a real h2; the coupon hero
  uses it; `.cs-hero h2` keeps the h1 look. First-shoot mistake: the
  companion CSS rule was written at `.case-study` scope and resized every
  section h2 — caught by the pixel diff, rescoped to `.cs-hero h2`.
- resume jumped h1 → h3 → h4: `mdresume` now emits real h2 sections
  (`.resume-section`, keeps the h3 visual size), skill titles are h3
  sub-titles under their h2, roles stay h3, role sub-titles stay h4.
  Resume title row wrapped in `<header>` (was a plain div.row).
- teachr's hero-adjacent card title was an h3 with no h2 above it →
  card label titles are now `p.cs-card-title` (same look, not a heading).
- Pull quotes were `p.cs-quote` → lone quotes are real
  `blockquote.cs-quote > p` (border/margin/padding reset in CSS); quote
  groups keep their card grid with a blockquote inside each card.

Audit script (scratchpad, `/tmp/audit-semantic.js`): one h1 per page, no
skipped heading levels, main/nav/header/footer landmarks, no numbered or
dash-led text in `<p>`, quotes are blockquotes. Result: ALL CLEAN on all
7 content pages (the "8 content pages" count in the original ticket was
wrong — 7 exist).

Acceptance criteria:

- [x] One `h1` per page; heading levels never skip (verified all pages)
- [x] `main`, `nav`, `header`, `footer` landmarks present (verified all pages)
- [x] Lists are `ul`/`ol`/`li`; timelines use `ol`; quotes are `blockquote`
- [x] No `div` used where a semantic element fits (card labels are
      `p.cs-card-title`; quiet resume sub-title divs stay divs by design —
      they are small side labels, not document headings, and are not
      counted in the heading ladder)
- [x] Verified on all content pages, pixel-identical before/after

## Ticket 14 — Accessibility audit (axe)

Status: DONE 2026-10-29 — zero violations on all 7 pages at 1440 + 768
(evidence: `evidence/axe-before.json`, `evidence/axe-after.json`)

What the first run found and how each was fixed:

- [serious] color-contrast, 4 pages:
  - `.cs-cover-summary` / `.cs-cover-details` (85%/80% white on the teal
    and red heroes) measured 4.11/3.81 and 3.76/3.48 → now pure white
    (4.67-5.02 on every hero ground). Intended visual change: cover text
    is slightly brighter on colored heroes.
  - `.cs-related` 0.6 ink measured 4.06 on the mint ground → 0.72 ink
    (5.7). Slightly darker quiet text on all case studies.
  - global link red #d73735 measured 4.33 on the teal page's mint ground
    → `cs-teal`-scoped link red #cd3231 (4.75). Other pages keep the
    global red (it passes on white).
  - `figcaption` #6e6e73 measured 4.46 on the light-blue venn ground →
    showcase captions darkened to #5f6264 (5.4).
- [moderate] region (content outside landmarks):
  - the site footer was `<article class="foot">` → now `<footer class="foot">`
  - its inner copyright `<footer>` created duplicate contentinfo → now
    `div.foot-copyright`, with the old bare `footer` element styles
    (32px bar, 10px font) re-scoped to that class
  - the buttonslider prev/next pagination rendered as a bare div AFTER
    `</main>` (the nunjucks macro output flushes after the layout closes -
    pre-existing quirk) → now `<nav class="btn-container"
aria-label="Previous / next">`, a proper landmark wherever it lands.
    Side fix required: the bare `nav { position: fixed; height: 48px }`
    site-nav styles (nav.scss + the per-page `body.*-page nav` rules)
    would have turned the pagination nav into a second fixed red bar -
    all scoped to `nav.site-nav` now.
  - `#__bs_notify__` is BrowserSync's dev-only injected notifier, not part
    of the site; the audit strips it before running.
- [moderate] landmark-unique: two unlabeled navs → site nav is
  `nav.site-nav[aria-label=Main]`, pagination `aria-label="Previous / next"`.

Keyboard verification: tab through every page - all tab stops show a
visible outline, none hidden (script in session scratchpad). The AI-mark
chip passes axe contrast on both grounds (dark: #EE6E73 on 16% tint;
light pages: #B3393B variant).

Acceptance criteria:

- [x] axe-core run on all content pages, results saved as evidence
- [x] Zero critical or serious violations on every page (zero violations at all)
- [x] Contrast verified for body text, links and the AI-mark chip
- [x] Keyboard: all interactive elements reachable and focus-visible
- [x] Report stored with the spec (evidence/ JSON) and referenced in the
      visuaibear-review output

## Ticket 15 — Prettier + lint wired into npm

Formatting and linting runnable from npm, not just inside gulp.

Status: DONE 2026-10-29 (commits `0bcd069` + `e53d6cf`)

Scope deviations from the original write-up:

- No `.njk`/html targets: prettier cannot parse Nunjucks tags safely, so
  the shells are excluded by design (recorded in `.prettierignore`)
- `src/_data/pages/` excluded until Pedro's copy rewrite lands, then
  re-include and reformat
- Prettier runs under Node 10 via `scripts/prettier.sh` (same nvm-exec
  pattern as `scripts/gulp.sh`)

Acceptance criteria:

- [x] `npm run format` formats js/scss/md targets (prettier 2.8.8, Node 10)
- [x] `npm run format:check` exits non-zero on unformatted files (verified passing)
- [x] `npm run lint` still passes (verified, exit 0)
- [x] `.prettierrc` committed; formatting committed separately from tooling
      commits so diffs stay reviewable
- [x] AUTHORING.md documents the three commands

## Ticket 16 — Resume: role bullet lists stick out of the text column (VERIFIED 2026-10-29)

Status: DONE 2026-10-29

Pedro reports text on `/resume/` sticking out and not as indented as the
rest. Verified with measured text-left edges (Playwright, text-node rects,
not boxes):

Finding:

- Every text block on the resume sits at text-left **316.4px** (1440
  viewport; 46.4px at 768) - name, intro, section h2s, role rows, the
  sub-title h4s, education/language lists, interests.
- The bullet lists under **Key Responsibilities** and **Key Achievements**
  sit at **302px** (32px at 768) - exactly **14.4px further left**
  (0.75rem at the page's 19.2px rem). Ten lists in total (5 roles × 2).

Root cause (in `mdResume`, `markdown-render.js`):

- A `**Sub-title**` paragraph emits a closed row:
  `<div class="row"><div class="col m12"><h4 class="sub-title">…</h4></div></div>`
- The bullet list that follows is then emitted as a **bare `<ul>` directly
  in the section** - outside any col, so it misses the col's 0.75rem left
  padding that every other block sits inside.
- The Education/Languages lists don't stick out because the quiet-section
  pattern keeps its col open (`openCol`) and renders the list inside it.
- Pre-existing: confirmed not introduced by the Ticket 13 semantic fixes
  (before/after captures were pixel-identical).

Proposed fix: keep the sub-title's col open until the following list has
rendered inside it (same pattern as quiet sections), or wrap the bare
`<ul>` in a col m12. Pixel risk is limited to the 10 role lists moving
14.4px right - which is the point of the fix; everything else must stay
put (before/after full-page diff, only those lists may shift).

Acceptance criteria:

- [x] All role bullet lists align at the same text-left edge as the
      sub-title headings above them (moved 14.4px right; measured 316.4px
      at 1440, 46.4px at 768 - same as every other block)
- [x] No other block on the page moves (full-page pixel diff: only the
      role lists change; some list lines now wrap that didn't before -
      expected consequence of the narrower column)
- [x] Verified at 1440 and 768 viewports
