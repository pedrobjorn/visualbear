---
# Hero from front matter (specs/text-to-md/DR-0001): the shell renders
# it via the mdhero filter. Values are raw (entities allowed), the
# vocabulary is bounded: variant, eyebrow, title, summary, details +
# meta items (logo | needs | related | metrics | footnote | summary).
hero:
  variant: "red"
  eyebrow: "Case Study"
  title: "My Closet, Digital Closet Feature"
  summary: "A digital closet showing customers the apparel they already own, built to increase Member engagement, and delivered in record time."
  details: "Lead UX Design ⋅ 5 months concept-to-delivery, a company record"
  meta:
    - metrics: "10% | session length increase"
    - metrics: "↑ | sign-in correlation from the Closet page"
    - metrics: "5 mo | concept-to-delivery"
    - summary: "Outcome: stickiness validated in studies and live, a company-record 5-month delivery, and a feature that taught the team as much as it achieved."
nav:
  - label: "Problem"
    id: "definition"
  - label: "Research"
    id: "research"
  - label: "Flows"
    id: "discovery"
  - label: "Design"
    id: "delivery"
  - label: "Outcome"
    id: "outcome"
---

<!--
/digital-closet/ - rendered through the mdpage filter. The hero lives in
the front matter above (DR-0001); this file owns the content sections.
`## H2 | Eyebrow | id` sets section overrides - an empty eyebrow omits
the eyebrow line. ::: blocks and [directives] are documented in
AUTHORING.md.
-->

## Problem & Approach | Definition | definition

> "How might we bring back our customers using clothes they already own?"

::: cards
[card: Customer needs]
"I want to look and feel good." The untapped potential sat in the clothes customers had already bought from us.

[card: Business goals]
Increase engagement (return rate, session length, pages/session) and relevance (add-to-cart, conversion), sustainably, by building on existing apparel.

[card: Approach]
Leverage existing purchase-history data, with a hard 5-month delivery target.
:::

## Research | Exploration | research

We conducted formative interviews with 6 customers to learn about their closets.

We then took these *Research Nuggets* and categorised them into 4 Jobs-to-be-done.

We also conducted a thorough Competitive Analysis covering 12 Apps and services that covered these needs.

::: showcase
[figure: research-venn]
Research Nuggets from the formative interviews, scattered across the overlapping Jobs-to-be-done.
:::

### Ideation

Two Design Studios:

- Blue-sky ideation with 11 participants, affinity-mapped into a backlog.
- Clustered and refined sketches, voted down to the strongest concepts.

### Customer voices

> "I run out of space, I get rid of clothes."

> "When I have time I organise it and make it easier to find."

> "It'll be a mini closet which will show clothes I like or I'd like to try."

## Flows & Validation | Discovery | discovery

[intro: A defined user flow and basic functionality fed straight into a fast prototype, the three flows below.]

::: compare
[panel: Flow 01 | Login]
The Closet was reached through the existing Sign-up / Sign-in flow, with expectations set before and after login. An empty state routed brand-new shoppers to the store immediately.

[frame: Login Flow | Final mockup pending]

[panel: Flow 02 · the signature piece | Closet View]
All previously purchased items, gathered and categorised. Swipable product sliders with a clothes-hanger feel, clothing shown clean, without detail clutter, an intro message, vertically scrollable categories, filterable and sortable.

[frame: Closet View, Hanger Slider | The signature piece · final mockup pending | tall]

[panel: Flow 03 | Details]
Tapping a product opened a bottom sheet with an image gallery, product info and options: care information, styling recommendations and buy-again.

[frame: Details Flow | Final mockup pending]
:::

### Validation

Five usability studies (desirability and time-on-task) refined the final design. Backlog additions from the studies: tagging/favouriting items, and adding items not bought from us.

> "It's showing me what's in my wardrobe."

> "I can narrow down to just see my trousers."

> "I can look how they look together, comparing."

> "I don't think I'd ever use this feature."

## Built on the Design System | Delivery | delivery

1. **Design System** - All components built on the established Design System.
2. **Handoff** - Developers embedded throughout, a clean handoff.
3. **Live study** - A live study on the production feature, with learnings documented for the next iteration.

## Win & Hard Truth | Outcome & Lessons | outcome

::: columns
[col: Win]
- Stickiness validated in studies and live.
- Record-setting delivery.

[col: Hard truth]
- Feature was heavy and expensive on the backend.
- Only a portion of customers' wardrobes was represented, limited usefulness.
- Flagged to stakeholders early.
- Served as a learning MVP.
- Sunsetted after one year.
:::
