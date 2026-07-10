# Oracle Delegation Instructions

Use the `oracle` subagent for read-only second opinions when working on:

- high-risk architecture or API decisions
- complex debugging after initial investigation
- security-sensitive changes
- data migration, deletion, or persistence changes
- large refactors or broad behavior changes
- code review before risky edits
- implementation plans where a second opinion would materially reduce risk

Do not use `oracle` for:

- routine edits
- formatting-only changes
- simple refactors
- obvious bugs where local inspection already gives a clear answer
- tasks where delegation would cost more than it helps

When invoking `oracle`, provide a self-contained brief with:

- the decision, bug, or change under review
- relevant files, symbols, and constraints
- the proposed approach, if any
- specific questions you want answered
- what kind of output would be useful, such as review findings, architecture critique, risk assessment, or verification plan

Treat Oracle's response as advisory. The primary agent remains responsible for the final decision and implementation.
