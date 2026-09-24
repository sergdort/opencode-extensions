---
name: plan-feature
description: Use only when the user explicitly invokes $plan-feature. Clarify
  the outcome, constraints, and what would demonstrate success, then pick a
  useful next step. Planning only. Native Plan mode is optional
---
## Codex Invocation And Tools

Run this skill only on explicit user invocation. Treat the text supplied with the skill as its arguments. A single-plan command accepts at most one plan path or directory. Review accepts a plan path or directory and an optional Git range. Ask if the supplied input cannot be assigned unambiguously; reject unexpected extra inputs.

Use the installed `developer`, `developer_luna`, `oracle`, and `contrarian` roles when their stated purpose fits. Independent review is optional and based on uncertainty and impact. Use built-in `explorer` for discovery. Use the native subagent tools available in this session; select the named role on a supported isolated spawn and resume the same agent for corrections when available. Follow current tool schemas, not remembered parameter names. A missing role blocks only the dispatch that needs it.

Parent live permissions apply to spawned sessions. Agent sandbox defaults do not mechanically enforce Git boundaries. Repository and explicit user restrictions remain authoritative. Do not automatically invoke the next workflow skill; ask the user to invoke it.

Plan in the current main session. Native Plan mode is optional; this skill does not switch modes. Follow the active mode's restrictions and required response format. In any mode, do not implement product changes or delegate implementation during this skill.

Plan the current feature with the user. Planning only: do not implement product changes or dispatch Developers.

`user-supplied skill arguments`

## Resolve The Note

- If the argument names a Markdown file, require its basename to be `plan.md` and use it. If it names a directory, use `<directory>/plan.md`. With no argument, use `plan.md` in the current repository or working directory.
- If a non-empty argument does not resolve to an existing directory or valid `plan.md` path, report it and stop. Never silently fall back to another path.
- If the target exists, read it first and confirm it belongs to this feature. Preserve its approved material and real constraints; revise rather than restart.
- Respect native planning restrictions. If the active mode cannot write the target, keep the draft in the conversation and say where it belongs so `$start-work` can save it later.

## Plan Just Enough

Clarify with the user: the outcome they want, the constraints that bind the work, and what would demonstrate success. Inspect the repository before asking for facts it can answer. Ask focused questions only when the answer changes the outcome, a material constraint, or a real trade-off. Recommend an option when evidence supports it, and do not ask the user to choose private names, helper signatures, fixtures, or other local implementation details.

Then identify a useful next step, not a prescribed solution. Important uncertainties emerge when code is built and integrated, so do not prescribe a detailed decomposition or structure ahead of evidence, or require one by default; include design detail when it resolves a consequential question. Do not assign Developers or commit authority here.

Use `show-me` when a visual helps the user judge a meaningful choice. It is not required for every question, and durable facts belong in the text, not only in a diagram. Do not write visual artifacts when the active mode forbids them.

`grill-me-architecture` runs only when the user requests it. You may recommend it once for a specific decision that is expensive to reverse, then continue normal planning unless the user chooses it.

Ask `oracle` or `contrarian` for an independent read-only look only when the uncertainty or blast radius justifies it. No findings is a valid outcome.

## The Note

Write `plan.md` as a lightweight durable note in whatever shape fits: the outcome, constraints and decisions worth keeping, what would demonstrate success, a useful next step, and honest evidence or open questions. No template, tables, or identifiers are required. An outcome already agreed in the conversation can be enough; never retrofit metadata.

## Handoff

Present the outcome, constraints, success criteria, and next step, with material open questions. Then stop and wait for the execution command `$start-work`; a conversational approval alone does not begin implementation. On resume, the note plus the conversation is the context.
