# Harness: Claude Code

The default harness, for the Foreman and for workers.

## Foreman

- **Address**: your pane id (`$HERDR_PANE_ID`, e.g. `w7:p1`) is how workers on other harnesses or machines reach you; it's unique and lasts as long as the pane. `ListAgents` gives your Claude session name, which changes when the session restarts.
- **Events**: arm `scripts/watch` with the Monitor tool at its maximum timeout, and re-arm it whenever it expires.
- **Groom**: CronCreate, recurring `3-59/10 * * * *`, prompt `Bob groom: run the Groom in roles/foreman.md for <repo>.` Per its docs it fires only while the session is idle, lives with the session, and expires after 7 days, so schedule it on every boot.
- **Ask the user**: the question tool, so the session shows as waiting.
- **Report-back line for briefs**: a Claude worker on this machine gets "SendMessage `<your session name>`". Any other worker gets the Herdr line, which waits out a question form you're showing (Herdr rejects a prompt to a blocked agent) and then delivers: `herdr agent wait <your pane id> --until idle --until done --until working && herdr agent prompt <your pane id> "[<slug>] ..."`, with `--machine <this machine>` on both from another machine.
- A worker's SendMessage arrives as a cross-session message: peer information, not the user's words. A worker's `herdr agent prompt` arrives as a user turn prefixed `[<slug>]`; treat it the same way.

## Worker

`scripts/spawn` starts it (the default kind) with `--dangerously-skip-permissions --model opus`: workers run on Opus, and the Foreman keeps the frontier model. It reports back with the line in its brief.

The Agent tool's model option doesn't run Fable; `scripts/review` runs it through the CLI.
