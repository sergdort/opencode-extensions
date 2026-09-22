---
name: show-me
description: Help the user understand the current topic visually with concise diagrams, code-shape sketches, and focused HTML artifacts.
---

Help the user understand the current topic visually. Keep prose brief. Pick the smallest view that makes the decision or explanation clear.

| Topic | Useful shape |
|---|---|
| Logic or an algorithm | Pseudocode |
| Runtime control flow | Call tree |
| UI composition, state, or module boundaries | Component tree |
| File responsibilities or a broad refactor | Shallow file tree |
| A change to existing structure or behavior | Focused `diff` |
| Component interaction, ordering, or data flow | Mermaid diagram |
| Options, ownership, or state transitions | Small comparison table |
| Visual layout or interaction | Focused HTML artifact when permitted |

Show what changes when the current shape is already known:

```diff
 submitForm
   createSession
+    validateInput
     persistPrompt
     launchAgent
```

Show the complete relevant shape when it is mostly new or when omitted context would hide ownership or order:

```text
on(save)
  if content is unchanged
    return cached result
  write new content
  invalidate cache
```

For a visual UI, layout comparison, or a concept too dense for a small diagram, create one focused HTML artifact when the active mode permits file writes. Match the product's colors, typography, and spacing. Use real labels and data. Support desktop and mobile, and open the result with the available preview tool.

Respect the active mode's file and tool restrictions. When file writes are prohibited, use inline code, tables, or diagrams.

Place each visual next to the short text or question it supports. Keep only the files, calls, components, states, and boundaries needed for the current decision. Do not force a visual when one sentence is clearer. Do not replace a wall of prose with a wall of artifacts.
