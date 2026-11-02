# Drafts — the copy source of truth (specs/text-to-md, DR-0003)

`<slug>.txt` here is the page's copy source. You edit THIS file; the
`visuai-text-to-md` skill re-converts it into the derived page md
(`src/_data/pages/<slug>.md`, hero included) whenever the txt changes.
The md is deterministic output - never hand-edit it.

## The plain format (v2: only #, **, and Word: labels)

Head block - the file opens with the hero as labeled lines:

    Variant: red              (omit for the plain dark hero)
    Eyebrow: Case Study
    Title: My Closet, Digital Closet Feature
    Summary: one line under the title
    Details: Lead UX Design ⋅ 5 months
    Logo: ../images/... | alt
    Needs: the Needs card text
    Related: lead text | ../teachr-agent/ | Link title
    Metrics: 20k | new users per month
    Footnote: * footnote text
    Takeaway: the meta block's summary

Body - everything else is plain text:

    ## Section | Eyebrow | id     (section; pipes optional)
    ### Sub-heading
    **Card or column title**      (bold-only line = a sub-block; the skill
                                  groups a run of them into cards/columns)
    **Before: Start Page**        (colon titles in a run = compare panels)
    Columns:                      (says the next bold group is columns)
    Hero: coupon-hero             (opens a mid-page hero block)
    Intro: text                   (-> [intro: ...])
    Note: text                    (-> [note: ...])
    Point: text                   (-> [point: ...])
    Frame: label | sub | tall     (-> [frame: ...], showcase-wrapped outside
                                  a group; add its caption as the next line)
    Image: label | sub            (-> [image: ...], never fenced)
    Figure: name                  (-> [figure: ...])
    Byline: text                  (-> [byline: ...])
    Wrap-up: text                 (-> [summary: ...]; closes a hero)
    Divider: text                 (-> [divider: ...])

    15% | fewer clicks            (value-first lines = metrics)
    - plain fact                  (bullets / chips)
    1. Step                       (timeline, bold re-added on emit)
    "a quote"                     (a line starting with " = pull quote)
    | a | b |                     (pipe rows = table)

Everything else is prose. No :::, no [directives], no raw HTML, no
markup beyond the above - the skill rebuilds all of it (the [rule],
executable reference: specs/text-to-md/tools/draft-to-md.js). The
round-trip is byte-proven: all six case studies' drafts re-convert to
their committed mds exactly.

`.txt` never enters the build (the data loader's whitelist is
`json|ya?ml|md`).
