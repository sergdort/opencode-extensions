---
description: Investigate GitHub repositories with the github-librarian subagent
agent: build
---

Invoke the `github-librarian` subagent via the Task tool with this query:

`$ARGUMENTS`

Pass the query verbatim. Do not rephrase, expand, or answer it inline.

When the subagent returns, surface its Markdown response to the user without rewriting it. You may add one short sentence only if task delegation failed, such as a missing `task` permission for `github-librarian`.

If the `github-librarian` subagent is unavailable or task delegation is denied, stop and tell the user to install the agent and allow task delegation instead of doing broad GitHub research in the main session.
