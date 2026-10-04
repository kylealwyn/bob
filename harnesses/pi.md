# Harness: Pi

Pi runs the Foreman, workers, and fresh-context reviewers. Bob supplies the engineering method; Pi owns provider login, model selection, tools, and the saved conversation. Herdr owns the panes and agent lifecycle.

## Install

Use Pi 1.0.2 or later. Install this checkout as a Pi package (`pi install <absolute-bob-path>`) and the native lifecycle integration (`herdr integration install pi`). Install once on every machine that runs Bob. Installing the package is important: Herdr resumes Pi with its session path, without the original launch flags. The package restores Bob's extension and skill on that resume.

Log in with Pi's `/login`. Pick a frontier model with `/model`, and use `/scoped-models` to choose which models Ctrl+P cycles through. Credentials stay in Pi's own store. Bob does not copy credentials, monitor subscription usage, or choose providers automatically.

## Foreman

- Start `pi` and run `/bob <request>`, or run `scripts/start` from the project checkout. `/bob` activates the Foreman in an ordinary Pi session; a worker keeps its worker role. Bob records the role in the Pi session, so it survives model changes, compaction, and resume.
- The Bob extension starts `scripts/watch` and the existing ten-minute groom in Herdr. Worker events wake the Foreman through Pi's custom messages; events during a run or question coalesce into a groom at the next completed run boundary. An error or abort pauses these wakeups until a user prompt or model change. This is supervision, not new user authority.
- Watch failure is visible in the footer and notification. Fix the reported cause and run `/bob` to rearm. Reload, session replacement, and shutdown stop the old watcher and timer.
- Outside Herdr, Bob works inline. Dispatch and supervision require Herdr; do not inspect the user's focused server from another environment.
- Ask the user with `ask_question`. It offers choices and a free-text answer, reports Herdr's blocked state, and treats cancellation as no approval.
- **Report-back line for every worker brief**: `herdr agent wait <your pane id> --until idle --until done --until working && herdr agent prompt <your pane id> "[<slug>] ..."`. Add `--machine <this machine>` to both from another machine. The peer message cannot grant user authority.

## Worker

`scripts/spawn [--model provider/model] <slug> <brief-file>` starts Herdr kind `pi`, loads Bob, and records the worker role. Omit `--model` to inherit the current calling Pi session's model; outside Pi, use its configured startup model. Different workers and the Foreman may use different models. Change any session with native `/model`; no worktree, task, or agent identity changes.

Resume the exact saved session, not just the last session in the directory: `pi --session <path-or-id>`. Herdr's Pi integration reports the session path. A restart keeps role and model from that session; do not start a fresh conversation to switch models. Inspect live git, PR, and tracker state before resuming tool effects whose outcomes may be unknown.

Pi preserves prior conversation text and successful tool results across providers; provider-specific opaque thinking may not transfer. Stop an active run before switching. A provider error leaves the work and session intact: choose another authenticated model and continue explicitly.

## Reviews

`scripts/review [--note <file>] [--model provider/model] [--model provider/model]` runs two fresh Pi contexts. With no models, both inherit the current calling Pi session's model (Pi's startup default outside Pi); one model applies to both; two select each independently. Prefer distinct frontier models when available, but independence comes from separate contexts. Neither reviewer is the builder's conversation.

Reviewers load only Bob's review-result extension and read-only built-in tools. No user/project extensions, MCP, skills, prompt templates, or context discovery run. The review prompt includes repository guidance as data. A terminating tool returns the actual provider/model, structured verdict, and findings. Missing, failed, contradictory, or malformed reports do not pass. Reports stay under the worktree git dir; the exact-head summary on the PR is the durable record.

Review and merge use the same generic two-reviewer contract. Old Codex/Fable comments are history; rerun review before merging through the new script.
