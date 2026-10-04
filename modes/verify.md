# Verify

Prove the change works: choose the cheapest check that can fail the changed behavior, drive the assembled product when only a human path can prove it, and report reproducible evidence.

## Choose the layer

1. **Static:** types, formatting, lint, schema validation.
2. **Unit or property:** pure logic and local transitions.
3. **Component:** one module through its public API.
4. **Integration:** database, process, network, framework, or composition boundaries.
5. **System or UI:** critical assembled user paths.
6. **Hardware or production acceptance:** behavior only the real environment can prove.

Use a broader layer only when a narrower one cannot exercise the failure.

## Design the check

Each check should:

- assert externally meaningful behavior;
- fail for the intended reason before the fix;
- use the smallest realistic input;
- control time, randomness, concurrency, and environment;
- cover failure, cancellation, empty, boundary, and compatibility cases when relevant;
- avoid private call order and implementation details.

Prefer real values and in-process components. Fake only nondeterministic, destructive, privileged, slow, or genuinely external boundaries. External adapters share one project-owned contract suite covering unsupported capabilities, errors, timeouts, cancellation, retries, and identity mapping.

Use test-first work when a red check clarifies changed behavior. Use characterization tests before preserving poorly understood behavior.

## Protect the environment

Never mutate production data, accounts, credentials, permissions, or user applications. Use isolated stores and allow-listed targets. Unknown test configuration fails closed. Test seams configure behavior; they never grant authority.

## Drive the product

When assembled interaction, copy, focus, geometry, or visual state matters, or a human flow needs acceptance, operate the product through its human interface. Driving complements deterministic checks; it never replaces them, and it is not for debugging internal logic.

Before driving, confirm isolated data and identity, allow-listed targets, one known app instance, stable identifiers, and bounded actions. Stop if any is absent. Then:

1. Restore documented clean state and launch the approved test build.
2. See pixels and a stable identifier; perform one human action.
3. Observe screen and machine state, and assert both.
4. Keep the artifacts and exact scenario; quit and clean disposable state.

Never add a model-only control surface, privileged bridge, or hidden authority. Stop on an unexpected permission, authentication, payment, or destructive dialog, production or unknown data, the wrong target, duplicate instances, sensitive fields, two targeting misses, a crash, or mutation outside isolation; don't click through.

## Evidence

Report:

- pre-fix red command and expected failure when behavior changed;
- final exact command or procedure;
- exit status and relevant test count;
- environment, seed, fixture, or hardware assumptions;
- skipped checks and reason;
- artifact location for failures, and visual plus state evidence for driven flows.

Never claim behavioral pass from compilation alone, a screenshot without state evidence, or output produced before the final edit. Project-specific commands, tiers, launch steps, and targets belong in the repo's AGENTS.md.
