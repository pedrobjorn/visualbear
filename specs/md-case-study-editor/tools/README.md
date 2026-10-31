# Audit tools

Both tools need the dev server (`npm run serve`, port 3000) and Playwright
(`pip3 install playwright && playwright install chromium`). Exit non-zero on
violations; `--json OUT` writes the full report (commit reports under
`../evidence/` for ticket evidence).

## edge-audit.py — text edges (tickets 18c/19, DR-0009)

Measures every body-level TEXT element's left edge and font size; flags
anything off the section text edge (±2px, or edge +8px for bullet text).
Run on every typography/spacing change:

    python3 specs/md-case-study-editor/tools/edge-audit.py [baseUrl] [--json OUT]

## box-audit.py — boxes, tables, overflow (tickets 30/31/32, DR-0009 amendments)

Measures the BOX system the text audit can't see:

- horizontal overflow (`scrollWidth != innerWidth`)
- boxes crossing the viewport or closer than 8px to its edge (the
  full-bleed tier — cs-wide/frames/tables — is exempt: it touches by design)
- bleeding-box edges on the bleed edge (text edge − 28px, ±2px), except the
  documented display elements (hero, panels, quotes, metrics, frames, annotations)
- chip/plain bullet dots ON the text edge (±1px) and bullet text at +8px
- annotation dots never outside their enclosing box
- resume: name/contact/download lists unmarked (rendered-pseudo check),
  content lists' dot on the edge, text +8, gap above every content list ≥ 8px

Run on EVERY box-touching change (bleed, cards, chips, tables, frames) —
this is the audit that catches the spills edge-audit is blind to:

    python3 specs/md-case-study-editor/tools/box-audit.py [baseUrl] [--json OUT]

Viewports: 1440 / 1024 / 768 / 780 / 390 (768 + 780 are the spill band
that motivated the tool).
