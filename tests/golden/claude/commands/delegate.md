---
description: Delegate agreed work to a Developer subagent and review the result in this session, including spikes and prototypes
argument-hint: "[notes]"
---
## Claude Code Invocation And Tools

Run this command only on explicit user invocation. Treat the text supplied with the command as its arguments. Delegate, show-program-design, and council treat their arguments as notes on the work. Review accepts a plan path or directory and an optional Git range. Ask if the supplied input cannot be assigned unambiguously; reject unexpected extra inputs.

Use the installed `developer`, `developer-luna`, `oracle`, and `contrarian` subagents when their stated purpose fits. Independent review is optional and based on uncertainty and impact. Use the built-in `Explore` subagent for discovery. Dispatch subagents with the `Agent` tool. Resume the same agent for corrections when the session supports it, for example with a follow-up message to its agent ID; otherwise start a fresh Developer with the current diff and the open findings. Follow current tool schemas, not remembered parameter names. A missing or unreachable subagent blocks only the dispatch that needs it: report it and do not substitute another role. `contrarian` and `developer-luna` use GPT models and need Claude Code to run through CLIProxyAPI.

Subagent tool lists and prompts do not mechanically enforce Git boundaries. Repository and explicit user restrictions remain authoritative. Do not automatically invoke the next workflow command; ask the user to invoke it.

This command does not switch modes. If plan mode is active, ask the user to leave plan mode and invoke this command again. Do not bypass mode restrictions through tools or subagents.

Delegate the agreed work to a Developer subagent, then review what comes back until it meets the outcome. Stay in this session: the user keeps talking to you, and you keep their intent.

`$ARGUMENTS`

## Start From The Conversation

- The outcome agreed in the conversation, plus any notes or arguments supplied here, is the brief. When the intended outcome is missing or ambiguous, ask; never invent it.
- For a spike or prototype, the outcome is the question to answer or the behavior to demonstrate, with an agreed stopping point.
- Inspect `git status`, the current diff, untracked files, and recent commits. Preserve user-owned and unrelated changes.

## Delegate

- Use `developer` when design, integration, or debugging is unresolved, and `developer-luna` for predictable, directly verifiable work that follows an established pattern. Reassess when evidence changes the route.
- Give the outcome, constraints, relevant paths, and the proof expected. Keep the brief short; Developers explore and adapt internally. A small feature is one dispatch.
- Developers may change implementation choices as they learn. Bring back to the user only changes to desired behavior or consequential trade-offs.

## Review And Correct

- Inspect the actual diff and its verification against the outcome; a delegated claim alone is not proof.
- Resume the same Developer for corrections when available. If a strategy fails twice, change it instead of repeating the prompt.
- Make a trivial correction yourself when a round trip would cost more than the edit.
- When appearance, interaction, or another uncertain part needs the user's judgment, show a concrete intermediate result early and ask a focused question.
- Use `oracle` or `contrarian` only when uncertainty or impact justifies an independent read-only look. No findings is a valid outcome.
- Stop once the outcome is adequately supported instead of accumulating speculative improvements.

## Git Safety And Reporting

- Local task commits only when the user and repository authorize them, and only with task-owned changes. Never push, amend, squash, merge, rewrite history, or discard existing changes unless the user asks.
- Finish with an honest summary: what works and how it was checked, what remains unverified or manual, adaptations made, the commit range if any commits were made, and open risks. Human acceptance decides when the work is done.
