# Tickets — phase 3.5: QA checks (added 2026-10-29)

Adds machine-checkable quality gates for the markdown pipeline output:
semantic HTML, accessibility, and formatting/lint wired into npm.

Constraint: the toolchain runs on Node 10 (`.nvmrc`, `./scripts/gulp.sh`).
Any new dev dependency must support Node 10 (e.g. prettier@2.x, not 3.x).

---

## Ticket 13 — Semantic HTML audit + fixes

The generated HTML must be semantic: real elements instead of div-soup
where a semantic element fits.

Scope:
- Audit the built HTML of all content pages (`build/*/index.html`)
- Fix generator-side in `markdown-render.js` / shells, not by hand in `build/`

Acceptance criteria:
- [ ] One `h1` per page; heading levels never skip (h2 after h1, etc.)
- [ ] `main`, `nav`, `header`, `footer` landmarks present where appropriate
- [ ] Lists are `ul`/`ol`/`li`; timelines use `ol`; blockquotes are `blockquote`
- [ ] No `div` used where a semantic element fits (section content wrapped
      in `section` or `article` where it carries a heading)
- [ ] Verified on all 8 content pages, fixes noted per page

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

Scope:
- Add `prettier@2.x` (Node 10 compatible) as a dev dependency
- Format targets: `src/**/*.{html,njk,scss,css}`, `*.md`, `markdown-render.js`,
  `gulp/*.js` — config in `.prettierrc` (no org-wide defaults smuggled in)
- ESLint already runs via `npm run lint` (gulp-eslint); keep it working

Acceptance criteria:
- [ ] `npm run format` formats the targets above (prettier 2.x, Node 10)
- [ ] `npm run format:check` exits non-zero on unformatted files
- [ ] `npm run lint` still passes (eslint via gulp)
- [ ] `.prettierrc` committed; formatting changes committed separately from
      logic changes so diffs stay reviewable
- [ ] README or AUTHORING.md mentions the two commands
