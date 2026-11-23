# Authoring markdown pages

How to write the content files in `src/_data/pages/` — plain markdown, plus a
small set of `[directives]` and `:::` blocks for the page's visual components.
This guide is the authoring contract (see
`specs/md-case-study-editor/DR-0001`); it must stay in sync with
`markdown-render.js`.

## The live loop

1. Start the dev server: `npm run serve` → `http://localhost:3000`
2. Edit the page's `.md` file in `src/_data/pages/`, save
3. The browser refreshes with the change

No hand-markdown at all? The draft txt in `src/_data/drafts/<slug>.txt`
is your copy source (DR-0003): edit it whenever, then run the
`visuai-text-to-md` skill - it re-converts (structure only, never
content) into `src/_data/pages/<slug>.md`, hero included, shows the diff
as the copy change, and verifies itself. The page md is derived - never
hand-edit it; txt edits are the workflow. (text-to-md plan, DR-0002 +
DR-0003.)

No template work for standard layouts. The page shell (in
`src/<page>/index.nunjucks`) holds the hero and chrome; everything below the
hero is your markdown, rendered by the `mdpage` or `mdresume` filter.

## Code quality commands

- `npm run lint` — ESLint on the JS (via gulp)
- `npm run format` — Prettier on js/scss/md (not `.nunjucks` templates,
  and not `src/_data/pages/` while the copy rewrite is in flight)
- `npm run format:check` — CI-style check; exits non-zero if unformatted

## Conventions: `mdpage` (case studies)

| You write    | You get                                                     |
| ------------ | ----------------------------------------------------------- |
| `# Title`    | (usually stays in the shell — hero title)                   |
| `## Section` | Full-width section block, heading text as eyebrow label     |
| `1. step`    | Numbered timeline                                           |
| `- item`     | Fact chips at section level; plain bullets inside a box     |
| `* item`     | Plain bullet list at section level (the opt-out from chips) |
| `> quote`    | Centred italic pull quote                                   |
| table        | Card grid (header row dropped, each body row → one card)    |
| raw HTML     | Passes through untouched — escape hatch, not the default    |

The list-context rule (DR-0010): the same `- item` renders as a plated
fact chip at section level and as a plain bullet inside `::: cards`,
`::: columns` or `::: compare` — by design, matching the reference pages.
`* item` is the explicit opt-out when a section-level list should not be
a chip.

### Hero from front matter (DR-0001)

The hero (cover + meta block) renders from the page md's `hero:` front
matter via the `mdhero` filter - the shell holds one line,
`{{ site.data.pages['<slug>'] | mdhero | safe }}`, instead of hardcoded
hero markup. Format:

    ---
    hero:
      variant: black        # cs-hero--<variant>; omit for the plain hero
      eyebrow: Case Study   # optional
      title: The page title
      summary: One line under the title
      details: Role ⋅ Tools ⋅ Dates
      meta:                 # the cs-hero--meta block; one-key items in source order
        - logo: "../images/... | alt text"
        - needs: "card body"                      # title is always "Needs"
        - related: "lead text | ../other-page/ | Link title"
        - metrics: "20k | new users per month*"   # count-up value; label's ↑/↓ become icons
        - footnote: "* footnote text"
        - summary: "block summary text"
    ---

Values are RAW (entities allowed, `&nbsp;` etc.), like the shell markup
this replaces - escape `&` yourself; the text-to-md skill emits escaped.
The related arrow points right (read next); a lead saying "read
first/previous" points it left. The bounded vocabulary is enforced by
`specs/text-to-md/tools/verify-page-md.js` (unknown keys fail). Pages
without front matter render exactly as before.

### `:::` blocks for visual components

    ::: metrics
    15% | customer return rate ↑
    #1 | Sports Site of the Year
    :::

Lines are `value | label`. Leading digits become the count-up value;
`↑` / `↓` become the phosphor arrow icons.

    ::: compare
    [panel: Before | Start Page]
    A cluttered index…

    [panel: After | Start Page]
    The redesigned version…
    :::

Each `[panel: tag | title]` opens a comparison panel; prose and `[frame:]`,
`[note:]`, `[point:]` directives flow inside in source order.

    ::: showcase
    [frame: Label | sub-label | tall]
    The caption text.
    :::

`[frame: …]` → mockup placeholder (`tall` variant optional); the last text
lines become the `figcaption`.

    ::: shots
    ![Before we started, the colours were heavy](../images/case-studies/mobile-compare/before.jpg)
    ![Elements were inconsistent in spacing](../images/case-studies/mobile-compare/menu.jpg)
    ![Content was not well proportioned](../images/case-studies/mobile-compare/after.jpg)
    :::

An IMAGE RUN (ticket 61): N images side by side, each image's **alt text
is its caption** below it. All shots in a band share one height - the
renderer sets each shot's flex-grow to the image's own aspect ratio, so a
phone capture next to a desktop capture renders at the desktop's height,
just narrower. Wraps when narrow (each shot ≥ 240px, stacked
on phones). The band is full-bleed. `[frame: Label]` placeholders work
as shots.

    ::: wide
    ![Detail: Course library, desktop](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.04.30-2-1.png)
    ![Detail: Course library, mobile](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.08.03-2.png)
    :::

The WIDE IMAGES container: same image row as `::: shots` (side by side,
shared height, alt-text captions), but at **75% of the viewport width on
desktop, 85% on tablet, 90% on mobile** instead of full bleed. This is
what the converter emits for an image run in a draft (rule 6b).

    ::: cards
    [card: Title]
    Card body (markdown).
    :::

    ::: columns
    [col: Left title]
    content
    [col: Right title]
    content
    :::

    ::: hero
    [eyebrow: Label]
    # Mid-page hero
    [summary: One line under the title.]
    :::

The mid-page hero (DR-0014) is a second hero inside the page — 64/64
padding, its subtitle/byline on the shared 24 gaps.

    ::: table
    | Column | Column |
    | ------ | ------ |
    | cell   | cell   |
    :::

A real data table (`table.cs-table`, scrollable box) spanning the
viewport. Top-level markdown tables still render as card grids — only
`::: table` gives you the real table.

    ::: callout
    [callout: Try the app | ../teachr-app/ | Open the live mock app]
    Tile body text (markdown). The link pill is stretched over the tile.
    :::

The CALLOUT tile: first line is `[callout: Title | href | Link text]`,
the remaining lines are the body. Renders one `.cs-callout` plate with an
accent edge, an h3 title, the body, and a pill link `.cs-callout-link`
(the whole tile is clickable). In a draft, a `Callout: Title | href |
Link text` label line emits this block, with the following plain lines as
the body.

### Widths: text edge, bleed, full-bleed (DR-0009)

All body text sits on one text edge. Boxes (cards, fact chips, quote
groups) bleed one indent step into the margins — their text stays on the
edge. Media and tables go further:

- **Showcases and tables are full-bleed by default**: the image or table
  spans the viewport, edge to edge. Use reasonably large images — small
  sources will upscale.
- **Background sections**: any container can take a `full` modifier so
  its background spans the viewport while the content keeps its insets:

      ::: cards full
      [card: On a full-width band]
      The card's background spans the viewport.
      :::

      ::: metrics full
      15% | return rate ↑
      :::

### Single-line directives (valid anywhere)

- `[intro: text]` → `p.cs-section-intro`
- `[note: text]` → `p.cs-note`
- `[point: text]` → annotation dot + text (inside panels); on the line
  after an image/frame it renders as a dotless, italic caption (DR-0011)
- `[summary: text]` → the closing-summary box (bleeding, centered,
  `.cs-summary`); inside `::: hero` it is the hero's summary line
- `[byline: text]` → label-tier byline; on the line after a `>` quote it
  moves inside that quote's blockquote, centered with it
- `[figure: name]` → HTML from `src/_data/patterns/name.html` (one-off
  graphics that can't be markdown, e.g. the venn diagram)
- `[h2: text]` / `[h3: text]` → heading without opening a new section

### Doc-sync rule (standing)

Every `:::` type documented here must be a known container in
`renderContainer` (`markdown-render.js`), and every container type
handled there must be documented here. The check is mechanical:
`specs/md-case-study-editor/tools/doc-sync.sh` (run from the repo root;
unknown containers warn and emit an HTML comment — if you see one, the
guide or the renderer drifted).

## Conventions: `mdresume`

| You write                            | You get                                             |
| ------------------------------------ | --------------------------------------------------- |
| `## Section`                         | Section heading row (`h3`)                          |
| `### Role - [Company](url) \| dates` | Experience row: role left, dates right              |
| `**Sub-title**` on its own line      | `h4.sub-title`                                      |
| `- item`                             | List items (plain `ul`)                             |
| `- **x** – [link](url) \| note`      | Education/languages entry: `b` + link + `side-text` |
| `## Title \|`                        | Quiet section: `div.sub-title` instead of an `h3`   |
| blank line                           | Closes the current list                             |

Paragraphs before the first `##` are the page intro (bare `col m12` row).

## Rules of thumb

- Two blank lines between a timeline (`1.`) and a following fact list
  (`-`) — the markdown engine merges adjacent lists.
- Keep the hero (title/summary/details) in the page shell for pages with
  bespoke hero variants (`cs-hero--red` etc.); simple heroes can live in md.
- Content comments (`<!-- … -->`) pass through as HTML comments — fine for
  WIP notes, they never render.

## AI attribution (DR-0008)

- Put `[ai]` on its own line at the END of a content block or section to mark
  it as AI-drafted. It renders as a small "✦ AI-drafted" tag below that
  content - on the dev server only. Production builds strip it and warn.
- Mark every content section that is AI-drafted. Do not mark quotes; the
  page hero carries its own marker in the shell.
- Rewrite AI-drafted copy in your own voice, then remove the `[ai]` line.
- Copy rule: no em dashes (—) anywhere - use hyphens, colons, or restructure.

## Images (DR-0008 phase 3)

- No asset yet? Use `[image: label]` - renders the placeholder frame
  ("pending" style). Add a sub-label and the tall variant with
  `[image: label | sub-label | tall]`.
- Real image: standard markdown `![alt](src)`.
- Caption under an image: `[caption: text]` on the line after it - the pair
  wraps into the showcase figure.
- The showcase tier is automatic, read from the image's own dimensions
  (DR-0004, `specs/teachr-training/`): wide desktop captures go full-bleed,
  phone-portrait captures render narrow at 480px, everything else sits on
  the text measure. No variant syntax; to change a tier, change the asset.
