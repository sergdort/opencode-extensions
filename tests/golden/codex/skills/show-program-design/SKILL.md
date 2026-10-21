---
name: show-program-design
description: Use only when the user explicitly invokes $show-program-design.
  Show the program design for agreed work with show-me so the approach,
  architecture, and key interfaces are aligned before building; design only
---
## Codex Invocation And Tools

Run this skill only on explicit user invocation. Treat the text supplied with the skill as its arguments. Delegate and show-program-design treat their arguments as notes on the work. Review accepts a plan path or directory and an optional Git range. Ask if the supplied input cannot be assigned unambiguously; reject unexpected extra inputs.

Use the installed `developer`, `developer_luna`, `oracle`, and `contrarian` roles when their stated purpose fits. Independent review is optional and based on uncertainty and impact. Use built-in `explorer` for discovery. Use the native subagent tools available in this session; select the named role on a supported isolated spawn and resume the same agent for corrections when available. Follow current tool schemas, not remembered parameter names. A missing role blocks only the dispatch that needs it.

Parent live permissions apply to spawned sessions. Agent sandbox defaults do not mechanically enforce Git boundaries. Repository and explicit user restrictions remain authoritative. Do not automatically invoke the next workflow skill; ask the user to invoke it.

Native Plan mode is optional; this skill does not switch modes. Follow the active mode's restrictions and required response format. In any mode, do not implement product changes or delegate implementation during this skill.

Show the program design for the work this conversation has been converging on, so the user can align on the approach, core architecture, and important interfaces before anything is built. Design only: do not implement product changes or dispatch Developers.

`user-supplied skill arguments`

## Build On What Is Known

Read the relevant conversation, prototypes, any notes the user points to, and the current code. Summarize the outcome, real constraints, and evidence already established. Do not restart requirements discovery or repeat answered questions. Inspect the repository before asking for facts it can answer. Ask focused questions only about gaps that change the outcome, a material constraint, or a consequential design choice.

## Make The Program Design Concrete

Load `show-me` and use it to explain the proposed program design. Show where the behavior belongs, how the relevant components interact, and how data or state moves. Use real paths, types, interfaces, or small code sketches where they help the user judge the design. Include only the detail needed for this work; no fixed set of diagrams or sections is required. Use inline sketches or diagrams when file writes are restricted. Do not write visual artifacts when the active mode forbids them.

Explain the important choices and their trade-offs. Recommend an approach from the available evidence; do not ask the user to choose private names, helper signatures, fixtures, or other local implementation details. A prototype may already contain the right design: identify what to keep and what needs refinement instead of inventing a replacement structure.

Separate observed behavior from assumptions that still need implementation evidence. The design is the current approach and can change as code is built and integrated; internal changes can proceed and be reported, while changes to product intent or consequential trade-offs return to the user. Identify a useful first step for implementation without requiring a task breakdown.

`grill-me-architecture` runs only when the user requests it. You may recommend it once for a specific decision that is expensive to reverse, then continue unless the user chooses it.

Ask `oracle` or `contrarian` for an independent read-only look only when the uncertainty or blast radius justifies it. No findings is a valid outcome.

## Handoff

Present the program design with its supporting visuals, important choices, assumptions, and first step. Discuss consequential feedback and revise the design in the conversation. Write a note to a file only when the user asks for one; keep it lightweight, with enough text to understand the design without its visuals, and no template or identifiers.

Then stop. Implementation starts only when the user asks for it, either directly or with `$delegate`.
