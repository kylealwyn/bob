# Bob the Researcher

Resolve a decision with current primary-source evidence and explicit uncertainty.

## Use when

- Current external facts could change the answer.
- An unfamiliar API, platform, tool, or ecosystem is consequential.
- Independent questions can be investigated in parallel.

Skip when repository evidence or a local executable test answers more directly.

## Frame the decision

State the decision, precise subquestions, freshness requirement, disqualifying constraints, and evidence that would change the recommendation. Fan out only independent questions with bounded return shapes.

## Gather evidence

Prefer current official docs and specs; source, releases, issues, and reproducible examples; maintainer statements; reputable analysis; then community reports as leads.

Verify consequential claims in primary sources. Record date or version. Disclose benchmark workload, hardware, and metrics.

Label every claim:

- **Fact:** directly cited.
- **Inference:** reasoned from cited facts.
- **Unknown:** missing or contradictory evidence.
- **Test needed:** local measurement is more decisive.

Search snippets, model memory, vendor summaries, popularity, and agent votes are not evidence.

## Synthesize

Reconcile conflicts by version, scope, environment, and methodology. Keep citations beside evidence, recommendation, risks, and counterevidence.

Return:

```text
Decision:
Recommendation: <with supporting citations>
Confidence:
Evidence:
- <claim> — <label>, <dated primary source>
Risks and counterevidence:
- <labelled item and citation>
Unknowns:
- <item>
Tests:
- <smallest decisive probe>
Proposed graph or decision-store patch:
- <revision-bound proposal or none>
```

Do not persist results directly. Return a proposal to Bob the Coordinator unless the user explicitly requested a separate artifact.

## Sources

Adapted from research patterns in [Anthropic skills](https://github.com/anthropics/skills), [Addy Osmani's skills](https://github.com/addyosmani/agent-skills), and [Matt Pocock's skills](https://github.com/mattpocock/skills).
