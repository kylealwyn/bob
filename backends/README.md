# Backends

Backends persist Bob's work graph. Bob owns workflow semantics and chooses work; a backend maps storage, query, transaction, and gate operations into that model.

The configured backend must provide:

```text
snapshot() -> graph revision and state
apply(expected_revision, graph_patch) -> new_revision | conflict
ready(snapshot) -> node IDs
record_evidence(node, attempt, artifact, provenance)
open_gate(node, kind, reason) -> gate
resolve_gate(gate, verdict, evidence)
```

Backend-native IDs, statuses, clients, and errors stay inside its adapter. Missing capabilities fail explicitly and never weaken atomicity, fencing, immutable evidence, artifact-bound review, or gate semantics.

Available backends:

- `beads.md` — Beads (`bd`), the first implementation.
- Linear — not implemented.

The project contract selects and configures one backend.
