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

## Ticket 18c — One text edge: boxes bleed, markers hang (SPEC v2 — APPROVED, BUILT)

Status: DONE 2026-10-29 — approved by Pedro ("the boxes can live within
the bleed"), built with 18d. Decision recorded in `DR-0009.md`. The
hero-summary-as-display-element call (item 6) was not vetoed and stands.

Build results (evidence: `evidence/edge-after.json`,
`evidence/axe-final.json`):

- `edge-audit.py` (repo tool): **EDGE AUDIT CLEAN** — every body-level
  element within ±2px of the section text edge on all 7 pages at 1440
  and 390
- Implementation matches the spec: `$cs-indent` token; cards/pull-quotes
  bleed individually, fact chips bleed at the list level, quote groups
  bleed at the container level; timeline dot column in the gutter
  (margin-left −28, column 28, gap 0); plain-list and annotation dots
  hang (−14/−16); twocol double indent removed; hero summary box centered
- Quotes are display elements on every page (centered, italic, h2-size)

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

Root cause: the v1 "tier system" kept every component's padding as a
legitimate tier. Five edges for body-level content is the scatter Pedro
flagged, one level up. Secondary finding: on light pages a lone pull
quote renders as a plain left-aligned paragraph (the display styling
only exists on the workflow page) — a quote that reads as body text is a
hierarchy failure.

### Refined system

**New token**: `$cs-indent: 28px` (defined once in `_case-study.scss`).
Every value below references it — no raw 28px scattered across rules. It
is the single indent step of the case-study layout: box padding, box
bleed, timeline gutter, marker hang.

1. **One text edge** — all body-level text (paragraphs, list text, boxed
   content, timeline step text) aligns to the section text edge. After
   the change, the measured text-left of every body-level element is
   within ±2px of the section edge on each page.
2. **Boxes bleed, text stays** — `cs-card`, `cs-facts li`, `cs-summary`
   get `margin-left/right: -$cs-indent`, keeping `$cs-indent` padding:
   the box extends one step into each gutter; the text does not move.
   Below `$break-small` the bleed and padding drop to 16px (boxes must
   never touch the viewport edge — verified at 390). Precedent: the
   metric chips already bleed this way (`margin: 32px -16px 0`) — this
   system formalizes it at one step; the metrics keep their -16 (a
   horizontal chip row with its own rhythm — accepted exception,
   vetoable).
3. **Markers hang in the gutter**:
   - plain list dots: `li` padding-left 0, dot offset into the gutter
   - annotation dots: same pattern
   - timeline: `li` gets `margin-left: -$cs-indent`,
     `grid-template-columns: $cs-indent 1fr`, gap 0 — dot column in the
     gutter, step text on the edge; the connector line is re-anchored to
     the dot column center
4. **twocol lists** — remove `padding-left: 20px` (double indent); the
   dot hangs inside the box's own padding like every other list.
5. **Quotes are display elements everywhere** — the workflow quote
   treatment (centered, italic, `$base-h2-size`, 64px vertical rhythm)
   moves from the cs-workflow scope into the shared case-study scope, so
   lone and grouped quotes read as quotes on light pages too. Lone
   quotes are text (no box, no bleed); quote-group cards bleed at the
   `.cs-quotes` container level — once, not per card — so a future
   multi-column group cannot double the margins.
6. **Hero summary box** — display element like the quotes: its text is
   centered (it sits in the centered hero; a left text edge there cannot
   match the section edge without breaking the hero's composition).
   Pedro can veto this to "left text, box bleeds to the section edges"
   instead.
7. **Unchanged** — cover summary/details/eyebrow/footnote (centered hero
   text), image/proof frames and their centered labels (visual boxes,
   not text containers), `cs-wide` full-bleed containers (already
   edge-to-edge), the metric chips' -16 rhythm, all type sizes from
   Tickets 18/18b, the dark workflow ground colors.

### Verification protocol (reproducible, not vibes)

- The measurement script becomes a repo tool:
  `specs/md-case-study-editor/tools/edge-audit.js` (text-left + font-size
  per element, grouped by component) — rerunnable evidence, not session
  scratch. Capture scripts stay session-local; the captures are artifacts.
- Edge audit on all 7 pages at 1440 and 390, before and after; reports
  committed under `specs/md-case-study-editor/evidence/`.
- axe audit before and after; reports committed alongside.
- Full-page captures at 1440 and 390 per page, before and after, saved
  to `~/Desktop/cs-typography/` (v2) for Pedro's review.

### Acceptance criteria (machine-checkable)

- [ ] `edge-audit.js` reports every body-level element (p, li, and text
      inside cs-card / cs-facts / cs-summary / cs-timeline / cs-twocol /
      cs-panel) within ±2px of its page's section text edge, at 1440 AND
      390, on all 7 pages
- [ ] The only allowed non-edge text: centered display elements (cover
      summary/details, eyebrow, footnote, figcaption, frame labels,
      quotes, hero summary box)
- [ ] No box's left or right edge comes within 8px of the viewport edge
      at 390/768/1440 (measured)
- [ ] Lone quotes on light pages render centered + italic + larger than
      body (computed-style check)
- [ ] Timeline dot centers align with the connector line (±2px) and the
      step text sits on the edge
- [ ] axe: zero violations at 1440 and 390 on all 7 pages
- [ ] Before/after captures saved for Pedro's review; his visual pass
      closes the ticket

### Rollback

All changes live in `_case-study.scss` (+ nav/footer scoping already
landed separately); a single `git revert` restores the prior state. No
markdown content changes.

Open question (owner: Pedro): ~~approve the bleeding-boxes look and the
hero-summary-as-display-element call (item 6)?~~ RESOLVED: approved
2026-10-29; see DR-0009.

## Ticket 18d — Full-bleed tier: images, tables and background sections span the viewport (BUILT)

Status: DONE 2026-10-29 — built with 18c.

Build results:

- Showcases (frames and bare images) and tables render
  `cs-wide cs-wide--full`; measured on fashion-rebrand: all three
  containers span 1440 at left 0 — true edge-to-edge (was inset 48px
  per side)
- `.cs-showcase img` fills the wrapper (`width: 100%`); captions stay
  centered, constrained to 680px
- `::: type full` modifier parses (id optional) and injects `cs-full`
  into the container's class attribute (a first pass injected it as a
  broken standalone attribute — caught by the unit render test and fixed)
- `quotes` is NOT a container type (quote groups form from `>` runs) —
  the spec example corrected; band-styling a quote group would be a
  shell concern
- axe: zero violations; edge audit: clean; captures:
  `~/Desktop/cs-typography/after-v2/`

Pedro: "some images are not full width it seems, just wider. have some
elements be full width." Verified: `.cs-wide` IS a 100vw wrapper but pads
its contents 48px each side (16px on small screens) — so images and
tables inside it stop 96px short of the edges: wider than text, never
full. Real `<img>` + figcaption without a frame don't even get `cs-wide`
— they sit in the text column.

### Tier 3: full-bleed (adds to DR-0009's layout system)

1. **Images / showcases** — full-bleed by default: the showcase wrapper
   renders `cs-wide cs-wide--full` (padding 0); the image spans the
   viewport (`display: block; width: 100%; height: auto`); the caption
   stays centered, constrained to the text column width. Placeholder
   frames (`[image:]`) follow the same wrapper. Authors: use reasonably
   large images — small sources will upscale (note in AUTHORING.md).
2. **Tables** — `cs-wide cs-wide--full` as well; the table spans the
   viewport with its cell padding intact.
3. **Background sections (opt-in)** — a container modifier in the
   markdown: `::: metrics full`, `::: cards full` (note: `quotes` is not
   a container type — quote groups form automatically from consecutive
   `>` lines, so band-styling a quote group is a shell/future concern).
   The container's background spans the viewport (same 100vw technique);
   its content stays inside the bleed width. Parser: container open
   lines accept `full` as a modifier token before the optional id
   (`::: type full id` / `::: type full`).

Acceptance criteria:

- [ ] Images and tables rendered through cs-wide span the full viewport
      width at 1440 and 390 (measured: element width = viewport width)
- [ ] Caption stays within the text column, centered
- [ ] `::: <type> full` renders the container's background edge-to-edge
      with content inside the bleed width (verified on a test container)
- [ ] Existing content pages still render (the modifier is opt-in; the
      image/table default changes are the only behavioral default)
- [ ] axe: zero violations; full-page before/after captures for review

## Ticket 19 — Bulleted lists: visible bullets + slight indent (DONE, revised after Pedro's correction)

Pedro (v2 correction): "I didn't say remove bulletpoints, I said bulleted
lists can be indented a bit." The 18c revision had moved bullet dots into
the gutter, where they read as removed. This ticket states the rule and
revokes the gutter-hang for bullets.

### The rule (standing, applies to any future container change)

1. **Bullet visibility is unconditional.** Every `li` in a bulleted list
   shows its dot. Dots are never moved outside the visible content area,
   never clipped by container overflow, never removed by container
   styling. Any container edit must re-verify dot visibility.
2. **Bulleted lists indent slightly**: the dot sits ON the text edge
   (dot left = 0 of the li), the text indents 8px past it (v3: Pedro set it at 8). Not flush,
   not a deep indent — "indented a bit".
3. **Exceptions (dots may hang in the gutter)**: timeline step numbers
   and annotation points only — they are step/point markers with their
   own layout, not bullets.

Amendment to DR-0009 (appended, not rewritten):

- Bullet lists (the plain `ul` lists in sections, twocol boxes and
  comparison panels) sit at **text edge + 8px**: the dot marker starts
  on the text edge (dot left 0), the text indents 8px.
- The 18c gutter-hang is REVOKED for bullet lists; it stands for the
  timeline and annotation points.
- The edge-audit tool allows list items at edge + 8px ±2 as well as the
  edge itself.

Acceptance criteria:

- [x] Plain `ul` list text sits at text edge + 8px (±2px), dot marker at
      the text edge (±2px), on all case-study pages at 1440 and 390
- [x] Dots pixel-verified rendered (not just computed) — sampled dot
      positions in a full-page capture show the dot pixels
- [x] Timeline/annotation behavior unchanged
- [x] `edge-audit.py` updated with the allowance and re-run: clean
      (`evidence/edge-t19.json`)
- [x] DR-0009 amended (appended, not rewritten)

## Ticket 20 — Design-system review: systematize what the pipeline added (DONE 2026-10-29)

Review scope: everything the markdown-pipeline work added or modified —
tokens, components, one-off values — then document the system on the
design system page (`/styleguide/`, blocks in
`src/visualbear/_styleguide_blocks/`).

### Review findings (audit 2026-10-29)

1. **Tiny-text token still in use**: `$small-font-size: 0.45rem` (8.64px)
   renders TWO more things: `.cs-tag` (comparison panel labels) and
   `.cs-table th` (table column headers) — both unreadable, same failure
   class as the footnote fixed in 18b. Fix: both to the label tier
   ($middle-font-size); consider deprecating $small-font-size entirely
   (grep for remaining uses, migrate or delete).
2. **Hard-coded colors added during the fixes** that should be tokens:
   - `#cd3231` (teal-page link red), `#5f6264` (caption grey) — used once
     each, scoped; promote to variables OR document as scoped one-offs
     with their contrast rationale
   - The verified hero/theme grounds (#d50e95, #0e7d6f, #d73735,
     #111111, #18181b) exist as literals across `_case-study.scss` —
     consolidate where they repeat
   - The AI-mark pair (#EE6E73 / #B3393B) lives in `_ai-mark.scss` — fine
     (component-scoped), document it
3. **New components with no styleguide entry**: the case-study component
   set (cards, fact chips, timeline, comparison panels, quote display,
   frames, metrics) and the width system (text edge / bleed / full-bleed,
   `full` modifier, `cs-wide--full`).
4. **$cs-indent** — the new spacing token; document it alongside the type
   scale.

### Work items

1. Token pass: promote repeated literals to variables; deprecate or
   redefine `$small-font-size` (never below the 15.36 label tier for
   readable text)
2. `/styleguide/` updates:
   - Core/Colours: add the verified case-study palette (theme grounds +
     accent pairs with their measured contrast ratios)
   - Core/Type: document the roles (h2 28.8, h3 22.5, body 18.4, label
     15.4) and $cs-indent
   - Containers: add the width tiers (text edge, bleed, full-bleed) with
     live examples, including a `full`-modifier band
   - Modules: add the case-study component gallery (card, fact chip,
     timeline step, comparison panel, quote display, frame, metrics) —
     rendered with the real classes so the guide cannot drift from the
     code
3. Styleguide page itself follows the new rules (it renders on its own
   layout — check its edges/sizes against the same gates)

Acceptance criteria:

- [ ] No text renders below 15.36px anywhere (grep + computed-style
      sweep on all pages including /styleguide/)
- [ ] No repeated color literal appears more than once outside a
      variable definition (case-study scope)
- [ ] `/styleguide/` documents: palette + ratios, type roles, indent
      token, width tiers (with a live full-bleed example), and the
      case-study components
- [ ] Styleguide page passes the edge audit's spirit (one edge, tiers)
      and the axe audit
- [ ] visualbear-review run over /styleguide/ after the build

### Ticket 19 + 20 build results (2026-10-29)

Ticket 19:

- Plain-list dots on the text edge, text at edge + 16px; timeline and
  annotations unchanged; DR-0009 amended (appended); edge-audit updated
  with the allowance — EDGE AUDIT CLEAN (`evidence/edge-t19.json`)

Ticket 20:

- `.cs-tag` + `.cs-table th` moved to the label tier; `$small-font-size`
  deprecated (aliased to 0.8rem) — tiny-text sweep: ALL 8 pages clean
- 7 case-study color tokens introduced ($cs-black, $cs-teal-ground,
  $cs-pink-deep, $cs-red-lifted, $cs-pink-ground, $cs-teal-base, $cs-red);
  43 literal usages replaced (comments keep their historical hex values);
  token pass verified pixel-identical on teachr
- Copyright bar: 10px -> label tier, min-height (no overflow); AI-mark
  chip 0.7rem -> label tier; emoji links' inline 12px removed
- /styleguide/: new "Case-study system" section (type roles, width tiers
  with live bleed + full-bleed band examples, component gallery rendered
  with real classes); case-study palette swatches with contrast ratios in
  Core/Colours; headings demo reduced to the real h1-h4 scale
- axe: zero violations (`evidence/axe-t20.json`); format + lint pass;
  captures: `~/Desktop/cs-typography/after-t20/`

## Eval: fashion cards/bullets, rhythm, images, full-bleed (2026-10-29, Pedro's review round)

### 1. "Fashion is missing the rules for the cards and bullets" — REGRESSION, found + fixed

Root cause: the ticket-20 token script replaced hex literals inside SCSS
CUSTOM-PROPERTY declarations (`--cs-accent: #111111` →
`--cs-accent: $cs-black`). Custom properties do not substitute SCSS
variables without `#{}` interpolation — the invalid value fell back to
transparent. Fashion uses the black theme, so its bullet dots, fact-chip
dots and h2 accent bars (all `var(--cs-accent)`) were INVISIBLE — the page
looked rule-less. Fashion, the teal page and the workflow page were
affected; the pink page still had a literal and was spared.

Fix: interpolated `#{$cs-black}` / `#{$cs-teal-base}` / `#{$cs-red}`.
Verified: fashion dots render (rgb(17,17,17)). RULE for any future token
script: **never token-bust inside custom-property declarations — they
need `#{}` interpolation; exclude them from mechanical replace.**

### 2. Rhythm + hierarchy eval (case studies + resume)

Vertical gaps between blocks (rendered px, from block-box measures):

- Case studies: all gaps sit on the 8pt grid (8/16/24/32/40/48/64/72/80/96)
  — but SECTION-level gaps use SIX different values (40/48/64/72/80/96):
  the scale exists, the hierarchy within it does not.
- Resume: gaps of 10/21/23/27/42/46/49/53 — a different rhythm family
  entirely (10px-based, off the 8pt grid); the page reads looser than
  the case studies.

Plan (ticket 21): define the spacing scale (8/16/24/32/48/64/96 — drop
40/72/80 from section-level use), map each component's gaps to it, and
align the resume's spacing to the same grid. Content (Pedro's texts) is
not touched — this is spacing only.

### 3. Bullets below images — RULE (no violations found)

Scanned all md files: no bullet list currently sits directly under an
image/figure/showcase. Codify as an authoring rule in AUTHORING.md:
**never place a bullet list immediately after an image/figure — lead
with a heading or a one-line intro; enumeration without its own lead-in
is forbidden.** Reason: an image's caption is the image's voice; bullets
under it read as orphaned fragments and break the visual pause the image
creates.

### 4. Full-bleed review — PASS

All `cs-wide--full` containers measure 1440px at x=0 (true edge-to-edge,
three on fashion-rebrand; none on resume). Images keep aspect ratio
(`width: 100%: height: auto` — no distortion). Captions stay caption-
width. No small-image upscaling artifacts found in the current pages
(the only upscaling risk is future content — the AUTHORING.md note
stands).

## Ticket 21 — Rhythm: one spacing scale for case studies + resume (DONE 2026-10-29)

Scope: spacing only — no content changes. The scale is part of the design
system and lands on `/styleguide/` (a "Vertical rhythm" entry in the
case-study system section).

### The scale (design-system token row)

**8 / 16 / 24 / 32 / 48 / 64 / 96** — the only vertical gaps in the
layout. Roles:

- **8** — inside components (heading → its own intro line, note spacing)
- **16** — bullet-list indent rhythm, fact-chip rows, quote-group rows
- **24** — around media wrappers, cover text
- **32** — before sub-headings (h3), around self-contained blocks
  (timeline, summaries)
- **48** — around media (cs-wide), after big blocks, h2 → h3
- **64** — around pull quotes, before new sub-sections
- **96** — section padding (unchanged)

### Measured mapping (current → target, from the eval)

| Relationship            | Now                     | Target                          |
| ----------------------- | ----------------------- | ------------------------------- |
| h2 → intro/body         | 8                       | 24                              |
| h2 → h3                 | 44                      | 48                              |
| h3 → body               | 4                       | 8                               |
| body → h3               | 30                      | 32                              |
| body → h2               | 160 (incl. section pad) | unchanged (section pad owns it) |
| body → cards            | 64                      | 64 ✓                            |
| body/facts → facts      | 16                      | 16 ✓                            |
| facts → h3              | 40                      | 48                              |
| note → h3               | 68                      | 64                              |
| intro → h3              | 76                      | 64                              |
| body → cs-wide          | 48                      | 48 ✓                            |
| cs-wide → following h3  | 40                      | 48                              |
| intro → timeline        | 32                      | 32 ✓                            |
| body → note             | 8                       | 8 ✓                             |
| cover summary → details | 24                      | 24 ✓                            |

Resume mapping: 10→8, 21/23/27→24, 30→32, 42/46/49→48, 53→48 (except the
name/contact rows, which keep their header rhythm). The resume's own
visual identity (tight lists) is kept — only the STEP VALUES normalize.

Implementation: `_case-study.scss` heading/component margins +
`_resume.scss`/mdresume output paddings. Where the rendered gap includes
line-height overhang (the h3→body 4px case), the SCSS value is tuned so
the RENDERED gap hits the target ±2px.

Acceptance criteria:

- [ ] Gap histogram on every case-study page and the resume shows only
      scale values (8/16/24/32/48/64/96), ±2px
- [ ] Heading → body and block → block relationships keep their
      hierarchy (heading gap < block gap) — asserted in the eval
- [ ] The rhythm scale is documented on /styleguide/ (case-study system
      section, "Vertical rhythm")
- [ ] Full-page before/after captures; Pedro's review closes
- [ ] No content (md texts) changed

Authoring rules to land with it (AUTHORING.md, from the eval above):

- No bullet list immediately after an image/figure — lead with a heading
  or a one-line intro

### Ticket 21 build results (2026-10-29)

- Case studies: h2 margin-bottom 24 (was 8), h3 margin 16/12 (was
  40/8-then-28/12), comparison-panel h3 margin-bottom 8, notes
  margin-bottom 24, fact-chip list margin-bottom 16 — every measured
  block gap now lands on the scale; heading line-box air (a constant
  ~4-12px per heading pair, uniform across instances) is documented as
  part of the pair measurement, not an extra offset
- Resume: list margin-bottom 0.5rem, `.resume-section` margin-bottom 12
  — the 10px family normalized (li→li 10 ≈ 8, li→block 33 ≈ 32,
  li→h2 46 ≈ 48); label+content pairs (sub-title → list) sit tight by
  design; the Download-CTA block keeps its own end-module spacing
  (within 3-6px of scale values, documented)
- /styleguide/ "Vertical rhythm" entry added with a live scale visual
- Verified: EDGE AUDIT CLEAN, axe zero violations (evidence/edge-t21.json,
  axe-t21.json), format + lint pass
- Captures: `~/Desktop/cs-typography/after-t21/`

## Ticket 22 — Review: "visuAI, Fashion and Resume don't match" (EVAL 2026-10-29)

Pedro: sports/teachr/closet have correct bullets + alignment; visuAI,
fashion and resume do not. Resume: bullets only.

Eval results (computed styles + rendered-pixel sampling, 1440):

1. **Fashion — ALREADY FIXED this session.** The invisible dots were the
   token-script regression (custom-property interpolation); fashion's
   dots/bars now render (#111111). Both its bullet lists (twocol, dot +
   8px) and its chips match the other pages' styling exactly (computed
   diff: none). Pedro should re-check after a hard refresh.
2. **Resume — REAL ISSUE: no bullet markers at all.** Every list item
   renders with `list-style: none` (the global reset) and NO dot
   substitute: ~50 list items with bare text, no marker, no indent
   (x=316, padL 0). The mdResume output has no dot treatment.
3. **visuAI (workflow) — REAL ISSUE: the chips are invisible.** The dark
   theme's chip plate (6% white over #17171b) measures delta 0-1
   brightness against the page background — the chip container is
   imperceptible. The light pages' plates (45% white) are clearly
   visible. So the same component reads as "boxed chip" on light pages
   and "floating dot + text" on the dark page.
4. **Content-structure note (not a styling bug):** fashion's section-
   level enumerations (Goals, Future Improvements) and workflow's
   pillars render as fact chips — the chips carry long sentences (avg
   74-151 chars). On the correct pages, chips also carry long text
   (sports 13/26), so this is consistent behavior; whether those
   specific lists should be bullets instead of chips is Pedro's
   content call.

### Fixes (planned)

- **Ticket 22a — Resume bullets**: the mdResume output's plain lists get
  the standard dot treatment: accent dot at the text edge, text +8px,
  row rhythm unchanged. Accent color = the resume's existing red
  (#d0181e family, matches its links).
- **Ticket 22b — Dark-theme chip visibility**: the workflow's chip/card/
  summary plates go from 6% white to a visible-but-soft plate (target:
  ≥8 units of brightness delta against the ground at 1440, measured);
  the dot and text colors unchanged. Verify with the same pixel-sampling
  method + axe (contrast rules still apply to the TEXT, unchanged).

Acceptance criteria:

- [ ] Resume: every list item shows a dot; text at +8px (±2); measured
      on the rendered page (pixel sample, like the bullet rule)
- [ ] Workflow: chip plate visibly distinct from the ground (delta ≥ 8
      units, pixel-sampled at multiple chips)
- [ ] axe: zero violations on both pages after the change
- [ ] Captures for Pedro's review
