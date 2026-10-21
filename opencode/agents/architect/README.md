# OpenCode Developer And Review Agents

Subagents and two commands for the normal `build` agent. Talk, prototype, or build in `build` as usual. Near the end of a conversation, run `/show-program-design` to see the approach, core architecture, and important interfaces with `show-me` before anything is built. When you want implementation done in a separate context, run `/delegate`: `build` hands the agreed work to a Developer subagent, reviews the diff, and directs corrections. Use Oracle or Contrarian whenever an independent read-only look is worth it.

There is no orchestrator primary agent, routing instruction, or approval gate between design and implementation. The package directory keeps its old `architect` name for path stability.

## What It Provides

Generated agents in `generated/current/opencode/agents/`:

- `developer.md`: complex Developer for work with unresolved design, unfamiliar integration, or uncertain debugging
- `developer-luna.md`: bounded Developer for predictable, directly verifiable work that follows an established pattern
- `oracle.md`: read-only second opinion on plans, designs, diagnoses, and code changes
- `contrarian.md`: read-only adversarial challenge to one decision

Both Developers work from short self-contained briefs and use OpenCode's built-in Explore agent for read-only discovery. They can be called through `/delegate` or directly with `@developer` and `@developer-luna`.

Generated commands in `generated/current/opencode/commands/`:

- `show-program-design.md`: present the program design with `show-me` for alignment; design only
- `delegate.md`: delegate agreed work, including spikes and prototypes, to a Developer and review the result in the current session
- `review-work.md`: optional independent review of the implementation
- `bro.md`, `handoff.md`: utilities

`/show-program-design` and `/delegate` have no `agent:` binding, so they run in whichever primary agent you are using. `/show-program-design` loads the shared `show-me` skill; it and the standalone `grill-me-architecture` skill are linked for use at your request. GitHub Librarian is optional.

## Delegation Loop

```text
conversation, prototypes, or a build in progress
  -> optional /show-program-design [notes]: approach, architecture, interfaces
  -> /delegate [notes], or build directly
  -> pick developer or developer-luna from the work at hand
  -> Developer builds and verifies with the smallest credible checks
  -> build reviews the diff, resumes the same Developer for corrections
  -> honest summary and human acceptance
```

- The outcome agreed in the conversation is the brief. Arguments add notes. No `plan.md` is required.
- `build` inspects the diff instead of trusting a delegated claim, and makes trivial corrections itself when a round trip would cost more.
- A strategy that fails twice changes instead of being repeated. Product conflicts and consequential trade-offs go back to you.
- Developers may submit task-only local commits when you and the repository permit them. Nothing pushes, amends, squashes, or discards changes unless you ask.

These are prompt rules, not a sandbox. Permission patterns do not prevent every alternate command form.

## Non-Goals

- No orchestrator agent, routing instruction, plan template, tickets, or workflow state
- No automatic review gates, model routing, push, or history rewriting
- No requirement that Librarian, Review, Plannotator, or the grill skill is installed

## Install

Requires Node.js 22 or newer. Run from the checkout:

```bash
npm ci
./opencode/link-global.sh --dry-run
./opencode/link-global.sh
```

The helper generates both native payloads, then links the OpenCode agents, commands, Librarian, and the shared `show-me` and grill skills. It does not edit `opencode.json`. Add `--with-review` only when an optional read-only `review` agent is installed.

The helper removes owned links from the retired Architect workflow: `agents/architect.md`, `ARCHITECT_INSTRUCTIONS.md`, `commands/plan-feature.md`, and `commands/start-work.md`. If your config lists `ARCHITECT_INSTRUCTIONS.md` under `instructions` or configures an `architect` agent, remove those entries yourself.

After source updates, rerun the helper. If Codex is also installed, rerun its helper to refresh agent copies. Restart OpenCode and reload Codex.

Destination overrides are `OPENCODE_CONFIG_DIR` (default `$XDG_CONFIG_HOME/opencode`, or `~/.config/opencode`) and `AGENTS_SKILLS_DIR` (default `~/.agents/skills`). See the root [migration and recovery rules](../../../README.md#migration-and-recovery) before replacing an existing installation.

### Copy Native Files

Generate with `npm run generate` first. From the destination project, set the checkout path:

```bash
EXTENSIONS_DIR=/path/to/opencode-extensions
NATIVE_DIR="$EXTENSIONS_DIR/generated/current/opencode"
mkdir -p .opencode/agents .opencode/commands .agents/skills/show-me
cp "$NATIVE_DIR/agents/"*.md .opencode/agents/
cp "$NATIVE_DIR/commands/"{bro,delegate,handoff,show-program-design}.md .opencode/commands/
cp "$EXTENSIONS_DIR/skills/show-me/SKILL.md" .agents/skills/show-me/SKILL.md
```

For optional standalone grilling, also copy `skills/grill-me-architecture/SKILL.md` into `.agents/skills/grill-me-architecture/`. Inspect destination conflicts before copying. For global copies, use `~/.config/opencode/` and `~/.agents/skills/` instead. Copy optional `review-work.md` only when its `review` agent is available. Install Librarian separately if needed.

## Task Permissions

`/delegate` runs in your primary agent, so that agent must be allowed to call the Developers. If your config denies them, for example `agent.build.permission.task` with `"developer": "deny"`, `/delegate` cannot dispatch. Allow the subagents you want `build` to use:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "build": {
      "permission": {
        "task": {
          "developer": "allow",
          "developer-luna": "allow",
          "oracle": "allow",
          "contrarian": "allow"
        }
      }
    }
  }
}
```

Put broad deny rules before these specific allows. The generated Developers may call only `explore`.

## Models

Agent definitions omit `model` and `variant`. Configure routes in global `~/.config/opencode/opencode.json` or project `opencode.json`.

Recommended routes:

- Complex Developer: `openai/gpt-6-sol`, `high`
- Luna Developer: `openai/gpt-6-luna`, `max`
- Explore: OpenCode built-in, with `openai/gpt-5.6-terra`, `low` as the recommended override
- Oracle and Contrarian: `openai/gpt-6-astra`, `xhigh`

Merge the `agent` block from [the example config](opencode.architect.example.json) into your config and edit routes to match available models and variants. The primary agent's own model is whatever you already use for `build`.

## Restart Required

OpenCode loads agent, command, instruction, and config files at startup. Quit and restart OpenCode after copying or changing them.
