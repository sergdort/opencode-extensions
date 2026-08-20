---
description: Align on program design before cutting tickets
argument-hint: "[feature or scope]"
---

Align with me on the program design for ${@:-the change we just approved} before creating any tickets.

You are past discovery: requirements, constraints, and direction are settled. You are not yet
at ticket creation. Do not run `tk create` until I confirm the design in this conversation.

## 1. Show The Implementation Board

Inspect the relevant code and follow repository conventions first. Then present, in the
conversation, the smallest board that makes the design reviewable:

- A component and ownership table.
- Crossing-boundary interface changes as real declarations or diffs in the repository's language.
- A compact shape for each load-bearing relationship, flow, or state machine.
- Open seams that affect implementation.

| Component | Module / file | Owns | Does not own | May depend on |
|---|---|---|---|---|
| `<name>` | `<location>` | <responsibility> | <explicit exclusion> | <closed allowlist or none> |

Prefer tables, declarations, diffs, and call stacks over explanatory paragraphs. Do not restate
the requirements we already agreed on.

## 2. Resolve Program Decisions

Discuss only decisions that materially affect ownership, dependency direction, crossing-boundary
contracts, state or concurrency ownership, persistence, migration, error behavior, cancellation,
or module placement.

Show the relevant shape before each question. Ask one focused question at a time, give concrete
options, and recommend one when repository evidence supports it. Do not ask me to decide private
names, helper signatures, fixtures, or other local implementation details.

Classify each design fact:

- **Settled**: reversal cost or blast radius is material, so it must not change silently.
- **Provisional**: it may be adapted from repository evidence, and the adaptation is reported.

Resolve every blocking seam. A reversible, non-blocking seam may stay provisional.

## 3. Confirm Proof

Once the design holds, state the behaviors and invariants worth proving, the cheapest level that
credibly proves each one, and anything that has to be checked manually. Keep it to a short table.

| ID | Behavior or invariant | Level | Proof |
|---|---|---|---|

## 4. Hand Off To Tickets

Only after I confirm the design and the proof table:

- Cut the normal `tk` ticket tree for this work.
- Put settled ownership rules and crossing-boundary interfaces in `tk create --design`.
- Put the behavior IDs and their expected outcomes in `--acceptance`.
- Leave provisional facts out of the tickets unless a ticket depends on one.

Present the ticket tree for approval as usual. Settled means no silent change, not immutable:
report it to me if implementation evidence disproves a settled rule.

## Architecture Rules

- Give every new or materially changed component one row. Do not list untouched components.
- Keep `Owns` narrow. Use `Does not own` for a responsibility a reader could reasonably misassign.
- Treat `May depend on` as a closed component-level allowlist. List an abstraction instead of its
  implementation when the boundary requires it.
- Treat responsibility, dependency direction, state ownership, public contract semantics,
  persistence, concurrency, errors, cancellation, and module placement as settled when reversal
  is costly.
- Treat private helpers, internal names, local file placement, fixtures, and local dependency
  injection as provisional unless there is a specific reason not to.
- Include a state section only for meaningful lifecycle, recovery, competing outcomes, or effects
  that require cancellation. Name one transition owner and record effects and cancellations.
- Justify a non-obvious choice directly under its proposal in no more than two sentences.

## Visual Rules

Show a compact shape before asking a structural, contract, flow, or state question. Choose the
smallest form that makes the hard relationship easy to scan:

| Question | Preferred shape |
|---|---|
| What owns what, and which types share an abstraction? | Component table or `classDiagram` |
| What contract changes? | Real declaration or `diff` |
| Who calls whom, and in what order? | Call stack or `sequenceDiagram` |
| How does lifecycle or recovery work? | `stateDiagram-v2` plus transition table |
| How do stored entities relate? | `erDiagram` |
| Which option should be selected? | Decision table |

- Use Mermaid only when a table, declaration, diff, or call stack does not show it clearly.
- Give each diagram a heading that states the question it answers.
- Do not put a settled fact only in a diagram. Record it in a table or a real interface.
- Drop a diagram when removing it loses no review-relevant relationship.
