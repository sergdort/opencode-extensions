---
description: Ask oracle and contrarian for independent views on the current question in parallel, then judge them and continue the discussion
argument-hint: "[question or notes]"
disable-model-invocation: true
---
## Claude Code Invocation And Tools

Treat the text supplied with the command as its arguments. Delegate, show-program-design, and council treat their arguments as notes on the work. Review accepts a plan path or directory and an optional Git range. Sol-review accepts an optional Git base or range, followed by notes. Ask if the supplied input cannot be assigned unambiguously; reject unexpected extra inputs.

Use the installed `developer`, `developer-luna`, `oracle`, and `contrarian` subagents when their stated purpose fits. Use `sol-reviewer` only for `/sol-review` or when the user asks for a Sol review. Independent review is optional and based on uncertainty and impact. Use the built-in `Explore` subagent for discovery. Dispatch subagents with the `Agent` tool. Resume the same agent for corrections when the session supports it, for example with a follow-up message to its agent ID; otherwise start a fresh Developer with the current diff and the open findings. Follow current tool schemas, not remembered parameter names. A missing or unreachable subagent blocks only the dispatch that needs it: report it and do not substitute another role. `contrarian`, `developer-luna`, and `sol-reviewer` use GPT models and need Claude Code to run through CLIProxyAPI.

Subagents have full tool access; their prompts, not permissions, set Git boundaries. Repository and explicit user restrictions remain authoritative. Do not automatically invoke the next workflow command; ask the user to invoke it.

Convene a council on the question this conversation is working on. `oracle` and `contrarian` give independent views in parallel; you judge them and continue the discussion with the user.

`$ARGUMENTS`

## Frame The Question

- The question is the design choice, diagnosis, plan, or change the conversation is converging on, plus any notes supplied here. If it is unclear, ask one focused question; never invent it.
- Write one neutral brief: the problem, the goal and real constraints, the options under consideration, and the relevant paths, diff, or evidence. Leave out your preferred answer, so members judge the problem and not your reading of it.
- Inspect the repository only enough to point members at the right files. Do not do their analysis for them.

## Consult

- Dispatch `oracle` and `contrarian` in parallel with the same brief. Ask `oracle` for its own assessment and recommendation. Ask `contrarian` to attack the most load-bearing option or assumption.
- Members do not change the work. When the question is a review of a change, ask each for a score out of 10 as a signal, not a gate.
- If a member is missing or fails, say so and continue with the other. Do not substitute another role or model.

## Judge

- Check each consequential finding against the code before relying on it. Agreement between members is not proof; one evidenced objection outweighs two unsupported opinions.
- Merge duplicates. Show where members agree, where they disagree, and which side the evidence supports.
- Give your recommendation, what changed in your view because of the council, and the open questions for the user. If a score was requested and a member gave none, write `no score`; never invent one.

## Rounds And Scope

- One round by default. Offer another round only after material changes or for a focused follow-up on a disagreement, and ask the user first.
- Keep the council on the question. Drop suggestions outside it, and do not accumulate speculative improvements.
- Do not implement during the council. Implementation starts only when the user asks, directly or with `/delegate`.
