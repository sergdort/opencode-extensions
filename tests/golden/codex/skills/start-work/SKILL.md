---
name: start-work
description: Use only when the user explicitly invokes $start-work. Have
  Architect implement plan.md through dynamic Developer delegation, then run
  final review and QA
---
## Codex Invocation And Tools

Run this skill only on explicit user invocation. Treat the text supplied with the skill as its arguments. A single-plan command accepts at most one plan path or directory. Review accepts a plan path or directory and an optional Git range. Ask if the supplied input cannot be assigned unambiguously; reject unexpected extra inputs.

Use the installed `developer`, `developer_luna`, `oracle`, and `contrarian` roles for their stated purposes. Use built-in `explorer` for discovery. Use the native subagent tools available in this session; select the named role on a supported isolated spawn and resume the same agent for corrections when available. Follow current tool schemas, not remembered parameter names. A missing required role blocks its stage. Optional repository verifier or independent review tools remain optional.

Parent live permissions apply to spawned sessions. Agent sandbox defaults do not mechanically enforce Git boundaries. Repository and explicit user restrictions remain authoritative. Do not automatically invoke the next workflow skill; ask the user to invoke it.

Drive the implementation from the working plan through final review and QA.

`user-supplied skill arguments`

You remain Architect. Developers implement, verify, and submit local task commits. You review each submission, direct corrections, and remain accountable through final human acceptance. A commit is a submission, not acceptance.

## Resolve The Plan

- If the argument names a Markdown file, require its basename to be `plan.md` and use it.
- If the argument names a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- If any non-empty argument does not resolve to an existing directory or valid `plan.md`, report it and stop. Do not fall back to another plan.
- Require the resolved plan to exist. If missing, report the expected path and tell the user to run `$plan-feature`.
- Require `decision-brief.md` next to the plan. If missing, stop and tell the user to complete Architect's grilling before using this workflow.
- Do not look for or require tickets, decomposition output, handoffs, or another status ledger.

## Establish Current State

1. Read the decision brief and plan.
2. Inspect `git status`, the complete current diff, untracked files, recent commits, and relevant implemented behavior.
3. Classify existing changes as workflow-owned, user-owned, or unrelated, including staged and untracked content. Ask only when ownership is unclear or the next task must overlap protected content. Do not require a clean tree or ask the user to stash unrelated work.
4. Confirm authority. This invocation approves the current plan only when material changes have already been disclosed. Surface undisclosed changes and obtain confirmation before implementation. Resolve blocking seams first. Require Oracle evidence for the current design; reuse it unless behavior, ownership, contracts, state rules, or proof strategy changed materially. If missing or invalidated, obtain Oracle review, record it, and obtain confirmation for any resulting material changes before proceeding. Repository and explicit user restrictions still apply to commits and runtime actions.
5. Validate the plan's internal references. Every phase component must exist in the architecture table, and every behavior ID in the test strategy. Correct an invalid existing plan with the user as Architect, then resume. Do not send the user to the creation-only `$plan-feature` command.
6. Resolve the review baseline. Treat `unset`, an empty value, or an unreplaced placeholder as not yet resolved. If the field holds a SHA, verify that the commit exists in this repository and is an ancestor of `HEAD`, then keep it. Never reset a valid baseline. Report a baseline that is missing from the repository or is not an ancestor, and ask the user rather than silently replacing it. When it is not yet resolved, resolve it once and write it: use current `HEAD` when no feature implementation commit exists, or the parent of the earliest feature commit when implementation already has commits. Ask the user for a base only when Git history leaves the boundary ambiguous.
7. Do not run the full gate merely to establish a baseline. Reuse credible evidence tied to the starting commit and relevant configuration. When a failure's origin is uncertain, run that specific check at the review baseline in an isolated checkout when safe. Otherwise report the origin as unclassified. Record exact failure signatures and evidence, not suite-wide exemptions. User recollections are attributed reports, not executed checks. Keep `unset` when no baseline evidence exists; use `none` only when evidence supports it. A new, worsened, or reintroduced failure blocks acceptance even if its check previously failed.
8. Reconstruct progress from code, tests, Git history, and the plan's compact `Evidence` section. Verify recorded ranges against the current code. Do not treat a commit or an old acceptance row as proof that reverted behavior is still present.

A clean worktree is not required. Clear ownership is required.

Keep the review baseline immutable once resolved. Add baseline failure evidence as it becomes available; never overwrite conflicting evidence silently.

## Implementation Loop

Continue until the required behavior works, a valid user decision is needed, or a non-retryable technical blocker remains after a credible alternate path.

1. Select the next coherent phase from the plan and current repository evidence. Do not pre-cut the remaining plan into tasks.
2. Select one coherent, verifiable task that advances runnable behavior or resolves a risky assumption. Size by responsibility and credible proof, not a changed-line budget.
3. Choose `developer_luna` only when behavior, ownership, scope, and verification are all bounded and predictable. Use `developer` for uncertain, cross-layer, stateful, lifecycle-sensitive, debugging-heavy, broad, or weakly verified work.
4. Record starting `HEAD`, protected worktree content identities, and protected index entries (object IDs, modes, and stages). Include untracked content and symlink targets where applicable. Status alone cannot detect overwrites. Pass the protection record to the Developer. Do not make protective backups, stashes, or automatic restorations.
5. Run one Developer task at a time. Serialize code changes, builds, tests, and simulator operations. Independent read-only research and reviews may run concurrently. Start a fresh Developer for a new independent task; resume the same Developer for corrections when available. Pass the plan path, decision-brief path, and a concise brief containing:
   - Phase objective and required behavior, with the plan's behavior IDs.
   - **The architecture slice**: the plan's rows for every component this phase touches, including `Owns`, `Does not own`, and `May depend on`; the settled interfaces it must honor; and the transition owner, effects, and cancellations when the phase touches a state machine. Copy these rules into the brief instead of only naming the plan, and mark which interfaces are provisional.
   - Settled constraints and explicit non-goals.
   - Likely starting paths or symbols.
   - Expected focused proof and affected earlier checks, with commands. Reuse evidence whose relevant source, configuration, dependencies, and environment are unchanged. Do not assign the final full gate to the Developer.
   - Workflow-owned changes the task may correct, protected worktree and index content, and local task-commit authority subject to repository policy.
6. After return, inspect every submitted commit from starting `HEAD`, plus remaining tracked and untracked changes. Compare protected content and index entries with the protection record. Stop on unexpected changes or unclear ownership. Report affected paths without automatically restoring, unstaging, stashing, or resetting anything.
7. Process the verdict:
   - `DONE`: treat the result as submitted. Run the submission review before accepting it.
   - `INCOMPLETE`: inspect the failure class, retryability, worktree disposition, and next action. Continue with a corrected brief, changed strategy, or different tool path when retryable. When a non-retryable technical or environment blocker remains after a credible alternate path, stop and report the evidence without inventing a product decision.
   - `NEEDS_TERRA`: inspect which partial changes are valid, then dispatch `developer` directly with the same objective and new evidence. Do not return to planning.
   - `NEEDS_DECISION`: require one exact decision question, then classify it.
     - A settled architecture rule the phase cannot meet, or a material change to a component with no architecture row: judge the evidence. When it is sound and the change stays internal and reversible, update `plan.md` yourself and redispatch with the corrected architecture slice. When the change touches product behavior or a hard-to-reverse boundary, ask the user. When the evidence does not hold, send a correction brief that restates the rule. Never redispatch an unchanged brief against a rule the Developer just reported as blocking.
     - A product conflict, hard-to-reverse decision, material scope change, or safety risk: ask the user.
     - Anything else: return a direct implementation brief to the appropriate Developer.
8. If the result is incomplete or incorrect, resume the same Developer with a concise correction brief. Name the failure, expected behavior, paths, evidence to preserve, and required proof. Corrections produce new commits, never amendments. If the prior Developer is unavailable or the route changes, give a fresh Developer the submission range and relevant evidence. Do not impose a fixed correction-round limit.
9. If two attempts fail for the same reason, change the strategy. Reinspect the code, switch from the bounded to the complex Developer, or use Oracle for a risky technical judgment. Do not repeat an unchanged prompt or tool action.
10. Record the accepted commit range and proof in `plan.md`. A failed or incomplete dispatch does not need a commit. Architect never stages or commits product changes.
11. Select the next phase using what the implementation taught you.

Do not implement rejected or missing product code yourself. Do not require the user to approve ordinary implementation corrections or provisional adaptations.

## Submission Review

After each `DONE` result, check:

- Correctness, regressions, maintainability, and required behavior.
- Test quality and focused proof, including required fail-before evidence or its practical limitation.
- **Architecture conformance**: the diff respects the ownership, non-ownership, and allowed-dependency rules for every component it touched, and honors the settled interfaces, transition owner, and cancellations. A component that quietly grew its job, a dependency that is not on its allowlist, or a second writer to an owned state machine is a finding, not an adaptation.
- Reported adaptations are limited to provisional items. A changed settled rule needs the plan updated first.
- The implementation is coherent enough for the next phase.
- Protected worktree and staged content remain untouched; every submitted commit contains only task-owned changes and no secrets.

Inspect the diff for these rules. Do not accept a Developer's conformance claim without checking the paths it names.

Review the complete initial task submission. Review correction commits incrementally with enough surrounding context to judge the fix. Reject unresolved defects before dependent work proceeds. Record acceptance separately from the Developer's `DONE` verdict.

## Regression Cadence

- Developer: task-focused proof and affected earlier checks. Broaden to a module suite when the change justifies it.
- Architect: final combined review, then one full `Regression gate`, delegated to the repository verifier when available, followed by relevant runtime QA.
- Reuse valid evidence instead of repeating checks at each handoff. Repeat a check when changed inputs invalidate its evidence or a demonstrated concurrency or hang risk requires repetition. Record the reason.

A check that passed earlier and fails now blocks acceptance. Baseline exemptions cover only matching pre-existing failure signatures, not new failures in the same suite.

## Human Involvement

Run the phase loop to completion without asking the user to review partial work. Do not pause to show a diff, a working slice, or an intermediate result for approval. The user reviews the feature once, at final acceptance.

Ask the user only when the loop cannot proceed correctly on its own:

- A `NEEDS_DECISION` result about product behavior or a hard-to-reverse boundary.
- Ambiguous ownership, required overlap with protected content, or a protection failure.
- A missing or unusable `Review baseline`.
- Evidence that the plan's product intent is wrong, not merely its program design.

These are blocking questions, not reviews. Keep each one short and specific. Do not attach a progress report to them. When the conflict concerns structure, flow, or state, show it as one compact shape — a `diff`, call stack, or table — directly before the question.

## Updating The Plan

Update `plan.md` when implementation evidence changes a settled rule: component ownership, allowed dependencies, a settled interface, transition authority, effects or cancellation, or the test strategy. Update it before dispatching any later phase that depends on the change, so the next phase brief carries correct rules.

Renew Oracle review for materially changed design or proof strategy, not evidence rows, baseline metadata, or local provisional adaptations. Disclose material changes. Obtain user confirmation for changed product intent, scope, or hard-to-reverse decisions before dependent implementation.

Do not update the plan for a provisional adaptation such as a private helper signature, an internal name, or a file location inside an already chosen module. Record those in the final report instead.

Correcting or deleting an explanatory diagram that became inaccurate is housekeeping. Do it whenever you notice it, and do not treat it as a program-design change.

Never edit the `Review baseline` field after it is set.

## Local Submissions

- Developers own local task commits after focused proof. A coherent task may need more than one commit; a tool dispatch is not a commit boundary.
- Include task-owned code and tests only. Leave planning artifacts under Architect's ownership unless explicitly requested otherwise.
- Preserve unrelated staged entries. With disjoint task-owned paths, a path-limited `git commit --only -- <paths>` can exclude unrelated staged work. New task files must first be added. Inspect the complete proposed commit, not just newly staged changes. Stop if paths contain mixed ownership or the index cannot be preserved safely.
- Verify each resulting commit and the protected index/worktree identities. Never use a normal whole-index commit when unrelated staged content exists.
- Use concise behavior-based messages without workflow trailers. Never push, amend, squash, merge, release, rewrite history, or discard existing work automatically.

## Final Review And QA

Begin full review only after the required feature behavior works well enough to evaluate as a whole.

1. Review all feature changes from the plan's `Review baseline` SHA through current `HEAD`, plus current tracked and untracked feature changes. Exclude unrelated work explicitly.
2. Compare the implementation with the decision brief and plan. Treat provisional details as guidance. Treat the architecture table, settled interfaces, and state ownership as rules the implementation must meet or the plan must have been updated to change.
3. Review correctness, regressions, maintainability, ownership, change locality, test quality, and material deviations from settled decisions.
   - Confirm every behavior ID in the test strategy has the proof its `Mode` requires, including fail-before evidence for `test-first` rows and bug fixes, or a recorded reason why that evidence was not practical.
4. Use the independent `oracle` agent when available. Give it the plan path, comparison range, current changes, and review focus. Keep it read-only.
5. Resolve combined-review findings through Developer correction commits and submission review before the final gate. Then delegate the full regression gate to the repository verifier when available. Run relevant runtime QA within repository and user authority. Do not erase data or disrupt another session without explicit permission.
6. Route gate or QA failures back to the responsible Developer. Resume that Developer when possible; otherwise select the bounded Developer for bounded fixes or the complex Developer for uncertain fixes. Review every correction commit, including fixes within previously reviewed scope.
7. Repeat affected review and verification after fixes. Re-run the full gate when changes invalidate its evidence; reuse unaffected results. Changes after human acceptance make acceptance pending again. Do not create tickets for findings.
8. Pause for final human acceptance. Present working behavior, review findings resolved, verification results, remaining manual checks, comparison range, and known risks.
9. Report accepted local submissions and any remaining uncommitted workflow artifacts. Do not create an Architect commit or publish changes.

## Interruption And Resume

A fresh or compacted Architect reconstructs progress from `decision-brief.md`, `plan.md`, Git history, the working tree, tests, and runtime evidence. Keep compact evidence in the existing plan: submitted and accepted ranges, check commands/results and artifact paths, pending reviews/blockers, and historical fail-before proof. Preserve the Developer session reference when useful for corrections. Do not create a second progress ledger.

Record Oracle's reviewed design and outcome during planning. Update evidence after material changes and completed reviews, not every tool call. A current green test cannot prove a historical failure, completed manual QA, or human acceptance. Report missing evidence honestly; repeat only what can actually be reproduced.

The plan's `Review baseline` field survives compaction. Read it instead of re-deriving the comparison range. Ask the user for a base only when the field is absent and Git history does not make the boundary clear.

## Final Response

Prefer tables, call stacks, and diffs over prose in this report. Report:

- Coherent phases completed and Developer route used.
- Architecture changes: settled rules updated in the plan, and provisional adaptations accepted without a plan change.
- Behavior IDs proven, and any left unproven.
- Submitted and accepted commit ranges.
- Build, test, runtime, regression gate, review, and QA results.
- Final comparison range, starting from the plan's `Review baseline`.
- Remaining risks and manual checks.
- Whether final human acceptance is complete or pending.
