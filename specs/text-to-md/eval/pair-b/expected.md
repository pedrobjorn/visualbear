---
# Hero from front matter (specs/text-to-md/DR-0001): the shell renders
# it via the mdhero filter. Values are raw (entities allowed), the
# vocabulary is bounded: variant, eyebrow, title, summary, details +
# meta items (logo | needs | related | metrics | footnote | summary).
hero:
  title: 'Kettle One Page'
  details: 'Lead Designer, 2027'
---

<!--
/kettle-one-page/ - rendered through the mdpage filter. The hero lives in
the front matter above (DR-0001); this file owns the content sections.
`## H2 | Eyebrow | id` sets section overrides. ::: blocks and [directives]
are documented in AUTHORING.md.
-->

::: metrics
30k | new users per month
22% | fewer single-page sessions
:::
