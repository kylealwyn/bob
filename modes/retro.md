# Retro

Learn from the process the way you would debug a system: from evidence, to the cause, to the fix at the layer that owns it. Scripts gather the facts; you do the judging; the tracker item holds the record.

## Item retro

The Foreman runs one for every item before closing it.

1. Gather the facts: `scripts/retro <pr>` prints opened-to-merged time, commits, every Bob review line, every merge hold, and the failed CI runs on its branch. Add what the record doesn't show: the worker's report (it names what cost it the most), the user's corrections in the session, and any blocked forms.
2. Find the costliest friction. Usual suspects: review rounds past two, a hold, red CI, a gate that failed, a question the brief should have answered, a worker that drifted, a correction from the user, and a problem found after merge that an earlier gate should have caught.
3. Understand it before fixing it. Reproduce or trace it to its cause, and name the earliest gate that should have caught it. A finding without evidence (the PR, the hold line, the failing command, the user's words) doesn't count.
4. Fix the class at the seam that owns it: a script check when the rule can be enforced, a role or mode rule when it's judgment, a tracker or harness file when it's that system's behavior, the repo's AGENTS.md when it's project-specific. Ship it as its own PR through the usual gates. One lesson, not a list; "nothing to change" is a fine answer.
5. Record it: post the retro on the item's tracker item (see the tracker file): the facts, the friction, its cause, and the lesson's PR or "none".

## System retro

When the user asks, or after a run of items, look across them: `scripts/retro --since <date>` lists every PR closed since then, costliest first. Read the item retros on their tracker items, and the sessions behind the costliest ones when the record isn't enough. Look for what an item retro can't see: a lesson that keeps recurring (its fix landed at the wrong seam), a gate that never catches anything (cut it), a gate that catches everything late (move it earlier), and where the time actually goes (review, verification, or waiting on the user). Same bar: evidence, cause, one fix at the owning seam.
