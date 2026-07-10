---
description: Create repo-local handoff documents for a fresh agent
agent: build
---
Write a handoff document summarising the current conversation so a fresh agent can continue the work.

Use these command arguments as the next-session focus, scope, or special instructions:

`$ARGUMENTS`

Requirements:

- Save handoff documents in a repo-local `handoffs/` folder by default. Create the folder if it does not exist.
- If the user explicitly asks for a temporary-file handoff, save it in the OS temp directory instead and still report the full path.
- If the user asks for multiple handoffs, create one focused document per requested thread.
- Name files clearly using lowercase kebab-case, for example `handoffs/payments-refactor.md`.
- Include a `Suggested Skills` section in every handoff with specific OpenCode skills the next agent should invoke and why.
- Do not duplicate content already captured in durable artifacts such as PRDs, plans, ADRs, GitHub issues, commits, or diffs. Reference those artifacts by path, commit hash, or URL.
- Redact sensitive information, including API keys, passwords, tokens, secrets, private credentials, and personally identifiable information.
- Summarise only what a fresh agent needs: goal, current state, key decisions, constraints, known blockers, validation already run, suggested next steps, and references.
- If the requested handoff should be paired with a GitHub issue, create the issue with `gh issue create`, put detailed findings there, and have the handoff reference the issue URL instead of duplicating it.
- Do not stage, commit, or push unless the user explicitly asks.

After writing the file or files, report the created paths and any issue URLs.
