# Review: 2026-11-15 session work (lint/format fixes, resume CV refresh + red bullets, edge alignment DR-0002)

- Date: 2026-11-15
- Scope: all changes made this session - `tabs-core.js`/`tabs.js` (eslint),
  `resume.md` + `resume.title.nunjucks` (CV, verbatim per DR-0003),
  `_resume.scss` (red skill bullets, DR-0004), edge alignment (DR-0001
  superseded by DR-0002: `$content-width` 916 + 16px page margin on body
  content), styleguide width copy, spec dirs `specs/resume-cv/`,
  `specs/edge-alignment/`.
- Evidence: captures `evidence/r-*.png` (10 pages x 1440+390 + tab/lightbox
  states), `evidence/edge-probe.json` (fresh 44/44), gates below.

## Gates

| Gate                    | Result | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A11y                    | PASS   | contrast probed: resume h1/headline/location 13.86:1 on #ebf5ff, resume email link 4.97:1, nav links 4.68:1 on brand red, hero h1 15.28:1, photography h1 15.62:1, case eyebrow 18.88:1 (all >= 4.5). One visible h1 per page at both widths. Tabs keyboard-operable (ArrowRight roving verified); lightbox opens on click and closes on Esc, role=dialog. Red skill bullets are decorative `::before` (content: '') - no a11y impact. Touch targets unchanged (44px tabs/lightbox per prior tickets) |
| States                  | PASS   | captures: default pages, workflow visuai + designsystem (body class vb-system-light, visible h1 swaps), photography lightbox open + Esc-closed, all at 1440 + 390. 0 console/page errors on all 10 pages x 2 widths; 0 horizontal overflow everywhere                                                                                                                                                                                                                                                 |
| Tokens & system         | PASS   | one new token `$content-width: 916px`; all former 900px caps use it; gutters use the nav's 16px page margin; bleed capped at 8px <=915px; no new components; red bullets reuse the resume's existing `#d0181e` dot rule (compiled CSS verified scoped to `#resume_container ul.no-bullets ul.no-bullets`)                                                                                                                                                                                             |
| Copy                    | PASS   | verbatim-check.js 51/51 PASS on the built resume (every pasted CV string byte-for-byte, pasted order, no em dashes, no [ai]); styleguide shows 916/884 only; "webb" typo kept verbatim per DR-0003                                                                                                                                                                                                                                                                                                    |
| Consistency             | PASS   | edge contract DR-0002: fresh edge probe 44/44 page-width combos PASS (content at nav box +-16 within 0.5px), no-touch-bleed: 0 offenders, only image bleeds (photogrid, cs-wide--full) at 0..vw; nav box/logo/link positions unchanged                                                                                                                                                                                                                                                                |
| Regressions             | PASS   | fresh `npm run build` exit 0 + 5/5 release-guards OK; `npm test` 5/5; `npm run lint` 0 problems; `npm run format:check` clean. styleguide/workflow builds carry 0 `resume_container` (no CSS leak). Compiled CSS spot-checked: `.content` 916, `.text-box` padding 0 16px, `.hero .content` 32px 16px, bleed cap -8px <=915px                                                                                                                                                                         |
| AI-attribution          | PASS   | 0 `[ai]` in resume.md; build [ai] warning count unchanged (18 blocks, pre-existing Pedro queue); production HTML has 0 ai-mark on reviewed pages                                                                                                                                                                                                                                                                                                                                                      |
| Foundational heuristics | PASS   | H1: no destructive ops (edits only; no files deleted). H2: no new assets. H3: edge-target and scope asked via structured questions and recorded (DR-0001/DR-0002); strict copy rule recorded (DR-0003)                                                                                                                                                                                                                                                                                                |

## Failures

- None blocking. Observation (pre-existing, not from this session): after a
  mouse click on a tab, the strip relocates into the active panel's host
  (ticket 14) and the clicked button loses focus, so an immediate ArrowRight
  keypress lands on <body> and does nothing; the keyboard path works when a
  tab has focus (verified in t62). Recorded here, not changed - out of scope.

## Verdict

PASS.
