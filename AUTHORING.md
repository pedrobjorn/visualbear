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

No template work for standard layouts. The page shell (in
`src/<page>/index.nunjucks`) holds the hero and chrome; everything below the
hero is your markdown, rendered by the `mdpage` or `mdresume` filter.

## Code quality commands

- `npm run lint` — ESLint on the JS (via gulp)
- `npm run format` — Prettier on js/scss/md (not `.nunjucks` templates,
  and not `src/_data/pages/` while the copy rewrite is in flight)
- `npm run format:check` — CI-style check; exits non-zero if unformatted

## Conventions: `mdpage` (case studies)

| You write    | You get                                                  |
| ------------ | -------------------------------------------------------- |
| `# Title`    | (usually stays in the shell — hero title)                |
| `## Section` | Full-width section block, heading text as eyebrow label  |
| `1. step`    | Numbered timeline                                        |
| `- item`     | Fact chips                                               |
| `> quote`    | Centred italic pull quote                                |
| table        | Card grid (header row dropped, each body row → one card) |
| raw HTML     | Passes through untouched — escape hatch, not the default |

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

### Single-line directives (valid anywhere)

- `[intro: text]` → `p.cs-section-intro`
- `[note: text]` → `p.cs-note`
- `[point: text]` → annotation dot + text (inside panels)
- `[figure: name]` → HTML from `src/_data/patterns/name.html` (one-off
  graphics that can't be markdown, e.g. the venn diagram)
- `[h2: text]` / `[h3: text]` → heading without opening a new section

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
