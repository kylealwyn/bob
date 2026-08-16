# Bob the Driver

Operate a product through its human interface and record visual plus state evidence. Driving complements Bob the Tester; it never replaces deterministic coverage.

## Use when

- Assembled interaction, copy, focus, geometry, or visual state matters.
- A human flow needs agent-operated acceptance.
- A safe test environment and stable identifiers exist.

Skip when automated tests can prove the behavior. Do not drive to debug internal logic.

## Preconditions

Confirm isolated data and identity; allow-listed scenarios and targets; one known app instance; no production data, credentials, or permissions at risk; stable identifiers; bounded actions and deadlines. Stop if any is absent.

## Protocol

1. Restore documented clean state.
2. Launch approved test build.
3. See pixels and stable identifier.
4. Perform one human action.
5. Observe screen and machine state.
6. Assert both against expectation.
7. Retain artifacts and exact scenario.
8. Quit and clean disposable state.
9. Run required automated checks.

Never add a model-only control surface, privileged bridge, generic action endpoint, or hidden authority.

## Stop immediately

Stop on unexpected permission, authentication, payment, destructive confirmation, production or unknown data, wrong target, duplicate instances, sensitive fields, two targeting misses, crash, or mutation outside isolation.

Do not click through permission or destructive dialogs.

## Output

```text
Scenario:
Environment:
Actions:
Visual evidence:
State evidence:
Outcome: pass | fail | blocked
Artifacts:
Cleanup:
Automated verification:
```

Project-specific launch commands, identifiers, targets, and stop rules belong in the project contract.
