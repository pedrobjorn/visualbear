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

Automated a11y check on the built pages, feeding the visuaibear-review
A11y gate with evidence instead of manual claims.

Scope:

- Run axe-core against the built pages (Python Playwright is available;
  no Node playwright in this toolchain)
- Fix violations generator-side (templates, `_ai-mark.scss`, shells)

Acceptance criteria:

- [ ] axe-core run on all 8 content pages, results saved as evidence
- [ ] Zero critical or serious violations on every page
- [ ] Contrast verified for body text, links and the AI-mark chip
- [ ] Keyboard: all interactive elements reachable and focus-visible
- [ ] Report stored with the spec (or linked) and referenced in the
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
