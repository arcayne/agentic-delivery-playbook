# Model and Agent Routing

This playbook is model-agnostic. It does not require a specific provider or model name.

The important idea is role fit: use the right kind of agent or model for each phase, and record what actually happened.

Choose process weight before model weight. Direct-mode edits should not get a model-routing ceremony or full run ledger unless the human asks. Lightweight runs can record compact routing evidence in `run.json`/`notes.md`. Full-mode runs should record explicit model/agent routing and reasoning intensity when available.

## Provider-specific companion guides

Use provider-specific companions only when they help users route within a real harness surface without changing the core playbook stance.

- OpenAI via Hermes/Pi: [`docs/openai-hermes-pi-routing.md`](openai-hermes-pi-routing.md)

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

## Avoid false claims

Do not claim that a model performed well unless the run actually used that model and recorded it.

If routing failed or the harness used a default, record that honestly. The operational question is not "which model is best?" but "did this run satisfy the approved spec with evidence?"

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

1. split the spec into implementer-sized tasks
2. identify high-risk QA checks
3. give the implementer one focused task set at a time
4. review after the first implementation pass

This prevents a broad prompt from becoming a large uncontrolled edit.

If the broad ticket becomes a dynamic workflow, require a plain-English launch note before fanout starts and verify findings before folding them into the final answer. See [`dynamic-workflows.md`](dynamic-workflows.md).
