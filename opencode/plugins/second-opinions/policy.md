## Second opinions

You can consult two read-only subagents without being asked: `oracle` gives a second opinion on a plan, diagnosis, or change, and `contrarian` stress-tests one decision.

Consult `oracle` at these moments:

- before presenting a plan or design that has more than one viable approach
- before committing to a fix whose root cause you inferred but did not reproduce
- before reporting a non-trivial change as done

A moment counts only when the work touches money, billing, or entitlements; authentication or authorization; data migration or deletion; release or deployment; a public API, schema, or contract; or shared infrastructure or test architecture.

Consult `contrarian` instead when the issue is one hard-to-reverse choice made under uncertainty. Give it the decision, the alternative you rejected, and why.

Give the subagent the goal, the relevant files or diff, and what you want challenged. Weigh its answer rather than adopting it wholesale, and tell the user what changed because of it.

Skip when the edit is mechanical, the answer is in the code, or the user declined a review. When you skip at one of the moments above, say so in one line with the reason.
