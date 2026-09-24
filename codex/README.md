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

1. Describe the feature and invoke `$plan-feature`. It inspects the repository, clarifies the outcome, constraints, and what would demonstrate success, then identifies a useful next step. `show-me` visuals help only when they help.
2. Discuss the note and refine it with the user. Independent Oracle or Contrarian review runs only when uncertainty or impact justifies it; no findings is a valid outcome. Grilling runs only at the user's request.
3. When you are ready to build, leave native Plan mode if active and invoke `$start-work`. It establishes Architect in the main session and executes the agreed outcome.
4. Architect picks the next useful step from evidence and delegates product code to a Developer, choosing the complex or bounded route by the work at hand. It reviews results and directs corrections.
5. Verify with the smallest credible checks, hand off what remains manual, and finish with human acceptance.

When user judgment can prevent substantial rework, Architect shows a concrete intermediate result and asks for focused feedback, especially on appearance or interaction. This is not a required approval step. Independent work continues while work that depends on the answer waits.

Native Plan mode is optional for `$plan-feature`; the skill does not switch modes. In any mode, it plans without changing product code or dispatching Developers. When native restrictions prevent writing `plan.md`, keep the note in the conversation or the native plan file. `$start-work` respects a supplied plan path and never falls back silently; an outcome already agreed in the conversation is enough to execute. It does not bypass an active Plan mode.

Use `$plan-feature` to revise the note for the same feature. During implementation, Architect keeps it current when a decision changes. A conversational approval alone does not start execution. There is no separate `$architect` entry, `$decompose`, ticket queue, or `Ticket:` trailer protocol. The helper removes only retired skill links owned by this checkout; inspect old copied skills manually.

Developers explore and adapt internally and may revise implementation choices as they learn, within user intent and established safety constraints. The bounded Developer takes predictable, directly verifiable work that follows an established pattern and hands uncertain design or debugging back. Developers may submit task-owned local commits after focused proof when repository policy and the user permit them, preserving unrelated working-tree content and index entries. Architect reviews and directs corrections; it does not commit product changes. The same Developer resumes corrections when available.

The workflow uses `plan.md`, Git, and the working tree. `plan.md` is a lightweight durable note: outcome, constraints, decisions worth keeping, what would demonstrate success, the next step, and honest evidence. No template or decision brief is required. It never removes planning artifacts automatically; cleanup belongs to the user.

## Skills And Agents

All five generated entry points have `policy.allow_implicit_invocation: false`:

- `$plan-feature [plan-path]`: clarify the outcome, constraints, and what would demonstrate success, then pick a useful next step (planning only).
- `$start-work [plan-path]`: establish Architect and execute the agreed outcome.
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

Select `gpt-6-sol` with `high` reasoning for planning and Architect execution. The main thread keeps its selected model; skills do not switch it. Use built-in `explorer` for discovery. Model availability depends on the client and account; change native metadata in `scripts/manifest.mjs` and regenerate when needed.

Planning uses the shared `show-me` skill when a visual helps. Oracle and Contrarian stay optional independent reviewers, used when uncertainty or impact justifies them. Optional Librarian and repository verification tools do not become core dependencies.

Invoke `$grill-me-architecture` separately when you want a deeper design interview. The planning agent may recommend it for a specific difficult decision, but does not invoke it automatically.

## Permissions And Limits

Use a Codex client that supports skill invocation policy and named custom agents. The templates follow current native tool schemas instead of requiring a fixed tool-call signature.

Developer defaults use `workspace-write`; advisory defaults use `read-only`. Parent live permissions can override spawned-agent sandbox defaults. These settings do not mechanically enforce every Git or read-only prompt boundary.

There is no implicit `AGENTS.md` router, primary-mode emulation, plugin, subprocess harness, automatic model selector, or hidden workflow state. Manual-only metadata controls skill triggering; it does not guarantee that different models behave identically.

Edit shared procedures in `canonical/`, native adapters in `templates/codex/`, and native metadata in `scripts/manifest.mjs`. Run generation and review the golden diff. Do not edit `generated/` or install `tests/golden/`.

Reload Codex after changing skills or custom agents.
