<!--
/fashion-rebrand/ - rendered through the mdpage filter. The hero and the
metrics block stay in the page shell (bespoke layout); this file owns the
content sections. `## H2 | Eyebrow | id` sets section overrides - an empty
eyebrow omits the eyebrow line. ::: blocks and [directives] are documented
in AUTHORING.md.
-->

## Context | | context

[intro: A global fashion retailer, losing its fashion credibility, and a nine-month rebrand mandate covering the digital and physical experience.]

> Brand recognition, sales and customer retention are dropping. We are no longer considered a fashion brand, we are considered a retail brand.

::: cards
[card: Vision & Mission]
**Vision:** re-establish ourselves as a fashion brand with a focus on quality.

**Mission:** rebrand the digital and physical experience to regain our fashion credibility.

[card: The Customer]
The influential *Fashionista*, 18–34, fashion-ambitious, knows what they like, open to expanding their style, wants to share and be shared with. A *Validator*, not a Guidance Seeker.

[note: Hypothesis: bring in the Fashionista, and the regular customer, influenced by these trendsetters, follows and invests more in quality, stylish apparel.]

[card: Core Team]
For this project a Core Team was created, a combination of seniors from different parts of the organisation: 1 Brand Strategist, 2 UX Researchers, 1 UI Designer, 1 Visual Designer, 2 UX Designers and 1 Impact Producer.

My role was Lead User Experience of the Global rebrand, responsible for the digital and brand lift meeting the standards for Web.

[note: ⚠️ Looking back, we were too centralised and waterfall, not enough room for contribution from teams and developers.]
:::

<!-- <div class="cs-frame">
    <span class="cs-frame-label"><strong>Team Composition Diagram</strong>Final diagram pending</span>
</div> -->

### Goals

- Lift the fashion & brand on App & Web.
- Unify the experience through Branding, Content, UI and UX.
- Declutter and focus.

## Deep-Dive: Entrances | | deep-dive

::: cards
[card: Problem]
Customers exit early from Department pages, a fragmented experience with limited discovery. The Primary Navigation always starts at the highest level of department views, which is redundant when the customer wants a context-sensitive list one level down. The old Desktop page exposed a lot of navigation, good for ease of access, but overwhelming for the new customers who mostly use Web. And a landing page that looks unfocused, with unclear navigation, makes people bounce.

[card: Goal & Hypothesis]
**Goal:** increase traffic down the funnel, let departments be discovered, and set them as the default landing page for returning customers.

**Hypothesis:** make the Index Page the Women's department with the other departments exposed as tabs, focusing the start page while making each department easier to find and segment on.
:::

### Simplifying the Information Architecture

The Start Page became the Women's Department, and Kids & Babies were merged into Kids. A small change with a big impact on the customer landing experience, our ways of working, and SEO. The research foundation came from our CX Unit and Core Researchers; from here, summative studies validated the proposals.

::: compare
[panel: Before | Start Page]
A cluttered index with heavy, exposed navigation competing for attention, unfocused for new customers.

[frame: Start Page · Before | Final mockup pending]

[point: Overwhelming navigation options]

[panel: After | Start Page]
The Women's department as the index, Women · Men · Kids · Home · Beauty as tabs, with bigger, bolder typography, less copy, adjusted spacing and media in focus.

[frame: Start Page · After | Final mockup pending]

[point: Simplified tab navigation]
:::

::: showcase
[frame: The new Start Page, Women's department as the index | Big page-wide mockup · final image pending | tall]
Bigger, bolder typography with less copy, media in focus, and Women · Men · Kids · Home · Beauty exposed as tabs.
:::

::: compare
[panel: Before | Navigation]
Desktop hover mega-menu: easy to jump anywhere from anywhere, but a lot of information and multiple patterns to keep track of across Mobile & Desktop. App and Web menus lived in completely different places.

[frame: Navigation · Before | Final mockup pending]

[panel: After | Navigation]
Progressive disclosure, navigation hidden behind a hamburger/icons, unified across desktop and mobile. On mobile, horizontal department tabs anchored to the header: hidden on scroll down, revealed on scroll up.

[frame: Navigation · After | Final mockup pending]

[point: Mobile-friendly progressive disclosure]
:::

::: showcase
[frame: The new Primary Navigation, Department tabs | Big page-wide mockup · final image pending | tall]
Departments always accessible in the header, hidden on scroll down, revealed on scroll up, with the active department shown at all times.
:::

### Key insights that shaped the design

- Customers overwhelmingly get inspired on social media before entering our store.
- Women often navigated to Men's departments anyway, shopping, or at least browsing, for their partners.
- Customers switch between browsing and seeking modes within a single session.
- Web users are often new and unfamiliar with us; App is used by Members who know the brand.
- Mobile is ~65% of web traffic, but Desktop still often carries the transactions.

### Validation: Qualitative Discoverability Study

The Navigation Team and I created the research plan with our Core Team Researchers, who ran the study and reported back. **Participants:** 9 (1 male, 8 female), ages 21–37, DE/UK/US, regular shoppers. **Method:** remote moderated, old and new versions of the start page across App, Mobile and Desktop prototypes.

- Department navigation was a very intuitive way to move between departments.
- The exposed department tab was validated as worth pursuing.
- Departments exposed upfront on Mobile would help new and returning customers explore.
- Web and App need fundamentally different navigation menus, the bar and expectations differ per device.
- Fewer departments reduce complexity and increase the presence of existing ones.
- Key issue: some customers may miss the Desktop mega-menu, one participant preferred the hover-over effect.

### Delivery: Two Teams, One Experience

The experience was owned by two teams in two verticals: the Entrances Team (mine) for Landing and Department pages, and the Navigation Team for the Navigation Menu. To the customer it's one experience, so we worked as one. I helped build the Web navigation menus with the Navigation Designer, to ensure the connecting tissue.

The Department Navigation Tab became a single shared component, used the same way in the header and the nav menu, on Mobile and Desktop:

- Always in relation to the Header on Mobile & Desktop, a familiar placement.
- Displays the active Department at all times in Navigation.
- Horizontal swipe on text overflow on Mobile; visible on page load.
- Hidden on scroll down, revealed on scroll up, out of the way, but always accessible.

[note: Implementation realities: font tokens felt disproportionately small on Desktop at release; an oversized menu came from right-hand tiles being too small; Kids needed an extra age level, so its layout differed; Women/Men could be set automatically from the gender chosen at account creation. Navigation icons without supportive text are a usability risk, but these were tested long before, and familiar enough to justify on Desktop.]

## Process | | process

[intro: A repeating Discovery → Exploration → Delivery loop: gather insights from behavioural metrics and formative studies, prioritise problems and opportunities, ideate and validate through summative studies, then ship with developers, and feed the learnings back in.]

1. **Planning & Strategy** - I proposed a more cyclical workflow with an insight phase, where teams would research first. UX researchers, researched content and DMs would jointly create concepts for each customer view, and patterns that carried across all customer journeys. Concept creation was a cyclical process where teams co-created and reviewed the concepts.
2. **Exploration & Vision** - We UX Designers in the Core Team co-created journey maps for each customer segment set by our Customer Experience team, providing as much support as possible and facilitating workshops to explore opportunities. We then mapped these along a customer journey to map the touchpoints and connect the insights as we proceeded.
3. **Design Guidance** - Once the teams got involved and started creating the different views and components, we ensured to provide as much support and guidance as possible, through both hands-on design work, and providing design specifications and assets.
4. **Collaboration & Design QA** - Collaborated with the UX & Design teams working across all products to review and align designs before development. Gathered and provided frequent feedback and support to ensure the designs aligned with B2C. Worked and aligned with the Content and SEO teams for frequent feedback and improvements, including helping Product Owners improve the content for the site.

## Outcomes | | outcomes

[intro: Pilot results, May 3–31 year over year, two markets, early, but very promising.]

::: table
| Metric | Before | After | What it means |
|---|---|---|---|
| Sessions | ~330k / mo | ~450k / mo | +27%, such a shift YoY is often more than season & marketing |
| Single-page sessions | ~10% | ~8.5% | −14%, ~11k more sessions going beyond the first page |
| Exit rate | ~15% | ~13% | −11%, ~9k fewer sessions exiting in a month |
| Performance | Baseline | +40% | Faster pages improved the experience and SEO ranking |
:::

<!-- <ul class="cs-facts">
    <li>All departments gained traffic from their new presence on Mobile Web and Apps.</li>
    <li>Business Units were happy with better discoverability, content guidelines and UI elements to work with.</li>
    <li>Cross-area collaboration with Brand and Content improved, campaign production time &amp; cost halved.</li>
    <li>Web experience and SEO improved thanks to consolidating department pages and reducing loading times, largely from less content on the Index and Department pages.</li>
</ul> -->

[note: ⚠️ Rebrands are often a long-term investment, we could have done more quantification work and gotten more solid insights.]

## Future Improvements, Based on Learnings | | future

- Department Navigation on other parts of the journey.
- Using Department preferences to shape recommendations.
- Expanding the Department Tab pattern to be used elsewhere, like Categories.
- Mobile is ~65% of web traffic while Desktop often carries transactions, a signal for further Mobile Web improvements.

## Lessons & Relevance | | lessons

::: columns
[col: Lessons learned]
- **Big projects are very risky**, learn early and often to de-risk.
- **Include teams earlier in the process**, committee-based design at this scale is harmful for culture and high risk.
- **Up-front navigation helps discovery**, users find what they're looking for more easily when it's visible.

[col: Relevance as a Staff Designer]
- How to tackle big cross-departmental navigation challenges, in process and team coordination.
- How Brand can be better integrated into product.
- How to bring teams together on a greater, unified mission.
:::
