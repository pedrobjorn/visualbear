# Evidence - ticket 30 (DR-0010): system page public at the root, robot links it

Verified 2026-11-13 on the fresh `npm run build` (guard OK, npm test PASS).

- release-mirror.js no longer prunes workflow: `build/workflow/index.html`
  exists in the PUBLIC root; grep: 0 hits for noindex / mirror-visuai mark
  in it (plain gulp output = the duplicate, no rewrite).
- Guard: check 2 now asserts teachr/teachr-agent absent from the public
  root AND `build/workflow/index.html` present; all other checks green.
- Public home `build/index.html`: exactly one `a.robot`,
  `data-vb-public-pill href="workflow/"`, name "The visualbear system",
  pill label "workflow & design system".
- Mirror home `build/selected-works/index.html`: public pill stripped
  (0 hits for data-vb-public-pill), exactly one `a.robot href="workflow/"`
  (the mirror's own).
- src/sitemap.xml carries https://www.visualbear.com/workflow/.
- Playwright click-through at 360 (mobile-emulated Chromium):
  public home pill -> http://.../workflow/ (200, .vb-tabs present, no
  noindex meta, no mirror mark; Design system tab switches: body class
  vb-system-light, visible h1 "Design system"); mirror home robot ->
  /selected-works/workflow/ with tabs working.
- mirror-link.test.js: strip targets data-vb-public-pill (href would
  collide with the mirror root robot post-DR-0010); idempotency + re-run
  safety assertions updated and green.
