# Review

Independently attack a fixed artifact (a PR at an exact head, a commit range, or a plan version) for specification violations and consequential engineering defects. Approve when it demonstrably improves code health and no integration-blocking defect remains; do not demand perfection or a personal rewrite.

Review is read-only. The builder never reviews its own work. The reviewer does not repair code, write tracker state, or merge. Skip a changing target, missing independence, or an artifact whose identity cannot be reproduced.

## Pin the review

Before reading implementation:

- identify the exact commit range, patch digest, diff, or plan version;
- reproduce its identity and stop on drift;
- read the task, acceptance, product truth, architecture, linked decisions, and project policy;
- confirm every changed path is owned and in scope;
- read the PR body, verification evidence, and self-flagged risks.

Review only the pinned artifact. Do not infer requirements from code when the governing task can state them.

## Understand before judging

Restate:

- the observable behavior that must become true;
- the old behavior or assumption being changed;
- the owners, consumers, and trust boundaries affected;
- the claimed proof.

Read changed tests before implementation, then inspect enough surrounding source and callers to understand every changed line in context. Unfamiliarity lowers confidence; it does not justify filling the review with style comments.

If the change cannot be explained coherently from its task, tests, and source, request clarification or identify the missing contract.

## Pass 1: specification

Trace every acceptance criterion, product promise, architecture invariant, and linked decision to:

- an implementation path;
- a decisive test or verification;
- an explicit approved waiver;
- or an omission.

Look for extra behavior as carefully as missing behavior. Silent fallback, widened authority, altered disclosure, inferred product behavior, unrelated cleanup, and unrequested architecture are specification defects even when tests pass.

Name assumptions the previous system allowed callers or operators to rely on—ownership, event order, stale-result rejection, isolation, target revalidation, error semantics, compatibility, timing, or resource bounds—and identify any the artifact silently falsifies.

## Trigger scan

Mark only seams the artifact opens:

- state machine or lifecycle;
- durable invariants or migrations;
- ownership, cancellation, or cleanup;
- shared mutable state or concurrency;
- effects leaving one serializability scope;
- compatibility or independently deployed contracts;
- capacity, queues, retries, or named performance budgets;
- trust boundary, identity, authority, secrets, or external input;
- dependency, lockfile, toolchain, or install behavior;
- generated source, binary artifact, model, update, or provenance;
- telemetry, logging, privacy, retention, or hosted sink;
- deployment, distribution, rollout, or rollback.

If a seam does not fire, mark it `n/a` and do not import its full discipline. A local reversible diff does not need distributed-systems, ASVS, SLSA, privacy-program, or deployment ritual.

Always perform the cheap scans: live secrets, unchecked execution or deserialization, unsigned loaded artifacts, and direct violations of product hard promises.

## Pass 2: risk-led correctness

Review in descending blast radius:

1. product behavior and authority;
2. durable history, invariants, isolation, and migrations;
3. leaving effects, unknown outcomes, retries, and idempotency;
4. lifecycle, stale results, cancellation, and cleanup;
5. ownership and shared mutable state;
6. trust, disclosure, secrets, and untrusted input;
7. resource bounds, queues, amplification, and named budgets;
8. dependency identity, generated artifacts, deployment, and rollback when triggered;
9. test adequacy for the risks above;
10. clarity and cohesion only after behavior is sound.

For each suspected defect, construct one concrete counterexample:

- an illegal transition or stale event;
- two interleaved operations;
- a check-then-act race;
- timeout after an effect succeeded, followed by retry;
- cancellation between acquire and release;
- old code with new data or new code with old data;
- overload or unbounded growth;
- removal or inversion of the new guard while tests remain green.

No concrete failure on this artifact means no correctness finding. Hypothetical extensibility, generic best practice, line-count thresholds, framework fashion, and “I would write it differently” do not block integration.

### Triggered depth

When a seam fires, check only until evidence establishes a finding or residual risk:

- **Lifecycle:** source, event, guard, destination, effects, duplicate/late event, terminal cleanup.
- **Invariants:** owner and enforcement point; invalid state reachable through another path.
- **Concurrency:** synchronization owner, happens-before or linearization point, stale fence, cancellation propagation.
- **Transactions:** serializability scope, isolation, conflict retry, state outside the commit, crash recovery.
- **Leaving effects:** delivery, stable intent identity, unknown outcome, one retry layer, idempotency, timeout, compensation.
- **Compatibility:** source/wire/semantic behavior, old↔new operation, expand→migrate→contract.
- **Capacity:** scarce resource, finite bound, backpressure, shed/degrade behavior, retry amplification.
- **Trust:** source→validation→sink, least privilege, authorization at the owned resource, fail-closed behavior.
- **Dependencies:** intended package, resolved source, version/commit/hash, install scripts, transitive change, lockfile consistency.
- **Artifacts:** reviewable generator input, identity, checksum/signature, load-time verification.
- **Telemetry/privacy:** fields, destination, redaction, retention, consent, and product disclosure boundary.
- **Deployment:** rollback unit, last-known-good, staged blast radius, irreversible schema or distribution step.

Automation should handle formatting, lint, obvious dead code, and known mechanical checks. A mechanical failure matters when required verification was skipped or the artifact changes the mechanism itself.

## Test the tests

Tests are evidence only when they can fail for the claimed defect.

Ask:

- Would removing or reversing the new guard fail?
- Does the test assert public behavior rather than private call order?
- Does it cover the triggered boundary, failure, cancellation, stale, compatibility, or concurrency case?
- Can the fake express the real failure?
- Is a green result from the final artifact and correct environment?

Do not equate compilation, coverage, snapshots, or a happy-path test with behavioral proof.

## Security and specialist escalation

Escalate instead of improvising a full audit when the artifact moves sensitive data, identity, authority, or exposure; adds cryptography, a hosted provider, a privileged capability, opaque executable content, or incident/compliance scope.

Name the target—Architect, security specialist, privacy specialist, or supply-chain specialist—and the exact moved boundary. Escalation blocks integration when required design or evidence is absent; otherwise record it as residual risk.

Do not expand a general review into an exhaustive standards catalog. Periodic whole-system and specialist reviews are separate controls.

## Verify independently

Run the task's exact verification against the pinned artifact when safe. Reproduce the failure-sensitive environment, fixtures, seed, hardware, or configuration that matters.

If verification cannot run, state why and lower confidence. Do not substitute a broad build for missing behavior proof or trust output produced before the final artifact.

## Findings and verdict

Every finding contains:

- **severity:** `blocking` or `non-blocking`;
- exact `file:line` or plan location;
- violated requirement, invariant, or named principle;
- concrete counterexample and consequence;
- smallest remedy;
- evidence;
- confidence: `high` or `medium`.

`blocking` means the artifact cannot safely integrate: specification miss, incorrect or unsafe behavior, violated hard invariant, trust/privacy break, compatibility break, missing required proof, or concrete code-health regression introduced by this change.

`non-blocking` means optional improvement, pre-existing debt, bounded uncertainty, or residual risk. It never changes `pass` to `changes_requested`; prefer listing it under residual risks.

Confidence is high when artifact identity, independence, governing contract, counterexample, and verification align. Confidence is medium when verification is blocked or relevant context remains uncertain. Low confidence on a risk that could block integration means the review is incomplete, not a pass.

Use `changes_requested` when any blocking finding exists. Otherwise use `pass`, even when residual risks remain.

## False-positive controls

- Facts and project rules outrank taste.
- Style blocks only when a governing rule or established local convention is violated.
- A finding must improve this artifact, not educate abstractly.
- Do not convert surrounding debt into scope.
- Do not demand speculative abstractions or “cleanup later” for pre-existing issues.
- Do not use arbitrary diff, file-size, reviewer-count, or response-time gates.
- Emit a few high-conviction findings, ordered by leverage; do not bury one real defect under nits.
- Rule explicitly on every self-flagged risk.

## Output

```text
Verdict: pass | changes_requested
Reviewed: <pinned target and identity>
Verification: <exact commands and result>
Confidence: high | medium | incomplete
Triggered: <seams or none>
Escalate: <target and reason or none>
Findings:
- <blocking> <file:line> — <violation>; counterexample: <failure>; remedy: <smallest fix>; evidence: <proof>; confidence: <level>
Residual risks:
- <item or none>
Waived dimensions:
- <triggered then n/a seam and reason, or none>
```

No praise, recap, edits, tracker writes, or merge.

## Design notes

A design note is reviewed before any code binds to it, because a schema, a wire contract, or a store gets expensive to change once code and data depend on it. Review it the way the principal engineer who owns the product would. Read the repo's AGENTS.md and the product doc it points to, and the existing code the note must fit or says it changes, and judge it against:

- the simplest thing that fully works; every noun and field has a real use case;
- the final state: would you land here starting from scratch;
- one way to do each thing, one source of truth;
- the platform before building your own;
- no magic numbers or arbitrary caps; known needs, not hypothetical ones;
- one name per concept, in the product's nouns;
- store raw inputs and derive the rest;
- no fallbacks or shims for unshipped code; a shim for a live contract names its removal condition.

When the note comes with code (the first interface commit: a migration, types, a wire protocol as code), the note is the specification: review the diff for where it departs from the note, then the note itself.

Report findings only, ranked: `[P1|P2|P3] <claim> · <why, citing the rule or product line> · <what to do instead>`. P1 is a wrong model or contract that will be expensive to reverse once data or code depends on it; P2 breaks a rule or adds complexity without a use case; P3 is naming or clarity. End with `Verdict: approve | approve with changes | redesign`. No praise, no summary of the note.

## Sources

Synthesized in original language from Google's Engineering Practices and *Software Engineering at Google*; empirical modern-review research by Bacchelli and Bird, Bosu et al., Czerwonka et al., McIntosh et al., and Sadowski et al.; Linux review guidance; Lamport, Herlihy and Wing, Berenson et al., Helland, Garcia-Molina and Salem, and AWS/Google reliability guidance; OWASP ASVS and Secure Code Review guidance; NIST SSDF; SLSA; OpenSSF Scorecard; and mutation/property-based testing research. Addy Osmani's review skill informed the comparison, not the procedure or its framework-specific checklist.
