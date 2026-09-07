# Canonical Markdown Loading Proof

Date: 2026-09-04
Repository baseline: `18962d4`
Scope: an isolated `bro` command and skill prototype. No production adapter was changed.

Follow-up on 2026-09-05: the user excluded Claude from migration.
Its historical authorization failure below no longer blocks the two-harness design.
See `at-reference-proof.md` for the subsequent bare-reference experiment.

## Results

| Client | Installed version | Initial load | Update without relinking | Missing source |
|---|---|---|---|---|
| OpenCode | 1.18.28 | Pass | Pass | Pass |
| Codex CLI | 0.152.1 | Pass | Pass | Pass |
| Claude Code | 2.1.258 | Command discovery passed; execution blocked | Not run | Not run |

Each passing case used a fresh process and session.
The same invocation ran from an unrelated project directory containing a space.
Each trace includes the actual canonical file read and the expected final response.
These are individual smoke tests, not a statistical reliability measurement.

Claude registered `bro` in its command list. The first model request returned HTTP 403
with `oauth_org_not_allowed`. The service reported that the organization had disabled
Claude subscription access for Claude Code. No procedure execution occurred.
Restore supported account access before rerunning the Claude cases.

## Files And Links

Temporary test root: `/tmp/canonical-loading.nkhp4k`
Working directory: `/tmp/canonical-loading.nkhp4k/projects/unrelated project`

```text
checkout/
  canonical/bro.md
  opencode/bro.md
  claude/bro.md
  codex/bro/SKILL.md
  codex/bro/agents/openai.yaml

config/
  agent-extensions -> ../checkout
  opencode/commands/bro.md -> ../../checkout/opencode/bro.md

projects/unrelated project/
  .claude/commands/bro.md -> checkout/claude/bro.md
  .agents/skills/bro -> checkout/codex/bro
```

The diagram abbreviates link targets. All installed symlinks used absolute targets.
The temporary checkout modeled the repository source. No file content was copied during installation.
The canonical file was restored after the missing-file test.
Temporary fixtures and raw logs remain outside the repository and may be removed by system cleanup.

OpenCode used an isolated global config directory. Claude and Codex used project discovery
locations for their symlinked adapters. All three shared the isolated canonical path.
The test did not modify installed user configuration, authentication, or existing global links.
Clients could still read existing credentials and create their normal runtime data.

## Adapter Contract

All adapters used this body, with native frontmatter:

```md
Read `${XDG_CONFIG_HOME:-$HOME/.config}/agent-extensions/canonical/bro.md` completely before answering.
Resolve the environment variables using the shell. This path is independent of the current working directory.
Follow the procedure in that file. If the file cannot be read, stop and report `CANONICAL_LOAD_FAILED`, the exact path, and the need to repair the symlink installation.
Do not infer the procedure from this description or search for another copy.
```

OpenCode and Claude adapters also passed `$ARGUMENTS` as invocation context.
The Codex adapter used `name: bro` and a manual invocation description.
Its `agents/openai.yaml` set `policy.allow_implicit_invocation: false`.

The test supplied this previous message as context:

```text
The implementation facilitates asynchronous inter-component communication.
```

The four-line canonical procedure requested a simple restatement and a test marker.
Version 1 used `BRO_PROOF_f73c9a_v1`. Version 2 used `BRO_PROOF_b8042d_v2`.
Neither marker appeared in the adapter or invocation.
Only the canonical source changed between the two successful cases.

For the final case, the canonical file was moved to `bro.md.saved`.
Both successful clients reported `CANONICAL_LOAD_FAILED`, the exact path, and a repair instruction.
Neither client produced a restatement or used the saved file as a fallback.

## Launch Method

Set `XDG_CONFIG_HOME` to the test root's `config` directory for each invocation.
Use the unrelated project as the working directory.

- OpenCode: set `OPENCODE_CONFIG_DIR` to the isolated `config/opencode` directory and
  `OPENCODE_DISABLE_CLAUDE_CODE=1`. Run `opencode run --pure --format json --command bro` with the context.
- Claude: run `claude -p '/bro <context>'` with `--setting-sources project`,
  `--settings '{"disableAllHooks":true}'`, `--strict-mcp-config`,
  `--tools 'Bash,Read,Skill'`, `--allowedTools 'Bash,Read,Skill'`,
  `--permission-mode dontAsk`, `--no-session-persistence`, and `--output-format stream-json --verbose`.
- Codex: run `codex exec --ignore-user-config --ignore-rules --ephemeral --sandbox read-only --json`
  with the literal `$bro <context>` prompt.

Use quoted command arguments so the invoking shell does not expand `$bro`.
The OpenCode test config allowed reads, shell commands, and the external canonical directory.
It disabled other permission categories. No model-generated file edits occurred.

The shell selected a broken Homebrew Codex launcher in the unrelated directory on the first attempt.
The successful retry used the existing executable at:

```text
/Users/sergiishulga/.local/share/mise/installs/node/22.22.0/bin/codex
```

No installation repair was needed for the test.

## Evidence

Raw traces are under `/tmp/canonical-loading.nkhp4k/logs/`:

| Case | Trace | Final response starts with |
|---|---|---|
| OpenCode initial | `opencode-v1.jsonl` | `BRO_PROOF_f73c9a_v1` |
| OpenCode update | `opencode-v2.jsonl` | `BRO_PROOF_b8042d_v2` |
| OpenCode missing | `opencode-missing.jsonl` | `CANONICAL_LOAD_FAILED` |
| Codex initial retry | `codex-v1-retry.jsonl` | `BRO_PROOF_f73c9a_v1` |
| Codex update | `codex-v2.jsonl` | `BRO_PROOF_b8042d_v2` |
| Codex missing | `codex-missing.jsonl` | `CANONICAL_LOAD_FAILED` |
| Claude initial | `claude-v1.jsonl` | Account access error |

A local trace check verified all six successful final responses and their canonical read events.
It also verified Claude command discovery and the reported service error.

## Design Implication

Explicit reads through a stable symlink worked in the tested OpenCode command and Codex skill.
This supports a shared source directory with native adapters and no generated prompt copies.
The OpenAI documentation also confirms symlinked skill discovery and manual `$skill` invocation:
[Build skills](https://learn.chatgpt.com/docs/build-skills).

The experiment does not establish native `@file.md` import behavior.
Stopping on a missing file remains a prompt contract, not a mechanically enforced gate.
Global Claude and Codex installation paths, custom agents, long procedures, restricted access,
and obsolete-link cleanup still require checks during the migration.
This historical test did not establish three-harness verification. Current migration scope includes only OpenCode and Codex.
