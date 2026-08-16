# Git-worktree runtime

Use Git worktrees to isolate parallel mutation. The project supplies the base branch, worktree root, serialized paths, and verification commands.

Read-only work may share a workspace. Sequential direct work may remain in the current tree. Parallel or delegated mutation requires disjoint ownership and an isolated worktree.

## Create

Before creation:

- record the exact base revision;
- confirm the worktree parent and branch name;
- confirm owned paths do not collide with active work;
- ensure required uncommitted dependencies are committed only with user authorization.

```bash
git worktree add "<worktree-path>" -b "<branch>" "<base-revision>"
```

The Coordinator records worktree, branch, base revision, and owned paths in the lease. A worker stops if any differ.

Never copy project state databases into a worktree when the configured backend already shares state through Git's common directory.

## Operate

Workers mutate only leased paths. They do not merge, integrate neighboring work, rewrite the base branch, or clean unrelated files.

Before expensive verification, check for ownership drift. Shared mutable resources—ports, simulators, app instances, databases, generated manifests, or project files—require explicit isolation or serialization.

## Freeze the artifact

Prefer an immutable commit range when the project permits worker commits. Otherwise freeze the complete owned diff, including untracked files:

```bash
OWNED=(<leased paths>)
git diff --binary --full-index HEAD -- "${OWNED[@]}" > /tmp/review.patch
git ls-files --others --exclude-standard -z -- "${OWNED[@]}" |
  xargs -0 -I{} sh -c 'git diff --binary --no-index /dev/null "$1" >> /tmp/review.patch || true' _ {}
shasum -a 256 /tmp/review.patch
```

The Handoff records the base revision, exact commit range or digest, owned paths, and verification. Once submitted, mutation invalidates the artifact and requires a new attempt or fence.

`git diff --no-index /dev/null <directory-symlink>` follows the target and produces an invalid path. Freeze an untracked symlink as an explicit `new file mode 120000` patch containing its relative link target.

## Review and integrate

The reviewer verifies the artifact identity before reading it and remains read-only.

Before integration, the Coordinator:

1. re-reads the current lease, dependencies, gate, and destination;
2. reproduces the artifact digest;
3. checks the artifact applies to the destination without overwriting unrelated work;
4. acquires required serialization;
5. layers the reviewed change onto the current destination;
6. resolves conflicts by preserving reviewed destination behavior and applying only the reviewed intent;
7. reruns exact verification on the destination;
8. closes durable work only after verification passes.

If the destination changed incompatibly, do not silently repair during integration. Create a new attempt against the new base and review the new artifact.

## Cleanup

Remove a worktree only after its artifact is integrated or intentionally abandoned, evidence is durable, and no unique untracked content remains.

```bash
git worktree remove "<worktree-path>"
git worktree prune
```

Do not force removal merely to clear a warning. Never use destructive reset or checkout to erase unexplained changes.
