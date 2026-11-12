# Ticket 1 evidence: robot on the mirror + the decorative index robot

- Date: 2026-11-12
- Ran: `npm test` (scripts/test/mirror-link.test.js) - PASS, 18 asserts
  (class, emoji codepoints, z-index: 3, aria-label/title, depth hrefs,
  idempotency marker, strip behaviour + idempotence)
- Ran: `npx eslint` on scripts/mirror-link.js, scripts/release-mirror.js,
  scripts/test/mirror-link.test.js - 0 errors; the 7 remaining warnings
  in release-mirror.js are pre-existing (unused warn/injected/already,
  pre-existing brace-style), none in the touched code
- Ran: full release pipeline (build + release-mirror) - the touched
  paths verified on the BUILT output:
  - build/selected-works/{index,workflow,teachr}/index.html: exactly
    one `a.robot`, zero `a.bear`, `z-index: 3`, aria-label present; the
    mirror home's decorative public robot is stripped (0 spans) - no
    double robot
  - build/index.html: exactly one decorative `span.floating-robot`, no
    link, no bear
  - build/styles/main.css carries .floating-robot (z-index: 3)
  - public secrets pruned (build/{workflow,teachr} absent)
- Visual: Playwright (headless chromium), 1440 + 390, each page scrolled
  to the footer; elementFromPoint at the robot's centre confirms the
  robot is topmost at its spot on every state - no z-index: 1 plate
  covers it. Screenshots: t1-{index,mirror-teachr,mirror-workflow}-{1440,390}.png
- Note: the release run above was killed by a tooling timeout mid-pipeline
  (files at 12:56 are valid build output but the run did not finish
  cleanly) - re-run `npm run build` before any deploy; do not deploy
  this partial build.
