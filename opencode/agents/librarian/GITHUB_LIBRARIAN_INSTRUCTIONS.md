# GitHub Librarian Delegation Instructions

Use the `github-librarian` subagent for focused GitHub repository research when the answer likely lives in one or more GitHub repositories and broad `gh` searches, tree probes, or fetched file reads would pollute the main session.

Use GitHub Librarian when:

- the exact repo path, symbol, schema, plugin metadata, or upstream implementation is unknown
- external GitHub evidence would materially affect a design, diagnosis, review, or plan
- the user provides repo, owner, ref, path, package, or symbol hints and wants exact locations
- the result needs path-first findings with line-ranged evidence from fetched files

Do not use GitHub Librarian for:

- local repository inspection
- generic web research or documentation lookup
- questions answerable from already-open files or current repo docs
- tasks that require mutating GitHub state, opening PRs, filing issues, or cloning repositories unless explicitly requested
- private repositories where access is unavailable; report 404/403 constraints instead of guessing

When invoking GitHub Librarian, pass a narrow, self-contained query. Include repo names, owners, refs, paths, symbols, package names, or error strings when available. Ask for concise Markdown with Summary, Locations, Evidence, and Searched sections.

Treat GitHub Librarian's response as evidence for the primary agent to use. Do not copy large fetched snippets into the main session, and do not present search-result snippets as proof unless the Librarian fetched and cited the file content.
