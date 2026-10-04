# Bob

Bob the Engineer is an agent skill that takes a request from understanding to a verified, merged PR. One task, it works inline, switching modes (brainstorm, plan, build, debug, verify, ...) as it goes. A list, the Foreman dispatches it: each item becomes a worker in its own git worktree with a brief, a tracker item, and a PR that Codex and Fable review before merge.

```
/bob <dump> ──▶ Foreman (Herdr pane on the main checkout)
                  ├─ spawn ──▶ worker: worktree + setup + Claude Opus ──▶ PR ──▶ review
                  ├─ spawn ──▶ worker ...
                  ├─ every 10m and on each event: status → one action per worker state
                  ├─ scripts/merge at the reported head · close
                  ▼
                you: one line per item, what needs you first
```

## Install

```bash
npx skills add kylealwyn/bob
```

or clone and link:

```bash
git clone https://github.com/kylealwyn/bob ~/dev/bob
ln -s ~/dev/bob ~/.claude/skills/bob
```

Dispatching workers needs [Herdr](https://herdr.dev), `gh` (authed), `jq`, `python3` 3.11+, `claude`, and `codex`. Inline work needs none of them.

## Adopt in a repo (five minutes)

1. The repo has a GitHub `origin` with `origin/HEAD` set (`git remote set-head origin --auto`), and `gh auth status` passes.
2. Open a Herdr pane on the repo's main checkout, start Claude, run `/bob <what you want done>`.
3. Only if the defaults don't fit:
   - **Setup**: `.codex/environments/environment.toml` with a `[setup]` `script`. Bob runs it in each new worktree and stops if it fails.
   - **Tracker**: GitHub issues by default. If work lives in Linear, say so in AGENTS.md with your team and label rules.
   - **Verification**: test commands and the pre-merge preview lane in AGENTS.md.
   - **Merge authority**: grant it in the session or AGENTS.md. Without it, Bob reports PRs ready with their review verdicts.

## Layout

```
SKILL.md              identity, roles and modes, how the repo configures Bob
roles/foreman.md    the Foreman: intake, spawning, the worker state table, groom, merge
roles/worker.md       a worker: owns one item, decides within it, reports back with the PR
modes/                brainstorm, architect, plan, design, build, debug, verify, review,
                      simplify, document, research
trackers/             github.md (default), linear.md
harnesses/            claude-code.md (Foreman and workers), codex.md (workers)
scripts/lib.sh        derives repo, default branch, PR repo, this repo's agents
scripts/              status, spawn, watch, review, merge, close
```
