---
# Hero from front matter (specs/text-to-md/DR-0001): the shell renders
# it via the mdhero filter. Values are raw (entities allowed), the
# vocabulary is bounded: variant, eyebrow, title, summary, details +
# meta items (logo | needs | related | metrics | footnote | summary).
hero:
  variant: 'red'
  eyebrow: 'Case Study'
  title: 'Kettle, the One Page'
  summary: 'A one-page rebuild with the plate system throughout.'
  details: 'Lead Designer ⋅ 3 months'
  meta:
    - logo: '../images/work/fullsize/kettle/kettle_logo.png | Kettle brand mark'
    - metrics: '40% | fewer clicks'
    - summary: 'The one page shipped on time and stuck.'
---

<!--
/kettle-one-page/ - rendered through the mdpage filter. The hero lives in
the front matter above (DR-0001); this file owns the content sections.
`## H2 | Eyebrow | id` sets section overrides - an empty eyebrow omits
the eyebrow line. ::: blocks and [directives] are documented in
AUTHORING.md.
-->
