# Working on Bob

The main checkout at `~/dev/bob` is the live skill for every agent on the machine: the machine repo links `ai/skills/bob` to it, so Claude Code and Codex load whatever it has checked out. Keep it on `main` and clean, and make every change in a worktree (`git worktree add <path> -b <branch> origin/main`). Switching its branch changes Bob mid-run for every Foreman and worker using it.

Changes go through PRs reviewed with `scripts/review` and merged with `scripts/merge`, like any Bob worker's.
