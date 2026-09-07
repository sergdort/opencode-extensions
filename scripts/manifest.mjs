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
      "description": "Use only when the user explicitly invokes $plan-feature. Have Architect draft plan.md immediately, then iterate on program design and test strategy with the user"
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
      "description": "Use only when the user explicitly invokes $start-work. Have Architect implement plan.md through dynamic Developer delegation, then run final review and QA"
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
    "harness": "codex",
    "output": "codex/skills/architect/SKILL.md",
    "template": "templates/codex/skills/architect.md.njk",
    "metadata": {
      "name": "architect",
      "description": "Use only when the user explicitly invokes $architect. Settle feature intent and architecture before planning."
    },
    "legacy": "codex/skills/architect"
  },
  {
    "harness": "codex",
    "output": "codex/skills/architect/agents/openai.yaml",
    "template": "templates/codex/openai.yaml.njk",
    "context": {
      "name": "architect"
    }
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
      "description": "Implement one coherent task or focused fix. Submit task-only local commits when authorized.",
      "model": "gpt-5.6-terra",
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
      "model": "gpt-5.6-luna",
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
      "description": "Read-only adversarial stress-test for one specific decision in an active Architect workflow or an explicit user request. Use sparingly before an uncertain, hard-to-reverse, or broad-blast-radius claim becomes the program-design baseline.",
      "model": "gpt-5.6",
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
      "description": "Deep read-only second opinion for an active Architect workflow or an explicit user request. Use for high-risk architecture, security, persistence, migrations, broad refactors, and high-stakes plans.",
      "model": "gpt-5.6",
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
];
