---
name: github-librarian
description: Run focused read-only GitHub repository research with the optional custom github_librarian agent. Use only when the user invokes $github-librarian.
---

Pass the user's research question verbatim to the custom `github_librarian`
agent. Do not research inline.

If the agent is unavailable, say that the optional Librarian package is not
installed and stop. Do not substitute a different agent without the user's
approval.

Wait for the agent and return its answer without turning the evidence into an
architecture decision. The main Architect owns any decision that follows.
