# Ticket 16 verify - end-to-end verification of the play sub-pages (2026-11-14)

House gates, all on the release build at HEAD:

- `npm run build` -> exit 0, 5/5 release-guard checks OK (walled garden, in-copy anchors, closet card, air-lock, secret pages)
- `npm test` -> 5/5 suites: mirror-link PASS, tabs PASS, play-data OK, gallery-order OK, lightbox OK
- `npm run lint` -> exit 0, 0 errors, 9 warnings (all pre-existing in tabs-core.js/tabs.js)
- `npm run format:check` -> exits 1 on warnings only: 12 files, all pre-existing (11 in specs/visualbear-system/ + specs/play-subpages/evidence/t2c-verify.md from ticket 2); zero new warnings from this spec's files

visuaibear-prototype capture loop (Playwright/Chromium against the release build): 20 screenshots in this dir - the 5 feature pages + regression pages (/steam-mobile/, /workflow/) + / at 1440 and 390, play-card hover, photography grid hover, lightbox open at 1440 + 390, photography empty state at 1440 + 390. Zero console/page errors and zero failed requests on all five feature pages after the nav fix. Full review report with the gate table: `t16-review.md` (verdict: PASS with notes).

Authoring flows, each confirmed once:

1. New post (T7 flow): copied the shell to `src/play/blog/verify-post/`, added `blog-verify-post.md` + `project_blog_verify_post.json`, prepended one entry to `blog.json`, re-ran the nunjucks task -> `/play/blog/verify-post/` rendered (h1 "Verify Post") and "Verify Post" became the top card on `/play/blog/`. Then removed (temp dir/md/json + blog.json restored to 3 entries) - it was a flow check, not real content.
2. New photo (T8 flow): dropped `zz-verify-photo.jpg` into `src/_images/play/photography/`, re-ran nunjucks -> it became `data-lb-index="0"` (top-left card, title "zz verify photo"). Then removed; final state is the committed `.gitkeep` only (empty grid verified: 0 cards, `[]`, no errors).

Regression spot-checks: t16-index-_, t16-regr-steam-mobile-_, t16-regr-workflow-\* at 1440 + 390 all render with correct h1s and zero errors; plus the byte-level worktree diffs filed under t10/t11 evidence (all pre-existing pages identical across T3-T11).

Found + fixed during this pass: the nav logo's hardcoded `../../images/icons/logo_default.svg` 404'd on the new depth-3 post page (first depth-3 page on the site); changed to root-absolute `/images/...` (commit 5c76a44) - same resolved URL on all existing public pages, and root-absolute is the mirror's zone-served asset convention. Re-captured: no failed requests anywhere.

Open items carried forward (all Pedro-owned, none blocking): seed photos + blog card img + post cover (H2 assets); hero/post copy rewrites incl. the [ai]-marked hello-world block (production strips the chip - verified 0 data-ai in built HTML); date format on blog cards.
