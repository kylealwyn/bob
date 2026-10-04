# Architect

Design consequential backend and system boundaries before implementation. Use when a change introduces or moves ownership, durable state, trust, compatibility, cross-process effects, or a decision expensive to reverse.

Skip small, local, reversible changes with no new seam. If hidden complexity appears, stop and upgrade to the full procedure; never finish under a weaker design contract.

## Read the system that exists

Read product truth, architecture, linked decisions, relevant source, callers, tests, schemas, migrations, deployment topology, and operational evidence. Identify current behavior before proposing replacement behavior.

State the problem, observable outcome, constraints, non-goals, and forces. Separate product invariants from implementation habit.

## Find the deep boundary

Decompose around decisions that are difficult or likely to change, not execution order or folder shape. A good module hides substantial policy or mechanism behind a smaller interface.

For each proposed boundary, name:

- the decision it hides;
- who creates, reads, mutates, finalizes, and cancels;
- the durable state and privileged effects it owns;
- what callers know if the implementation disappears;
- what can change without changing callers.

Place seams around ownership, mutable state, effects, trust, failure, cancellation, compatibility, persistence, or independently variable policy. Prefer values and pure functions until one of those forces requires a boundary. Do not create an interface merely because a second implementation is imaginable.

## Classify the system

Before importing backend machinery, classify the seam:

```text
System class: local-single-process | local-multiprocess | distributed
Serializability scope: <one memory owner, store, entity, or named transaction domain>
Write authority: <one writer or named writers>
Effects leave the scope: yes | no
```

Local does not mean unconstrained: threads, actors, files, and one-writer databases still require explicit ownership and concurrency semantics.

If effects do not leave the serializability scope, queues, delivery guarantees, sagas, CAP, distributed locks, and workflow engines are `n/a`. Never add distributed complexity speculatively.

## Design the contract

Define operations in domain language: exact inputs, outputs, generated fields, errors, lifecycle, cancellation, ordering, limits, and observable side effects. Make invalid states difficult to represent and unsafe operations difficult to invoke.

For persisted, public, cross-process, or independently deployed seams, also define:

- **Consumers:** known callers and the subset of behavior they bind.
- **Compatibility:** source, wire, and semantic guarantees in both old-to-new and new-to-old directions.
- **Schema and stability:** contract language, presence/null/omitted rules, enum openness, version, deprecation clock, and additive evolution path.
- **Errors:** one taxonomy with stable machine identity, safe human detail, retryability, and authorization behavior.
- **Idempotency:** safe, naturally idempotent, keyed idempotent, or unsafe to retry.
- **Collections:** bounded-complete waiver or explicit continuation, ordering, consistency, and limits.
- **Trust:** validation at every external or newly crossed trust edge.

Every observable behavior may become a dependency. Avoid leaking storage layout, vendor types, error text, timing accidents, or ordering that the contract does not intend to preserve.

Names are interface surface. Use domain nouns and active verbs; avoid implementation-shaped names, lifecycle states presented as services, and redundant qualifiers.

## Design data and invariants

For each durable noun, name its owner, identity, schema, retention, and enforced invariants. State whether each invariant is guaranteed by a type, constraint, transaction, application check, or not enforced.

Prefer one serializability scope. Name:

- begin, commit, rollback, and isolation semantics;
- allowed concurrency anomalies;
- conflict detection and whole-transaction retry behavior;
- state outside the transaction, including files, sequences, caches, and remote effects;
- crash recovery and repair.

Do not create storage for a noun without a real query, retention boundary, referential constraint, or relationship. Applied migrations are history; evolve with expand → migrate → contract.

## Design concurrency and leaving effects

For local concurrency, name the synchronization owner, linearization point where required, cancellation tree, stale-result fence, resource bound, and cleanup.

When effects leave the serializability scope, define:

- delivery: at-most-once, at-least-once, or a precisely stated observed-result guarantee;
- stable intent or event identity and where attempts are remembered;
- ordering and deduplication scope;
- unknown outcome after timeout or disconnect;
- retryable versus permanent failures, with one retry layer, budget, capped backoff, and jitter;
- idempotency claim, payload fingerprint, in-flight duplicate policy, and retention;
- wait, work, total, and liveness timeouts;
- backpressure, admission, queue bound, overload degradation, and load shedding;
- partial-commit visibility, compensation, replay, and human repair.

Never claim exactly-once merely because a broker, SDK, or workflow engine retries. Never treat timeout as proof of failure. Record intent before an effect whose outcome may become unknown.

## Design trust and authority

Mark processes, stores, users, providers, and privilege boundaries. For each moved boundary ask:

1. What are we protecting?
2. What can go wrong?
3. What prevents, detects, contains, or repairs it?
4. What evidence shows that is enough?

Use least privilege, fail-safe defaults, complete mediation, explicit disclosure, bounded untrusted input, and safe secret custody. Name what is configuration versus code, where secrets live, who may read them, rotation and compromise behavior, and what fails closed.

Use a full security or privacy threat model only when the change moves sensitive data, identity, authority, or exposure. Do not add ritual matrices to a local reversible seam.

## Design operability

Only for seams that can affect production behavior, state:

- deployment and process topology;
- blast radius and staged rollout;
- user-visible service level or performance budget;
- constrained resource and expected peak;
- overload and degraded behavior;
- useful traces, metrics, logs, and correlation identity;
- latency, traffic, errors, and saturation where applicable;
- page, ticket, log, or no signal;
- last-known-good configuration and rollback unit.

Telemetry must obey the product's data boundary; observability is not a second product-data path.

## Isolate volatile dependencies

Keep domain workflow in project-owned types. Put providers, databases, frameworks, operating systems, trackers, and harnesses behind a narrow adapter that translates capabilities and failures.

For each dependency:

- name the project-owned primitive it implements;
- contain vendor IDs, statuses, clients, and errors;
- define capability discovery and explicit degradation;
- centralize configuration and construction;
- test the adapter against the project-owned contract;
- identify replacement and migration cost.

Do not build a lowest-common-denominator abstraction or hide a feature the product intentionally depends on. Isolate vocabulary and authority, not reality.

## Design it twice

Sketch two materially different shapes for a consequential seam. Make both concrete enough to compare:

- complexity hidden versus exported;
- ownership and authority;
- coupling and change amplification;
- transaction and failure semantics;
- compatibility and migration;
- trust and blast radius;
- operability and resource cost;
- testability through public behavior;
- vendor leakage and replacement;
- rollback and irreversible steps;
- actual need versus hypothetical flexibility.

Choose and reject explicitly. Record consequences, including the ugly ones.

## Prove and escalate

Name the smallest public seam that can falsify the design, plus any contract, migration, failure-injection, recovery, load, or compatibility test required. Verify mode owns detailed test construction.

Escalate instead of deciding silently when the choice changes a product promise, trust or disclosure boundary, persistence or compatibility contract, system of record, privileged authority, user-owned cost or retention trade-off, service objective, or safe rollback.

Store decisions through the project's configured decision process. Keep enduring rationale at the owning source seam; do not invent a parallel architecture archive.

## Output

Return a diff-shaped design. Use `n/a` for triggered dimensions that do not apply.

```text
Problem and outcome:
Forces, invariants, and non-goals:
System class and serializability scope:
Boundary, hidden decisions, and owner:
Authority and privileged effects:
Contract and consumers:
Data, schema, and invariants:
Transaction and isolation:
Concurrency and cancellation:
Leaving effects and delivery:
Errors, retries, idempotency, and timeouts:
Backpressure, capacity, and recovery:
Trust, privacy, config, and secrets:
Topology, observability, and operations:
Compatibility and evolution:
Interface A:
Interface B:
Comparison and choice:
Primitive and adapters:
Test surfaces:
Migration, rollout, and rollback:
Decision escalation:
Likely touch points:
Open risks:
```

Do not implement, create speculative extension points, prescribe a framework, or silently alter product architecture.

## Sources

Synthesized in original language from Parnas on information hiding; Ousterhout on deep modules and design twice; Hyrum's Law; RFC 9110 and RFC 9457; Google API Improvement Proposals; SQLite and PostgreSQL transaction documentation; Helland on entities and idempotence; Garcia-Molina and Salem on sagas; AWS Builders Library and Google SRE guidance on retries, overload, and operations; Saltzer and Schroeder, NIST, and OWASP on trust; OpenTelemetry; Fowler on parallel change; and Nygard on architecturally significant decisions. Addy Osmani's API/interface skill informed the contract checklist, not the procedure's language or framework shape.
