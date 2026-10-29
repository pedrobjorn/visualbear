<!--
/workflow/ - rendered through the mdpage filter.
# = hero (stays in the shell), ## = section, 1. = numbered timeline,
- = fact chips, > = pull quote.
AI-attribution (DR-0007): blocks marked [ai] were AI-drafted - chip shows
on localhost only; production strips it.
-->


## Why the bottleneck moved | The shift | shift

AI has removed the bar of entry for production: now the separation becomes intent, vision and decision making.

Understanding this, closing the gap means optimising the speed from learning-to-decision-to-delivery - which is done through a collection of skills and process that helps agents keep rigour and consistency along the way.

As designers, our skills have always been about empathising with people, identifying their needs, exploring solutions, and making sure these make it through to delivery, consistently. What's different today is that we have a tool that takes a lot of the hurdles off our plate: planning research, synthesising findings, manually building prototypes and mock-ups, handing over to developers, and testing outcomes.

> "Design is decision making. Decisions are spec."

So the workflow that grew out of this looks like:

- **Spec as core** - tickets, plans and decisions from meetings, written for humans but also detailed enough for agents, always including the *why*. Context and a paper trail.
- **Guardrails keep things consistent** - principles, copy guidelines, hooks, tokens and components are agent-readable, so whatever the workflow creates comes out repeatable and consistent.
- **Visual and measured validation** - not just verified through code reviews, but through visual quality gates the work has to actually pass.

[ai]

## One loop, seven stages | The workflow loop | loop

1. **Insights** - I pull PostHog analytics (trends, funnels, HogQL) and Notion research notes, and synthesise them into insight briefs with linked evidence. No evidence-free design decisions: every requirement either cites a source or is honestly tagged as an assumption with a plan to validate it.
2. **Spec** - Write the plan, break it into tickets, record the decisions. Tickets carry acceptance criteria an agent can verify without asking a human - states, sizes, token values, behaviours, exact copy.
3. **Build** - Agents implement from the tickets. The constraints live in the system itself (tokens, components, principles, hooks), and companion skills keep the engineering honest: test-driven development, systematic debugging.
4. **Prototype verify** - Live preview (Pantomime, Storybook, Playwright), screenshots of every state (default, empty, loading, error, edge cases, viewports), compared against Figma via MCP. Deltas get sorted into three buckets: intentional deviation, fix needed, acceptable as is.
5. **Review** - Seven machine-checkable gates, each marked PASS or FAIL with evidence in the report - never just "looks fine."
6. **Metrics** - Per ticket: spec→ship cycle time, rework count, % closed autonomously, blockers caught per gate. The workflow measures itself, and those numbers become portfolio evidence.

[ai]

> "The speed of decision making is invaluable."

## What holds it together | The consistency layer | system

| | |
| --- | --- |
| Design system + tokens | Colors, spacing, type, radii come from the system - never hard-coded |
| Design principles | Six checkable rules with a priority order for conflicts |
| Copy principles | Voice, tone by context, error-message formula, microcopy patterns |
| Hooks | Reusable interaction contracts (async action, destructive confirmation, empty state) referenced by name instead of re-described |

The key move: all of these are **machine-readable**. The design system isn't a PDF sitting in a folder - it's the agent's source of truth, applied in every spec, build, and review.

[ai]

## How I know it's done | Quality gates | gates

1. **Accessibility** - Contrast, keyboard, semantics, focus, reduced motion, touch targets.
2. **States** - Empty, loading, error, edge cases, success, destructive confirmation.
3. **Tokens & system compliance** - No hard-coded values, existing components, justified additions.
4. **Copy** - Voice, error formula (what happened + why + one action), no filler.
5. **Consistency** - Principles and hooks applied, conflicts resolved by priority order.
6. **Regressions** - Surrounding flows still pass captures, no scope creep.
7. **Engineering verification** - Test-driven implementation, root-cause fixes, verification commands actually run before any "done" claim.

If any gate hits a blocker, the work stops there. Accessibility blockers especially are never up for negotiation.

[ai]

## Conflicts resolve by rule, not taste | Design principles | principles

1. **Outcomes over outputs** - Evidence beats novelty; the boring solution that works wins.
2. **Accessibility makes everything better for everyone** - A11y shapes the defaults, it's not an end-gate fix.
3. **Performance is good design** - Fast > pretty-but-slow; big and optimized, never big and slow.
4. **Keep it stupid simple** - One primary action per view; no effect that isn't in the system.
5. **Big is beautiful** - Large type, generous whitespace, hero images, room to breathe.
6. **Playfully professional** - Round softness and playful color, contained by context: quiet in errors, forms, money, and destructive flows.

Reverse-engineering my own portfolio surfaced two more:

- **Attention** - direct the eye; exactly one primary action, a single focal point. A brand principle since 2015: *"attention, minimal, soft"*.
- **Real content, not placeholders** - design and verify with actual content at realistic lengths; lorem ipsum hides the problems that matter.

The 2015 brand principles map cleanly onto the 2026 set - *minimal* → keep it stupid simple, *soft* → playfully professional. Ten years of continuity, now encoded as machine-checkable contracts.

[ai]

## visuAIbear - the suite that systematises it | visuAIbear | visuaibear

Since the work version of this stack is proprietary, I built myself an independent, personal agentic design suite - visuAIbear - packaged as open Agent Skills that run in Mistral Code CLI, the VS Code extension, and Vibe Work.

| | |
| --- | --- |
| [visuaibear-core](https://github.com/pedrobjorn/visuaibear) | Hub: routing, principles, hooks, non-negotiables |
| [visuaibear-spec](https://github.com/pedrobjorn/visuaibear) | Plans, tickets, decision records - human+AI readable |
| [visuaibear-review](https://github.com/pedrobjorn/visuaibear) | 7 QA gates, pass/fail review reports |
| [visuaibear-prototype](https://github.com/pedrobjorn/visuaibear) | Live preview / capture / Figma-compare loop |
| [visuaibear-insights](https://github.com/pedrobjorn/visuaibear) | PostHog + Notion synthesis into evidence briefs |
| [visuaibear-metrics](https://github.com/pedrobjorn/visuaibear) | Cycle time, rework, autonomous closure tracking |

Five companion skills (external): [frontend-design, webapp-testing](https://github.com/anthropics/skills) and [test-driven-development, systematic-debugging, verification-before-completion](https://github.com/obra/superpowers). One simple rule keeps it all coherent: visuAIbear owns the methodology - no competing spec frameworks invited in.

The six non-negotiables: spec before build · evidence before opinion · rationale is written down · done is machine-checkable · nothing ships unseen · the workflow itself is measured.

> "Evidence should shape discovery, discovery should shape delivery."

[ai]

## What the workflow produces | Proof | proof

<div class="cs-frame">
    <span class="cs-frame-label"><strong>Proof pending</strong>first cohort of tickets in progress - median &amp; p90 spec→ship cycle time, rework rate, % closed autonomously, blockers caught per gate.</span>
</div>

This is the differentiator: not claims about being "AI-powered" - numbers about what the workflow actually produces.

[ai]
