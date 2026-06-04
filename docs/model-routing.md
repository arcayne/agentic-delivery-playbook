# Model and Agent Routing

This playbook is model-agnostic. It does not require a specific provider or model name.

The important idea is role fit: use the right kind of agent or model for each phase, and record what actually happened.

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

## Configuration keys

Use whatever configuration mechanism your harness supports. Suggested logical names:

```text
SPEC_AUTHOR_MODEL
SPEC_CRITIC_MODEL
IMPLEMENTER_MODEL
QA_REVIEW_MODEL
ESCALATION_MODEL
```

If your harness supports subagents, you can map these to agent profiles instead of direct model names.

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

## Broad-ticket planning

For broad tickets, add a planning/review layer before implementation:

1. split the spec into implementer-sized tasks
2. identify high-risk QA checks
3. give the implementer one focused task set at a time
4. review after the first implementation pass

This prevents a broad prompt from becoming a large uncontrolled edit.
