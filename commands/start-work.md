---
description: Implement work from a Plannotator-reviewed plan.md
agent: build
---
Implement the work described by the plan identified by these command arguments:

`$ARGUMENTS`

## Resolve The Plan

- If the argument names a Markdown file, use that file as the plan path.
- If the argument names a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- Read the resolved `plan.md` before editing files.
- If `plan.md` is missing, warn that `/plan-feature` must create the implementation plan first and stop.

## Implementation Rules

- Treat `plan.md` as the source of truth.
- Implement only the scope from `plan.md`.
- Preserve the constraints, ownership boundaries, execution sketch, call flow, and behavioral contract in `plan.md` unless the user explicitly renegotiates them.
- Prefer implementing scenario by scenario when `plan.md` includes Gherkin scenarios.
- If repository reality conflicts with the plan, stop and explain the conflict before changing direction.
- If the user approves a necessary deviation, update `plan.md` to record it.
- Do not expand scope just because nearby improvements are visible.
- Do not stage, commit, or push unless the user explicitly asks.

## Verification

- Run the verification listed in `plan.md` whenever feasible.
- Also run obvious repo-specific checks when they are discoverable from package scripts, READMEs, CI config, or project conventions.
- If a check cannot be run, explain why and what remains unverified.

## Final Response

Report:

- Files changed
- Any deviations from the plan
- Verification commands and results
- Remaining risks or follow-ups
- The next command: `/review-work` or `/review-work <plan-path>` if a non-default plan path was used
