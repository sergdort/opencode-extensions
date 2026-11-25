Run a correctness review loop on the current change with two independent reviewers: `sol-reviewer` and `astra-reviewer`. They run the same review on different models in parallel and find bugs and edge cases; you merge and judge their findings and make the fixes. Design and architecture review belong to `oracle` and `contrarian`, not to this command.

`{{ inputs.arguments }}`

## Scope

- Run `git status --short`. Do not stash, discard, or include unrelated changes. If the change paths do not separate cleanly from unrelated work, stop and ask.
- If the arguments name a valid Git base or range, use it. Otherwise run `git fetch origin` and use `git merge-base HEAD origin/<default-branch>`. Without a remote, use a base the user names, or `HEAD` for uncommitted changes only. Ask instead of guessing when the boundary is unclear.
- The change is the base to the working tree in those paths, plus untracked files. Use the same diff command in every round.
- State the intent and what is out of scope in one or two sentences, from the conversation and the arguments. Ask if the intent is unclear.
- Run the checks that cover the change. Do not send code that the change breaks. Note missing or failing checks in the brief.

## Review

Dispatch `sol-reviewer` and `astra-reviewer` in parallel with this brief. They get no conversation history:

```
Repo: <absolute path>  Base: <sha>  Intent: <intent>  Out of scope: <scope>  Checks: <results>
See: git diff <base> [-- <paths>]; git status --short (read untracked files).
```

- Do not edit the scoped files while the reviews run. Wait for both replies. A timeout, an error, or an empty reply is not approval.
- If one reviewer is missing or fails, report it and continue with the other. If both fail, report it and stop. Do not substitute another agent, another model, or a main-session review.

## Answer Findings

Merge findings that describe the same defect into one entry that keeps both IDs, such as `S2/A1`. Agreement between reviewers is not proof, and a finding from one reviewer is not weaker for that. Check each finding and its severity against the code yourself. Another path, a rare case, or a small cost is a nit, whatever its label.

- Agree: make the smallest fix. Prefer to delete or narrow code over a new lock, cache, helper, or option. Add one focused test that fails without the fix only when the intent needs it.
- Disagree: say why, with evidence such as `file:line`, a test, or command output.
- Nit or out of scope: decline in one line and list it as a follow-up.

Keep a short list in the conversation: ID, severity, and outcome (`fixed`, `disagree`, or `declined`) with evidence. Re-run the checks and `git diff --shortstat <base>`. If the review grew the diff, cut first. Do not agree just to end the loop.

## Second Round

- Two rounds in total: round 1 is the full review, round 2 is the check. Run more rounds only when the user asks.
- Start round 2 only when you fixed or disputed a `blocker` or `should`, or changed behavior code after round 1. Skip it when every reviewer that replied approved or returned only nits, or when you changed only comments, docs, or formatting.
- Run each reviewer that replied in round 1 again, in parallel. Resume each one when the harness supports it; otherwise dispatch a fresh one with the round 1 brief. Send each the merged finding list with outcomes and evidence, the same base diff, and the change since round 1. Ask each to check only the open IDs, including the other reviewer's, and the changed code.

## Finish

- Agreed: `APPROVE` on the current diff from every reviewer that replied, no `blocker` or `should` open, and no concern of your own. If only one reviewer replied, say that the review used one model.
- Not agreed: a finding is still disputed after round 2. Show both sides in two or three lines each. The user decides. The end of the rounds is not approval.
- Do not commit or push. Report the rounds, which reviewers replied and their models when known, what changed because of the review, the diff size before and after, and the fixed and declined findings with reasons.
