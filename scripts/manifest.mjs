// Exact native output inventory and harness-only configuration.
export const mappings = {
  "opencode": {
    "commands": {
      "plan": "/plan-feature",
      "start": "/start-work",
      "review": "/review-work"
    },
    "roles": {
      "bounded": "developer-luna",
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
      "plan": "$plan-feature",
      "start": "$start-work",
      "review": "$review-work"
    },
    "roles": {
      "bounded": "developer_luna",
      "review": "oracle"
    },
    "inputs": {
      "arguments": "user-supplied skill arguments",
      "plan": "plan-path",
      "range": "git-range"
    }
  }
};

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
      "description": "Use only when the user explicitly invokes $review-work. Optional independent review of the completed plan implementation; does not replace human QA or acceptance"
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
    "output": "opencode/commands/plan-feature.md",
    "template": "templates/opencode/commands/plan-feature.md.njk",
    "legacy": "opencode/commands/plan-feature.md"
  },
  {
    "harness": "codex",
    "output": "codex/skills/plan-feature/SKILL.md",
    "template": "templates/codex/skills/plan-feature.md.njk",
    "metadata": {
      "name": "plan-feature",
      "description": "Use only when the user explicitly invokes $plan-feature. Plan with show-me, clarify requirements, and review the plan before approval. Native Plan mode is optional"
    },
    "legacy": "codex/skills/plan-feature"
  },
  {
    "harness": "codex",
    "output": "codex/skills/plan-feature/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "plan-feature"
    }
  },
  {
    "harness": "opencode",
    "output": "opencode/commands/start-work.md",
    "template": "templates/opencode/commands/start-work.md.njk",
    "legacy": "opencode/commands/start-work.md"
  },
  {
    "harness": "codex",
    "output": "codex/skills/start-work/SKILL.md",
    "template": "templates/codex/skills/start-work.md.njk",
    "metadata": {
      "name": "start-work",
      "description": "Use only when the user explicitly invokes $start-work. Act as Architect to execute the approved plan through Developer delegation, review, and QA"
    },
    "legacy": "codex/skills/start-work"
  },
  {
    "harness": "codex",
    "output": "codex/skills/start-work/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "start-work"
    }
  },
  {
    "harness": "opencode",
    "output": "opencode/agents/architect.md",
    "template": "templates/opencode/agents/architect.md.njk",
    "context": {},
    "legacy": "opencode/agents/architect/agents/architect.md",
    "required": []
  },
  {
    "harness": "opencode",
    "output": "opencode/agents/developer.md",
    "template": "templates/opencode/agents/developer.md.njk",
    "context": {
      "bounded": false
    },
    "legacy": "opencode/agents/architect/agents/developer.md",
    "required": [
      "bounded"
    ]
  },
  {
    "harness": "codex",
    "output": "codex/agents/developer.toml",
    "template": "templates/codex/agents/developer.md.njk",
    "format": "toml",
    "metadata": {
      "name": "developer",
      "description": "Resolve uncertain implementation and establish verified working patterns. Submit task-only local commits when authorized.",
      "model": "gpt-6-sol",
      "model_reasoning_effort": "high",
      "sandbox_mode": "workspace-write"
    },
    "context": {
      "bounded": false
    },
    "required": [
      "bounded"
    ],
    "legacy": "codex/agents/developer.toml"
  },
  {
    "harness": "opencode",
    "output": "opencode/agents/developer-luna.md",
    "template": "templates/opencode/agents/developer-luna.md.njk",
    "context": {
      "bounded": true
    },
    "legacy": "opencode/agents/architect/agents/developer-luna.md",
    "required": [
      "bounded"
    ]
  },
  {
    "harness": "codex",
    "output": "codex/agents/developer_luna.toml",
    "template": "templates/codex/agents/developer_luna.md.njk",
    "format": "toml",
    "metadata": {
      "name": "developer_luna",
      "model": "gpt-6-luna",
      "model_reasoning_effort": "max",
      "sandbox_mode": "workspace-write",
      "description": "Implement one bounded, directly verifiable task. Escalate uncertain work to the complex Developer."
    },
    "context": {
      "bounded": true
    },
    "required": [
      "bounded"
    ],
    "legacy": null
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
      "description": "Read-only adversarial stress-test for one specific decision during feature planning, execution, or an explicit user request. Use when an uncertain, hard-to-reverse, or cross-component claim needs a challenge.",
      "model": "gpt-6-astra",
      "model_reasoning_effort": "xhigh",
      "sandbox_mode": "read-only"
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
      "description": "Read-only review of every feature plan before approval, or a second opinion during execution or an explicit user request. Check correctness, missing cases, repository fit, and verification.",
      "model": "gpt-6-astra",
      "model_reasoning_effort": "xhigh",
      "sandbox_mode": "read-only"
    },
    "context": {},
    "required": [],
    "legacy": "codex/agents/oracle.toml"
  },
  {
    "harness": "opencode",
    "output": "opencode/ARCHITECT_INSTRUCTIONS.md",
    "template": "templates/opencode/ARCHITECT_INSTRUCTIONS.md.njk",
    "legacy": "opencode/agents/architect/ARCHITECT_INSTRUCTIONS.md"
  }
];

export const retired = [
  { harness: 'opencode', destination: 'commands/decompose.md', legacy: 'opencode/commands/decompose.md' },
  { harness: 'codex', destination: 'skills/decompose', legacy: 'codex/skills/decompose' },
  { harness: 'codex', destination: 'skills/architect', legacy: 'codex/skills/architect' },
];
