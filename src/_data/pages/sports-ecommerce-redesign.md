<!--
/sports-ecommerce-redesign/ - rendered through the mdpage filter. The first
hero + metrics block stay in the page shell (bespoke layout); this file owns
both case studies' content sections, including the second case study's
divider + hero. `## H2 | Eyebrow | id` sets section overrides. ::: blocks
and [directives] are documented in AUTHORING.md.
-->

## Problems & Opportunities | Definition | definition

| | |
|---|---|
| Stagnating growth | Retention had gone flat, the business needed a reason for customers to come back. |
| Site usability issues | Impacting both the user experience and SEO. |
| Feature friction | New features and options, such as browsing through brands, were not findable or very usable, and hard to implement on an inconsistent base. |
| New rebrand | A new brand identity needed implementing across the entire e-commerce experience. |

### Insights

- Service and selection were great, but the site, on mobile and desktop, was hard to use.
- It was difficult to find products, due to the sheer quantity of selection and information.
- A lot of features and options, such as browsing through brands, were not findable or very usable.
- The inconsistent experience meant customers returned in spite of the experience, because of the quality of the selection and service.

### Goals

- Improve the growing usability issues.
- Standardise the experience, so we can implement new features more effectively.
- Implement the new rebrand across the e-commerce experience.

## Brand, Process & Design System | Exploration | exploration

| | |
|---|---|
| Brand visual redesign | The brand redesign was done in tandem with the site redesigns. A close collaboration with Brand meant we could embed the brand identity into the UI visual direction, centred around slanted inclines, and rounded corners combined with occasional sharp corners. |
| Design process & Design System | We implemented a Design System, including tokens that handled fonts, colours and spacing, and introduced a Discovery cycle that unified the experience, validated our decisions and embedded the Brand direction all in one big leap. |

### The Discovery cycle

1. **Ideation**
2. **Prototype**
3. **Usability Study**
4. **Implement**
5. **Measure**

## Site Redesign: Mobile & Desktop | Discovery | site-redesign

### Mobile Web

::: compare
[panel: How it started | Mobile Web · Before]
The colours were very heavy, elements very close together and very sharp, claustrophobic. Images and text were badly proportioned, and spacing was inconsistent, like this 3rd-party component clashing with the rest of the experience.

[frame: Mobile Web · Before | Final mockup pending]

[point: Inconsistent spacing from 3rd-party components]

[note: *Excuse the blurry image, it's all we could gather from the old site.]

[panel: How it ended up | Mobile Web · After]
More whitespace and rounded corners, replicating the roundness and softness of gym gear and muscles, making it feel friendly. We reduced the intensity of colours and content, letting the CTA stand out and using the brand colour sparingly. Since content was still largely shot 1:1, we accommodated that while coordinating a shift to 2:3.

[frame: Mobile Web · After | Final mockup pending]

[point: Rounded corners, the softness of gym gear and muscles]

[point: Brand colour used sparingly, CTA stands out]
:::

::: showcase
[frame: Mobile Web, how it ended up | Big page-wide mockup · final image pending | tall]
The redesigned mobile experience: whitespace, rounded corners and room for content.
:::

### Desktop

::: compare
[panel: How it started | Desktop Web · Before]
Much like on mobile, there was an inconsistency of elements, and an overwhelming quantity of content, causing information overload.

[frame: Desktop Web · Before | Final mockup pending]

[panel: How it ended up | Desktop Web · After]
We retained the information density, customers come seeking information, and we didn't want to change the experience too much. We introduced "combination" so customers could easily add commonly-bought-together items, and kept reviews useful while updating them to feel more personal.

[frame: Desktop Web · After | Final mockup pending]

[point: Information density retained]

[point: "Combination" pattern for commonly-bought-together items]

[point: Reviews updated to feel more personal]
:::

## Rolled Out in Phases | Delivery | site-delivery

[intro: The results were rolled out in phases, per page, on web mobile and desktop, each page verified against the new standards as it shipped.]

## Outcome | Outcome | site-outcome

::: metrics
15% | customer return rate ↑
#1 | Sports Site of the Year
:::

[h2: Lessons]

- **Validate early and often with users.**
- **Design Systems are enablers, not gatekeepers**, use them to accelerate exploration and feature development, and provide value for customers.
- **Include Brand in product from day 1**, embed brand into the fabric of the product.
- **Start with a solid foundation**, and iterate early and often.

[divider: Deep-Dive]

::: hero coupon-hero
[eyebrow: Case Study, Coupon System]
## Redesigned Coupon System
[subtitle: Improve our coupon campaign issues, which were causing our users and customer support a lot of problems, the flagship example of the redesign's standardisation paying off.]
[byline: Lead UX Design]

::: metrics
0 | user complaints in feedback
50% | drop in CS tickets
<2% | abandon cart ↓ · CR% ↑ on coupon campaigns
:::

[summary: After two weeks: no more user complaints in feedback and a 50% drop in CS tickets. After a few months: a slight uptick in return users.]
:::

## Problem & Goal | Definition | coupon-definition

| | |
|---|---|
| The problem | Coupon campaign issues drove **30% of Customer Support tickets**, were frequent in user feedback, and the UX audit displayed clear issues. The coupon relied on the user copying or memorising the code and inputting it manually. |
| The goal | Increase active coupon campaigns and their Conversion Rate (CR%), and reduce user frustration and confusion. |

> "We want to increase the amount of live coupon campaigns, and also increase their conversion rate." - E-commerce Department

### KPIs

- Increased CR%
- Decreased Customer Support tickets
- Decreased user feedback issues

## Research & Insights | Exploration | coupon-exploration

Based on both internal and industry-wide findings, we knew customers want the best value for money when shopping online. But when presented with an inconvenient coupon format, the potential to miss out goes up, resulting in frustration.

::: cards
[card: Qualitatively]
- Session recordings, to see it actually happen
- Remote unmoderated user tests

[card: Quantitatively]
- Google Analytics & internal reporting
- Customer Support tickets

[card: External research]
- Competitive analysis
- Existing research, voucher flight
:::

### Key issues

- Users try to combine coupons, often
- Poorly worded error messages
- Copy/pasting codes is a hassle
- Leaving the site to search for coupons

These cause frustrating experiences at the cart level, a poor final impression, and users dropping off without purchasing.

[note: External stat: competitive prices and valuable promotions beyond free shipping are two of the top-5 important factors for customers choosing a retailer. (Digital Commerce 360 / Bizrate Insights holiday shopping survey, October 2019, 1,055 U.S. online shoppers.)]

## Workshops, Study & Actions | Discovery | coupon-discovery

### Ideation workshops

- Workshop to map out the existing flows: user touch-points, types of coupons, possible coupon combinations, and coupon alert messages.
- Workshop ideating on possible solutions: listing examples, writing down ideas, and affinity-mapping them.

### Qualitative study

A quick prototype verified whether participants understood what was happening. With no surprises, our hypotheses were validated enough for us to commit to a release. This was before we had A/B tests implemented, so we had to do it live.

### Actions taken

- **Improvements:** automatically apply coupons on checkout, more coupon alerts and feedback, simplified coupon conditions, and a refined Coupon Component.
- **Campaign Component System** in the Design System: coupon component, campaign themes, and component rules.
- Allow users to copy/paste coupons anyway, *it doesn't really do anything, but it feels good!*
- A Customer Support ticket data view for the support team.

## Design System, Documentation & Collaboration | Delivery | coupon-delivery

1. **Connect to the Design System** - Adding the new components to the Design System, such as the new Coupon Component.
2. **Documentation** - Documenting the user flows and the new copy.
3. **Developer collaboration** - Collaborating with developers to ensure the new user flow was integrated smoothly into production.

## Achievements & Takeaways | Outcome & Lessons | coupon-outcome

### Achievements

- **After two weeks:** no more user complaints in feedback, a 50% drop in CS tickets, a slight (<2%) drop in abandoned carts, and a slight (<2%) increase in CR% for coupon campaigns.
- **After a few months:** a slight uptick in return users.

<!-- <div class="cs-twocol">
    <div class="cs-col">
        <h3>Takeaways</h3>
        <ul>
            <li>Automate it, remove human error.</li>
            <li>Customer Support is a valuable source of data.</li>
            <li>Voucher flight is a thing.</li>
        </ul>
    </div>
    <div class="cs-col">
        <h3>Details to consider</h3>
        <ul>
            <li>Many users were still used to copy/pasting.</li>
            <li>Most users were not campaign-focused, but product-focused.</li>
            <li>Coupons didn't have such a huge impact.</li>
            <li>Checkout unchanged.</li>
        </ul>
    </div>
</div>

<p class="cs-note">
    The coupon study is proof of the redesign thesis, standardisation (Design System + Discovery cycle) is what made a fast, surgical coupon fix possible. Its sobering learnings are kept verbatim and unhidden; they strengthen, not weaken, the story.
</p> -->
