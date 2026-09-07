# Bare File Reference Proof

Date: 2026-09-05
Clients: OpenCode 1.18.28 and Codex CLI 0.152.1
Scope: symlinked OpenCode `/bro` commands and Codex `$bro` skills.

## Result

Bare `@` references loaded the shared procedure in both clients.
The clients used different loading and relative-path behavior.
Neither client stopped reliably when the canonical file was missing.

| Case | OpenCode | Codex |
|---|---|---|
| Absolute reference | Included the file before the assistant response | Agent read the referenced file through a shell command |
| Source update without relinking | Returned the new marker | Returned the new marker |
| Relative reference; no project file | Tried the project path, then searched and found the shared file | Read the file beside the skill |
| Relative reference; conflicting project file | Used the project file | Used the file beside the skill |
| Missing absolute target | Read the saved file and continued | Searched, then restated the message without the canonical procedure |

The relative OpenCode run without a project file produced the correct marker only after searching.
That result does not establish correct reference resolution.
The conflicting-file case confirmed that OpenCode used the project directory for this command reference.

These are individual runtime observations from fresh processes and sessions.
They do not establish guaranteed behavior across models, client versions, or other instruction surfaces.

## Fixture

Temporary root: `/tmp/at-reference.xHoLi1`
Source: `checkout/canonical/CANONICAL.md`
Shared link: `config/agent-extensions` points to the temporary checkout.
Working directories: `projects/absolute project` and `projects/relative project`.

Installed command files and skill directories were symlinked to their source adapters.
OpenCode used isolated global configuration. Codex used project skill discovery.
No installed user configuration or production adapter was changed.

The absolute OpenCode command contained:

```md
---
description: Restate the previous response in plain, concise language
---
@/tmp/at-reference.xHoLi1/config/agent-extensions/canonical/CANONICAL.md

$ARGUMENTS
```

The Codex skill contained the same reference with native frontmatter:

```md
---
name: bro
description: Restate the previous response in plain, concise language. Use only when the user invokes $bro.
---
@/tmp/at-reference.xHoLi1/config/agent-extensions/canonical/CANONICAL.md
```

The relative adapters replaced the absolute reference with `@CANONICAL.md`.
The referenced file was available beside each source adapter through another symlink.
OpenCode also had that symlink beside its installed command.
Codex used `policy.allow_implicit_invocation: false` in `agents/openai.yaml`.

No adapter contained an explicit read instruction or missing-file guard.
No test marker appeared in the adapter or invocation.

## Cases

1. Invoke the native command or skill with a supplied previous assistant message.
   The canonical file requests a plain-language restatement and marker `AT_CANONICAL_92ac71_v1`.
2. Change only the canonical marker to `AT_CANONICAL_6b20fe_v2`.
   Invoke the absolute adapters in fresh sessions without changing their symlinks.
3. Place a different `CANONICAL.md` in the relative test project.
   That file requests the distinct output `AT_PROJECT_13cd57`.
   Invoke both relative adapters again.
4. Move the shared source to `CANONICAL.md.saved` and invoke the absolute adapters again.
   Neither client stops as required by the proposed workflow contract.
5. Restore the shared source after both missing-file runs finish.

The launch method followed `canonical-loading-proof.md` with separate absolute and relative fixtures.
The same existing authenticated clients were used. Claude was not run.

## Evidence

Traces remain under `/tmp/at-reference.xHoLi1/logs/`:

| Cases | Trace names |
|---|---|
| Initial absolute reference | `opencode-absolute-v1.jsonl`, `codex-absolute-v1.jsonl` |
| Initial relative reference | `opencode-relative-v1.jsonl`, `codex-relative-v1.jsonl` |
| Absolute source update | `opencode-absolute-v2.jsonl`, `codex-absolute-v2.jsonl` |
| Conflicting project file | `opencode-relative-collision.jsonl`, `codex-relative-collision.jsonl` |
| Missing absolute target | `opencode-absolute-missing.jsonl`, `codex-absolute-missing.jsonl` |
| OpenCode initial session export | `opencode-absolute-export.json` |

The OpenCode export contains the canonical file content in synthetic user-message parts.
The marker is present before any assistant message. This confirms native command expansion for that case.
This matches the documented [OpenCode command file references](https://opencode.ai/docs/commands/#file-references).

Codex traces show the agent reading `SKILL.md` and the referenced Markdown through shell commands.
They establish that Codex followed the reference, not that a native Markdown import expanded the file.
No global `AGENTS.md` import behavior was tested.

The OpenCode missing-file trace shows an explicit read of `CANONICAL.md.saved` after the target read failed.
The Codex missing-file trace shows a failed read, a file search, and a final restatement without a marker.
A trace check confirmed all ten outcomes and the OpenCode native injection.

## Migration Decision

Use a reference with an unambiguous path to the shared installation.
Keep an explicit instruction to stop when the required file cannot be read.
Prohibit searching for alternate copies or inferring the missing procedure.
The earlier explicit-read adapter passed that missing-file check in both clients.
A bare reference alone does not satisfy the agreed loading contract.

The absolute paths in this experiment are fixture paths, not proposed production constants.
Validate the final portable path notation before installing shared adapters globally.
Long procedures, custom-agent definitions, and global Codex skill installation still need separate checks.
