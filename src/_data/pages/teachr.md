---
# Hero from front matter (specs/text-to-md/DR-0001): the shell renders
# it via the mdhero filter. Values are raw (entities allowed), the
# vocabulary is bounded: variant, eyebrow, title, summary, details +
# meta items (logo | needs | related | metrics | footnote | summary).
hero:
  variant: "teal"
  eyebrow: "Case Study - Quizrr (mock brand)"
  title: "Quizrr, Redesigning the Learning Experience"
  summary: "Revamping a teaching tool used by thousands of users to make it better and faster for learning - and more scalable and accessible to build on."
  details: "Lead Designer ⋅ Figjam · Figma · Claude Code ⋅ 2025 – 2026"
  meta:
    - logo: "../images/work/fullsize/teachr/teachr_logo.png | Quizrr brand mark"
    - needs: "Mock up a design system, and mock up the training flow vibe-coded with Claude Code."
    - related: "Part of a pair - read next | ../teachr-agent/ | Quizrr, AI Agent in the Learning Dashboard"
    - summary: "Summary: redesigning the training for thousands of users to make it better and faster for learning, but also more scalable and accessible."
---

<!--
/teachr/ - rendered through the mdpage filter. The hero lives in
the front matter above (DR-0001); this file owns the content sections.
`## H2 | Eyebrow | id` sets section overrides - an empty eyebrow omits
the eyebrow line. ::: blocks and [directives] are documented in
AUTHORING.md.
-->

## Outcomes & Impact | Outcomes & Impact | outcomes

::: metrics
↓80% | Customer support issues
↑20% | Started training after registering
↑3% | Increase in completion rate (approximate)
↑4x | Delivery speed of new features
:::

With the goal in mind, the redesign made the registration and learning experience simpler to use, while also improving the speed of delivery and ability to iterate the product.

- Established automated Atomic Research, AI-agents synthesise findings into insights and actions.
- Unified the registration and lesson surfaces, creating a more cohesive experience, ensuring flow, easier to maintain and iterate on, with AI-generated style tokens.
- Split registration steps, reducing information overload and user error.
- Reduced the number of actions ensuring a faster, smoother experience.

[note: This was designed and built by me in 1 week using AI Coding* as a fully interactive web prototype.]

[note: Although not perfect, this particular mock project took 1 week from first requirements to this case study. I also used a much weaker yet sustainable model. Using a frontier model at high reasoning levels would have been even faster and provided even better results.]

[note: * This is a mock-design approximation to the real work due to NDA, but the process and decisions are representative of my work, ** 2026 October vs Previous Year October, *** Due to poor benchmark data it this has at most medium confidence]

## The problem | Problem & Goal | problem

**The problem:** Our participants, often of low digital literacy, had little time for lessons, and registration errors were common.

**The goal:** To streamline and unify the experience, reducing human error and speeding up training whilst maintaining learning quality.

## Redesigning participant registration | Detail | registration

[ai]

Registration was originally a long page with a lot of options, often leading to confusion and errors. The redesign split it up into steps ensuring a smoother experience.

![Registration, steps 1 to 5](../images/work/fullsize/teachr/frame-181.png)
[caption: Detail: Redesigning participant registration]

1. **Native tongue** - The first and most important step is ensuring the participant selects their native tongue..
2. **Worker ID** - Worker ID's are one of the most complex details we capture, so we make sure it has clear validation and there is no chance of proceeding until it's submitted correctly.
3. **All options visible** - Long lists of options are all visible per step and no longer hidden behind a dropdown.
4. **Back-step auto-advance** - Going back a step highlights the selected option. Reselecting it or selecting a new option automatically moves you onto the next step.
5. **Verify & edit** - In the end we provide a verification step so the participant can verify all their information and edit it if need be.

## Course library | Detail | library

![Detail: Course library, desktop](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.04.30-2-1.png)
[caption: Detail: Course library]

![Detail: Course library, mobile](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.08.03-2.png)
[caption: Detail: Course library, mobile]

::: compare
[panel: Before | Course library]
The old course library had stacked carousels with a lot of information, while mixing two scroll actions.

[panel: After | Course library]
Simplified it by creating a list of courses, ensuring a focus on what's next.

The training library shows a list of lessons to be done. In this case lessons are locked until other lessons are complete.

The lesson card contains details like time to complete, questions, a short summary and status.
:::

## Avatar menu | Detail | avatar-menu

The header, besides including a back button during sections with steps, also includes the general context, in this case the training library, and an avatar menu.

The Avatar pop-out menu contains details the participant can review and edit, settings and a log out option.

Settings contains more options the participant can access at any time.

![Detail: Avatar pop-out menu](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.48.57-1.png)
[caption: Detail: Avatar pop-out menu]

![Detail: Settings](../images/work/fullsize/teachr/screenshot-2026-11-05-at-11.06.28-1.png)
[caption: Detail: Settings]

## Lessons | Detail | lessons

![Detail: Lessons - the unified lesson page](../images/work/fullsize/teachr/frame-184.png)
[caption: Detail: Lessons]

::: compare
[panel: Before | Lessons]
The old lessons had redundant actions, jumping between questions and videos

[panel: After | Lessons]
The new design unifies the lesson on a single page, reducing actions and allowing review of previous questions.

The lessons often start with a video introducing the participants to key concepts they're then asked about.

Videos then may appear throughout the lesson to cover additional topics

The content is kept centered and narrow to ensure focus and parity between devices, since it's not uncommon for users to switch devices. It also means fewer components to worry about and a vertical sense to the flow.

A scroll to next question button ensures it's one tap away from continuing.

![Detail: Question, answered on desktop](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.01.57-2.png)
![Detail: Question, on mobile](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.08.19-2.png)
![Detail: The scroll to next question button](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.08.53-2.png)
:::

## Quizrr Assistant | Detail: AI Chat Support | assistant

The Quizrr assistant is an AI Chat Support that can help participants with any questions they might have during the lesson, such as how answers work, what happens with progress or to highlight something is wrong.

This cannot be used to get right answers, as the AI Agent is calibrated to only answer specific questions to ensure the participants can learn as best as possible.

![The assistant chat](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.01.42-2.png)
[caption: Detail: The assistant]

## Feedback and reviewing | Detail: Feedback and reviewing | feedback

::: compare
[panel: Before | Feedback]
The old lessons had very binary feedback, correct or incorrect answers.

[panel: After | Feedback]
The new design not only provides clearer feedback, but if they get pick the incorrect answer twice, we emphasise the right answer.

Reviewing answers and videos is also an essential part of learning, so we made it easy to go back.

![Clearer feedback, emphasis on the right answer](../images/work/fullsize/teachr/screenshot-2026-11-05-at-10.02.56-2.png)
[caption: Detail: Feedback and reviewing]
:::

## Completion | Detail: Completion | completion

::: compare
[panel: Before | Completion]
The old lessons had a completion page that simply told the user they congratulations and they were done.

[panel: After | Completion]
The new design adds a bit more flare and provides stats to inform the participant of their performance. With that said, this is a page we want plan to work on a lot more to make it really special, which it isn't yet.

This stats are useful for users to feel closure, but also it gives a sense of assurance that their answers have been saved and they can proceed back to their lessons.

![Lesson complete, desktop](../images/work/fullsize/teachr/screenshot-2026-11-05-at-11.46.30-1.png)
[caption: Detail: Completion]

![Lesson complete, on mobile](../images/work/fullsize/teachr/screenshot-2026-11-05-at-11.46.12-1.png)
[caption: Detail: Completion]
:::

## AI-workflow & Design System | Detail: AI-workflow & Design System | ai-workflow

[ai]

Using an AI-coding agent and my own agentic design suite* I was able to setup a standardised and repeatable workflow.

1. **The spec** - Setup started with kicking off a Spec which specified challenges, goals, user personas, etc. This is the backbone of the project and referenced throughout.
2. **Spec-driven evaluation** - Spec Driven Design / Development meant everything was first evaluated against user goals, UX heuristics based on audits and tests, and referenced against existing code.
3. **Design system as foundation** - This is then used to establish the design system, which then becomes the foundation of all future decisions. Anything changed is always done through this.
4. **Playwright review** - Lastly review is done by running Playwright which allows the agent to grab screenshots and verify them against heuristics and rules.
5. **Refine loop** - Any changes and issues are refined by looping back into skills to ensure mistakes don't happen again.

This enabled me to design purely in code. No Figma was used in this project, only code.

The design system is far from perfect, but it was the foundation to ensure the experience remained consistent at low agent effort. Although this isn't a development focused project, this also ensured the component code remained consistent and reusable.

[note: * The agent used was GLM-5.3 Flash (Mistral Hoster) in Visual Studio, as well as my own visuAI agentic design suite which includes visuai-spec, visuai-design, visuai-prototype and visuai-review. More will be shared in future.]

![Design system type scale and motion tokens](../images/work/fullsize/teachr/frame-187.png)
[caption: Detail: AI-workflow & Design System]
