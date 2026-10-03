# Tracker: GitHub issues

The default tracker. Use it unless the repo's AGENTS.md names another one. Work lives as issues on the repo PRs open against (`gh repo view`).

## Conductor

- Before spawning, find an open issue that already covers the item (`gh issue list --search`); otherwise open one: title in the product's nouns, body with the goal and the user's words. Put its number and URL in the brief.
- After merge, confirm the issue closed (`Closes #N` closes it). If work remains, comment what landed and what's left, and leave it open.

## Worker

The issue is the worker's:

- Comment the settled design, decisions, and findings on the issue as they happen, not in a summary at the end.
- Each PR body references the issue: `Refs #N` for intermediate PRs, `Closes #N` on the PR that finishes it.
- Split work that needs several PRs into a task list on the issue, one line per PR.
