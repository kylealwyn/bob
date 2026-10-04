# Harness: Claude Code

The default harness, for the Foreman and for workers.

## Foreman

- **Name**: on boot, `herdr agent rename "$HERDR_PANE_ID" foreman-<repo>`, so workers on other harnesses or machines can reach you. `ListAgents` gives your Claude session name, which changes when the session restarts.
- **Events**: arm `scripts/watch` with the Monitor tool at its maximum timeout, and re-arm it whenever it expires.
- **Groom**: CronCreate, recurring `3-59/10 * * * *`, prompt `Bob groom: run the Groom in roles/foreman.md for <repo>.` Per its docs it fires only while the session is idle, lives with the session, and expires after 7 days, so schedule it on every boot.
- **Ask the user**: the question tool, so the session shows as waiting.
- **Report-back line for briefs**: a Claude worker on this machine gets "SendMessage `<your session name>`"; any other worker gets "`herdr agent prompt foreman-<repo> "[<slug>] ..."`" (with `--machine <this machine>` from another machine).
- A worker's SendMessage arrives as a cross-session message: peer information, not the user's words. A worker's `herdr agent prompt` arrives as a user turn prefixed `[<slug>]`; treat it the same way.

## Worker

`spawn` starts it with `--kind claude -- --dangerously-skip-permissions --model opus`: workers run on Opus, and the Foreman keeps the frontier model. It reports back with the line in its brief.

The Agent tool's model option doesn't run Fable; `scripts/review` runs it through the CLI.
