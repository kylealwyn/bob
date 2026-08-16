# Work-graph runtime

The work graph gives Bob durable memory, dependencies, attempts, fencing, evidence, gates, and controlled integration. Load it only when the Coordinator activates durable work.

Backends persist and project this model; they do not define its semantics.

## Node model

Each node has:

- intent and immutable specification revision;
- acceptance, scope, authority, priority, and verification;
- prerequisite edges and non-scheduling relations;
- ownership and workspace constraints;
- attempts, leases, and immutable evidence;
- gates and terminal outcome.

Scheduling edges mean **requires**. Relations such as **contains**, **supersedes**, and **discovered from** do not affect readiness. Prerequisite edges must remain acyclic.

## Node lifecycle

```text
proposed → blocked | ready
blocked → ready
ready → active
active → gated
active → ready: attempt expired, failed, or cancelled; attempt N+1
gated → integrating → done
gated → ready: same-specification review rejection; attempt N+1
integrating → ready: pre-mutation verification failed; attempt N+1
integrating → failed: mutation began and failed; explicit repair successor
any nonterminal state → superseded: specification changed
terminal alternatives: failed | cancelled | superseded
```

A replacement specification is a new revision entering `blocked` or `ready`, not an outgoing transition from the superseded revision.

## Attempt lifecycle

```text
leased → running → submitted → verified → reviewed → integration-ready → integrated
terminal alternatives: expired | failed | cancelled | rejected
```

Attempts never rewind. Every retry or review correction creates attempt `N+1` and a new fencing generation. A changed requirement also creates a new specification revision.

## Apply new information

Never redirect a worker before repairing durable state.

1. Record input and provenance as a change request.
2. Classify it as evidence, independent work, prerequisite, revision, or invalidation.
3. Compute affected nodes and descendants.
4. Build a patch against the observed graph revision.
5. Check cycles, authority, ownership collisions, acceptance, and verification.
6. Apply through the configured backend; fence invalid attempts and create replacements.
7. Cancel fenced runtimes best-effort.
8. Reconcile the new frontier.

By current state:

- **proposed/blocked/ready:** supersede and replace in `blocked` or `ready`;
- **active:** supersede, replace, and fence before cancellation; reject late Handoffs;
- **gated:** same-specification rejection creates attempt `N+1`; a changed specification invalidates review and replaces the node;
- **integrating:** pre-mutation failure may retry; post-mutation failure creates repair work;
- **done:** preserve history and add a successor.

Respect backend transaction limits. When a backend cannot apply a patch atomically, serialize writes, carry expected revisions and fences, verify after mutation, and expose partial failure.

## Reconcile

One idempotent pass:

1. Read graph revision, runtime state, gates, ownership, and capacity.
2. Deduplicate input and reject stale evidence.
3. Expire abandoned leases and fence their attempts.
4. Apply approved patches.
5. Advance verification, review, and integration.
6. Compute readiness from prerequisites, gates, ownership, and capacity.
7. Dispatch collision-free nodes.
8. Report what remained active, advanced, blocked, or needs a human.

Completion events beat polling. `heartbeat.md` requests this pass; it never schedules work itself.

## Invariants

- One authoritative graph writer.
- Graph patches are revision-checked and cycle-free.
- Every lease binds node, specification, attempt, fence, ownership, workspace, and base revision.
- Only the current fencing generation may submit or integrate.
- Evidence and reviews bind immutable artifacts.
- Integration requires satisfied dependencies, verification, independent review, and gates.
- Completed history is superseded, never rewritten.
- Retries are bounded and classified.
- Backends and worker runtimes translate operations; they do not invent workflow state.
