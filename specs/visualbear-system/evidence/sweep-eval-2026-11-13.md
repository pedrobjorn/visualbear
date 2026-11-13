# Evidence - whole-build sweep eval 2026-11-13c (accessibility + performance)

Method: Python Playwright (Chromium headless) over a static serve of the
post-7d99707 build. A machine scan (accessible names, heading structure,
duplicate ids, img alt, form labels, touch targets, computed-style
contrast) on 12 pages: public home/about/styleguide/resume/workflow/one
case + 404 at 390-mobiled, home + workflow at 1440, all three mirrored
pages (workflow in BOTH tab states). Every below-cutoff contrast finding
was re-verified PIXEL-BASED (screenshot luminance) before being called
real - the computed-style background walk cannot see body gradients or
photo plates. Performance pass: navigation timing + paint + longtask +
resource transferSize, mobile pages at 4x CPU throttle.

Raw complete JSON: evidence/eval_a11y.json, evidence/eval_perf.json.

## Findings (confirmed)

### A1. Case-study gallery images have no alt text (MAJOR)
/visualbear/ ships 9 `<img>` without alt (the work/fullsize/* gallery);
their wrapper links also end up with no accessible name. The visualbear
case renders its own copy of the gallery pipeline - the other case pages
need the same check when the ticket runs.

### A2. Broken icon assets in the styleguide modules demo (MAJOR)
`src/visualbear/_styleguide_blocks/styleguide.modules.nunjucks:44,47`
reference `icons/twitter_icon_64.jpg` and `icons/behance_icon_64.jpg` -
neither file exists in build/images/icons/ (grep; only github_icon_64.png
+ linkdin_icon_64.jpg ship). Two 404 console errors on every page that
renders the design system demo: the public /styleguide/ AND the
`/visualbear/` case study (its duplicate blocks). The alts are
alt="Smiley face" (Bootstrap placeholder).

### A3. /visualbear/ renders FIVE visible h1s (MAJOR)
The case's embedded styleguide copy (src/visualbear/_styleguide_blocks
duplication, the T3-era "case-study duplicates untouched" zone) ships its
own "Styleguide" h1 and the "h1 Heading" ladder demo on a PUBLIC case-
study page. Measured h1s: the hero "visualbear - Brand & Portfolio",
"Brand Identity", "Styleguide", "h1 Heading" + secondary text, plus the
pages own mid-page h1.

### A4. Duplicate id="contact" - the design panel's Footer demo (MEDIUM)
The styleguide modules demo renders a full LIVE footer copy
(`<footer class="foot"><section ... id="contact">`, the real mailto) as a
"use the Footer component" demo. /workflow/, /styleguide/ and
/visualbear/ each ship TWO foots / id=contact (home, about, resume: one).
Duplicate ids break in-page anchor + landmark resolution (browsers scroll
to the first; AT sees two). Demo = visual specimen, not a live footer.

### A5. The workflow eyebrow fails AA on its real ground (MEDIUM)
`/workflow/` cs-eyebrow renders #E34A47 at 15.36px; pixel scan of the
gradient/spotlight ground behind it: best-case ratio 3.64 (worst lower).
Ticket 2's fix shipped #EA544F (4.65:1) for the STRIP's active label -
the eyebrow kept the older ink. Same class of gap: cs-metric-label
measures 4.47 (0.03 under the 4.5 bar, 15.36px). The GLOBAL link red
#D73735 also measures ~4.12 on light grounds (about-page body links;
/styleguide/ + /resume/ already carry the darker #d0181e/#cd3231
instances - the 2026 light-ground pages do not).

### A6. /about/ has no headings at all (MEDIUM)
Zero h1-h6 on the page; no h1. The home's #about section shares the
markup (no heading inside .about-copy) - the page-level one is the
structural miss.

### A7. Interactive elements under the 44px target (MINOR)
Nav logo 40x40; .vb-tab buttons 37px tall (the T21 44/48px-tall-target
rule covered the main nav, never the strip); the footer bear glyph 19x21;
the .highlight chips 27px tall (in-copy text links - record, not fix).

### A8. False positives ruled out (do NOT "fix" these)
- Logo link "unnamed": named via its inner img alt "visualbear home".
- Home 3.27-contrast item: red color on an EMPTY link (the logo icon) -
  no text, n/a.
- Work-card titles: WHITE text (not red) over the dark thumbs (~9.5).
- Resume white li: sits over a dark photo plate (~15.3).
- Workflow "3 h1s": exactly ONE VISIBLE h1 per tab state (probed); the
  ladder demo h1 is only visible on the design tab - the T6 flag.

## Performance (390 + 4x CPU throttle unless noted)

- Page timings (ms, ttfb/FCP/LCP/complete): home 5/312/356/419 (1440:
  168/196); workflow 3/412/412/553; visualbear 2/372/372/619;
  mirror home 2/248/296/357; styleguide 2/504/504/622 (worst LCP).
- Long tasks: home 1x143ms; workflow 2x404ms; visualbear 2x346ms;
  styleguide 2x517ms; mirror home 1x113ms. DOM nodes 118-592; requests
  11-19; JS bundle 4KB. All healthy.
- P1. /workflow/ + /styleguide/ (+ mirror copies) eagerly load 324KB / 6
  images for the [hidden] design panel - incl. gallery_thumb_closet.jpg
  131KB - on every visit. Direct cost of T16's mechanical lazy-removal
  (the demo images had to render complete on first tab-open; eager
  NODE-load was the blunt instrument).
- P2. profile_photo.png: a photo shipped as PNG (119KB on home + about).

## Harness caveats (honesty row)

- python http.server adds no gzip/brotli: main.css = 117KB uncompressed
  here; on the real server, verify compression (~20-25KB expected).
- Keyboard/roving behavior not re-run (T2/T14 evidence stands); screen-
  reader output cannot be synthesized in this environment.
- Contrast scans cover computed text colors; text baked INTO photos
  (card tiles) was pixel-checked only where the scanner flagged it.
