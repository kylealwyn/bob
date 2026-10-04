# Harness: Codex

## Worker

`spawn --kind codex` starts it with `--kind codex -- --dangerously-bypass-approvals-and-sandbox`, on the model in `~/.codex/config.toml`; that model must be one the CLI accepts for your login. Codex asks to trust each new folder unless a parent is already trusted in that config; Herdr's worktree directory under a trusted home folder covers it. Trusting a folder is the user's decision, never the Foreman's.

Codex has no cross-session messaging, so its brief's report-back line is `herdr agent prompt foreman-<repo> "[<slug>] ..."`.

## Foreman

Not supported yet. The Foreman needs an event channel and a groom that fires while it is idle; Claude Code has both (Monitor, CronCreate), and the Codex CLI has neither as a tool. `codex queue --thread <session> --message` can deliver a message into a running Codex session and `hooks` are stable, so a bridge from `scripts/watch` and a timer is possible but unbuilt. Run the Foreman in Claude Code; Codex workers are fine.
