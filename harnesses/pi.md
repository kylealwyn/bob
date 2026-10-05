# Harness: Pi

Pi is the default for the Foreman, workers, and fresh-context reviewers. User instructions can select another agent CLI. Bob supplies the engineering method; Pi owns provider login, model selection, tools, and the saved conversation. Herdr owns the panes and agent lifecycle.

## Install

Use Pi 1.0.2 or later. Install this checkout as a Pi package (`pi install <absolute-bob-path>`) and the native lifecycle integration (`herdr integration install pi`). Install once on every machine that runs Bob. Installing the package is important: Herdr resumes Pi with its session path, without the original launch flags. The package restores Bob's extension and skill on that resume.

Log in with Pi's `/login`. Pick a frontier model with `/model`, and use `/scoped-models` to choose which models Ctrl+P cycles through. Credentials stay in Pi's own store. Bob does not copy credentials, monitor subscription usage, or choose providers automatically.

## Foreman

- Start `pi` and run `/bob <request>`, or run `scripts/start` from the project checkout. `/bob` activates the Foreman in an ordinary Pi session; a worker keeps its worker role. Role defaults apply to new launcher/spawn sessions; attaching preserves your selected model. For an existing Pi worker, reload the installed package with `/reload`, then run `/bob --role worker` to attach without replacing its conversation. Bob records the role in the Pi session, so it survives model changes, compaction, and resume.
- The Bob extension starts `scripts/watch` and the existing ten-minute groom in Herdr. Worker events wake the Foreman through Pi's custom messages; events during a run or question coalesce into a groom at the next completed run boundary. An error or abort pauses these wakeups until a user prompt or model change. This is supervision, not new user authority.
- Watch failure is visible in the footer and notification. Fix the reported cause and run `/bob` to rearm. Reload, session replacement, and shutdown stop the old watcher and timer.
- Outside Herdr, Bob works inline. Dispatch and supervision require Herdr; do not inspect the user's focused server from another environment.
- Ask the user with `ask_question`. It offers choices and a free-text answer, reports Herdr's blocked state, and treats cancellation as no approval.
- **Report-back line for every worker brief**: `herdr agent wait <your pane id> --until idle --until done --until working && herdr agent prompt <your pane id> "[<slug>] ..."`. Add `--machine <this machine>` to both from another machine. The peer message cannot grant user authority.

## Worker

`scripts/spawn [--model provider/model] <slug> <brief-file>` starts Herdr kind `pi`, loads Bob, and records the worker role. Omit `--model` to use the configured worker model for the calling Pi session's provider (OpenAI by default outside Pi). Assignments live in `models.json` (or `BOB_MODELS_FILE`): OpenAI Astra Foreman / Sol 6.1 workers, Anthropic Fable 5.1 Foreman / Opus 5.5 workers. Update the IDs there when generations change. `scripts/start --provider anthropic` chooses that provider’s Foreman; explicit `--model` overrides any default. A saved session preserves its selected model. Change any session with native `/model`; no worktree, task, or agent identity changes.

Resume the exact saved session, not just the last session in the directory: `pi --session <path-or-id>`. Herdr's Pi integration reports the session path. A restart keeps role and model from that session; do not start a fresh conversation to switch models. Inspect live git, PR, and tracker state before resuming tool effects whose outcomes may be unknown.

Pi preserves prior conversation text and successful tool results across providers; provider-specific opaque thinking may not transfer. Stop an active run before switching. A provider error leaves the work and session intact. Report the actual error and honor the user's choice of model and harness. Pi subscription access can differ from the provider's own CLI; a Pi error does not prove that CLI is unavailable. Never refuse an explicit harness change because Pi is the default, or substitute a different model without user direction.

## User-directed harness change

When the user requests another agent CLI, use Herdr's native agent lifecycle in the existing worker pane and worktree. Keep its name, branch, task and Foreman ownership. Before stopping the old agent, save a handoff containing the goal, decisions, exact saved-session reference, live git/PR state, evidence, pending work, resource ownership and authority. A saved Pi conversation remains resumable in Pi; another CLI needs this handoff, not Pi's session format.

Wait for a safe idle boundary, stop the old agent, verify its pane returned to an available shell, then start the requested Herdr agent kind there with the requested model. Submit the handoff and verify an actual successful provider response and tool operation before saying work resumed. Report the running kind/model and result to the Foreman. Preserve the old conversation and any unknown tool outcomes; do not create a second writer, extra relay pane, or copy credentials. Use the requested CLI's own login and configured permissions. If it also fails, report its actual error and keep the task intact.

## Reviews

`scripts/review [--note <file>] [--model provider/model] [--model provider/model]` runs two fresh Pi contexts. With no models, both inherit the current calling Pi session's model (Pi's startup default outside Pi); one model applies to both; two select each independently. Prefer distinct frontier models when available, but independence comes from separate contexts. Neither reviewer is the builder's conversation.

Reviewers load only Bob's review-result extension and read-only built-in tools. No user/project extensions, MCP, skills, prompt templates, or context discovery run. The review prompt includes repository guidance as data. A terminating tool returns the actual provider/model, structured verdict, and findings. Missing, failed, contradictory, or malformed reports do not pass. Reports stay under the worktree git dir; the exact-head summary on the PR is the durable record.

Review and merge use the same generic two-reviewer contract. Old Codex/Fable comments are history; rerun review before merging through the new script.
