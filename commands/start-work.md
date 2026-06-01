---
description: Implement an Architect work packet from decision.md and plan.md
agent: build
---
Implement the Architect work packet identified by these command arguments:

`$ARGUMENTS`

## Resolve The Work Packet

- Treat the argument as a handoff directory path, for example `handoffs/payments-refactor`.
- If the argument is a bare slug and `handoffs/<slug>` exists, use that directory.
- If no argument is provided, ask the user for the handoff directory before doing any work.
- Read `decision.md` and `plan.md` from the handoff directory before editing files.
- If either file is missing, stop and ask the user to provide the correct work packet.

## Plannotator Soft Gate

- Inspect the status line in `plan.md` before editing files.
- If the plan is clearly approved or reviewed, proceed.
- If the plan is draft, pending review, missing a status line, or otherwise unclear, warn the user that the plan does not appear approved.
- Do not edit product files after that warning unless the user confirms they want to proceed anyway.
- If the command arguments already include an explicit instruction to proceed despite a draft plan, report the caveat and continue.

## Implementation Rules

- Treat `decision.md` and `plan.md` as the source of truth.
- Implement only the approved scope from `plan.md`.
- Preserve architectural decisions from `decision.md` unless the user explicitly renegotiates them.
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
- The next command: `/review-work <handoff-dir>`
