# Model and Agent Routing

This playbook is model-agnostic. It does not require a specific provider or model name.

The important idea is role fit: use the right kind of agent or model for each phase, and record what actually happened.

Choose process weight before model weight. Direct-mode edits should not get a model-routing ceremony or full run ledger unless the human asks. Lightweight runs can record compact routing evidence in `run.json`/`notes.md`. Full-mode runs should record explicit model/agent routing and reasoning intensity when available.

## Provider-specific companion guides

Use provider-specific companions only when they help users route within a real harness surface without changing the core playbook stance.

- OpenAI via Hermes/Pi: [`docs/openai-hermes-pi-routing.md`](openai-hermes-pi-routing.md)
- Pi task-fit model routing (task-shape-first policy with DeepSeek as implementation worker, escalation rules, and final review contract): [`docs/pi-task-fit-model-routing.md`](pi-task-fit-model-routing.md)

## Recommended roles

| Role | Work type | Useful traits |
| --- | --- | --- |
| Spec author | Turn ambiguity into a contract | strong reasoning, product judgment, architecture awareness |
| Spec critic | Attack the contract | skeptical, security/privacy aware, edge-case focused |
| Implementer | Apply a focused spec | fast, reliable code editing, test-running discipline |
| QA reviewer | Compare diff to spec | detail-oriented, adversarial, validation-focused |
| Escalation reviewer | Diagnose drift or hard failures | strong reasoning, debugging, architecture judgment |

Optional dynamic-workflow roles:

| Role | Work type | Useful traits |
| --- | --- | --- |
| Workflow orchestrator | Split broad work and coordinate fanout | planning, decomposition, cost awareness |
| Worker / explorer | Inspect one item, package, hypothesis, or approach | focused context, evidence discipline |
| Verifier / refuter | Try to disprove a worker finding against a rubric | skeptical, adversarial, precise |
| Synthesizer / judge | Merge, dedupe, compare, and classify results | strong reasoning, conflict resolution, evidence weighting |

## Configuration keys

Use whatever configuration mechanism your harness supports. Suggested logical names:

```text
SPEC_AUTHOR_MODEL
SPEC_CRITIC_MODEL
IMPLEMENTER_MODEL
QA_REVIEW_MODEL
ESCALATION_MODEL
WORKFLOW_ORCHESTRATOR_MODEL
WORKFLOW_VERIFIER_MODEL
WORKFLOW_SYNTHESIZER_MODEL
```

If your harness supports subagents, you can map these to agent profiles instead of direct model names. Workflow-specific keys are optional; use them only when broad fanout is actually launched.

## Model ledger

Every run should record model or agent routing in `run.json`.

Minimum fields:

```json
{
  "role": "implementer",
  "agent": "code-writer",
  "model": "configured-implementation-model",
  "reasoningIntensity": "high",
  "source": "explicit",
  "notes": "Routed by run configuration."
}
```

Use `source` values consistently:

- `explicit`: the run requested this model/agent directly
- `agent-default`: an agent profile supplied it
- `runtime-default`: the harness chose it implicitly
- `manual`: a human selected it outside the run configuration
- `project-settings`: project configuration supplied the route
- `pending-user-decision`: Full-mode routing is unresolved and coding must not start
- `exception-approved`: the user approved a route different from the normal policy

## Full-mode route enforcement

Full-mode work must not silently drift onto whatever model happens to be active.

Before Full-mode implementation:

1. Inspect the harness/project routing configuration.
2. If no project override or explicit/manual route exists, stop before coding and ask the user to choose one:
   - create/update project model or agent overrides,
   - manually switch/select the intended model,
   - approve `runtime-default`/`agent-default` as an exception for this run,
   - narrow or split the task so the current route is safe.
3. Do not set the implementation target to `agent-default` or `runtime-default` merely because no config exists. Use `pending-user-decision` until resolved, or `exception-approved` after explicit approval.
4. Record both target and observed route in `run.json`.
5. If a delegated worker/reviewer times out or returns unusable output, record that gate as failed. Parent takeover is allowed only as an explicit exception; do not mark the timed-out role gate as passed or partially passed.

## Avoid false claims

Do not claim that a model performed well unless the run actually used that model and recorded it.

If routing failed or the harness used a default, record that honestly. For Full mode, routing failure or missing config is a decision point before coding, not an automatic pass. The operational question is not "which model is best?" but "did this run satisfy the approved spec with evidence under the route that was actually approved and recorded?"

## Model mix and cost/quota discipline

Using different model lanes is expected when it improves role fit. Typical safe mix:

- medium/lower-cost lanes for read-only repository context, inventory, and narrow handoff notes
- stronger reasoning for product/architecture decisions, route selection, guardrail review, and final QA
- implementation workers chosen for reliable edits under bounded contracts, not for broad planning

Mixed models can reduce API cost compared with running every lane on the strongest high/xhigh model **when** prompts are bounded, accepted evidence is synthesized once, and the cheaper lanes do not cause rework. It is not automatic: parallel fanout can increase total tokens and burn quota faster, and a weak lane that causes rework can cost more than a stronger lane used narrowly.

Record enough telemetry to evaluate the tradeoff locally:

- role, agent/model, reasoning level, and source
- input/output tokens, cache reads/writes, turns, duration, and approximate cost when available
- whether the lane prevented rework, found defects, or produced accepted evidence
- whether any output was rejected as speculative, duplicated, or too broad

Do not compare model cost by prose impression. Compare the accepted evidence and total run cost against the likely alternative, e.g. “all lanes on strongest high/xhigh.” If exact provider pricing or quota accounting is unavailable, record `unknown` rather than inventing a savings claim.

For the detailed measurement model and public reporting schema, see [`handoff-economics.md`](handoff-economics.md).

## Implementation evaluation

When implementation used an explicitly chosen model or agent, record a short post-QA evaluation:

- target model or agent
- actual model or agent
- task fit
- acceptance criteria met
- implementation drift
- unapproved decisions
- fix cycles
- back and forth signal
- tests run
- review findings
- verdict

This is not a benchmark score. It is a local operating signal: which models and agents are reliable for which task shapes in your own workflow.

## Harness ladder and dynamic workflow routing

Choose the smallest orchestration harness that safely fits the task:

```text
direct prompt -> skill -> subagent -> chain / agent team -> goal loop -> dynamic workflow
```

Goal loops are depth: they keep iterating against a completion condition. Dynamic workflows are width: many workers run in parallel, then a synthesizer folds the results together.

Dynamic workflows should record the actual roles used, such as orchestrator, worker/explorer, verifier/refuter, and synthesizer/judge. Do not claim model-specific workflow results unless those agents or models were actually routed and recorded.

## Broad-ticket planning

For broad tickets, add a planning/review layer before implementation:

1. choose a recursive decomposition strategy
2. create a coarse launch tree with slice ids, dependencies, first slice(s), and recursion/concurrency caps
3. assign one focused task set per launched worker with objective, allowed files, forbidden files, non-goals, dependencies, route, validation, and ownership/conflict rule
4. require any planner that decomposes a still-broad slice to return a local subtree map
5. identify shared/foundation files that need one owner or serialization for siblings launching now
6. identify high-risk QA checks
7. review/synthesize at a barrier after each implementation pass

This prevents a broad prompt from becoming a large uncontrolled edit without forcing the root planner to over-plan every package before the first slice starts.

Run this decomposition strategy gate before implementation when the approved spec spans multiple packages/services, names explicit rollout slices, has multiple independent acceptance-criteria clusters, or would require one worker prompt to carry the whole PRD/spec plus broad scout context.

Do not hand a whole PRD/spec to one giant implementation worker unless you record an explicit single-worker exception: why recursive slicing would be less safe or impossible, how context overflow/drift risk is mitigated, and what review/validation compensating controls will run.

If the user approved the full outcome or confirmed a goal for the full scope, you may batch independent slices without asking again for each child task. Record a launch note, recursion cap, concurrency cap, conflict rule for the active launch, and barrier plan. Each launched child task must apply the same playbook rules at slice scale: objective, non-goals, route evidence or exception, validation, drift check, and closeout.

Each planner owns the proposed subtree map for the slice it decomposes; the parent/orchestrator owns approval, launch, global synthesis, and final evidence. Default to one decomposition level and add another subtree level only when the child slice is still too broad for one focused worker and the run records the reason and cap.

"One writer" means one owner for a file or tightly coupled cluster, not one worker for the whole repo. Serialize shared schemas/contracts, env examples, lockfiles, routers, nav/i18n, central stores, and config for siblings launching now unless worktrees and a merge barrier make parallel edits safe.

If the broad ticket becomes a dynamic workflow, require a plain-English launch note before fanout starts and verify findings before folding them into the final answer. See [`dynamic-workflows.md`](dynamic-workflows.md).
