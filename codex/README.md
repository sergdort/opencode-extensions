# Codex Workflow

> Migration is pending a native installation decision. The tested CLI rejects symlinked agent TOML files at spawn time. The regular-file control then rejects the existing Oracle model `gpt-5.6`. Do not run the new link helper until these checks pass. See [runtime evidence](../docs/core-generation-proof.md).

Codex uses the same canonical procedures as OpenCode. Native templates provide manual-only skills and custom spawned agents. Generated native files contain the complete procedure; there is no runtime canonical-file include.

## Install

Requires Node.js 22 or newer. From the checkout:

```bash
npm ci
./codex/link-global.sh --dry-run
./codex/link-global.sh
```

The helper links five manual workflow and utility skills into `~/.agents/skills` and four custom agents into `~/.codex/agents`. It also links `show-me` and the standalone `grill-me-architecture` skill directly from `skills/`. Grilling is installed for optional use; the core workflow does not require it.

Override destinations with `CODEX_SKILLS_DIR` and `CODEX_AGENTS_DIR`. Add `--with-librarian` for the unchanged optional Librarian package.

After source updates, rerun the helper. It regenerates both payloads, even when only Codex links are selected. Reload Codex and restart any OpenCode installation linked to this checkout.

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

1. Describe the feature and invoke `$plan-feature`. It inspects the repository, clarifies requirements, and uses `show-me` to explain meaningful choices.
2. Refine the draft. Oracle reviews every plan before final approval. Contrarian challenges one consequential uncertain decision when warranted. The planning agent resolves findings and discloses material changes.
3. Review the disclosed plan, leave native Plan mode if active, and invoke `$start-work` to approve the plan and begin execution. This skill establishes Architect in the main session.
4. Architect routes one coherent task at a time to a Developer. It reviews every submission and correction.
5. Complete combined review, final verification, QA, and human acceptance.

Native Plan mode is optional for `$plan-feature`; the skill does not switch modes. In any mode, it plans without changing product code or dispatching Developers. When native restrictions prevent writing `plan.md`, keep the reviewed draft and review evidence in the conversation or the native plan file. `$start-work` saves that exact disclosed plan when writes are allowed. It does not bypass an active Plan mode.

Use `$plan-feature` to revise an existing plan for the same feature. During implementation, Architect maintains the plan as evidence changes. A conversational approval alone does not start execution. There is no separate `$architect` entry, `$decompose`, ticket queue, or `Ticket:` trailer protocol. The helper removes only retired skill links owned by this checkout; inspect old copied skills manually.

Developers may submit task-owned local commits after focused proof when repository policy and the user permit them. They preserve unrelated working-tree content and index entries. Architect reviews and directs corrections; it does not commit product changes. Development and verification run sequentially. The same Developer resumes corrections when available.

The workflow uses `plan.md`, Git, and the working tree. The plan contains product intent, constraints, design decisions, proof strategy, and execution evidence. No decision brief is required. It never removes planning artifacts automatically; cleanup belongs to the user.

## Skills And Agents

All five generated entry points have `policy.allow_implicit_invocation: false`:

- `$plan-feature [plan-path]`: create or revise the feature plan with visual explanations and review.
- `$start-work [plan-path]`: establish Architect and execute the approved plan.
- `$bro`: restate the last response plainly.
- `$handoff`: write repository-local handoff documents.
- `$review-work [plan-path] [git-range]`: dispatch Oracle for independent implementation review.

Handoff does not create GitHub issues without an explicit user request. Review returns findings; it does not replace human QA or acceptance.

Custom agents:

| Name | Purpose | Default model / effort |
|---|---|---|
| `developer` | Complex or uncertain implementation | `gpt-5.6-terra` / high |
| `developer_luna` | Bounded, directly verifiable implementation | `gpt-5.6-luna` / max |
| `oracle` | Read-only plan and implementation advice | `gpt-5.6` / xhigh |
| `contrarian` | Focused read-only challenge to a design decision | `gpt-5.6` / xhigh |

The main thread keeps its selected model. Use built-in `explorer` for discovery. Model availability depends on the client and account; change native metadata in `scripts/manifest.mjs` and regenerate when needed.

Planning uses the shared `show-me` skill and requires Oracle review. A warranted Contrarian challenge must be resolved before approval. Optional Librarian and repository verification tools do not become core dependencies.

Invoke `$grill-me-architecture` separately when you want a deeper design interview. The planning agent may recommend it for a specific difficult decision, but does not invoke it automatically.

## Permissions And Limits

Use a Codex client that supports skill invocation policy and named custom agents. The templates follow current native tool schemas instead of requiring a fixed tool-call signature.

Developer defaults use `workspace-write`; advisory defaults use `read-only`. Parent live permissions can override spawned-agent sandbox defaults. These settings do not mechanically enforce every Git or read-only prompt boundary.

There is no implicit `AGENTS.md` router, primary-mode emulation, plugin, subprocess harness, automatic model selector, or hidden workflow state. Manual-only metadata controls skill triggering; it does not guarantee that different models behave identically.

Edit shared procedures in `canonical/`, native adapters in `templates/codex/`, and native metadata in `scripts/manifest.mjs`. Run generation and review the golden diff. Do not edit `generated/` or install `tests/golden/`.

Reload Codex after changing skills or custom agents.
