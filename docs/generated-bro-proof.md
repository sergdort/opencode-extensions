# Generated Bro Proof

Date: 2026-09-06
Repository behavior baseline: `8162c92`
Clients: OpenCode 1.18.29 and Codex CLI 0.152.1
Scope: isolated generation and native invocation of `bro`. Production configuration is unchanged.

## Result

One canonical Markdown body generated a complete OpenCode command and a complete Codex skill.
Both clients returned the expected marker before and after explicit regeneration.
All four explicit runtime traces contained zero model-issued tool calls.
Neither client needed to read the canonical source at runtime.

| Check | Result |
|---|---|
| OpenCode `/bro`, initial generation | Passed; first marker returned |
| Codex `$bro`, initial generation | Passed; first marker returned |
| Both clients after source update and regeneration | Passed; second marker returned |
| Codex request without `$bro` | No marker or tool call; consistent with manual-only policy |
| Repeat generation with unchanged inputs | Identical output; symlink targets and inodes unchanged |
| Missing canonical source | Nonzero exit; exact source path and repair instruction; output and links unchanged |
| Unknown template token | Nonzero exit before output publication |
| Conflicting installation file | Nonzero exit; test user file and generated output preserved |
| Literal Markdown insertion | Dollar sequences, quotes, backslashes, and example braces preserved |
| Native metadata | Markdown frontmatter and YAML parsed; Codex manual-only policy retained |
| Generated output in Git | All three generated files ignored |

These are individual smoke tests, not guarantees across models or harness versions.
The implicit control alone does not prove that automatic invocation is impossible.
The generated Codex metadata sets `policy.allow_implicit_invocation: false`, as documented in
[official OpenAI documentation](https://learn.chatgpt.com/docs/build-skills#optional-metadata).

## Fixture

Temporary root: `/tmp/bro-generation.TtW6TG`.
macOS resolves this path to `/private/tmp/bro-generation.TtW6TG` in logs and generated symlink targets.

```text
checkout/
  canonical/bro.md
  templates/opencode-bro.md
  templates/codex-bro.md
  templates/openai.yaml
  generate-and-link.mjs
  .gitignore
  generated/
    opencode/commands/bro.md
    codex/skills/bro/SKILL.md
    codex/skills/bro/agents/openai.yaml

config/opencode/commands/bro.md -> generated OpenCode command
projects/unrelated project/.agents/skills/bro -> generated Codex skill directory
```

All installed links use absolute paths. The working directory is a separate disposable Git repository.
The temporary source checkout ignores `/generated/`. No generated file was staged or committed.
No shared workflow skill was installed for automatic OpenCode discovery.

The canonical body starts with the existing OpenCode `bro` procedure, unchanged.
Test-only instructions accept a supplied previous message and require a marker.
The markers are `GEN_BRO_8ea7_v1` and `GEN_BRO_b92c_v2`.
Neither marker appears in a template or invocation argument.

The template mechanism is one literal `{{BRO_BODY}}` placeholder, not a selected production template language.
The generator substitutes the complete body and retains native metadata.
OpenCode's template adds `$ARGUMENTS`; Codex's template adds a manual-invocation description.
The generator emits `agents/openai.yaml` with manual-only policy separately.
It uses function-based replacement to preserve dollar sequences and does not recursively expand the inserted body.

The script reads all inputs and checks installation conflicts before publishing output.
It replaces each output file through a temporary file and rename.
Existing matching symlinks remain unchanged.

## Runtime Method

`run-client.mjs` launches each client with existing credentials and isolated instruction locations.
It uses the same supplied context as the earlier loading spikes:

```text
Previous assistant message: The implementation facilitates asynchronous inter-component communication.
```

- OpenCode uses isolated `XDG_CONFIG_HOME` and `OPENCODE_CONFIG_DIR`, with `OPENCODE_DISABLE_CLAUDE_CODE=1`.
  Invocation: `opencode run --pure --format json --command bro <context>`.
- Codex uses isolated `XDG_CONFIG_HOME` and project skill discovery.
  Invocation: `codex exec --ignore-user-config --ignore-rules --ephemeral --sandbox read-only --json '$bro <context>'`.
- The Codex implicit control asks for a plain-language restatement without naming `bro`.

Clients use fresh processes and sessions. Existing user authentication and normal client runtime storage remain available.
The tests do not alter installed user prompts, skills, links, or configuration.
Codex emitted state-database warnings, but every runtime case completed successfully.

## Evidence And Reproduction

Scripts and raw logs remain under the temporary root. System cleanup can remove them.

| Evidence | Path relative to the temporary root |
|---|---|
| Generator and isolated link helper | `checkout/generate-and-link.mjs` |
| Generator assertions | `test-generator.mjs` |
| Client launch script | `run-client.mjs` |
| Runtime trace assertions | `check-traces.mjs` |
| Generator results | `logs/generator-tests.txt` |
| Runtime assertion results | `logs/trace-checks.txt` |
| Initial runtime traces | `logs/opencode-v1.jsonl`, `logs/codex-v1.jsonl` |
| Updated runtime traces | `logs/opencode-v2.jsonl`, `logs/codex-v2.jsonl` |
| Codex implicit control | `logs/codex-implicit.jsonl` |

Run the generator and its assertions with Node.js:

```sh
node /tmp/bro-generation.TtW6TG/checkout/generate-and-link.mjs
node /tmp/bro-generation.TtW6TG/test-generator.mjs
node /tmp/bro-generation.TtW6TG/check-traces.mjs
```

`test-generator.mjs` currently uses the YAML parser already present in the earlier temporary spike.
Its path is `/tmp/at-reference.xHoLi1/config/opencode/node_modules/yaml`.
This is a test dependency, not a production dependency decision.
`check-traces.mjs` checks recorded runtime traces; it does not launch fresh clients.
The fixture now contains version 2 of the canonical source.

## Limits And Next Step

The spike verifies complete native `bro` files, not the full workflow or custom-agent TOML generation.
It does not test long instructions, global Codex installation, obsolete-link cleanup, or interrupted generation.
Output publication is per file, not transactional across all outputs.
The prototype installer targets only two fixed temporary links and is not a production installer.

A failed generation preserves the previous valid output. That output can still run through existing symlinks.
The failure therefore blocks regeneration, not execution of an older installed version.
The production script must report failures clearly; users must not treat failed generation as a completed update.

Normal skill loading may still require tool reads in other invocation paths.
These explicit Codex invocations did not require any model-issued tool read.
The result does not imply that generic `@file.md` references work as native Codex imports.

Next, settle the production template mechanism, source/output layout, and generation failure handling.
Then implement the generate-and-link path before extracting the complete workflow.
