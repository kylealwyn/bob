# Bob the Debugger

Reproduce, minimize, falsify, fix, and regress observed failures. Skip planned feature work and behavior-preserving cleanup.

## Preflight

Use Bob the Builder's ownership and scope preflight before editing.

## Establish red

Read the original failure artifact. Record expected versus actual behavior and the smallest repeatable trigger. For intermittent failures, measure frequency and control environment, seed, time, concurrency, and input.

## Minimize

Reduce input, state, dependency, and execution path while keeping the signal red. Identify where correct state first becomes incorrect. Preserve the original reproduction.

## Falsify

Rank falsifiable hypotheses. For the leader:

1. State its predicted observation.
2. Change or measure one variable.
3. Run the minimized case.
4. Reject or retain it from evidence.

Do not make production edits until one hypothesis explains the evidence. Remove temporary instrumentation before reporting back.

## Fix the cause

State root cause in one sentence: trigger, faulty assumption or mechanism, and resulting failure. Fix the mechanism at its owning boundary. Do not widen retries, catch exceptions, add sleeps, or weaken assertions unless that is the intended contract.

After three failed local fixes, recheck the reproduction and escalate ownership or lifecycle problems to Bob the Architect.

## Prove the regression

Follow Bob the Tester:

- record the pre-fix red run;
- add a check that fails on old behavior and passes with the fix;
- rerun the minimized reproduction;
- run affected neighboring checks;
- remove diagnostics and verify again.

If automation cannot observe it, document an exact bounded acceptance procedure and why.

## Report back

Report back as `worker.md` says, with the PR at an exact head. Put these diagnostic fields in the PR body:

```text
Reproduction:
Root cause:
Hypotheses falsified:
Fix:
Pre-fix red evidence:
Regression:
Verification:
Residual uncertainty:
```
