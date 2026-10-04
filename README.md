# Bob

Bob carries engineering work from a request to a verified PR. Pi owns the conversation, tools, login, and model selection. Bob supplies the roles, modes, worker briefs, review, and merge discipline. Herdr keeps the Foreman and workers in persistent panes, with one worktree per item.

The Foreman and every worker can use different frontier models and change them during a task with Pi's `/model`. The role, saved conversation, branch, and worktree stay the same. Bob does not monitor usage or route providers automatically.

```text
/bob <request> → Foreman in Pi (choose any logged-in frontier model)
                  ├─ spawn → Pi worker + worktree → verified PR
                  ├─ worker events + periodic groom → one action per state
                  └─ two independent Pi reviews → merge at reviewed head → close
```

## Install

Install [Pi](https://pi.dev) 1.0.2 or later, then install Bob as a Pi package:

```bash
git clone https://github.com/kylealwyn/bob ~/dev/bob
pi install ~/dev/bob
herdr integration install pi
```

Use Pi's `/login` for provider access, `/model` to select a model, and `/scoped-models` to choose the models Ctrl+P cycles through. Login and model configuration belong to Pi. Bob never copies credentials. Provider/role assignments live in `models.json`; set `BOB_MODELS_FILE` to an alternate file with the same schema for machine-local choices and future model generations.

Bob remains a standard `SKILL.md` for agents that read skills. The package also installs its Pi extension, which provides `/bob`, the Foreman's monitoring and groom, persisted session roles, and the question tool. Install the package on every worker machine so a Herdr resume restores Bob without the original launch flags. See [Pi harness](harnesses/pi.md).

Dispatch needs [Herdr](https://herdr.dev), authenticated `gh`, `jq`, `python3` 3.11+, and `pi`. Bob’s role-model resolver uses Node.js 24 or later. Inline work needs Pi and Node.js.

## Adopt in a repo

1. Set the GitHub `origin` and `origin/HEAD` (`git remote set-head origin --auto`), and check `gh auth status`.
2. In a Herdr pane on the repo's main checkout, start `pi` and run `/bob <request>`. The extension starts supervision. `~/dev/bob/scripts/start` is also a Foreman launcher and accepts native Pi options.
3. Put project-specific setup, verification, release workflow, tracker rules, and merge authority in AGENTS.md. Setup uses the existing single `.codex/environments/*.toml` `[setup].script`; no file means no setup. GitHub issues are the default tracker.

Choose a model per worker with `scripts/spawn --model provider/model <slug> <brief-file>`. Omit the model to use the configured worker model for the calling Pi session's provider (OpenAI by default outside Pi). Defaults are OpenAI Astra Foreman / Sol 6.1 workers, and Anthropic Fable 5.1 Foreman / Opus 5.5 workers. `scripts/start --provider anthropic` selects the Anthropic Foreman; `/bob` activates the Foreman model for the current provider. Explicit `--model` and native `/model` override the assignment. Saved sessions retain their chosen model.

Run `/model` in any Foreman or worker to switch in place. Stop an active run before switching; then continue explicitly. After a restart, resume the exact session with `pi --session <path-or-id>`.

Review with `scripts/review`, optionally selecting one or two models with `--model`. Two fresh contexts preserve reviewer independence even when only one provider is available. Reviews record actual model IDs and structured findings; `scripts/merge` still checks the exact head and green CI. Merge authority must come from the user or AGENTS.md.

## Layout

```text
SKILL.md              shared engineering method and routing
roles/                Foreman and worker responsibilities
modes/                engineering modes
trackers/             GitHub (default) and Linear
harnesses/pi.md       Pi session, model, supervision, and review contract
extensions/bob.ts     /bob, persisted role, Foreman supervision, ask_question
extensions/review.ts  terminating structured review result
scripts/              start, spawn, status, watch, review, merge, retro, close
tests/                session/supervision and review/merge behavior
```

## Development

Keep the live checkout on clean `main`; work in a separate worktree. Run `npm ci`, `npm run check`, and `npm test`. The tests exercise supervision lifecycle and fail-closed review behavior. Changes to launch or supervision also require a live isolated Herdr run, including model switch and resume, before review.
