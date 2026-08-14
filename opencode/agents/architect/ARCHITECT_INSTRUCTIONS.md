# Architect Routing Instructions

For non-trivial feature work, broad refactors, or architecture decisions that need design before implementation, tell the user to switch to the top-level `architect` agent with the concrete goal. Architect is a primary agent; never invoke it through Task or look for an `/architect` command.

Keep small, obvious edits and simple bug fixes with the normal agent. Do not reroute work that is already in implementation or review unless its direction is materially wrong.
