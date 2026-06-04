# PRD: OpenAI Routing Guidance for Hermes and Pi

## Summary

Add an optional OpenAI-specific routing guide for users who run this playbook through Hermes or Pi and select OpenAI Codex models through browser login.

The core playbook remains model-agnostic. This addition gives practical defaults for a common operating setup: OpenAI-backed coding models exposed by Hermes/Pi, with model choice and reasoning intensity recorded as part of each run.

## Problem

The playbook already tells users to choose models by role fit, but it intentionally avoids provider-specific names. That is useful for portability, but it leaves OpenAI-preferring Hermes/Pi users without concrete guidance.

Those users see a practical model picker, not a generic provider registry. In that environment, they need to know:

- which OpenAI model to use for spec writing, critique, implementation, QA, guardrails, and escalation
- which reasoning intensity to select for each task shape
- how to record model and reasoning choices in `run.json`
- when to spend premium reasoning and when to use faster or cheaper coding models
- how to avoid treating Hermes/Pi labels as universal API or ChatGPT model names

## Audience

Primary audience:

- Hermes users running the Agentic Delivery Playbook with OpenAI browser-login models
- Pi users using `adapters/pi/SKILL.md`
- maintainers who want model routing to be concrete without making the whole repo provider-specific

Secondary audience:

- teams adapting the playbook to their own OpenAI-backed agent harnesses

## Goals

- Add a dedicated OpenAI Hermes/Pi routing document under `docs/`.
- Keep `docs/model-routing.md` as the provider-neutral source of truth.
- Provide a clear OpenAI model ladder based on the Hermes/Pi labels users actually see.
- Make reasoning intensity a first-class routing decision.
- Update run artifacts so intended and actual reasoning intensity can be recorded.
- Give users a practical default mapping for lightweight tickets, broad tickets, QA, guardrails, and escalation.
- Make it explicit that these labels are Hermes/Pi surface labels and may not match public API or ChatGPT picker names.

## Non-Goals

- Do not turn the playbook into an OpenAI-only workflow.
- Do not claim Hermes/Pi model labels are universal OpenAI API model IDs.
- Do not add pricing claims or benchmark scores.
- Do not recommend one model for every role.
- Do not remove support for other providers or local models.
- Do not hard-code model names into every template field.

## Observed Hermes/Pi OpenAI Model Labels

Use this list as the initial documented OpenAI model set for Hermes/Pi users:

| Model label | Provider label | Suggested role |
| --- | --- | --- |
| `gpt-5.5` | `openai-codex` | premium reasoning, broad planning, critique, escalation, risky implementation |
| `gpt-5.4` | `openai-codex` | strong default for normal implementation, QA, and focused planning |
| `gpt-5.4-mini` | `openai-codex` | validation, guardrails, log triage, low-risk QA, bounded implementation |
| `gpt-5.3-codex` | `openai-codex` | focused implementation against a clear spec |
| `gpt-5.3-codex-spark` | `openai-codex` | mechanical edits, boilerplate, narrow transformations |
| `gpt-5.2` | `openai-codex` | fallback when newer models are unavailable or project history supports it |

The implementation guide should describe these as observed Hermes/Pi labels, not as global OpenAI model availability.

## Reasoning Intensity Policy

Reasoning intensity should be routed by task risk and recorded separately from model choice.

| Reasoning intensity | Use when |
| --- | --- |
| Low | Mechanical edits, formatting, simple classification, checklist checks, narrow transformations, and objective validation with little ambiguity. |
| Medium | Ordinary implementation, bounded QA, log triage, and validation where the spec is already clear. |
| High | Spec writing, critique, multi-file implementation, debugging, QA review, and decisions with unclear tradeoffs. |
| Extra High | Architecture decisions, security/privacy-sensitive work, broad-ticket decomposition, repeated failure loops, and final escalation review. |

The guide should emphasize that `gpt-5.5` at Low reasoning and `gpt-5.5` at Extra High reasoning are operationally different choices. Both the model and reasoning intensity belong in the run ledger.

## Recommended Routing Matrix

| Playbook role or task shape | Recommended OpenAI model | Reasoning intensity | Notes |
| --- | --- | --- | --- |
| Intake for ambiguous work | `gpt-5.5` | High | Use when requirements, risk, or scope are unclear. |
| Lightweight spec author | `gpt-5.4` or `gpt-5.5` | Medium / High | Use `gpt-5.5` when acceptance criteria or edge cases are subtle. |
| Broad-ticket spec author | `gpt-5.5` | High / Extra High | Split into implementer-sized work before coding. |
| Spec critic | `gpt-5.5` | High / Extra High | Prefer skeptical review over cheap validation. |
| Normal focused implementer | `gpt-5.4` or `gpt-5.3-codex` | Medium / High | Best when the spec is approved and bounded. |
| Broad or risky implementer | `gpt-5.5` or `gpt-5.4` | High | Use stronger reasoning when implementation may require judgment. |
| Mechanical implementer | `gpt-5.3-codex-spark` | Low / Medium | Use for boilerplate, syntax changes, dependency updates, and test templates. |
| Guardrail validator | `gpt-5.4-mini` | Low / Medium | Use for structured checks, run-state classification, and log triage. |
| Low-risk QA reviewer | `gpt-5.4-mini` | Medium | Suitable when acceptance criteria are explicit and evidence is objective. |
| High-risk QA reviewer | `gpt-5.5` or `gpt-5.4` | High | Use for security, privacy, auth, data flow, or cross-system review. |
| Escalation reviewer | `gpt-5.5` | Extra High | Use after repeated drift, unresolved failures, or architectural ambiguity. |
| Legacy fallback | `gpt-5.2` | Match task risk | Use only when newer models are unavailable or prior evidence supports it. |

## Proposed Repo Changes

1. Add `docs/openai-hermes-pi-routing.md`.

   This should be the user-facing implementation guide. It should include the model ladder, reasoning policy, routing matrix, example `run.json` entries, and caveats about Hermes/Pi labels.

2. Update `docs/model-routing.md`.

   Add a short "Provider-specific companion guides" section linking to the OpenAI Hermes/Pi guide. Keep the existing page model-agnostic.

3. Update `README.md`.

   Add one sentence under "Model choice per task" pointing OpenAI Hermes/Pi users to the companion guide.

4. Update `templates/run.template.json`.

   Add `reasoningIntensity` to role entries and model ledger entries. Suggested values:

   ```json
   "reasoningIntensity": "low | medium | high | extra-high | runtime-default | unknown"
   ```

5. Update `examples/lightweight-ticket/run.json`.

   Add sample reasoning intensity values so users can see how to record the field.

6. Update `adapters/pi/SKILL.md`.

   Add a short note telling Pi users to record both model and reasoning intensity when selecting OpenAI models through browser login.

## Example Ledger Entry

The OpenAI guide should include a compact example:

```json
{
  "role": "specAuthor",
  "agent": "planner",
  "model": "gpt-5.5",
  "provider": "openai-codex",
  "reasoningIntensity": "high",
  "source": "manual",
  "notes": "Selected in Hermes/Pi model picker for broad-ticket planning."
}
```

If the harness changes routing automatically, the run should record the actual value:

```json
{
  "role": "implementer",
  "agent": "code-writer",
  "targetModel": "gpt-5.3-codex",
  "actualModel": "gpt-5.4",
  "provider": "openai-codex",
  "targetReasoningIntensity": "medium",
  "actualReasoningIntensity": "high",
  "source": "agent-default",
  "notes": "Actual model came from the selected agent profile."
}
```

## Acceptance Criteria

- `docs/openai-hermes-pi-routing.md` exists and is linked from `docs/model-routing.md`.
- README references the OpenAI Hermes/Pi guide without making the whole playbook OpenAI-specific.
- The guide includes the observed Hermes/Pi OpenAI labels and the recommended routing matrix.
- The guide includes a reasoning intensity policy with Low, Medium, High, and Extra High.
- `templates/run.template.json` supports recording reasoning intensity.
- The Pi adapter tells users to record model and reasoning intensity when available.
- The implementation avoids pricing claims, benchmark claims, and universal API-model claims.
- Existing provider-neutral routing guidance remains intact.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Model labels change in Hermes/Pi | Label the guide as surface-specific and require actual model recording in `run.json`. |
| Users treat the guide as universal OpenAI API guidance | State clearly that the labels reflect Hermes/Pi browser-login availability. |
| `gpt-5.5` becomes overused for cheap tasks | Route by task risk and reasoning intensity, not by highest model number. |
| Lower-tier models are used for ambiguous planning | Make broad-ticket planning and escalation default to `gpt-5.5` High or Extra High. |
| Reasoning intensity is forgotten | Add it to templates, examples, and adapter instructions. |

## Rollout Plan

1. Add the OpenAI Hermes/Pi guide.
2. Wire the guide into `docs/model-routing.md` and `README.md`.
3. Add reasoning intensity fields to `templates/run.template.json`.
4. Update the lightweight example.
5. Add a Pi adapter note.
6. Review the docs for provider-neutral language and surface-specific caveats.

## Open Questions

- Should the OpenAI Hermes/Pi guide be included in the public README quick start, or only linked from the model-routing section?
- Should reasoning intensity be required for every role entry, or only for explicit/manual model routing?
- Should the model ledger use one combined `modelLedger` array only, or should each role object also carry its latest selected reasoning intensity?
