// Exact native output inventory and harness-only configuration.
export const mappings = {
  "opencode": {
    "commands": {
      "review": "/review-work",
      "delegate": "/delegate"
    },
    "roles": {
      "review": "review"
    },
    "inputs": {
      "arguments": "$ARGUMENTS",
      "plan": "$1",
      "range": "$2"
    }
  },
  "codex": {
    "commands": {
      "review": "$review-work",
      "delegate": "$delegate"
    },
    "roles": {
      "review": "oracle"
    },
    "inputs": {
      "arguments": "user-supplied skill arguments",
      "plan": "plan-path",
      "range": "git-range"
    }
  },
  "claude": {
    "commands": {
      "review": "/review-work",
      "delegate": "/delegate"
    },
    "roles": {
      "review": "oracle"
    },
    "inputs": {
      "arguments": "$ARGUMENTS",
      "plan": "$1",
      "range": "$2"
    }
  }
};


// Claude Code subagents send `model` verbatim. GPT models need CLIProxyAPI; the `(level)` suffix sets their effort.
const claudeEntries = [
  ...[
    ["bro", "Restate the last response in plain, concise language", null],
    ["handoff", "Create repo-local handoff documents for a fresh agent", "[focus or instructions]"],
    ["review-work", "Optional independent review of the implementation by oracle; does not replace human QA or acceptance", "[plan-path-or-directory] [git-range]"],
    ["delegate", "Delegate agreed work to a Developer subagent and review the result in this session, including spikes and prototypes", "[notes]"],
    ["show-program-design", "Show the program design for agreed work with show-me so the approach, architecture, and key interfaces are aligned before building; design only", "[notes]"],
    ["council", "Ask oracle and contrarian for independent views on the current question in parallel, then judge them and continue the discussion", "[question or notes]"],
    ["sol-review", "Review the current change for bugs with sol-reviewer and astra-reviewer in parallel, fix agreed findings, and re-check once", "[git-base-or-range] [notes]"],
  ].map(([name, description, hint]) => ({
    "harness": "claude",
    "output": `claude/commands/${name}.md`,
    "template": `templates/claude/commands/${name}.md.njk`,
    "metadata": hint
      ? { description, "argument-hint": hint, "disable-model-invocation": true }
      : { description, "disable-model-invocation": true },
    "legacy": name === "handoff" ? "claude/commands/handoff.md" : null,
  })),
  {
    "harness": "claude",
    "output": "claude/agents/developer.md",
    "template": "templates/claude/agents/developer.md.njk",
    "legacy": "claude/agents/developer.md",
    "metadata": {
      "name": "developer",
      "description": "Implements product code, exploring and adapting as evidence emerges. Submits task-only local commits when authorized.",
      "model": "claude-sonnet-5-5",
      "effort": "high"
    },
  },
  {
    "harness": "claude",
    "output": "claude/agents/contrarian.md",
    "template": "templates/claude/agents/contrarian.md.njk",
    "legacy": "claude/agents/contrarian.md",
    "metadata": {
      "name": "contrarian",
      "description": "Adversarial challenge to one uncertain, hard-to-reverse, or consequential decision when an independent stress test is warranted. Do not use for routine review.",
      "model": "gpt-6.2-astra(xhigh)"
    }
  },
  {
    "harness": "claude",
    "output": "claude/agents/oracle.md",
    "template": "templates/claude/agents/oracle.md.njk",
    "legacy": "claude/agents/oracle.md",
    "metadata": {
      "name": "oracle",
      "description": "Second opinion on plans, designs, diagnoses, and code changes when uncertainty or impact justifies it. Considers consequential defects and excess scope, complexity, or tests.",
      "model": "claude-fable-5-2",
      "effort": "high"
    }
  },
  {
    "harness": "claude",
    "output": "claude/agents/sol-reviewer.md",
    "template": "templates/claude/agents/sol-reviewer.md.njk",
    "metadata": {
      "name": "sol-reviewer",
      "description": "Correctness review of one code change for bugs, edge cases, broken callers, and mismatch with intent. Use only through /sol-review or when the user asks for a Sol review; not for design review.",
      "model": "gpt-6.2-sol(high)"
    },
    "context": { "reviewer": { "name": "Sol Reviewer", "prefix": "S" } },
    "required": ["reviewer"]
  },
  {
    "harness": "claude",
    "output": "claude/agents/astra-reviewer.md",
    "template": "templates/claude/agents/astra-reviewer.md.njk",
    "metadata": {
      "name": "astra-reviewer",
      "description": "Correctness review of one code change for bugs, edge cases, broken callers, and mismatch with intent. Runs on Astra beside sol-reviewer. Use only through /sol-review or when the user asks for an Astra review; not for design review.",
      "model": "gpt-6.2-astra(high)"
    },
    "context": { "reviewer": { "name": "Astra Reviewer", "prefix": "A" } },
    "required": ["reviewer"]
  },
];

export const entries = [
  {
    "harness": "opencode",
    "output": "opencode/commands/bro.md",
    "template": "templates/opencode/commands/bro.md.njk",
    "legacy": "opencode/commands/bro.md"
  },
  {
    "harness": "codex",
    "output": "codex/skills/bro/SKILL.md",
    "template": "templates/codex/skills/bro.md.njk",
    "metadata": {
      "name": "bro",
      "description": "Use only when the user explicitly invokes $bro. Restate the last response in plain, concise language"
    },
    "legacy": null
  },
  {
    "harness": "codex",
    "output": "codex/skills/bro/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "bro"
    }
  },
  {
    "harness": "opencode",
    "output": "opencode/commands/handoff.md",
    "template": "templates/opencode/commands/handoff.md.njk",
    "legacy": "opencode/commands/handoff.md"
  },
  {
    "harness": "codex",
    "output": "codex/skills/handoff/SKILL.md",
    "template": "templates/codex/skills/handoff.md.njk",
    "metadata": {
      "name": "handoff",
      "description": "Use only when the user explicitly invokes $handoff. Create repo-local handoff documents for a fresh agent"
    },
    "legacy": null
  },
  {
    "harness": "codex",
    "output": "codex/skills/handoff/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "handoff"
    }
  },
  {
    "harness": "opencode",
    "output": "opencode/commands/review-work.md",
    "template": "templates/opencode/commands/review-work.md.njk",
    "legacy": "opencode/commands/review-work.md"
  },
  {
    "harness": "codex",
    "output": "codex/skills/review-work/SKILL.md",
    "template": "templates/codex/skills/review-work.md.njk",
    "metadata": {
      "name": "review-work",
      "description": "Use only when the user explicitly invokes $review-work. Optional independent review of the implementation; does not replace human QA or acceptance"
    },
    "legacy": null
  },
  {
    "harness": "codex",
    "output": "codex/skills/review-work/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "review-work"
    }
  },
  {
    "harness": "opencode",
    "output": "opencode/commands/delegate.md",
    "template": "templates/opencode/commands/delegate.md.njk"
  },
  {
    "harness": "codex",
    "output": "codex/skills/delegate/SKILL.md",
    "template": "templates/codex/skills/delegate.md.njk",
    "metadata": {
      "name": "delegate",
      "description": "Use only when the user explicitly invokes $delegate. Delegate agreed work to a developer subagent and review the result in this session, including spikes and prototypes"
    },
    "legacy": null
  },
  {
    "harness": "codex",
    "output": "codex/skills/delegate/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "delegate"
    }
  },
  {
    "harness": "opencode",
    "output": "opencode/commands/show-program-design.md",
    "template": "templates/opencode/commands/show-program-design.md.njk"
  },
  {
    "harness": "codex",
    "output": "codex/skills/show-program-design/SKILL.md",
    "template": "templates/codex/skills/show-program-design.md.njk",
    "metadata": {
      "name": "show-program-design",
      "description": "Use only when the user explicitly invokes $show-program-design. Show the program design for agreed work with show-me so the approach, architecture, and key interfaces are aligned before building; design only"
    },
    "legacy": null
  },
  {
    "harness": "codex",
    "output": "codex/skills/show-program-design/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "show-program-design"
    }
  },
  {
    "harness": "opencode",
    "output": "opencode/commands/council.md",
    "template": "templates/opencode/commands/council.md.njk"
  },
  {
    "harness": "codex",
    "output": "codex/skills/council/SKILL.md",
    "template": "templates/codex/skills/council.md.njk",
    "metadata": {
      "name": "council",
      "description": "Use only when the user explicitly invokes $council. Ask oracle and contrarian for independent views on the current question in parallel, then judge them and continue the discussion"
    },
    "legacy": null
  },
  {
    "harness": "codex",
    "output": "codex/skills/council/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "council"
    }
  },
  {
    "harness": "opencode",
    "output": "opencode/commands/sol-review.md",
    "template": "templates/opencode/commands/sol-review.md.njk"
  },
  {
    "harness": "opencode",
    "output": "opencode/agents/sol-reviewer.md",
    "template": "templates/opencode/agents/sol-reviewer.md.njk",
    "context": { "reviewer": { "name": "Sol Reviewer", "prefix": "S" } },
    "required": ["reviewer"]
  },
  {
    "harness": "opencode",
    "output": "opencode/agents/astra-reviewer.md",
    "template": "templates/opencode/agents/astra-reviewer.md.njk",
    "context": { "reviewer": { "name": "Astra Reviewer", "prefix": "A" } },
    "required": ["reviewer"]
  },
  {
    "harness": "opencode",
    "output": "opencode/agents/developer.md",
    "template": "templates/opencode/agents/developer.md.njk",
    "legacy": "opencode/agents/architect/agents/developer.md"
  },
  {
    "harness": "codex",
    "output": "codex/agents/developer.toml",
    "template": "templates/codex/agents/developer.md.njk",
    "format": "toml",
    "metadata": {
      "name": "developer",
      "description": "Implement product code, exploring and adapting as evidence emerges. Submit task-only local commits when authorized.",
      "model": "gpt-6-sol",
      "model_reasoning_effort": "high"
    },
    "legacy": "codex/agents/developer.toml"
  },
  {
    "harness": "opencode",
    "output": "opencode/agents/contrarian.md",
    "template": "templates/opencode/agents/contrarian.md.njk",
    "context": {},
    "legacy": "opencode/agents/architect/agents/contrarian.md",
    "required": []
  },
  {
    "harness": "codex",
    "output": "codex/agents/contrarian.toml",
    "template": "templates/codex/agents/contrarian.md.njk",
    "format": "toml",
    "metadata": {
      "name": "contrarian",
      "description": "Adversarial challenge to one uncertain, hard-to-reverse, or consequential decision when an independent stress test is warranted.",
      "model": "gpt-6.2-astra",
      "model_reasoning_effort": "xhigh"
    },
    "context": {},
    "required": [],
    "legacy": "codex/agents/contrarian.toml"
  },
  {
    "harness": "opencode",
    "output": "opencode/agents/oracle.md",
    "template": "templates/opencode/agents/oracle.md.njk",
    "context": {},
    "legacy": "opencode/agents/oracle/agents/oracle.md",
    "required": []
  },
  {
    "harness": "codex",
    "output": "codex/agents/oracle.toml",
    "template": "templates/codex/agents/oracle.md.njk",
    "format": "toml",
    "metadata": {
      "name": "oracle",
      "description": "Second opinion during planning or execution, or an explicit user request. Considers consequential defects and excess scope, complexity, or tests.",
      "model": "gpt-6-astra",
      "model_reasoning_effort": "xhigh"
    },
    "context": {},
    "required": [],
    "legacy": "codex/agents/oracle.toml"
  },
  ...claudeEntries,
];

export const retired = [
  { harness: 'opencode', destination: 'commands/decompose.md', legacy: 'opencode/commands/decompose.md' },
  { harness: 'codex', destination: 'skills/decompose', legacy: 'codex/skills/decompose' },
  { harness: 'codex', destination: 'skills/architect', legacy: 'codex/skills/architect' },
  { harness: 'opencode', destination: 'agents/architect.md', legacy: 'opencode/agents/architect/agents/architect.md' },
  { harness: 'opencode', destination: 'ARCHITECT_INSTRUCTIONS.md', legacy: 'opencode/agents/architect/ARCHITECT_INSTRUCTIONS.md' },
  { harness: 'opencode', destination: 'commands/plan-feature.md', legacy: 'opencode/commands/plan-feature.md' },
  { harness: 'opencode', destination: 'commands/start-work.md', legacy: 'opencode/commands/start-work.md' },
  { harness: 'codex', destination: 'skills/plan-feature', legacy: 'codex/skills/plan-feature' },
  { harness: 'codex', destination: 'skills/start-work', legacy: 'codex/skills/start-work' },
  ...['architect', 'plan-feature', 'decompose', 'start-work'].map(name =>
    ({ harness: 'claude', destination: `commands/${name}.md`, legacy: `claude/commands/${name}.md` })),
  { harness: 'claude', destination: 'agents/repo-scout.md', legacy: 'claude/agents/repo-scout.md' },
  { harness: 'claude', destination: 'agents/developer-luna.md', legacy: 'claude/agents/developer-luna.md' },
  { harness: 'opencode', destination: 'agents/developer-luna.md', legacy: 'opencode/agents/architect/agents/developer-luna.md' },
  { harness: 'codex', destination: 'agents/developer_luna.toml', legacy: 'codex/agents/developer_luna.toml' },
];
