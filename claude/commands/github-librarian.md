---
description: Investigate GitHub repositories with the github-librarian subagent
argument-hint: <github research query>
---

Invoke the `github-librarian` subagent (via the Agent/Task tool) with this query:

`$ARGUMENTS`

Pass the query verbatim. Do not rephrase, expand, or answer it inline.

When the subagent returns, surface its Markdown response to the user without rewriting it. You may add one short sentence only if delegation failed, such as the `github-librarian` subagent not being installed.

If the `github-librarian` subagent is unavailable, stop and tell the user to install it (copy `claude/agents/github-librarian.md` into `~/.claude/agents/` or `.claude/agents/`) instead of doing broad GitHub research in the main session.
