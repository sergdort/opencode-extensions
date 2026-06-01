# Architect Routing Instructions

Use the `architect` primary agent when the user is starting non-trivial feature work, a broad refactor, an architecture decision, or a change where the approach should be settled before implementation.

Recommend Architect when:

- the work needs design clarification before code changes
- multiple implementation approaches are plausible
- prior decisions, constraints, risks, or review focus should be captured for later agents
- the user wants a durable work packet with `decision.md` and `plan.md`
- implementation should be handed to build/review agents after alignment

Do not route to Architect for:

- small, obvious edits
- formatting-only changes
- simple bug fixes where the implementation path is clear
- requests that are already in implementation or review unless the plan is materially wrong

Architect is a primary agent, not a subagent. Do not invoke it through the Task tool. If Architect is the right next step, tell the user to switch to or start the `architect` agent and include the concrete goal to bring there.

Treat Architect's artifacts as workflow handoffs, not committed project documentation, unless the user explicitly says otherwise.
