# Sourced by Bob's orchestrator scripts. Everything about the project is derived
# from the git checkout the script runs in, so a repo adopts Bob without a
# config file:
#
#   repo     the main checkout (parent of the git common dir)
#   common   the git common dir, shared by every worktree of the repo
#   base     the default branch as a remote ref, e.g. origin/main
#
# gh_repo and repo_agents are functions because they cost a network call or a
# Herdr round trip; call them only where needed.

die() { printf '%s: %s\n' "$(basename "$0")" "$*" >&2; exit 1; }

common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null) \
  || die "run from inside the project's git checkout"
repo=$(dirname "$common")
base=$(git -C "$repo" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null) \
  || die "origin/HEAD is unset in $repo; run: git -C $repo remote set-head origin --auto"

# Scripts that drive Herdr call this first.
require_herdr() { [[ "${HERDR_ENV:-}" == 1 ]] || die "not running inside Herdr"; }

# owner/name of the GitHub repo PRs open against.
gh_repo() { (cd "$repo" && gh repo view --json nameWithOwner --jq .nameWithOwner); }

# Herdr agents other than this pane whose cwd is a checkout of this repo, one
# JSON object per line. Workers in other repos belong to those repos'
# orchestrators.
repo_agents() {
  local a cwd
  herdr agent list | jq -c --arg self "${HERDR_PANE_ID:-}" '.result.agents[] | select(.pane_id != $self)' |
    while IFS= read -r a; do
      cwd=$(jq -r '.cwd // empty' <<<"$a")
      if [[ -n "$cwd" && "$(git -C "$cwd" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" == "$common" ]]; then
        printf '%s\n' "$a"
      fi
    done
}
