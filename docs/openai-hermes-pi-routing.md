# OpenAI Routing for Hermes and Pi

This companion guide is for teams that run the Agentic Delivery Playbook through Hermes or Pi and select OpenAI-backed coding models through browser login.

The core playbook stays model-agnostic. This page adds practical defaults for the model labels Hermes/Pi users actually see, plus guidance for choosing reasoning intensity by task risk.

## Scope and caveat

Treat the model labels below as Hermes/Pi surface labels.

- They reflect a common OpenAI-backed Hermes/Pi setup.
- They may not match public API model IDs exactly.
- They may not match ChatGPT picker names.
- Record the actual selected model string in `run.json`.

## Observed Hermes/Pi OpenAI labels

| Model label | Provider label | Best fit |
| --- | --- | --- |
| `gpt-5.5` | `openai-codex` | premium reasoning, broad planning, critique, escalation, risky implementation |
| `gpt-5.4` | `openai-codex` | strong default for focused planning, implementation, and high-signal QA |
| `gpt-5.4-mini` | `openai-codex` | guardrails, low-risk QA, log triage, structured validation |
| `gpt-5.3-codex` | `openai-codex` | focused implementation against a clear approved spec |
| `gpt-5.3-codex-spark` | `openai-codex` | mechanical edits, boilerplate, narrow transformations |
| `gpt-5.2` | `openai-codex` | fallback when newer models are unavailable or a project has known-good history on it |

## Process weight before reasoning weight

First decide whether the work is direct mode, lightweight mode, or full mode.

- Direct mode: no run directory and no routing ceremony; use the current/default editor model unless the human asks otherwise.
- Lightweight mode: compact spec/checklist, notes-only evidence, parent self-review by default, and medium reasoning unless risk appears.
- Full mode: broad-ticket planning when needed, explicit model/reasoning ledger, critic/QA gate, high-risk QA for sensitive work, and required closeout fields.

Do not spend premium reasoning or run the full spec-gated workflow for clear one- or two-file edits unless the human explicitly asks.

## Reasoning intensity policy

Route reasoning intensity by task risk, not by model number alone.

| Reasoning intensity | Use when |
| --- | --- |
| Low | mechanical edits, formatting, simple classification, narrow transformations, objective checks |
| Medium | bounded implementation, ordinary QA, log triage, validation against a clear spec |
| High | spec writing, critique, multi-file implementation, debugging, QA review, ambiguous tradeoffs |
| Extra High | architecture decisions, security/privacy-sensitive work, broad-ticket decomposition, repeated failure loops, final escalation review |

`gpt-5.5` at Low reasoning and `gpt-5.5` at Extra High reasoning are different operational choices. Record the reasoning intensity separately from the model string.

## Recommended routing matrix

| Playbook role or task shape | Recommended model | Reasoning intensity | Notes |
| --- | --- | --- | --- |
| Intake for ambiguous work | `gpt-5.5` | High | Use when scope, risk, or acceptance criteria are unclear. |
| Lightweight spec author | `gpt-5.4` or `gpt-5.5` | Medium / High | Use `gpt-5.5` when edge cases or tradeoffs are subtle. |
| Broad-ticket spec author | `gpt-5.5` | High / Extra High | Split work into implementer-sized tasks before coding. |
| Spec critic | `gpt-5.5` | High / Extra High | Prefer skeptical review over cheap validation. |
| Normal focused implementer | `gpt-5.4` or `gpt-5.3-codex` | Medium / High | Best when the spec is approved and bounded. |
| Broad or risky implementer | `gpt-5.5` or `gpt-5.4` | High | Use stronger reasoning when implementation requires judgment. |
| Mechanical implementer | `gpt-5.3-codex-spark` | Low / Medium | Use for boilerplate, syntax changes, dependency updates, and narrow test templates. |
| Guardrail validator | `gpt-5.4-mini` | Low / Medium | Use for structured checks, run-state classification, and log triage. |
| Low-risk QA reviewer | `gpt-5.4-mini` | Medium | Good when acceptance criteria are explicit and evidence is objective. |
| High-risk QA reviewer | `gpt-5.5` or `gpt-5.4` | High | Use for security, privacy, auth, data flow, or cross-system review. |
| Escalation reviewer | `gpt-5.5` | Extra High | Use after repeated drift, unresolved failures, or architectural ambiguity. |
| Legacy fallback | `gpt-5.2` | Match task risk | Use only when newer models are unavailable or prior evidence supports it. |

## Recording routing in `run.json`

Record both model selection and reasoning intensity when the harness exposes them.

Example role entry:

```json
{
  "agent": "code-writer",
  "model": "gpt-5.4",
  "reasoningIntensity": "high",
  "source": "explicit"
}
```

Example ledger entry:

```json
{
  "role": "implementer",
  "agent": "code-writer",
  "model": "gpt-5.4",
  "reasoningIntensity": "high",
  "source": "explicit",
  "notes": "Selected in the Hermes/Pi model picker for a risky multi-file change."
}
```

If the harness resolves different actual values than the target selection, record both:

```json
{
  "role": "implementer",
  "agent": "code-writer",
  "targetModel": "gpt-5.3-codex",
  "actualModel": "gpt-5.4",
  "targetReasoningIntensity": "medium",
  "actualReasoningIntensity": "high",
  "source": "agent-default",
  "notes": "Agent profile supplied the actual routing."
}
```

## Operating guidance

- Use `gpt-5.5` where ambiguity, critique, architecture, or drift risk matters.
- Use `gpt-5.4` or `gpt-5.3-codex` once the task is narrow, approved, and testable.
- Use `gpt-5.4-mini` for repetitive guardrails, structured checks, and low-risk review.
- Avoid claiming model-specific success unless the actual model and reasoning intensity were recorded.
