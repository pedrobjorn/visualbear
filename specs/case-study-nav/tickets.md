Requirement source for every ticket in this file: Pedro's request 2026-11-23 (see plan.md Problem - the request IS the requirement). Anything not traceable to that request is marked ASSUMPTION. Tickets are ordered by dependency - build top-down.

---

# Ticket 1: `mdtoc` filter emits the section nav; inserted below the hero in the 4 case-study templates

- Part of: specs/case-study-nav/plan.md
- Depends on: -
- Size: M
- Type: system
- Status: TODO

## Context

`mdPage()` (markdown-render.js:844) turns every `## Title | Eyebrow | id` H2 into `<section class="cs-section" id="..."><p class="cs-eyebrow">..</p><h2>..</h2>` (splice at :975; id = `parts[2] || slugify(eyebrow || heading)`). The four page templates (src/fashion-rebrand/index.nunjucks, src/sports-ecommerce-redesign/index.nunjucks, src/digital-closet/index.nunjucks, src/teachr/index.nunjucks) render `{{ site.data.pages['<slug>'] | mdhero | safe }}` then `{{ ... | mdpage | safe }}` inside `article.case-study`. Filters are registered in gulp/nunjucks.js:105-108 (`mdpage`, `mdresume`, `mdmeta`, `mdhero`). Section counts in the drafts (2026-11-23): fashion-rebrand 6, sports-ecommerce-redesign 11, digital-closet 5, teachr 15.

## Requirements

- Refactor: extract mdPage's H2/`##`-pipe parsing into a shared `parseSections(src)` (or equivalent) used by both `mdPage` and the new `mdtoc`, so nav hrefs and section ids can never drift. No behavior change to `mdPage` output.
- New `mdtoc(src)` in markdown-render.js returns `<nav class="cs-index" aria-label="Case study sections"><ul><li><a href="#id">Title</a></li>...</ul></nav>` - one link per `##` section, in document order, link text = the primary title (first pipe field, tags stripped), href = `#` + the exact same id mdPage assigns.
- Register `env.addFilter('mdtoc', mdToc)` everywhere `mdpage` is registered (gulp/nunjucks.js:105).
- In each of the 4 page templates, insert `{{ site.data.pages['<slug>'] | mdtoc | safe }}` between the `mdhero` and `mdpage` calls (the slot directly below the hero block, in flow).
- Update AUTHORING.md doc-sync if it lists the page filters.

## Design references

- Hooks used: `mdpage`/`mdhero` filters. Principles applied: single source of truth (nav derived from the same `##` lines as the sections - no hand-copied titles).
- Style refs: nav markup pattern from `src/_modules/molecules/nav/nav.nunjucks` (semantic `<nav>` + `<ul>`).

## Acceptance criteria (agent-checkable)

- [ ] `npm test` green including a new `scripts/test/cs-nav.test.js` (wired into the `test` script in package.json) that runs `mdtoc` over each of the 4 drafts and asserts: link count = `## ` line count (6/11/5/15), each `href="#id"` matches a `cs-section` id produced by `mdPage` on the same draft, same order, link text = title field.
- [ ] Built HTML: in each of `build/fashion-rebrand/index.html`, `build/sports-ecommerce-redesign/index.html`, `build/digital-closet/index.html`, `build/teachr/index.html`, a `<nav class="cs-index">` appears after the hero (`</header>`/`</section>` of `.cs-hero`) and before the first `<section class="cs-section">`.
- [ ] `mdPage` output is byte-identical to before the refactor on all 4 drafts (test asserts equality of section ids).
- [ ] `npm run build` exit 0 + release-guard OK.
- [ ] Gates: prettier `format:check` clean.

## Out of scope

- Styling/sticky of `.cs-index` (Ticket 2), active state (Ticket 4), new-tab links (Ticket 5), the teachr-agent page (plan open question).

## Open questions

- `aria-label` string: "Case study sections" - ASSUMPTION, one-line change (Pedro).

---

# Ticket 2: Sticky `.cs-index` bar at top 48px with the header-matched background per theme

- Part of: specs/case-study-nav/plan.md (DR-0001)
- Depends on: Ticket 1
- Size: M
- Type: UI
- Status: TODO

## Context

`nav.site-nav` is `height: 48px; position: fixed; z-index: 2` (src/_modules/molecules/nav/nav.scss:3-6). Header backgrounds per page: default `$vb-primary` #d73735; `body.cs-pink-page` #d50e95, `body.cs-black-page` #111111, `body.cs-teal-page` #0e7d6f (_case-study.scss:1250/1319/1523). Existing sticky reference: `.photoview-switch` at `top: 48px`, z-index 1 (specs/play-subpages T17). All new styles scoped under `.case-study .cs-index` in src/_styles/templates/_case-study.scss.

## Requirements

- `.case-study .cs-index { position: sticky; top: 48px; z-index: 1; }` - flush under the fixed header, under it in stacking order.
- Background per DR-0001: introduce `--cs-head-bg` on `body` (= `$vb-primary`) in nav.scss and override it in the existing `body.cs-pink-page` / `body.cs-black-page` / `body.cs-teal-page` rules in _case-study.scss; both `nav.site-nav` and `.case-study .cs-index` use `background-color: var(--cs-head-bg)`. The existing per-page nav rules keep working (same values, now via the variable).
- Opaque bar: content scrolling under the stuck bar is hidden. Hairline bottom border in the theme accent (`--cs-accent`) for separation from the header.
- Link ink white (same as nav links on these grounds); hover/focus = underline + lifted accent (`$cs-red-lifted` #ee6e73 on dark grounds, matching nav feedback); active section link = underline (Ticket 4 adds aria-current).
- Bar layout: flex row, gap, `overflow-x: auto; white-space: nowrap` at <=480px (390 capture) so long title lists scroll horizontally instead of wrapping; desktop wraps or scrolls at Pedro's pick - ASSUMPTION: nowrap + horizontal scroll at all widths, consistent with the photoview switch bar.
- Padding: 8px vertical, aligned to the site container inset (same side padding as `.container`).

## Design references

- Hooks used: sticky pattern from `.photoview-switch` (play-subpages T17). Principles applied: tokenized color (one `--cs-head-bg` var, DR-0001), nav-link feedback recipe.
- Style refs: `nav.scss`, `_case-study.scss` theme blocks, `.photoview-switch` in gallery.scss.

## Acceptance criteria (agent-checkable)

- [ ] Playwright at 1440x900 and 390x844 on each of the 4 pages: after scrolling 800px, `getBoundingClientRect().top` of `.cs-index` === 48; `getComputedStyle(.cs-index).position` === "sticky".
- [ ] On each page, `getComputedStyle(.cs-index).backgroundColor` === `getComputedStyle(nav.site-nav).backgroundColor` (expected: #d73735 digital-closet, #d50e95 sports-ecommerce, #111111 fashion-rebrand, #0e7d6f teachr - rgb() equivalents).
- [ ] `z-index` of `.cs-index` (1) < `z-index` of `nav.site-nav` (2); an element scrolled under the bar is fully covered (bar background alpha = 1).
- [ ] At 390: no horizontal page scroll introduced by the bar itself; the bar's own `scrollWidth > clientWidth` is handled by `overflow-x: auto`.
- [ ] Captures: `evidence/cs-nav-{page}-{1440,390}-{top,stuck}.png`.
- [ ] Gates: `npm run build` exit 0, `npm test` green, visuaibear-review gates pass (contrast of white links on all four header colors, focus visible).

## Out of scope

- Nav content/links (Ticket 1), scroll-margin (Ticket 3), active state JS (Ticket 4), target=_blank (Ticket 5).

## Open questions

- Bar height value (drives Ticket 3's calc) - measured at build, then pinned as a CSS var `--cs-index-h` (Pedro).

---

# Ticket 3: `scroll-margin-top` on `.cs-section` so TOC jumps clear the stuck bar

- Part of: specs/case-study-nav/plan.md
- Depends on: Tickets 1, 2
- Size: S
- Type: UI
- Status: TODO

## Context

Global smooth scrolling with prefers-reduced-motion opt-out already exists (html `scroll-behavior: smooth`, asserted by scripts/test/anchors.test.js). The fixed nav occupies 48px; the stuck `.cs-index` bar adds its own height on top. Without scroll-margin, a TOC jump hides the section heading under the stuck bar.

## Requirements

- `.case-study .cs-section { scroll-margin-top: calc(48px + var(--cs-index-h, 40px)); }` - the bar height is pinned as `--cs-index-h` on `.cs-index` once measured (Ticket 2 open question), default 40px until then.
- No change to the global anchors audit contract; the generated `#id` hrefs from `mdtoc` are runtime-generated, so they are verified by Playwright, not by the src-walking anchors test.

## Acceptance criteria (agent-checkable)

- [ ] Playwright at 1440 and 390 on `/teachr/`: click each `.cs-index a` (or set `location.hash`), wait for scroll, assert the target section's `getBoundingClientRect().top` >= 48 + bar height - 1 (tolerance 1px).
- [ ] `getComputedStyle(section).scrollMarginTop` resolves to >= 48px + bar height.
- [ ] prefers-reduced-motion emulation: jump is instant (no smooth animation) - platform behavior, assert no error.
- [ ] `npm test` (incl. anchors.test.js) and `npm run build` green.

## Out of scope

- Any change to non-case-study pages' scroll-margin.

## Open questions

- None.

---

# Ticket 4: Active-section highlight (`aria-current="true"`) in the sticky nav

- Part of: specs/case-study-nav/plan.md
- Depends on: Tickets 1, 2
- Size: S
- Type: UI
- Status: TODO

## Context

A section nav that sticks should show where you are. The `.cs-index` links point at `.cs-section` ids. Implementation: a small scoped script (e.g. `src/_scripts/cs-index.js`, loaded only on case-study pages) using IntersectionObserver with `rootMargin: -48px 0px -<bar> 0px 0px` so "current" = section under the stuck bar.

## Requirements

- Exactly one `.cs-index a[aria-current="true"]` while a section is under the bar; none when above the first section (hero zone). aria-current value "true" on the link; CSS: underline + lifted accent (same recipe as Ticket 2 hover).
- No library; vanilla IntersectionObserver; disconnect when no `.cs-index` on page. Respects reduced motion implicitly (no animation, just a class).
- Script included only on the 4 case-study pages (page-level script block in the 4 templates or a body-class gate in the global script loader).

## Acceptance criteria (agent-checkable)

- [ ] Playwright at 1440 on `/teachr/`: scroll to `#library`, assert exactly one `aria-current="true"` and it is the `a[href="#library"]`; scroll back to top, assert zero.
- [ ] Keyboard: tabbing into `.cs-index` shows a visible focus ring on links (review gate).
- [ ] `npm test` + `npm run build` green; captures `evidence/cs-nav-teachr-1440-active.png`.

## Out of scope

- Scroll-spy on any other page type; progress indicators; collapsing the bar on scroll down.

## Open questions

- Descopable if Pedro prefers a static nav - mark in plan Status (Pedro).

---

# Ticket 5: Case-study links open in new tabs (opt-in, `#` anchors excluded)

- Part of: specs/case-study-nav/plan.md (DR-0002)
- Depends on: -
- Size: M
- Type: system
- Status: TODO

## Context

The renderer emits `<a href>` without target in: `::: callout` links (markdown-render.js:314), "lead | href | title" link lists (:1308), inline markdown links (marked parser). `mdpage`/`mdhero` are shared with `/workflow/` (gulp/nunjucks.js:105-108), so the behavior must be opt-in per template call, not a global default. Live case-study content links today: teachr `try-app` callout -> `../teachr-app/?view=library` (DR-0005.2 in specs/teachr-case-study).

## Requirements

- Renderer opt-in: `mdPage(src, opts)` / `mdHero(src, opts)` accept `{ links: 'blank' }`; when set, every emitted `<a href="...">` whose href does NOT start with `#` also gets `target="_blank" rel="noopener noreferrer"`. Apply inside the shared link-emitting helpers (callout, link list, inline links) so all link kinds are covered; the Ticket 1 `mdtoc` nav anchors are `#...` and stay same-tab by construction (mdtoc does not take the flag).
- The 4 case-study templates pass the flag: `{{ site.data.pages['<slug>'] | mdpage({ links: 'blank' }) | safe }}` and same for `mdhero` (nunjucks filter-arg syntax; if the registered filter signature is `mdPage(src)`, wrap as `mdPage(src, opts)`).
- `/workflow/` calls stay without the flag - byte-identical output (test asserts).
- `scripts/test/mirror-link.test.js` (or mirror-link.js) accepts/ignores `target` when checking hrefs; links still verified 200 under the mirror.

## Design references

- Hooks used: `mdpage`/`mdhero` filters. Principles applied: opt-in over global (DR-0002), security rel on _blank.
- Style refs: markdown-render.js link emission sites (:314, :1308, inline link rule).

## Acceptance criteria (agent-checkable)

- [ ] In each built case-study page: every `article.case-study a[href]` whose href does not start with `#` has `target="_blank"` and `rel` containing `noopener`; count > 0 on teachr (the `../teachr-app/?view=library` callout). Zero `#...` anchors inside `nav.cs-index` carry target.
- [ ] `build/workflow/index.html` (and other mdpage consumers) unchanged: no `target="_blank"` added (diff/test).
- [ ] New `scripts/test/cs-nav.test.js` asserts the above on renderer output for all 4 drafts + a workflow draft; wired into `npm test`.
- [ ] `npm run build` exit 0; mirror-link test green (teachr-app link 200 under the mirror with target attr).
- [ ] Playwright: clicking the teachr callout opens a new tab (page event `popup`) with the teachr-app URL; the case-study tab keeps its scroll position.

## Out of scope

- Global nav, home work cards, buttonslider prev/next (DR-0002); styleguide demo links.

## Open questions

- None blocking; scope reading recorded in DR-0002 (Pedro).

---

# Ticket 6: End-to-end verification

- Part of: specs/case-study-nav/plan.md
- Depends on: Tickets 1-5
- Size: S
- Type: research
- Status: TODO

## Context

House verification loop: unit/guard tests, production build with release-guard, Playwright measurements + captures at 1440x900 and 390x844, visuaibear-review gates.

## Requirements

- Run `npm test` (all suites incl. new `cs-nav.test.js`), `npm run build` (exit 0, release-guard + mirror OK), lint/prettier clean.
- Playwright script (under `specs/case-study-nav/tools/` or scripts/test companion) asserting the union of Tickets 1-5 acceptance on all 4 pages at 1440x900 and 390x844.
- Captures into `specs/case-study-nav/evidence/`: per page, top-of-page (nav below hero, unstuck) and scrolled (stuck at 48, bg matches header), plus teachr active-state and the new-tab popup; name pattern `cs-nav-{page}-{1440|390}-{state}.png`.
- Write `specs/case-study-nav/evidence/verify.md` with the measured numbers (bar top, bg colors per page, section counts, target counts).
- Run visuaibear-review gates; record pass/fail in the plan Status.

## Acceptance criteria (agent-checkable)

- [ ] `npm test` all green; `npm run build` exit 0 with guards; `format:check` clean.
- [ ] All Playwright assertions from Tickets 1-5 pass at both viewports on all 4 pages.
- [ ] `evidence/verify.md` + captures present and linked from plan.md Status.
- [ ] visuaibear-review report attached; no open gate failures.

## Out of scope

- Any change beyond the four pages (teachr-agent stays untouched per plan open question).

## Open questions

- None.
