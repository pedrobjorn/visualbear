<!--
/teachr-agent/ - rendered through the mdpage filter. The hero and the
hero-meta block (logo, related link, summary) stay in the page shell.
## = section, 1. = numbered timeline, - = fact chips, > = pull quote,
[image: label | sub | tall] = image placeholder, [ai] = AI-drafted marker.
-->

## Outcomes & Impact | Outcomes & Impact | outcomes

[image: Outcomes & Impact | WIP - results pending]

## Process

1. **Identifying the issue**
2. **Discovery**
3. **Design**
4. **Delivery**

This case study ran on my AI workflow - spec first, agent-drafted, visually verified at every step. The full loop: [My Agentic Design Workflow](../workflow/).

[ai]

## Problem & Goal (Why!?) | Identifying the Issue | problem

Despite the quality of our Dashboard in providing insights for our users about the training of their students, we often found that users had questions they needed more interpretation and customisation for their circumstances.

This leads to users asking questions to our support team, which lead to support tasks creating specific explanations or reports for them.

Even if we answered 80% of their questions with our Dashboard, the remaining 20% of the questions took 80% of the work to solve.

The goal: leverage our internal knowledge of data and results we could already provide to answer more specific questions.

### Users and Needs

Our Dashboard users were digitally and data literate, but they were not power users.

This meant designing a Dashboard that focused on basic reporting with some advanced metrics and insights like training performance, demographic breakdowns, etc. Anything that helped them ensure training was done and students were learning.

However, it was common that a client would need a unique report. Often these were not necessary to evaluate training performance, but for internal reporting, namely compliance and internal goals.

These custom reports could be done by them through exports, but sometimes they wanted us to provide these numbers, since we were subject matter experts. This came at a cost however, and often we'd guide them how to do it themselves instead.

AI Support Chat was already helping a lot, but still some cases needed to be handled by us.

## Research

We evaluated the most common types of custom reports through support tickets and talking to users.

## Discovery & Validation | Discovery | discovery

Some ideas ranged from custom reporting to just building the reports into the dashboard.

But both of these were a lot of effort and would not scale. Custom reporting would require more user mastery, and more complexity. More reporting would mean metrics for very unique needs, with little impact.

We needed something that could interpret data, make basic transformations on the fly, and be easy to use.

This is where an AI Agent became the obvious answer, capable of addressing any gaps we couldn't reliably cover in the dashboard.

The first step was creating a quick MVP we could test and learn with.

When building embedded AI agents one must also gather usage insights to calibrate the system, which in turn improves the service.

This also means not relying on the agent to do everything, but instead to orchestrate different services.

[image: Agent flow | Diagram pending]

Evals and calibration will help improve the agent's capabilities, while usage behaviour will also give us insights into UX improvements for the feature - although a lot of functionality is already established, like rating, replying, quick actions, editing, stopping processing, etc.

[image: Evals cycle | Diagram pending]

The other layer was to manage the credits and embed it into the payment plans. We did this by giving everyone a budget they could "top up" on top of the base usage.

## Design & Delivery

The design was two parts: the initial chat as a landing page, serving as a portal into other posts as recommendations.

[image: Agent view | Designs pending]

The other service was a drawer available in any view, able to work within the context. It also enabled selecting most elements on the view to gain context for the agent.

The emphasis when designing this feature is a) trust, b) clarity of options and c) consistency.

## Conclusion & Lessons learned | Conclusion | conclusion

[image: Conclusion & Lessons learned | WIP - pending]
