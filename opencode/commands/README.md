# OpenCode Commands

Core commands are generated from canonical procedures. Librarian remains a native source prompt.

## Commands

- `bro.md`: restate the last response plainly and concisely
- `handoff.md`: create repository-local handoff documents for a fresh agent
- `github-librarian.md`: investigate GitHub repositories with the `github-librarian` subagent
- `plan-feature.md`: select Architect to develop a program design with `show-me` from the conversation, prototypes, and code (planning only)
- `start-work.md`: have Architect execute the agreed outcome through Developer delegation and focused verification
- `review-work.md`: optionally review the implementation with an independent agent; this does not replace human QA or acceptance

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

`plan-feature.md` selects `architect`. Install Architect and the shared `show-me` skill as described in the [Architect guide](../agents/architect/README.md#install). The command develops a program design from existing discovery; it never implements or dispatches Developers. Oracle and Contrarian review remain optional. Grilling runs only at the user's request.

`start-work.md` selects the persistent `architect` primary agent. It executes agreed work through Developer delegation and focused verification, including spikes and prototypes discussed in the conversation. No plan file or prior `/plan-feature` invocation is required. Install Architect and its Developers before execution.

`review-work.md` assumes an optional read-only agent named `review`. The agent returns findings in its response and does not create workflow state. Edit `templates/opencode/commands/review-work.md.njk` and regenerate when the agent has a different name.
