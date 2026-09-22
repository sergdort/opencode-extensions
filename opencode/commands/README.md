# OpenCode Commands

Core commands are generated from canonical procedures. Librarian remains a native source prompt.

## Commands

- `bro.md`: restate the last response plainly and concisely
- `handoff.md`: create repository-local handoff documents for a fresh agent
- `github-librarian.md`: investigate GitHub repositories with the `github-librarian` subagent
- `plan-feature.md`: select the built-in Plan agent, use `show-me`, and review the feature plan before approval
- `start-work.md`: have Architect route coherent implementation phases dynamically, check architecture conformance, and run final review and QA
- `review-work.md`: optionally review the completed implementation with an independent agent; this does not replace human QA or acceptance

## Install

Run `npm ci` and `npm run generate` from the checkout first. For a generated symlink setup, use `opencode/link-global.sh`; add `--with-review` only when the optional read-only `review` agent is installed. Rerun after source updates. Generation updates both payloads; restart OpenCode and reload any already-linked Codex installation.


For global use:

```bash
COMMANDS_DIR=/path/to/opencode-extensions/generated/current/opencode/commands
mkdir -p ~/.config/opencode/commands
cp "$COMMANDS_DIR"/{bro,handoff,plan-feature,start-work}.md ~/.config/opencode/commands/
```

For one project:

```bash
COMMANDS_DIR=/path/to/opencode-extensions/generated/current/opencode/commands
mkdir -p .opencode/commands
cp "$COMMANDS_DIR"/{bro,handoff,plan-feature,start-work}.md .opencode/commands/
```

When upgrading, inspect any installed `decompose.md`. Remove it only when it is the obsolete ticket command from this package. Restart OpenCode after copying command files.

Install `opencode/commands/github-librarian.md` separately for copy-based setups; it is not generated. The core link helper preserves its existing installation.

`github-librarian.md` assumes the `github-librarian` subagent is installed and task delegation is allowed from the `build` agent.

`plan-feature.md` selects the built-in `plan` agent. Install `show-me`, Oracle, and Contrarian, and merge the Plan-agent Task permissions from the [Architect guide](../agents/architect/README.md#plan-agent-config). The command creates or revises the plan and runs review before approval. Grilling is optional.

`start-work.md` selects the persistent `architect` primary agent. It approves the current disclosed plan and begins Developer submissions and Architect review. If planning restrictions prevented saving `plan.md`, Architect saves the exact reviewed draft first. Install Architect and its Developers before execution.

`review-work.md` assumes an optional read-only agent named `review`. The agent returns findings in its response and does not create workflow state. Edit `templates/opencode/commands/review-work.md.njk` and regenerate when the agent has a different name.
