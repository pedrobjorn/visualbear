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

## Ticket 17 — visuAI: gradient band breaks at the very bottom (VERIFIED 2026-10-29)

Status: DONE 2026-10-29 (commit `a875cd5` + follow-up)

Finding (measured on `/workflow/` at 1440):

- The body fade ends at `#101013` (measured `rgb(16,16,19)` just above the
  page end), but the last ~43px strip paints flat `#252528` — the emoji /
  copyright strip sits visibly on a flat grey plate instead of the fade.
- Root cause: a shared `html, body { … background-color: #252528 … }` rule
  (`_base.scss`). Because `html` has a background color, the body's
  gradient does NOT propagate to the root canvas, so the area below the
  body's box (the document is ~43px taller than the body's painted box)
  shows the html's flat fill.
- Why only visuAI: every other page's body gradient ends at `#252528`, so
  the strip is the same color as the fade's end — invisible. The visuAI
  fade ends darker (`#101013`), so the band shows.

Proposed fix (root cause, small blast radius): remove `background-color`
from the shared `html, body` rule so the body gradient propagates to the
canvas and paints the full document — the fade then covers the strip and
the gradient's stops re-map to the full document height (<1% shift).
Verify with before/after full-page captures on ALL pages (the gradient
end-color shift affects every page's last pixels); if any page regresses,
fall back to painting the workflow gradient on `html` via
`html:has(body.workflow-page)`.

Acceptance criteria:

- [ ] No flat band at the bottom of `/workflow/`; the fade reaches the
      page end (pixel-verified: last 100px are a smooth continuation)
- [ ] All other pages keep their gradient (before/after captures; only
      sub-1% gradient re-mapping allowed)
- [ ] No horizontal seams at the body/document boundary on any page

## Ticket 18 — Case-study text hierarchy: reduce body-copy variance (EVAL 2026-10-29)

Pedro: text hierarchy is off on many case-study pages — indented AND
smaller text mixed in; reduce the variance of body copy, emphasize
headlines vs body, and align text edges so the page is scannable.

Eval (measured text-left edges + computed font sizes, all content
elements, 1440 viewport, 6 case-study pages):

Current state — body copy scatters across 3 sizes, 2 weights and 8 left
edges:

| Role                                               | Sizes seen                      | Left edges seen                        |
| -------------------------------------------------- | ------------------------------- | -------------------------------------- |
| h2 section heads                                   | 28.8px / 700 (consistent)       | 352                                    |
| h3                                                 | 19.2px AND 22.464px (two sizes) | 352, 380, 396                          |
| p body                                             | 18.432px AND 15.36px            | 352, 368, 376, 380, 396, 418, 436, 439 |
| li                                                 | 18.432px                        | 384, 396                               |
| labels (eyebrow, frame-label, figcaption, cs-note) | 15.36px                         | 352–680                                |

Sources of the variance: timeline step titles render at h4 size (19.2),
card/timeline/quote paragraphs render at `$middle-font-size` (15.36),
cards/timeline/frames indent their content by 28–44px, and quotes render
at h2 size centred. Labels at 15.36 are fine — body copy at 15.36 is not.

Target (3 roles + 1 label tier, 2 edges):

- **Headline**: h2 28.8/700 (unchanged)
- **Sub-head**: h3 22.464/700 everywhere — timeline step titles and card
  titles step up from 19.2
- **Body**: p AND li at 18.432/300 everywhere — card paragraphs, timeline
  descriptions and notes step up from 15.36
- **Labels** (eyebrow, frame-label, figcaption, cs-note, quote byline):
  stay 15.36 — they are labels, not body copy
- **Text edge**: one content edge at the section edge (352). Component
  boxes (cards, frames, quotes) may keep their containers, but their text
  must align to 352 or a single uniform indent step — no 4–8px scatter.
  Quotes stay centred by design (they are display elements, not body copy).

Constraints:

- Token-sourced sizes only ($base-*/$middle-\*) — no new one-off values
- Timeline text at 15.36 was chosen for muted step descriptions (the
  workflow ground) — the step-up must keep passing the axe contrast gates
  from Ticket 14 on both dark and light grounds
- Full-page pixel diffs per page; only typography-driven reflow allowed

Acceptance criteria:

- [ ] No body copy (p/li) below 18.432px on any case-study page; only
      label-tier elements render at 15.36
- [ ] All h3s render at 22.464/700
- [ ] Body text left edges: only 352 or one uniform indent value (no
      368/376/380/384/396/418/436/439 scatter); measured on all 6 pages
- [ ] axe re-run: zero violations (contrast holds at the new sizes)
- [ ] Full-page captures before/after per page, reviewed by Pedro

## Ticket 18c — One text edge: boxes bleed, markers hang (REVIEW + SPEC, awaiting Pedro's approval)

Pedro's verdict on the second pass: sizes are unified now, but fashion-
rebrand (and the other case studies) still read as indented + variant —
he is right. Measured at his viewport (Chrome, 1440 window = 1425 css px):

| Content                                                   | Left edge | Offset from the text edge |
| --------------------------------------------------------- | --------- | ------------------------- |
| Section body/h2/h3, comparison panels, notes, lone quotes | 345       | 0 — the edge              |
| Annotation points                                         | 361       | +16                       |
| Cards, fact chips (22 on fashion), timeline, twocol heads | 373       | +28                       |
| Summary box                                               | 381       | +36                       |
| twocol list items                                         | 389       | +44 (double indent)       |
| Cover/eyebrow/footnote/figcaptions                        | centered  | display elements          |

Root cause of the lingering variance: my "tier system" kept every
component's padding as a legitimate tier. Five edges for body-level
content is not a system — it is the scatter Pedro flagged, one level up.

Also found: on light pages a lone pull quote renders as a plain
left-aligned paragraph (the quote display styling only exists on the
workflow page) — a quote that looks like body text is a hierarchy failure.

### Proposed system (one edge, hanging markers, bleeding boxes)

1. **One text edge** — ALL body-level text (paragraphs, list text, boxed
   content, timeline steps) aligns to the section text edge (345/352).
2. **Boxes bleed, text stays** — cards, fact chips, the summary box and
   quote-group cards get `margin: 0 -28px` (symmetric bleed into the
   gutters) keeping their 28px padding: the colored box extends past the
   text column on both sides; the text does not move. Below the small
   breakpoint the bleed and padding shrink to 16px so boxes never touch
   the viewport edge.
3. **Markers hang in the gutter** — plain list dots, annotation dots and
   the timeline's numbered dots move into the left gutter (negative
   offset), their text on the edge. The timeline grid becomes
   `margin-left: -28px` + `grid-template-columns: 28px 1fr`, text at the
   edge; its connector line moves with the dot column.
4. **twocol lists** — drop the inner `padding-left: 20px` (double
   indent); markers hang inside the box's own padding.
5. **Quotes everywhere get the display treatment** — the workflow quote
   style (centered, italic, h2-size, generous margins) applies on the
   light pages too, so a quote never reads as a body paragraph.
6. Labels stay as-is: eyebrows/notes/annotations text 15.36, centered
   cover/figcaption/footnote stay centered display elements.

Acceptance criteria:

- [ ] One measured text edge for all body-level content on every
      case-study page (345/352 at 1425/1440; scaled equivalents at other
      viewports) — no +16/+28/+36/+44 scatter
- [ ] Boxes visually bleed but no box touches the viewport edge at
      390-1440
- [ ] Quotes are visually distinct from body text on every page
- [ ] axe: zero violations after the change
- [ ] Full-page before/after captures per page for Pedro's review
- [ ] Timeline dots/connector line still align with their steps

Open question (owner: Pedro): approve the bleeding-boxes look? The
alternative is flushing boxes to the text column (narrower boxes, text
still indented inside them) — but that keeps a second edge for boxed
content, which is what he asked to remove.
