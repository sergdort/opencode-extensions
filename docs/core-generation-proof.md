# Core Generation Proof

Date: 2026-09-06
Behavior baseline: `8162c928aabe5da27e7e491748d608cf32152fb6`
Status: generator verified; native Codex installation blocked; final acceptance pending

## Automated Checks

- `npm ci --ignore-scripts --no-audit --no-fund`: passes with pinned dependencies.
- `npm test`: 14 tests pass, including exact comparison of all 27 golden files.
- Coverage includes missing sources and mappings, literal serialization, native parsing, manual-only policy, complete output inventory, publication fault injection, locks, tampered releases, dry-run, forced regular-file conflicts, foreign-link protection, legacy aliases, retired links, selected link edits, partial installation recovery, and explicit snapshot updates.
- `git diff --check` and untracked-file whitespace checks pass.
- `bash -n` passes for all three changed helpers.
- `jq empty` passes for the existing Architect example config. An initial command named a nonexistent Oracle example; the corrected check uses the actual JSON inventory.
- `shellcheck` is not installed; that check was not run.
- Git ignores `generated/` and `node_modules/`.
- Claude, TLH, Librarian sources, and the shared grill source have no changes.

## Isolated Runtime Fixture

Temporary fixture: `/tmp/core-loading.TqVxkt` (physical path `/private/tmp/core-loading.TqVxkt`).
Drivers: `smoke.mjs`, `utilities.mjs`, `native-review.mjs`, and `regular-role-control.mjs` in that fixture.

The fixture copies the production canonical procedures and templates. It runs the production generator/link implementation with temporary destinations. No user-installed link or harness config is edited. The fixture has its own Git repository, staged sentinel, and untracked sentinel.

| Check | Result | Trace |
|---|---|---|
| OpenCode 1.18.29 initial bro | Complete procedure loaded; no model-issued tool calls | `opencode-initial.jsonl` |
| Codex 0.152.1 initial bro | Complete procedure loaded; no model-issued tool calls | `codex-initial.jsonl` |
| OpenCode fresh session after regeneration | Returns `CORE_GENERATED_V2`; no model-issued tool calls | `opencode-update.jsonl` |
| Codex fresh session after OpenCode-selected regeneration | Returns the new marker; no model-issued tool calls | `codex-update.jsonl` |
| Codex ordinary request, no skill invocation | No marker and no model-issued tool calls | `codex-implicit.jsonl` |
| Codex handoff | Creates only `handoffs/addition.md`; has Suggested Skills and artifact references; no issue or commit; protected sentinels unchanged | `codex-handoff.jsonl` |
| Codex review with unavailable role | Stops instead of silently reviewing in the main session | `codex-review-work.jsonl` |

The test marker exists only in the temporary canonical fixture, never in production output or golden fixtures. Handoff supplied a Suggested Skills section but judged that no extra skill was needed for the tiny task. That is observed model behavior, not a guarantee of exact instruction compliance.

## Native Role Discovery And Spawn Blocker

The standalone CLI is 0.152.1. The bundled CLI at `/Applications/ChatGPT.app/Contents/Resources/codex` is 0.153.0.

In the first fixture, `--ignore-user-config` prevents project custom roles from appearing. An ephemeral project-trust override alone does not change that result with this flag. Normal configuration loading, an ephemeral trust override, and CLI 0.153.0 expose `developer`, `developer_luna`, `oracle`, and `contrarian` from the generated symlinks. No project config file is required in the successful discovery control. Hooks are disabled for these tests.

Discovery is not sufficient. `$review-work plan.md HEAD..HEAD` attempts the installed Oracle and fails while applying its role:

```text
failed to apply role to config: Too many levels of symbolic links (os error 62)
agent type is currently not available
```

Trace: `codex-native-review.jsonl`. The role file is a named symlink through `generated/current`. The generated TOML parses and its target exists. The skill stops without substituting a main-session review.

A controlled replacement in the temporary project copies the identical Oracle TOML into a regular file. The role then loads and spawns, but its model request fails:

```text
The 'gpt-5.6' model is not supported when using Codex with a ChatGPT account.
```

Trace: `codex-regular-oracle.jsonl`. No other role or model is substituted. This separates the symlink loading failure from the account/model limitation. The production model defaults remain unchanged pending a user decision.

The [official custom-agent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents) specifies standalone TOML files and their required fields. The [configuration documentation](https://learn.chatgpt.com/docs/config-file/config-basic) states that project configuration layers require trust. These documents do not establish that symlinked role files work at spawn time. The OpenAI Docs skill guided the native configuration checks; runtime observations above determine the remaining limitation.

## Remaining Work

- Decide how to install generated Codex agent TOML files without the failing file symlinks. Regular generated files are a demonstrated loading alternative, not yet an approved installation change.
- Resolve Oracle and Contrarian model availability. Both retain the old `gpt-5.6` default; only Oracle's runtime failure was exercised.
- Run successful Oracle review, a small disposable phase workflow, task-only Developer submissions, protected-index checks, and correction/resume proof. B5, B6, and the remaining B7 success path are not proven.
- Recheck installation ownership and update behavior for any revised native installation method.
- Remove legacy executable sources only after native migration is verified.
- Obtain final human acceptance. No repository commit was created, and no user-installed link or configuration was changed.
