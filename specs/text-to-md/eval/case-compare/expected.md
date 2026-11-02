---
# Hero from front matter (specs/text-to-md/DR-0001): the shell renders
# it via the mdhero filter. Values are raw (entities allowed), the
# vocabulary is bounded: variant, eyebrow, title, summary, details +
# meta items (logo | needs | related | metrics | footnote | summary).
hero:
  title: 'Coupon Flow'
---

<!--
/coupon-flow/ - rendered through the mdpage filter. The hero lives in
the front matter above (DR-0001); this file owns the content sections.
`## H2 | Eyebrow | id` sets section overrides. ::: blocks and [directives]
are documented in AUTHORING.md.
-->

::: compare
[panel: Before | Before]
A cluttered index with inconsistent spacing and mismatched buttons.

[panel: After | After]
A focused entry with one clear primary action and the plate system.
:::

We shipped the coupon flow in two releases.
