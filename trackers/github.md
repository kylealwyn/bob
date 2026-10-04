# Tracker: GitHub issues

The default tracker. Use it unless the repo's AGENTS.md names another one. Work lives as issues on the repo PRs open against (`gh repo view`).

## Foreman

- Before spawning, find an open issue that already covers the item (`gh issue list --search`); otherwise open one: title in the product's nouns, body with the goal and the user's words. Put its number and URL in the brief.
- Follow-ups are issues labeled `follow-up` (create the label once if missing): `gh issue list --label follow-up --state open`. Each groom gives every open one a disposition.
- After merge, confirm the issue closed (`Closes #N` closes it). If work remains, comment what landed and what's left, and leave it open.
- The item's retro (`modes/retro.md`) is a comment on the issue, posted before closing the workspace: facts, friction, cause, and the lesson's PR or "none".

## Worker

The issue is the worker's:

- Comment the settled design, decisions, and findings on the issue as they happen, not in a summary at the end.
- Each PR body references the issue: `Refs #N` for intermediate PRs, `Closes #N` on the PR that finishes it.
- Split work that needs several PRs into a task list on the issue, one line per PR.
- File each follow-up when you find it: `gh issue create --label follow-up` (`gh label create follow-up` first if it's missing), title in the product's nouns, body with what you saw, where, why it matters, and `Found in #<issue>`. Never fix it on your branch.
