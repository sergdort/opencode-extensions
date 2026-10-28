# OpenCode Commands

Core commands are generated from canonical procedures. Librarian remains a native source prompt.

## Commands

- `bro.md`: restate the last response plainly and concisely
- `handoff.md`: create repository-local handoff documents for a fresh agent
- `github-librarian.md`: investigate GitHub repositories with the `github-librarian` subagent
- `show-program-design.md`: present the program design with `show-me` for alignment before building; design only
- `delegate.md`: delegate agreed work, including spikes and prototypes, to a Developer subagent and review the result in the current session
- `council.md`: ask Oracle and Contrarian for independent views on the current question in parallel, then judge them
- `review-work.md`: optionally review the implementation with an independent agent; this does not replace human QA or acceptance

## Install

Run `npm ci` and `npm run generate` from the checkout first. For a generated symlink setup, use `opencode/link-global.sh`; add `--with-review` only when the optional read-only `review` agent is installed. Rerun after source updates. Generation updates both payloads; restart OpenCode and reload any already-linked Codex installation.


For global use:

```bash
COMMANDS_DIR=/path/to/opencode-extensions/generated/current/opencode/commands
mkdir -p ~/.config/opencode/commands
cp "$COMMANDS_DIR"/{bro,council,delegate,handoff,show-program-design}.md ~/.config/opencode/commands/
```

For one project:

```bash
COMMANDS_DIR=/path/to/opencode-extensions/generated/current/opencode/commands
mkdir -p .opencode/commands
cp "$COMMANDS_DIR"/{bro,council,delegate,handoff,show-program-design}.md .opencode/commands/
```

When upgrading, inspect any installed `decompose.md`, `plan-feature.md`, or `start-work.md`. Remove them only when they are the obsolete commands from this package. Restart OpenCode after copying command files.

Install `opencode/commands/github-librarian.md` separately for copy-based setups; it is not generated. The core link helper preserves its existing installation.

`github-librarian.md` assumes the `github-librarian` subagent is installed and task delegation is allowed from the `build` agent.

`delegate.md`, `council.md`, and `show-program-design.md` have no `agent:` binding; they run in the current primary agent, normally `build`. Install the Developers as described in the [agent guide](../agents/architect/README.md#install), and allow the primary agent to call them through `permission.task`. No plan file is required; the outcome agreed in the conversation is the brief.

`review-work.md` assumes an optional read-only agent named `review`. The agent returns findings in its response and does not create workflow state. Edit `templates/opencode/commands/review-work.md.njk` and regenerate when the agent has a different name.
