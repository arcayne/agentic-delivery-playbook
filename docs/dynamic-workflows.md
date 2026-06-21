# Dynamic workflows

Dynamic workflows are the top of the orchestration ladder: broad parallel work with many workers, followed by synthesis and verification. They are useful when one context window or one linear pass would bias, miss, or slow the work.

They are not a substitute for a spec, approval, or evidence. Use them only when width is genuinely useful.

## Escalation ladder

Choose the smallest harness that safely fits the task:

```text
direct prompt
→ skill
→ subagent
→ chain / agent team
→ goal loop
→ dynamic workflow
```

- **Direct prompt:** one clear task, one agent, obvious validation.
- **Skill:** a repeatable process or instruction set.
- **Subagent:** isolated worker context for a focused task.
- **Chain / agent team:** a small number of coordinated roles.
- **Goal loop:** depth; keep iterating against a completion condition.
- **Dynamic workflow:** width; many workers explore, verify, or compare in parallel, then synthesize.

Do not jump to dynamic workflow when a skill, subagent, chain, or goal loop is enough.

## Width vs depth

Goal-style runs are **depth**: one objective, repeated passes, stop when the completion condition is true.

Dynamic workflows are **width**: many agents run side by side against separate items, hypotheses, approaches, or checks, then a synthesizer folds the work into one answer.

Nesting a workflow inside a goal loop can be powerful, but it is also a fast way to waste tokens or over-delegate. Treat that combination as a full-mode escalation that needs explicit approval.

## When to use dynamic workflows

Use dynamic workflows for full-mode work where parallelism changes the quality or speed of the result:

- codebase-wide audits, dead-code discovery, security review, or cleanup discovery
- large migrations or refactors with many independent files or packages
- root-cause investigations that need independent hypotheses tested against different evidence
- critical plans that need independent attempts and adversarial review before action
- evals, prompt/model comparisons, or skill reviews against a rubric
- rule-adherence checks where each rule can be verified independently
- repeated triage, research, or verification runs with a clear stop rule

## When not to use dynamic workflows

Do not use dynamic workflows for:

- small direct edits
- tightly sequential work where each step depends on the previous result
- unclear scope or vague success criteria
- low-value knowledge work where a normal answer is enough
- tasks that need one careful shared context more than many isolated contexts
- work without a concrete launch note and approval
- runs where no one will review the synthesis or verification evidence

## Launch approval note

Before starting a dynamic workflow or large parallel fanout, state the launch plan in plain English and get approval. Do not rely on blank budget fields that people will not fill.

If the user already approved the full outcome with language like "do it all", "implement the whole PRD", or a confirmed goal covering the full scope, treat that as approval to batch independent slices **inside that scope**. You still must record the launch note, but you do not need to re-ask for every child slice unless the plan changes scope, risk, authority, routing, or cost materially.

The launch note should include:

- **Scope:** what is included and excluded.
- **Concrete cap:** a human-readable boundary such as one worker per package, first pass only, fixed file list, no unapproved recursive fanout, maximum subtree depth, or max one verifier per finding.
- **Stop rule:** what ends the workflow.
- **Synthesis and verification plan:** how results are folded in, checked, and rejected.

Example:

```text
Dynamic workflow launch note:
Audit the 41 local skills, one worker per skill,
no recursive fanout, synthesize once, then run one
verifier pass over the synthesized findings. Stop
after the verifier pass or when no new high-confidence
findings remain.
```

Record the approved note in `notes.md`, `run.json`, or a workflow artifact. The important part is that the human approves an understandable plan before expensive fanout starts, or that the prior full-scope approval is explicitly tied to the launch note.

## Parallel implementation slicing

For broad implementation work, prefer many bounded child tasks over one huge implementation prompt when the slices are independent enough to merge safely.

A decomposition gate is required before implementation when Full-mode work spans multiple packages/services, names explicit rollout slices, has several independent acceptance-criteria clusters, or would require one worker to carry the whole PRD/spec plus broad scout reports. Scouts can gather local context, but scout output is not the child-task map.

Do not send the entire broad PRD/spec to one giant implementation worker unless a recorded exception explains why slicing is less safe or impossible, how context overflow/drift risk is mitigated, and what compensating review/validation will run.

A safe broad implementation shape is usually:

```text
parent/planner creates global child-task map + file ownership matrix
-> serialized foundation/shared-contract/config slice, if needed
-> slice planner creates a local subtree map only if that slice is still broad
-> parallel app/service/surface worker leaves with non-overlapping ownership
-> parent synthesis barrier + global validation
-> independent QA/reviewer
```

Good slice boundaries:

- one package, app, service, or adapter
- one page/component cluster
- one migration plus its tests
- one fixture/eval set
- one acceptance-criteria cluster
- one read-only audit or verifier rule cluster

Bad slice boundaries:

- multiple workers editing the same core file without worktree isolation
- slices that need unapproved product decisions
- slices with hidden ordering dependencies
- slices where validation cannot prove local correctness

Each child slice is a fractal playbook run. It needs:

- objective and non-goals
- allowed files and forbidden files
- route/model expectation or approved exception
- validation commands or manual evidence
- stop/escalation rules
- closeout evidence

Each planner in that tree owns the proposed subtree map for the slice it is asked to decompose. The parent/orchestrator owns approval to launch that subtree, the recursion/depth cap, and the final synthesis. Default to one decomposition level; add another planner level only when a child slice is still too broad for one focused worker and the run records why.

Parent responsibilities:

- create the child-task map, file ownership matrix, recursion cap, and concurrency cap before workers write
- prevent file ownership conflicts
- serialize or single-own shared schemas/contracts, env examples, lockfiles, routers, nav/i18n, central stores, and config unless using isolated worktrees plus a merge barrier
- collect child closeouts at a barrier
- reject speculative or unverified child findings
- run parent-level validation and QA after merge/fold-in
- record worker/reviewer failures truthfully

## Risk controls for parallel implementation

| Risk | Required control |
| --- | --- |
| Shared files such as nav, i18n, routers, schemas, config, or central stores attract multiple slices | Create a file ownership matrix before launch. Give each shared file one owner, serialize shared-file slices, or use isolated worktrees with an explicit merge barrier. |
| A child discovers product, UX, data-model, or architecture ambiguity | Child stops and escalates to parent with options/evidence. Child does not decide outside its slice. |
| A slice is Full-mode or high-risk | Run route enforcement for that slice. It needs verified model/agent route or an approved exception before coding. |
| Worker/reviewer times out or returns unusable output | Mark the child gate failed. Treat any partial edits as untrusted until inspected and completed by the same route, an approved replacement, or an explicit parent-takeover exception. |
| Child tests pass but global behavior may still break | Require both local child validation and parent global validation after synthesis. Child validation is necessary but not sufficient. |
| UX flow has sequential state or dependent screens | Do not split by tiny files. Slice by independent surfaces or run the sequential flow in a serialized lane with one owner. |
| Parallel outputs conflict or overlap | Stop at the barrier, resolve conflicts deliberately, rerun affected validation, and record rejected/accepted child changes. |

## Useful workflow patterns

### Classify-and-act

Use a classifier to assign each item to a route, handler, or output category.

### Fan-out-and-synthesize

Split the work into independent items, run workers in clean contexts, then synthesize structured outputs at a barrier.

### Adversarial verification

For each important finding or output, run a separate verifier or refuter against a rubric before accepting it.

### Generate-and-filter

Generate many candidates, deduplicate them, and filter by rubric, evidence, or verification.

### Tournament

Have multiple agents attempt the same task using different approaches, then compare outputs pairwise or with a judging agent.

### Loop-until-done

For unknown-size work, repeat bounded fanout until a stop rule is met, such as no new findings or no more errors in the logs.

### Root-cause hypothesis panel

Generate independent hypotheses from disjoint evidence sources, test each hypothesis, then refute weak explanations before synthesis.

### Rule-adherence verification

Assign one rule or small rule cluster to each verifier. Use a skeptic pass to reduce false positives.

### Evals

Run candidate prompts, skills, models, or implementations against a rubric, then compare and grade outputs with explicit evidence.

## Evidence and fold-in contract

A dynamic workflow finding is not accepted just because a worker reported it.

Each worker result should name:

- task or item handled
- evidence inspected
- finding or output
- confidence and uncertainty
- validation performed
- verifier/refuter result, when applicable

The synthesizer should record:

- accepted findings
- rejected findings
- speculative findings
- conflicts between workers
- verification gaps
- residual risks

No workflow finding should be presented as final unless it survives independent verification or is clearly marked speculative.
