---
description: Have Architect implement plan.md through dynamic Developer delegation, then run final review and QA
agent: architect
---
Drive the implementation from the working plan through final review and QA.

`$ARGUMENTS`

You remain Architect. Developer subagents write product code. You choose the next coherent phase, select the Developer just in time, inspect integration, direct corrections, create useful local milestone commits, and remain accountable for the complete result.

## Resolve The Plan

- If the argument names a Markdown file, require its basename to be `plan.md` and use it.
- If the argument names a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- If any non-empty argument does not resolve to an existing directory or valid `plan.md`, report it and stop. Do not fall back to another plan.
- Require the resolved plan to exist. If missing, report the expected path and tell the user to run `/plan-feature`.
- Require `decision-brief.md` next to the plan. If missing, stop and tell the user to complete Architect's grilling before using this workflow.
- Do not look for or require tickets, decomposition output, handoffs, or another status ledger.

## Establish Current State

1. Read the decision brief and plan.
2. Inspect `git status`, the complete current diff, untracked files, recent commits, and relevant implemented behavior.
3. Classify each dirty path as feature-owned or unrelated. Treat a path with mixed or unclear ownership as ambiguous and ask the user before dispatching work that could modify it. A dirty tree is normal; feature-owned changes stay uncommitted between phases by design.
4. Handle unrelated uncommitted work before implementation starts. List the paths and ask the user to either stash it, or commit it when that code must be present while the feature is built. Do not stash or commit it yourself. If the user chooses neither, continue, but state plainly that Developers can overwrite uncommitted content and that this workflow detects such a change rather than preventing or restoring it.
5. Validate the plan's internal references. Every component named in the phases table must exist in the architecture table, and every behavior ID must exist in the test strategy. Report an unresolved reference and stop; send the user back to `/plan-feature`.
6. Resolve the review baseline. Treat `unset`, an empty value, or an unreplaced placeholder as not yet resolved. If the field holds a SHA, verify that the commit exists in this repository and is an ancestor of `HEAD`, then keep it. Never reset a valid baseline. Report a baseline that is missing from the repository or is not an ancestor, and ask the user rather than silently replacing it. When it is not yet resolved, resolve it once and write it: use current `HEAD` when no feature implementation commit exists, or the parent of the earliest feature commit when implementation already has commits. Ask the user for a base only when Git history leaves the boundary ambiguous.
7. Establish the regression baseline. Treat `unset`, an empty value, or an unreplaced placeholder as not yet resolved, and keep any resolved value without re-deriving it. To resolve it, the gate must describe the repository at the review baseline, not the current feature work:
   - When the baseline is current `HEAD` and no feature change is present, run the plan's `Regression gate` commands now and record the failing checks, or `none`.
   - When feature commits or dirty feature changes already exist, do not record current failures as baseline failures. Evaluate the gate at the baseline commit in a separate checkout or worktree when that is safe and cheap. Otherwise ask the user which checks were already failing before the feature started, and record that answer.
   - Write the result into `Known gate failures at baseline`. A failure recorded here is not the feature's responsibility. Any other failure is.
8. Reconstruct existing progress from code, tests, Git history, and the plan. Do not rely on stale checkboxes or repeat completed work.

A clean worktree is not required. Clear ownership is required.

Writing `Review baseline` and `Known gate failures at baseline` are the only planning-artifact edits this command makes before implementation starts. Both are written once and never reset.

## Implementation Loop

Continue until the required behavior works, a valid user decision is needed, or a non-retryable technical blocker remains after a credible alternate path.

1. Select the next coherent phase from the plan and current repository evidence. Do not pre-cut the remaining plan into tasks.
2. Prefer a phase that produces runnable behavior, resolves a risky technical assumption, or removes the next integration blocker. Keep each phase the smallest coherent slice a reviewer can judge in one sitting. Split a phase that is clearly growing past that; roughly 100 to 200 hand-written changed lines is a useful heuristic, not a limit.
3. Choose `developer-luna` only when behavior, ownership, scope, and verification are all bounded and predictable. Use `developer` for uncertain, cross-layer, stateful, lifecycle-sensitive, debugging-heavy, broad, or weakly verified work.
4. Snapshot `git status --short` before dispatch. Do not dispatch work that can plausibly overlap a user-owned dirty path without prior user approval. Do not copy, back up, stash, or relocate user content to protect it; the user already chose how to handle unrelated work.
5. Dispatch a fresh Task to the selected Developer. Pass the plan path, decision-brief path, and a concise phase brief containing:
   - Phase objective and required behavior, with the plan's behavior IDs.
   - **The architecture slice**: the plan's rows for every component this phase touches, including `Owns`, `Does not own`, and `May depend on`; the settled interfaces it must honor; and the transition owner, effects, and cancellations when the phase touches a state machine. Copy these rules into the brief instead of only naming the plan, and mark which interfaces are provisional.
   - Settled constraints and explicit non-goals.
   - Likely starting paths or symbols.
   - Expected focused proof, plus the specific checks this phase must keep green: its own proof and the proofs established by earlier accepted phases. Name the commands. Do not require the full regression gate unless this phase ends at a milestone commit.
   - Known active worktree context that must be preserved.
6. After the Developer returns, inspect `git status`, the complete diff, and untracked files. Compare every path with the pre-dispatch snapshot. Stop immediately if the Developer changed a user-owned path or if ownership became unclear, and report the exact paths so the user can recover the content themselves.
7. Process the verdict:
   - `DONE`: accept the verdict only when the phase objective is complete, no known phase defect remains, and its required focused proof passed. Then run the integration check.
   - `INCOMPLETE`: inspect the failure class, retryability, worktree disposition, and next action. Continue with a corrected brief, changed strategy, or different tool path when retryable. When a non-retryable technical or environment blocker remains after a credible alternate path, stop and report the evidence without inventing a product decision.
   - `NEEDS_TERRA`: inspect which partial changes are valid, then dispatch `developer` directly with the same objective and new evidence. Do not return to planning.
   - `NEEDS_DECISION`: require one exact decision question, then classify it.
     - A settled architecture rule the phase cannot meet, or a material change to a component with no architecture row: judge the evidence. When it is sound and the change stays internal and reversible, update `plan.md` yourself and redispatch with the corrected architecture slice. When the change touches product behavior or a hard-to-reverse boundary, ask the user. When the evidence does not hold, send a correction brief that restates the rule. Never redispatch an unchanged brief against a rule the Developer just reported as blocking.
     - A product conflict, hard-to-reverse decision, material scope change, or safety risk: ask the user.
     - Anything else: return a direct implementation brief to the appropriate Developer.
8. If the result is incomplete or incorrect, send a concise correction brief. Name the observed failure, expected behavior, relevant paths, evidence to preserve, and required proof. Do not impose a fixed correction-round limit.
9. If two attempts fail for the same reason, change the strategy. Reinspect the code, switch from Luna to Terra, or use Oracle for a risky technical judgment. Do not repeat an unchanged prompt or tool action.
10. Create a local commit when the integrated changes form a useful rollback point. Do not commit every dispatch by default.
11. Select the next phase using what the implementation taught you.

Do not implement rejected or missing product code yourself. Do not require the user to approve ordinary implementation corrections or provisional adaptations.

## Integration Check

After each `DONE` result, check:

- Required behavior moved forward.
- Focused build or test evidence is credible.
- **Architecture conformance**: the diff respects the ownership, non-ownership, and allowed-dependency rules for every component it touched, and honors the settled interfaces, transition owner, and cancellations. A component that quietly grew its job, a dependency that is not on its allowlist, or a second writer to an owned state machine is a finding, not an adaptation.
- Reported adaptations are limited to provisional items. A changed settled rule needs the plan updated first.
- The implementation is coherent enough for the next phase.
- Unrelated worktree changes remain untouched.

Inspect the diff for these rules. Do not accept a Developer's conformance claim without checking the paths it names.

This is not full code review. Do not apply the final review rubric or pause for human approval after every phase.

## Regression Cadence

- After each phase: its focused proof, plus the proofs established by earlier accepted phases. The full regression gate is not required here.
- At each milestone commit: the affected module or target suite.
- At final review: the full `Regression gate` plus planned runtime QA.

A check that passed in an earlier phase and fails now is a regression and blocks acceptance, unless it is listed in the plan's `Known gate failures at baseline`.

## Human Checkpoints

Pause for the user at a phase whose plan `Checkpoint` is `human`. The first runnable phase is a human checkpoint by default. Add one for any phase crossing a security, persistence, migration, public API, or other hard-to-reverse boundary.

At a checkpoint, present the behavior now working, the diff summary, conformance result, verification output, and remaining manual checks. Leave the relevant changes uncommitted until the user approves them, then create the next milestone commit. On resume, an uncommitted checkpoint is pending unless the user confirms prior approval; a following milestone commit is evidence that the checkpoint completed.

## Updating The Plan

Update `plan.md` when implementation evidence changes a settled rule: component ownership, allowed dependencies, a settled interface, transition authority, effects or cancellation, or the test strategy. Update it before dispatching any later phase that depends on the change, so the next phase brief carries correct rules.

Do not update the plan for a provisional adaptation such as a private helper signature, an internal name, or a file location inside an already chosen module. Record those in the final report instead.

Correcting or deleting an explanatory diagram that became inaccurate is housekeeping. Do it whenever you notice it, and do not treat it as a program-design change.

Never edit the `Review baseline` field after it is set.

## Milestone Commits

- Before committing, inspect the complete diff and stage only integrated feature-owned changes.
- Inspect the staged diff before each commit.
- Use concise commit messages that describe behavior. Do not add ticket or workflow trailers.
- Keep related phases in one commit when separation adds no rollback or review value.
- Never push, amend, rewrite history, or include unrelated worktree changes.

## Final Review And QA

Begin full review only after the required feature behavior works well enough to evaluate as a whole.

1. Review all feature changes from the plan's `Review baseline` SHA through current `HEAD`, plus current tracked and untracked feature changes. Exclude unrelated work explicitly.
2. Compare the implementation with the decision brief and plan. Treat provisional details as guidance. Treat the architecture table, settled interfaces, and state ownership as rules the implementation must meet or the plan must have been updated to change.
3. Review correctness, regressions, maintainability, ownership, change locality, test quality, and material deviations from settled decisions.
   - Confirm every behavior ID in the test strategy has the proof its `Mode` requires, including fail-before evidence for `test-first` rows and bug fixes, or a recorded reason why that evidence was not practical.
4. Use the independent `review` agent when available. Give it the plan path, comparison range, current changes, and review focus. Keep it read-only.
5. Run the full relevant build and test suite. Run planned simulator, browser, device, migration, accessibility, performance, or operational QA where applicable.
6. Put review and QA findings in priority order. Dispatch direct fix briefs to Luna for bounded fixes or Terra for uncertain and cross-layer fixes.
7. Repeat the relevant review and QA checks after fixes. Do not create tickets for findings.
8. Pause for final human acceptance. Present working behavior, review findings resolved, verification results, remaining manual checks, comparison range, and known risks.
9. Commit accepted remaining changes at coherent boundaries. Never push.

## Interruption And Resume

A fresh or compacted Architect reconstructs progress from `decision-brief.md`, `plan.md`, Git history, the working tree, tests, and runtime evidence. Do not create a second progress ledger.

The plan's `Review baseline` field survives compaction. Read it instead of re-deriving the comparison range. Ask the user for a base only when the field is absent and Git history does not make the boundary clear.

## Final Response

Report:

- Coherent phases completed and Developer route used.
- Architecture changes: settled rules updated in the plan, and provisional adaptations accepted without a plan change.
- Behavior IDs proven, and any left unproven.
- Milestone and final commit hashes.
- Build, test, runtime, regression gate, review, and QA results.
- Final comparison range, starting from the plan's `Review baseline`.
- Remaining risks and manual checks.
- Whether final human acceptance is complete or pending.
