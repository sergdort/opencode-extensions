---
name: plan-feature
description: Use only when the user explicitly invokes $plan-feature. Develop a
  program design as Architect from the conversation, prototypes, and code using
  show-me. Planning only. Native Plan mode is optional
---
## Codex Invocation And Tools

Run this skill only on explicit user invocation. Treat the text supplied with the skill as its arguments. A single-plan command accepts at most one plan path or directory. Review accepts a plan path or directory and an optional Git range. Ask if the supplied input cannot be assigned unambiguously; reject unexpected extra inputs.

Use the installed `developer`, `developer_luna`, `oracle`, and `contrarian` roles when their stated purpose fits. Independent review is optional and based on uncertainty and impact. Use built-in `explorer` for discovery. Use the native subagent tools available in this session; select the named role on a supported isolated spawn and resume the same agent for corrections when available. Follow current tool schemas, not remembered parameter names. A missing role blocks only the dispatch that needs it.

Parent live permissions apply to spawned sessions. Agent sandbox defaults do not mechanically enforce Git boundaries. Repository and explicit user restrictions remain authoritative. Do not automatically invoke the next workflow skill; ask the user to invoke it.

Act as Architect in this main session for program design. No separate role skill is required. Native Plan mode is optional; this skill does not switch modes. Follow the active mode's restrictions and required response format. In any mode, do not implement product changes or delegate implementation during this skill.

Act as Architect and turn what the conversation, prototypes, and current code have established into a concrete program design. Planning only: do not implement product changes or dispatch Developers.

`user-supplied skill arguments`

## Resolve The Note

- If the argument names a Markdown file, require its basename to be `plan.md` and use it. If it names a directory, use `<directory>/plan.md`. With no argument, use `plan.md` in the current repository or working directory.
- If a non-empty argument does not resolve to an existing directory or valid `plan.md` path, report it and stop. Never silently fall back to another path.
- If the target exists, read it first and confirm it belongs to this feature. Preserve its approved material and real constraints; revise rather than restart.
- Respect native planning restrictions. If the active mode cannot write the target, keep the draft in the conversation and say where it belongs so `$start-work` can save it later.

## Build On What Is Known

Read the relevant conversation, existing plan, prototypes, and current code. Summarize the outcome, real constraints, and evidence already established. Do not restart requirements discovery or repeat answered questions. Inspect the repository before asking for facts it can answer. Ask focused questions only about gaps that change the outcome, a material constraint, or a consequential design choice.

## Make The Program Design Concrete

Load `show-me` and use it to explain the proposed program design. Show where the behavior belongs, how the relevant components interact, and how data or state moves. Use real paths, types, interfaces, or small code sketches where they help the user judge the design. Include only the detail needed for this feature; no fixed set of diagrams or sections is required. Use inline sketches or diagrams when file writes are restricted. Do not write visual artifacts when the active mode forbids them.

Explain the important choices and their trade-offs. Recommend an approach from the available evidence; do not ask the user to choose private names, helper signatures, fixtures, or other local implementation details. A prototype may already contain the right design: identify what to keep and what needs refinement instead of inventing a replacement structure.

Separate observed behavior from assumptions that still need implementation evidence. The design is the current approach and can change as code is built and integrated. During implementation, internal changes can proceed and be reported; changes to product intent or consequential trade-offs return to the user. Identify a useful next step for implementation without requiring a task breakdown. Do not assign Developers or commit authority here.

`grill-me-architecture` runs only when the user requests it. You may recommend it once for a specific decision that is expensive to reverse, then continue normal planning unless the user chooses it.

Ask `oracle` or `contrarian` for an independent read-only look only when the uncertainty or blast radius justifies it. No findings is a valid outcome.

## The Note

Write `plan.md` as a lightweight durable note in whatever shape fits: the outcome, constraints, proposed program design and its rationale, what would demonstrate success, a useful next step, and honest evidence or open questions. Keep enough text to understand the design without its visual artifacts. No template, tables, or identifiers are required; never retrofit metadata.

## Handoff

Present the program design with its supporting visuals, important choices, assumptions, and next step. Discuss consequential feedback and revise the same note. Then stop and wait for the execution command `$start-work`; a conversational approval alone does not begin implementation. On resume, the note plus the conversation is the context.
