# Tracker: Linear

Selected when the repo's AGENTS.md says work lives in Linear. The repo's own Linear rules (team, labels, projects, writing policy) win over anything here; read them first.

## Coordinator

- Before spawning, search for a ticket that already covers the item. Otherwise create the workstream ticket: team and labels per the repo's rules, title in the product's nouns, a short goal, project when one fits, state In Progress, and a footer naming the worker (`Owner: <slug> worker`). Create it before spawning, never retroactively. Put the key and URL in the brief.
- The Linear GitHub integration links PRs and transitions tickets from the key in the PR. The Coordinator fixes drift only: after merge, comment `Merged <sha>` and set Done only where automation didn't. A parent closes when its last sub-issue lands; don't leave it In Progress while every sub-issue sits In Review.
- Serialize Linear calls; the API rate-limits around ten parallel requests.

## Worker

The ticket is the worker's:

- Document the settled design, decisions, and findings as comments as they happen.
- For each PR, open a sub-issue titled `PR #N: <what>` and put its key in the PR body, so the integration links and transitions it.
- Keep status current: a ticket shows the real state of its work.
