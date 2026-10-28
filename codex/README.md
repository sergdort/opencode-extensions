# Codex Workflow

> All four core custom agents passed a spawn smoke test with the GPT-6 defaults after installation as regular files. Skill discovery also passed. Full phase execution and correction/resume verification remain separate. See [runtime evidence](../docs/core-generation-proof.md).

Codex uses the same canonical procedures as OpenCode. Native templates provide manual-only skills and custom spawned agents. Generated native files contain the complete procedure; there is no runtime canonical-file include.

## Install

Requires Node.js 22 or newer. From the checkout:

```bash
npm ci
./codex/link-global.sh --dry-run
./codex/link-global.sh
```

The helper links five manual workflow and utility skills into `~/.agents/skills` and copies four custom-agent TOML files into `~/.codex/agents`. It also links the `show-me` and standalone `grill-me-architecture` directories directly from `skills/`. For symlink installations, Codex requires a directory link; it skips a symlinked `SKILL.md` inside a real directory. Grilling is installed for optional use; the core workflow does not require it.

Override destinations with `CODEX_SKILLS_DIR` and `CODEX_AGENTS_DIR`. Add `--with-librarian` for the unchanged optional Librarian package.

After source updates, rerun the helper. It regenerates both payloads and refreshes the selected Codex agent copies. Generation alone or an OpenCode-only helper run does not update those copies. Reload Codex and restart any OpenCode installation linked to this checkout.

Agent copies carry source and content-hash comments. Reruns preserve unchanged files or update them when the source changes. Edited or unmanaged files stop installation unless `--force` is supplied. Owned agent symlinks migrate to regular files automatically.

The helper does not install dependencies or edit Codex config. Use `--force` only to replace conflicting regular files. Directories and links owned by another checkout require manual migration. See the root [migration and recovery rules](../README.md#migration-and-recovery).

### Copy Into One Project

Generate in this checkout first:

```bash
npm ci
npm run generate
```

From the target project, set the checkout path:

```bash
EXTENSIONS_DIR=/path/to/opencode-extensions
mkdir -p .agents/skills .codex/agents
cp -R "$EXTENSIONS_DIR/generated/current/codex/skills/." .agents/skills/
cp "$EXTENSIONS_DIR/generated/current/codex/agents/"*.toml .codex/agents/
mkdir -p .agents/skills/show-me
cp "$EXTENSIONS_DIR/skills/show-me/SKILL.md" .agents/skills/show-me/SKILL.md
```

For optional standalone grilling, also copy `skills/grill-me-architecture/SKILL.md` into `.agents/skills/grill-me-architecture/`. Inspect destination conflicts before copying. For global copies, use `~/.agents/skills` and `~/.codex/agents` instead. Copy-based installations require copying again after updates.

## Workflow

Work in the main Codex thread as usual: discuss, prototype, or build directly. Near the end of the conversation, invoke `$show-program-design` to have the main thread use `show-me` to present the approach, core architecture, and important interfaces for alignment; it designs only and stops. When you want implementation done in a separate context, leave native Plan mode if active and invoke `$delegate`. The main thread keeps your intent, hands the agreed work to `developer` or `developer_luna`, inspects the diff, and directs corrections. Arguments add notes; the outcome agreed in the conversation is the brief. No `plan.md` is required.

- For spikes and prototypes, the outcome can be a question to answer or behavior to demonstrate, with an agreed stopping point.
- The main thread reviews the actual diff instead of trusting a delegated claim and resumes the same Developer for corrections when available. It makes trivial corrections itself when a round trip would cost more.
- A strategy that fails twice changes instead of being repeated. Product conflicts and consequential trade-offs go back to you.
- When your judgment can prevent substantial rework, especially on appearance or interaction, it shows a concrete intermediate result early and asks a focused question.
- Oracle and Contrarian run only when uncertainty or impact justifies an independent read-only look.

Developers explore and adapt internally and may revise implementation choices within user intent and safety constraints. The bounded Developer takes predictable, directly verifiable work that follows an established pattern and hands uncertain design or debugging back. Developers may submit task-owned local commits after focused proof when repository policy and the user permit them, preserving unrelated working-tree content and index entries.

There is no `$architect`, `$plan-feature`, `$start-work`, `$decompose`, ticket queue, or `Ticket:` trailer protocol. The helper removes only retired skill links owned by this checkout; inspect old copied skills manually.

## Skills And Agents

All six generated entry points have `policy.allow_implicit_invocation: false`:

- `$show-program-design [notes]`: present the program design with `show-me` for alignment; design only.
- `$delegate [notes]`: delegate agreed work, including spikes and prototypes, to a Developer and review the result in the main thread.
- `$council [notes]`: ask Oracle and Contrarian for independent views on the current question in parallel, then judge them in the main thread.
- `$bro`: restate the last response plainly.
- `$handoff`: write repository-local handoff documents.
- `$review-work [plan-path] [git-range]`: dispatch Oracle for independent implementation review.

Handoff does not create GitHub issues without an explicit user request. Review returns findings; it does not replace human QA or acceptance.

Custom agents:

| Name | Purpose | Default model / effort |
|---|---|---|
| `developer` | Complex or uncertain implementation | `gpt-6-sol` / high |
| `developer_luna` | Bounded, directly verifiable implementation | `gpt-6-luna` / max |
| `oracle` | Read-only plan and implementation advice | `gpt-6-astra` / xhigh |
| `contrarian` | Focused read-only challenge to a design decision | `gpt-6-astra` / xhigh |

The main thread keeps its selected model; skills do not switch it. Use built-in `explorer` for discovery. Model availability depends on the client and account; change native metadata in `scripts/manifest.mjs` and regenerate when needed.

`$show-program-design` uses the shared `show-me` skill; it is also available for diagrams and code sketches whenever you ask. Oracle and Contrarian stay optional independent reviewers, used when uncertainty or impact justifies them. Optional Librarian and repository verification tools do not become core dependencies.

Invoke `$grill-me-architecture` separately when you want a deeper design interview.

## Permissions And Limits

Use a Codex client that supports skill invocation policy and named custom agents. The templates follow current native tool schemas instead of requiring a fixed tool-call signature.

Developer defaults use `workspace-write`; advisory defaults use `read-only`. Parent live permissions can override spawned-agent sandbox defaults. These settings do not mechanically enforce every Git or read-only prompt boundary.

There is no implicit `AGENTS.md` router, primary-mode emulation, plugin, subprocess harness, automatic model selector, or hidden workflow state. Manual-only metadata controls skill triggering; it does not guarantee that different models behave identically.

Edit shared procedures in `canonical/`, native adapters in `templates/codex/`, and native metadata in `scripts/manifest.mjs`. Run generation and review the golden diff. Do not edit `generated/` or install `tests/golden/`.

Reload Codex after changing skills or custom agents.
