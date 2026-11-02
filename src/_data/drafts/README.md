# Drafts — the copy source of truth (specs/text-to-md, DR-0003)

`<slug>.txt` here is the page's copy source. You edit THIS file; the
`visuai-text-to-md` skill re-converts it into the derived page md
(`src/_data/pages/<slug>.md`, hero included) whenever the txt changes.
The md is deterministic output - never hand-edit it.

## Conventions in the txt (what the skill maps)

Head block - the first consecutive labeled lines ARE the hero:

    Variant: red              (omit for the plain dark hero)
    Eyebrow: Case Study
    Title: The page title
    Summary: One line under the title
    Details: Role ⋅ Tools ⋅ Dates
    Logo: ../images/... | alt text
    Needs: the Needs card text
    Related: lead text | ../other-page/ | Link title
    Metrics: 20k | new users per month*
    Footnote: "* for two pilot markets"
    Takeaway: the block summary line

Body:

    Heading | Eyebrow | id     -> section with overrides
    1. Step text               -> numbered timeline
    - short fact               -> fact chips
    > "a quote"                -> pull quote
    15% | something ↑          -> ::: metrics
    [image: ...], [intro: ...], [note: ...], ::: blocks
                               -> pass through as-is
    everything else            -> paragraphs

Round-trip guarantee: the six case studies were reverse-engineered into
this format (specs/text-to-md/tools/md-to-draft.js) and re-converting
their txts reproduces the committed mds byte-for-byte (checked by
specs/text-to-md/tools/draft-to-md.js). Edit freely - the diff after
re-conversion shows exactly what changed.

`.txt` never enters the build (the data loader's whitelist is
`json|ya?ml|md`).
