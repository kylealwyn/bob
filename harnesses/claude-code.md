# Harness: Claude Code

The default harness, for the Foreman and for workers.

## Bypass, always

The Foreman and every worker run in bypass permissions. `spawn` passes the flag, but after a Herdr restart agents come back through their resume command (`claude --resume <id>`) without launch flags, so bypass has to be the CLI's default: `permissions.defaultMode` is `bypassPermissions` in `~/.claude/settings.json`. A first launch on a machine may offer to switch the default to auto mode, with Yes pre-selected; choose "No, keep bypass permissions". Mixed modes also make Claude Code hold cross-session messages for the user to deliver by hand.

## Foreman

- **Address**: your pane id (`$HERDR_PANE_ID`, e.g. `w7:p1`) is how workers on other harnesses or machines reach you; it's unique and lasts as long as the pane. `ListAgents` gives your Claude session name, which changes when the session restarts.
- **Events**: arm `scripts/watch` with the Monitor tool at its maximum timeout, and re-arm it whenever it expires.
- **Groom**: CronCreate, recurring `3-59/10 * * * *`, prompt `Bob groom: run the Groom in roles/foreman.md for <repo>.` Per its docs it fires only while the session is idle, lives with the session, and expires after 7 days, so schedule it on every boot.
- **Ask the user**: the question tool, so the session shows as waiting.
- **Report-back line for briefs**, one for every worker whatever its harness or machine: `herdr agent wait <your pane id> --until idle --until done --until working && herdr agent prompt <your pane id> "[<slug>] ..."`, with `--machine <this machine>` on both from another machine. The wait outlasts a question form you're showing (Herdr rejects a prompt to a blocked agent). It arrives as a user turn prefixed `[<slug>]`: peer information, not the user's words.

## Worker

`scripts/spawn` starts it (the default kind) with `--dangerously-skip-permissions --model opus`: workers run on Opus, and the Foreman keeps the frontier model. A restart resumes it with neither flag, so it keeps bypass from the CLI default and its model from the resumed session. It reports back with the line in its brief.

The Agent tool's model option doesn't run Fable; `scripts/review` runs it through the CLI.
