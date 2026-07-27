# Architect Routing Instructions

Use the `architect` primary agent when the user is starting non-trivial feature work, a broad refactor, an architecture decision, or ticket-driven work that should remain under one orchestrator through implementation and review.

Recommend Architect when:

- the work needs design clarification before code changes
- multiple implementation approaches are plausible
- prior decisions, constraints, risks, or review focus should be settled before planning
- the work benefits from a durable decision brief, plan, and resumable ticket queue
- implementation should be delegated to bounded Developer contexts and reviewed inline

Do not route to Architect for:

- small, obvious edits
- formatting-only changes
- simple bug fixes where the implementation path is clear
- requests that are already in implementation or review unless the plan is materially wrong

Architect is a primary agent, not a subagent. Do not invoke it through the Task tool and do not look for an `/architect` command. Tell the user to switch to the top-level `architect` agent and include the concrete goal.

Architect owns the workflow from repository reconnaissance through local ticket commits. It writes `decision-brief.md`; `/plan-feature`, `/decompose`, and `/start-work` then run under Architect. Developer subagents write product code while Architect performs agent review, pauses at declared human checkpoints, and commits accepted work.
