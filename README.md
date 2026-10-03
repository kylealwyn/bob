# Bob

Bob the Engineer: an agent skill that takes a request from understanding to a verified, merged PR. For one task it works inline through focused roles. For a list, it orchestrates: each item becomes a worker in its own git worktree with a written brief, a tracker item, and a PR that Codex and Fable review before merge.

```
you ──/bob <dump>──▶ Coordinator (Herdr pane on main)
                       │ spawn <slug> <brief>
                       ├──▶ worker: worktree + setup + Claude Opus ──▶ PR ──▶ review (Codex + Fable)
                       ├──▶ worker ...
                       │ watch (events) · checkin (drift) · merge at exact head · close
                       ▼
                     you: one line per item, what needs you first
```

## Install

```bash
npx skills add kylealwyn/bob
```

Or clone it and link it into your skills directory:

```bash
git clone https://github.com/kylealwyn/bob ~/dev/bob
ln -s ~/dev/bob ~/.claude/skills/bob
```

Requires, for orchestration: [Herdr](https://herdr.dev), `gh` (authed), `jq`, `python3` (3.11+), `claude`, and `codex` for reviews. Inline work needs none of them.

## Adopt in a repo (five minutes)

1. The repo has a GitHub `origin` with `origin/HEAD` set (`git remote set-head origin --auto`) and `gh auth status` passes.
2. Open a Herdr pane on the repo's main checkout, start Claude, and run `/bob <what you want done>`.
3. Optional, only if the defaults don't fit:
   - **Worktree setup**: `.codex/environments/environment.toml` with a `[setup]` `script` (installs, env files). Bob runs it in each new worktree and fails loudly if it fails. Without it, worktrees get no setup.
   - **Tracker**: GitHub issues on the repo by default. If work lives in Linear, say so in AGENTS.md ("work state lives in Linear", plus your team and label rules).
   - **Verification and preview**: name your test commands and the pre-merge preview lane in AGENTS.md. Workers verify on the PR's own preview, never a shared environment the default branch deploys to.
   - **Merge authority**: Bob merges only when you grant it, in the session or in AGENTS.md. Otherwise it reports PRs ready with their review verdicts.

No Bob config file: everything else is derived from the checkout.

## Layout

```
SKILL.md              identity, roles index, how the repo configures Bob
roles/coordinator.md  intake, inline vs orchestrate, the orchestrator procedure
roles/*.md            focused roles: builder, debugger, reviewer, designer, ...
trackers/github.md    default tracker: GitHub issues
trackers/linear.md    Linear, when AGENTS.md names it
scripts/lib.sh        derives repo, default branch, PR repo, this repo's agents
scripts/{status,spawn,watch,checkin,review,close}
```
