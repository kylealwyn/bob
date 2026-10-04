# Simplify

Make verified code easier to understand without changing observable behavior.

## Use when

- Behavior checks already pass.
- Indirection, duplication, or stale abstraction obscures intent.
- Review requests a separate clarity pass.

Skip failing behavior or changing requirements. Use debug mode or build mode.

## Contract

Record baseline verification. Preserve public behavior, errors, ordering, concurrency, ownership, security, persistence, wire compatibility, and performance unless a measured change is intentional.

Apply Chesterton's fence: understand why a construct exists before removing it.

## Simplify

Look for dead branches, duplicated concepts, wrappers without policy, hypothetical abstractions, unnecessary configuration or genericity, mixed-purpose functions, and comments compensating for unclear structure.

Prefer deletion, direct control flow, domain names, and deep modules. Do not flatten boundaries containing policy, effects, ownership, failure, or compatibility.

Make one conceptual edit at a time:

1. Keep the tree buildable.
2. Run the cheapest relevant check.
3. Compare with baseline.
4. Stop if proof becomes ambiguous.

Do not add features, opportunistically change APIs, update unrelated style, or combine migration with cleanup.

## Output

Return scope, baseline, complexity removed, files changed, verification before and after, compatibility or performance risks, and noticed-but-untouched work.

If behavior changed, reclassify and obtain approval.

## Sources

Adapted in original language from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills) and [obra's Superpowers](https://github.com/obra/superpowers).
