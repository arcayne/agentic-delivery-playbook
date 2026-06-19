# Agentic Delivery Playbook for Codex

Use the Agentic Delivery Playbook for non-trivial coding work: features, refactors, integrations, workflow changes, bug fixes with ambiguity, safety/privacy/security risk, cross-package changes, public contract changes, or agent drift risk.

Do not use the full workflow for clear small direct edits unless the user asks.

## Scope triage

Classify every task before editing:

- **Direct**: clear, low-risk, likely one or two files, no security/privacy/auth/provider/destructive/public-contract risk, obvious validation. Do not create run artifacts; edit narrowly, validate, and report evidence.
- **Lightweight**: bounded low/medium-risk work, likely two to five files or one package, mostly clear acceptance criteria. Create a compact spec/checklist and stop for approval before implementation unless the user asked for end-to-end work.
- **Full**: broad, ambiguous, sensitive, provider/config/state/API/routing/public-contract, cross-package, or drift-prone work. Use the full spec, critique, approval, implementation, QA, fix/escalation, and closeout workflow.

Use the least intrusive process that can safely produce evidence.

## Direct mode

For direct mode:

1. Make the smallest correct change.
2. Do not create `specs/` artifacts.
3. Run obvious validation.
4. Report changed files, commands run, results, assumptions, and known gaps.

## Lightweight/full artifacts

For lightweight or full mode, create:

```text
specs/YYYYMMDD-HHMM-<feature-slug>/
  spec.md or spec.html
  run.json
  notes.md
```

Use `spec.html` only when visual hierarchy, diagrams, screenshots, tables, or state machines make approval safer.

`run.json` should record workflow/version, phase, status, task fit, spec path, active role/agent/model, review gates, model ledger, changed files, validation evidence, findings, known gaps, and next action.

Model ledger source values:

```text
explicit | agent-default | runtime-default | manual | project-settings | pending-user-decision | exception-approved
```

If routing/model choice cannot be controlled, record `runtime-default` and avoid model-specific claims. For Full mode, do not treat missing model configuration as approval to continue on defaults; stop before coding and resolve the route decision.

## Full-mode routing enforcement

Full mode must make implementation/review routing explicit before coding.

Before Full-mode implementation:

1. Inspect the project for model/agent routing config, such as `.codex`, `.agents`, `.pi/settings.json`, repo instructions, or run/spec model fields.
2. If no project override or explicit user-selected route exists, stop and ask the user to choose one:
   - create/update project route overrides,
   - manually switch/select a model and record it,
   - approve `runtime-default`/`agent-default` as an exception for this run,
   - narrow or split the task so the current route is safe.
3. Do not set a Full-mode implementation target to `agent-default` or `runtime-default` just because no config exists. Use `pending-user-decision` until resolved, or `exception-approved` after explicit approval.
4. If a worker/reviewer route is used, record target and observed route in `run.json` before implementation starts.
5. If a worker/reviewer times out or returns unusable output, mark that gate failed. Parent takeover is allowed only as an explicit exception; do not mark the worker/reviewer gate as passed or partially passed.

Minimum `run.json` fields for this gate:

```json
{
  "routeEnforcement": {
    "required": true,
    "reason": "full-mode missing route config requires user decision",
    "targets": [
      {
        "role": "implementer",
        "agent": "worker",
        "model": "pending-user-decision",
        "reasoningIntensity": "unknown",
        "source": "pending-user-decision"
      }
    ],
    "verification": {
      "status": "config-missing | pending-user-decision | verified | exception-approved | unverified | unavailable",
      "evidence": null
    }
  }
}
```

## Workflow

### 1. Intake

Ask only blocking clarification questions. For lightweight runs, ask at most one focused question before drafting when the task is mostly clear.

Clarify objective, non-goals, constraints, acceptance criteria, risks, and required evidence.

### 2. Spec author

Draft an implementation-ready spec with:

- objective
- non-goals
- current-state/repo context
- relevant architecture/stack decisions
- data/API/contracts
- UX or messaging behavior if relevant
- safety/security/privacy constraints
- edge cases and failure modes
- acceptance criteria
- verification plan
- implementation checklist
- QA checklist
- open questions, if any

Keep lightweight specs compact.

### 3. Spec critic

Before coding, critique the spec for vague requirements, contradictions, missing states, hidden assumptions, impossible acceptance criteria, security/privacy gaps, and under-specified verification.

Revise the spec or ask the user to decide unresolved questions.

### 4. Approval gate

Do not implement non-direct work until the spec is approved unless the user explicitly requested uninterrupted end-to-end work.

Record approval in `run.json` or `notes.md`.

### 5. Implementation

Implement only against the approved spec.

Rules:

- make the smallest correct change
- do not broaden scope or refactor unrelated code
- do not edit run artifacts unless explicitly asked
- stop and ask if the spec becomes ambiguous
- run relevant validation and fix failures
- report changed files, validation commands, assumptions, and gaps

### Broad-ticket planning gate

If the task fit is `broad-ticket`, split the approved spec into implementer-sized tickets before implementation. Give Codex one focused ticket or tightly grouped ticket set at a time.

Record the split and high-risk QA checks in `notes.md` or `run.json`.

### 6. QA review

QA against the approved spec and actual diff, not against the implementation summary.

Categorize findings as:

```text
blocker | high | medium | low | spec ambiguity | implementation drift | missing validation/test
```

For sensitive or broad work, include checks for privacy/redaction, authority or irreversible actions, routing/state precedence, mode behavior, numeric/display edge cases, provider/config validation, and external-service failures.

### 7. Fix/escalation loop

Stop blind fix loops when:

- more than two fix cycles are needed
- the same issue category reappears
- implementation drifts from spec
- QA finds safety/privacy/security violations
- evidence is missing or contradictory

### 8. Closeout

Close with:

- final status
- files changed
- validation commands/evidence
- known gaps
- QA findings
- fix cycles
- next action

Never invent evidence. Missing checks are known gaps or approved exceptions.
