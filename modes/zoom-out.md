# Zoom out

Judge a piece of work against the whole, and find the global maximum rather than the nearest improvement. The Foreman runs it on every new item (Fit) and on every shared design and merge; any Bob runs it when a plan sprawls, a request feels like a symptom, or the current path has momentum it hasn't earned.

## Read the whole first

Before judging, read what the work has to fit:

- the product doc and the repo's AGENTS.md: the nouns, the arc, the settled decisions;
- the tracker's open items, including triage and backlog;
- what's in flight: each worker's goal, its design notes, its PR;
- what merged recently, and the default branch's current shape where the work lands.

Skipping this is how a reasonable request lands as a second model of something that already exists.

## Judge

1. Restate the real objective in a sentence: what must be true for the user after this succeeds.
2. Name the current frame: the path, design, or assumption dominating attention, and what it optimizes. Is that the outcome or a nearby proxy?
3. Place the work in the whole. Does it duplicate something in flight or settled? Contradict a decision? Need a concept that doesn't exist yet, or that two items are each inventing?
4. Separate durable constraints from accidental ones; drop the accidental.
5. Compare two to four options, at least one smaller or lower-commitment. Doing less, deleting, or not doing it are options.
6. Recommend one, with the reason and the next concrete action.

## Lenses

Use the ones that add signal: outcome (the user's problem, or a nicer artifact?), reversibility, surface area, native fit (fighting the platform?), ownership after the excitement, failure mode (loud, silent, or social), and the evidence that would change the call.

## Output

One short paragraph for a small call. For a consequential one: the real objective, the current frame, where it sits in the whole, the options, the recommendation, and the next move. No pros-and-cons essay, no "it depends" without saying on what. If the answer is stop, delete it, or ship the smaller version, say so.
