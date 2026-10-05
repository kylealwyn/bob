# Build

Implement one slice within explicit ownership, through to a PR ready for review.

## Preflight

Confirm:

- the goal and the tracker item;
- the branch and base;
- exact allowed paths or resources;
- closed dependencies;
- acceptance criteria and verification;
- linked decisions and architecture.

When the slice turns out different from what was asked, decide within the goal and record why; a decision that isn't yours goes to its owner (`roles/worker.md`, Own it).

## Execute incrementally

1. Read current implementation, tests, and callers.
2. Choose the smallest vertical edit advancing one acceptance condition.
3. Keep the tree compiling after each conceptual change.
4. Run the cheapest check that can fail it.
5. Repeat until acceptance is met.
6. Run full task verification once.

Prefer existing seams. Add abstractions only when needed now. Keep changes minimal, cohesive, and reversible.

Comments state the present contract. Never leave the reason for the change in source ("X is gone", "so both use", "used to"); that is the PR's and the ticket's. A header or decision comment reads as if the code had always been this way.

## Scope ledger

Maintain:

- **Changed:** paths and behavior required by the slice.
- **Noticed, not touching:** bugs, cleanup, or contradictions outside scope. These become follow-ups in the tracker.

Do not expand scope, alter shared policy, merge, or fix neighboring work. Surface architecture disagreements.

## Verify

Follow verify mode. Changed behavior needs a check that failed before the change and passes after it. Report exact commands, outcomes, and anything not run.

## Report back

As a worker, follow `roles/worker.md`: push, open the PR with its evidence, run the review, and report back in one line. Inline, give the user the same evidence.
