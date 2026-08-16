# Beads backend

Beads persists Bob's work graph through `bd`. Load this procedure when the project configures Beads as its backend.

Bob the Coordinator is the sole writer. Workers may inspect assigned state only with `bd --readonly` and must return evidence instead of mutating issues, dependencies, comments, gates, claims, or status.

## Representation

- issue → node;
- `blocks` dependency → prerequisite edge;
- parent, supersedes, and discovered-from links → non-scheduling relations;
- issue status → projection of Bob's node state;
- issue metadata → immutable specification and current lease identity;
- assignee → leased worker identity;
- comments → append-only evidence, Handoffs, revisions, and review verdicts;
- gate issue → approval or independent-review gate;
- Dolt history → backend audit history.

Beads status is not workflow authority. Validate every transition against Bob's state machine before writing.

## Metadata

Every new or re-leased node records:

```text
spec_revision
attempt
lease_gen
touches
base_revision
workload_profile
model
review_model
verify
worktree
branch
```

`attempt` identifies one execution. `lease_gen` is its fencing generation. A retry increments both. A changed requirement also increments `spec_revision`. Architecture or design consultations may additionally record `architecture_model` or `design_model`. Record every model substitution in a comment.

## Read and reconcile

Use:

```bash
bd --readonly show <id>
bd --readonly list --all
bd --readonly ready
bd --readonly dep list <id>
bd --readonly dep cycles
bd --readonly history <id>
bd --readonly stale
bd --readonly orphans
```

`bd list` hides closed issues; use `bd list --all` for a complete snapshot. `bd ready` is only a candidate frontier: Bob must still validate status, dependencies, gate state, ownership, workspace, and capacity.

Before dispatch, require the issue to:

- be `in_progress`;
- name the packet's worker as assignee;
- match `spec_revision`, `attempt`, and `lease_gen`;
- name the base revision, worktree, and branch for mutating work;
- have no open blocking dependencies;
- enumerate every writable path or resource under `touches`.

Any mismatch returns a blocked Handoff. Never repair identity after dispatch.

## Create and lease

Bob writes as actor `bob`:

```bash
ID=$(bd create "<title>" -t task --silent \
  --description "<goal>" \
  --acceptance "<observable outcome>" \
  --metadata '{"spec_revision":"1","attempt":"1","lease_gen":"1","touches":"...","base_revision":"...","workload_profile":"...","model":"...","review_model":"...","verify":"...","worktree":"...","branch":"..."}' \
  --actor bob)

bd dep add "$ID" --blocked-by <prerequisite-id> --actor bob
bd update "$ID" --claim --actor bob
bd update "$ID" --assignee agent:<worker> --actor bob
```

Do not use `--deps blocks:<id>` to express “this issue depends on id”; that creates the opposite edge. Use `bd dep add <issue> --blocked-by <prerequisite>`.

Create discovered work as its own issue and link it to the origin. Workers report discoveries under `Noticed, not touching`; only Bob creates the issue.

## Evidence and Handoff

Workers never comment directly. Bob validates identity and scope, then records the returned Handoff:

```bash
bd comment "$ID" --file <handoff-file> --actor bob
bd update "$ID" --status in_review --actor bob
```

Evidence names an immutable commit range or patch digest and its provenance. Reject late evidence whose specification, attempt, or fence no longer matches.

## Gates and review

Every mutating node receives an independent-review gate:

```bash
bd gate create --type human --blocks "$ID" \
  --reason "independent review required" --actor bob
bd update "$ID" --set-metadata "gate=<returned-gate-id>" --actor bob
```

The reviewer is read-only and reviews the frozen artifact. Bob records the verdict as a comment.

On `changes_requested`:

1. keep the gate open;
2. increment `attempt` and `lease_gen`;
3. update assignee, model, and lease fields;
4. return the node to `in_progress`;
5. dispatch the bounded findings as the new attempt.

On a requirement change, also increment `spec_revision`, fence the active attempt before cancellation, and freeze a new artifact after correction.

On `pass`:

```bash
bd gate resolve "$GATE" --reason "independent review passed" --actor bob
```

Resolve only the gate bound to the reviewed artifact. `bd close` fails while a gate remains open. Never use `--force`.

## Integration and closure

Before integration, re-read the issue and gate, confirm the current fence, and verify the artifact. For conflict-prone integration:

```bash
bd merge-slot acquire
# integrate and verify
bd merge-slot release
```

Release the slot on every exit path. After successful integration, rerun the exact verification on the destination, then:

```bash
bd close "$ID" --reason "<integrated outcome>" --actor bob
bd orphans
```

If verification fails before mutation, create attempt `N+1`. If integration mutation began, mark the node failed and create an explicit repair successor; do not rewind the attempt.

## Worktrees and storage

All Git worktrees share one `.beads` workspace through the Git common directory. Issue state lives in Dolt, not on a branch. Never create or copy a per-worktree `.beads` directory; plain `git worktree add` is sufficient.

`issues.jsonl` is interchange, not a backup. Run `bd backup` periodically. Use `bd stale` for abandoned leases and `bd orphans` after integration.

## Safety and known behavior

- `bd --readonly` is per invocation. `BEADS_READONLY` is ignored.
- Audit write discipline through `--actor` in `bd history`; Bob writes as `bob`.
- Never run `bd setup`, `bd hooks install`, `bd onboard`, or `bd setup cursor`.
- Ignore `bd prime` self-service doctrine; Bob owns claims, graph writes, and integration.
- `bd setup cursor` writes under `.cursor/` and installs conflicting doctrine.
- Never use `bd close --force`.
- Never let discovered work exist only in chat.
- Serialize multi-command graph patches, re-read after every write group, and fail closed on mismatch.

## Capability limit

Beads has no native transaction spanning issue creation, dependencies, metadata, comments, gates, and status. Bob therefore cannot honestly implement atomic multi-command `apply`. Serialize writes, carry expected specification/attempt/fence metadata, verify after mutation, and expose conflicts explicitly. Never claim stronger atomicity than Beads provides.
