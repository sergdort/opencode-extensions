---
description: Review implemented work against an Architect decision and plan
agent: review
---
Review the current implementation against the Architect work packet identified by these command arguments:

`$ARGUMENTS`

## Resolve The Work Packet

- Treat the argument as a handoff directory path, for example `handoffs/payments-refactor`.
- If the argument is a bare slug and `handoffs/<slug>` exists, use that directory.
- If no argument is provided, ask the user for the handoff directory before reviewing.
- Read `decision.md` and `plan.md` from the handoff directory before judging the implementation.
- If either file is missing, stop and ask the user to provide the correct work packet.

## Review Scope

- Review the current diff and relevant touched files.
- Compare the implementation to `decision.md` and `plan.md`.
- Flag deviations from the agreed architecture.
- Flag implementation defects, regressions, missing tests, and missing verification.
- Distinguish code problems from plan problems.
- If the diff includes unrelated changes, call them out separately instead of treating them as part of the work packet.
- Stay read-only. Do not edit files, stage changes, commit, or push.

## Findings Format

Put findings first, ordered by severity.

For each finding, include:

- Severity
- File and line reference when available
- The violated decision, plan step, or expected behavior
- Why it matters
- A concrete fix or follow-up

If there are no findings, say that explicitly and mention any residual verification gaps.

## Final Response

Keep the response concise. Do not restate the whole plan. Focus on risks the implementer should act on before the work is considered complete.
