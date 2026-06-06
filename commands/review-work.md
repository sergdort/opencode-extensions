---
description: Review implemented work against plan.md
agent: review
---
Review the current implementation against the plan identified by these command arguments:

`$ARGUMENTS`

## Resolve The Plan

- If the argument names a Markdown file, use that file as the plan path.
- If the argument names a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- Read the resolved `plan.md` before judging the implementation.
- If `plan.md` is missing, warn that `/plan-feature` must create the implementation plan first and stop.

## Review Scope

- Review the current diff and relevant touched files.
- Compare the implementation to `plan.md`.
- Flag deviations from the goal, constraints, execution sketch, call flow, work steps, behavioral contract, and verification plan.
- Flag implementation defects, regressions, missing tests, and missing verification.
- Distinguish code problems from plan problems.
- If the diff includes unrelated changes, call them out separately instead of treating them as part of the planned work.
- Stay read-only. Do not edit files, stage changes, commit, or push.

## Findings Format

Put findings first, ordered by severity.

For each finding, include:

- Severity
- File and line reference when available
- The violated plan step, expected behavior, or verification requirement
- Why it matters
- A concrete fix or follow-up

If there are no findings, say that explicitly and mention any residual verification gaps.

## Final Response

Keep the response concise. Do not restate the whole plan. Focus on risks the implementer should act on before the work is considered complete.
