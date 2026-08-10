# Architect Routing Instructions

Use the `architect` primary agent when the user starts non-trivial feature work, a broad refactor, or an architecture decision that needs one orchestrator through implementation, review, and QA.

Recommend Architect when:

- The work needs design clarification before code changes.
- Multiple implementation approaches are plausible.
- Product intent, hard constraints, risks, or review focus should be settled before planning.
- The work benefits from a durable decision brief and working plan.
- Architect should choose Terra or Luna dynamically for coherent implementation phases.

Do not route to Architect for:

- Small, obvious edits.
- Formatting-only changes.
- Simple bug fixes with a clear implementation path.
- Requests already in implementation or review unless the direction is materially wrong.

Architect is a primary agent, not a subagent. Do not invoke Architect through the Task tool and do not look for an `/architect` command. Tell the user to switch to the top-level `architect` agent and include the concrete goal.

Architect owns the workflow from repository reconnaissance through local commits. Architect writes `decision-brief.md`; `/plan-feature` creates the working `plan.md`; `/start-work` selects coherent phases, routes Developer subagents just in time, integrates their work, and runs final review and QA. No decomposition or ticket queue is required.
