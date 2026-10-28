# Claude Code Extensions

Claude Code adapter for the shared workflow. The procedures come from `canonical/`, the same source as the OpenCode and Codex packages. `npm run generate` writes the native files to `generated/current/claude/`. See the [root README](../README.md) for generation and golden tests.

## What This Provides

Subagents (`~/.claude/agents/`):

| Agent | Model | Effort | Purpose |
|---|---|---|---|
| `developer` | `claude-sonnet-5-5` | `high` | Product code under uncertainty |
| `developer-luna` | `gpt-6.1-sol(medium)` | suffix | Bounded work that follows an established pattern |
| `oracle` | `claude-fable-5-1` | `high` | Read-only second opinion |
| `contrarian` | `gpt-6-astra(xhigh)` | suffix | Read-only adversarial challenge to one decision |

Commands (`~/.claude/commands/`). They run in the main session:

| Command | Purpose |
|---|---|
| `/show-program-design [notes]` | Show the approach, architecture, and key interfaces with `show-me`; design only |
| `/delegate [notes]` | Dispatch a Developer, review the diff in this session, direct corrections |
| `/council [question or notes]` | Ask `oracle` and `contrarian` in parallel with one neutral brief, then judge their views |
| `/review-work [plan-path-or-directory] [git-range]` | Optional independent review by `oracle` |
| `/bro` | Restate the last reply in plain language |
| `/handoff [focus]` | Write repo-local handoff documents |

Shared skills (`~/.claude/skills/`): `show-me` and `grill-me-architecture`. `grill-me-architecture` runs only when you ask for it.

Optional (`--with-librarian`): the independent `github-librarian` agent and `/github-librarian` command in this directory.

## Second Opinions Without Asking

`/council` runs only when you invoke it. To let the main session consult `oracle` or `contrarian` on its own, append the shared policy from the OpenCode plugin to the main session's system prompt:

```text
--append-system-prompt-file /path/to/opencode-extensions/opencode/plugins/second-opinions/policy.md
```

In T3 Code, put this in Providers -> Claude -> Launch arguments. For the CLI, add it to a shell alias. Claude Code applies an appended system prompt to the main session only, so subagents do not see the policy and do not start delegating. A `CLAUDE.md` rule would reach every subagent. Start a new session after changing the policy.

## Non-Goals

- No orchestrator agent, tickets, required plan file, decomposition stage, or approval gate. The workflow is the same as for OpenCode and Codex.
- No plugins, hooks, settings edits, or hidden state. The helper only links named files.
- Tool lists and prompts do not mechanically enforce Git boundaries. Developers follow a prompt contract: task-owned local commits when authorized, never push or rewrite history.

## Install

Requires Node.js 22 or newer. Run from this checkout:

```bash
npm ci
./claude/link-global.sh --dry-run
./claude/link-global.sh
```

The helper regenerates all payloads, then links the files above into `~/.claude` (override with `CLAUDE_CONFIG_DIR`). Add `--with-librarian` for the optional Librarian. Regular-file conflicts need `--force`. Directories and foreign links are never replaced.

Restart Claude Code after installation and after each rerun. Rerun the helper after you pull updates or edit `canonical/`, `templates/`, or `scripts/manifest.mjs`.

## Run Through CLIProxyAPI

`developer-luna` and `contrarian` use GPT models. Claude Code reaches them only through [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI). `ANTHROPIC_BASE_URL` applies to the whole process, so the main session also goes through the proxy.

1. Log in to Claude and Codex in CLIProxyAPI. Check that `GET /v1/models` lists `claude-opus-5-5`, `claude-fable-5-1`, `claude-sonnet-5-5`, `gpt-6-astra`, and `gpt-6.1-sol`.
2. Start Claude Code with the proxy address and a proxy client key from `access.api-keys`. This is not an upstream provider key:

   ```bash
   ANTHROPIC_BASE_URL=http://127.0.0.1:8317 \
   ANTHROPIC_AUTH_TOKEN=<proxy-client-key> \
   claude --model claude-opus-5-5
   ```

   A shell alias keeps this out of `settings.json`.

Known effects:

- Claude Code disables claude.ai connectors while an auth token is set.
- Claude Code warns that it does not recognize the GPT model IDs and assumes a 200k context window. Through Codex OAuth the real windows are larger (272k for Astra, 500k for Sol), so the assumption is safe and you need not configure anything.
- If the proxy's Claude login expires, every Claude model, including the main session, returns `503 auth_unavailable`. Log in again in CLIProxyAPI.

Without the proxy, `developer` and `oracle` still work and the GPT agents fail to dispatch. `/delegate` reports the failure and does not substitute another role.

## Model And Effort Defaults

Model IDs live in `scripts/manifest.mjs`. Claude Code sends the `model` value to the API unchanged.

- Claude agents use Claude Code's `effort` field.
- GPT agents put the effort in a `(level)` suffix. CLIProxyAPI reads the suffix, and it overrides any effort in the request body. The agents therefore omit `effort`.
- Run the main session on Opus. Fable runs only in short `oracle` bursts.

To change a model, edit the manifest entry, rerun the helper, and review the golden diff (`npm run snapshots:update`). Installed agents are symlinks, so do not edit them in place.

## Execution Notes

- Subagents do not see the parent conversation. The command passes a short brief with the outcome, constraints, paths, and expected proof.
- `/delegate` resumes the same Developer for corrections when the session supports follow-up messages to an agent. Otherwise it starts a fresh Developer with the current diff and open findings.
- Developers may use the built-in `Explore` subagent for discovery. Oracle and Contrarian have no `Agent`, `Edit`, or `Write` tools.
- Plan mode stays authoritative. `/delegate` asks you to leave plan mode first.

## Migrating From The Ticket Workflow

The `/architect`, `/plan-feature`, `/decompose`, and `/start-work` commands and the `repo-scout` agent are retired. The helper removes links to them only when the links point into this checkout. It reports other entries and leaves them in place. The old package was installed by copying, so inspect and remove these copies manually:

```text
~/.claude/commands/{architect,plan-feature,decompose,start-work}.md
~/.claude/agents/repo-scout.md
```

Old copies of `developer.md`, `oracle.md`, `contrarian.md`, or `handoff.md` are regular-file conflicts. Back them up, then rerun the helper with `--force`, or move them away first.

## Uninstall

Remove the named links in `~/.claude/agents/`, `~/.claude/commands/`, and `~/.claude/skills/` that point into this checkout. Keep unrelated files.
