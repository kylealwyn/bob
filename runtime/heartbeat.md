# Heartbeat runtime

Heartbeat provides liveness, not scheduling policy. A tick asks Bob the Coordinator for one idempotent reconciliation pass.

## Arm

Use one schedule per graph scope and one in-flight tick. Prefer completion events and native monitors; use recurring time only when no event wakes Bob reliably.

```text
arm(scope, cadence, callback)
disarm(scope)

callback:
  Coordinator.reconcile(reason = heartbeat)
```

The harness may implement this with a recurring prompt, scheduler, process loop, timer, or foreground callback.

## Tick

1. Confirm graph and schedule remain active.
2. Coalesce overlapping ticks.
3. Ask Bob the Coordinator to reconcile through `work-graph.md`.
4. Report what advanced.
5. Back off after infrastructure failure.
6. Stop on terminal graph, disarm, expiry, human ambiguity, or repeated failure.

Heartbeat never chooses work, grants leases, spawns workers, resolves gates, retries mutations, or invents work. Spare capacity belongs to the Coordinator because only it sees ownership and the ready frontier.

## Output

```text
Scope:
Tick:
Active:
Advanced:
Blocked:
Next:
```

One unchanged tick is normal. Repeated unchanged ticks should back off or disarm.
