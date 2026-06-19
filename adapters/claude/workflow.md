# Agentic Delivery Playbook workflow

Use this reference after `SKILL.md` selects lightweight or full mode.

## Run artifacts

Direct mode creates no run directory. For lightweight or full runs, create:

```text
specs/YYYYMMDD-HHMM-<feature-slug>/
  spec.md or spec.html
  run.json
  notes.md
```

Use `spec.html` only when diagrams, screenshots, state machines, tables, or stronger visual hierarchy make approval safer.

`run.json` should record workflow/version, phase, status, task fit, spec path, active role/agent/model, review gates, model ledger, changed files, validation evidence, findings, known gaps, and next action.

Model ledger source values:

```text
explicit | agent-default | runtime-default | manual | project-settings | pending-user-decision | exception-approved
```

For Full mode, do not treat missing model/agent routing config as approval to continue on defaults. Resolve routing before coding.

## 0. Triage

Record `taskFit` as:

```text
small-direct | lightweight-ticket | broad-ticket
```

Use direct mode when the task is clear, low ambiguity, likely one or two files, no serious risk, no public/cross-package contract change, and validation is obvious.

Use lightweight mode when the task is bounded, likely two to five files or one package, acceptance criteria are mostly clear after at most one or two questions, and risk is low/medium.

Use full mode when there is meaningful product or architecture ambiguity, safety/security/privacy/auth/provider/destructive risk, routing/state/config/API/public-contract semantics, more than five likely files, costly failure, or explicit end-to-end spec-gated request.

## 1. Intake

Interview until objective, non-goals, constraints, acceptance criteria, risks, and required evidence are clear.

For lightweight runs, ask at most one focused clarification question before drafting. If already clear, draft a compact spec/checklist immediately.

## 2. Spec author

Write `spec.md` or `spec.html` as an implementation-ready contract.

Include:

- objective
- non-goals
- current-state/repo context
- architecture and stack decisions that matter
- data/API/contracts
- UX or messaging behavior if relevant
- safety/security/privacy constraints
- edge cases and failure modes
- acceptance criteria
- verification plan
- implementation checklist
- QA checklist
- explicit open questions, if any

Keep lightweight specs compact.

## 3. Spec critic

Before coding, attack the spec for vague requirements, contradictions, missing states, hidden assumptions, impossible acceptance criteria, security/privacy gaps, and under-specified verification.

Revise the spec or ask the user to decide unresolved questions.

For lightweight runs, self-review is acceptable if no serious risk appears. For full runs, use an independent critic when available.

## 4. Approval gate

Do not implement until the spec is approved unless the user explicitly requested uninterrupted end-to-end work.

Informal approval such as `go`, `approved`, or `implement it` is acceptable. Record it in `run.json` or `notes.md`.

## 5. Routing enforcement and implementation

Before Full-mode implementation, run a route enforcement gate:

1. Inspect project routing config, Claude settings, repo instructions, run/spec model fields, and any available subagent/review tool configuration.
2. If no project override or explicit user-selected route exists, stop and ask the user to choose one: create route overrides, switch/select a model manually, approve `runtime-default`/`agent-default` as an exception, or narrow/split the task.
3. Do not set a Full-mode implementation target to `agent-default` or `runtime-default` just because no config exists. Use `pending-user-decision` until resolved, or `exception-approved` after explicit approval.
4. Record target and observed route in `run.json` before coding.
5. If a worker/reviewer times out or returns unusable output, mark that gate failed. Parent takeover is allowed only as an explicit exception; do not mark the timed-out worker/reviewer gate as passed.

Implement only against the approved spec. If the spec becomes ambiguous, stop and ask or reopen the spec phase.

Implementation rules:

- implement one approved spec task or tightly grouped task set at a time
- make the smallest correct change
- do not broaden scope or refactor unrelated code
- do not edit run artifacts unless explicitly asked
- run relevant validation and fix failures
- report changed files, validation commands, assumptions, and spec ambiguities

## Broad-ticket planning gate

If `taskFit` is `broad-ticket`, split the approved spec into implementer-sized tickets before implementation.

For broad tickets:

1. use a strong planner/reviewer to split tasks and list high-risk QA checks
2. give the implementer one ticket or tightly grouped ticket set at a time
3. review after the first implementation pass
4. record the gate in `run.json` and the model ledger

Do not add this gate for direct or ordinary lightweight work unless a risk signal appears.

## Evidence integrity

For older, interrupted, or incomplete runs:

- mark missing routing, missing gates, or skipped validation as warnings or approved exceptions
- do not fabricate model routing claims after the fact
- do not claim a model-specific result unless that model or agent was actually routed and recorded
- record what future runs should do differently

## 6. Implementation QA

QA against the approved spec, not against the implementation summary.

Categorize findings as:

```text
blocker | high | medium | low | spec ambiguity | implementation drift | missing validation/test
```

For broad tickets or sensitive changes, include high-risk QA checks for privacy/redaction, authority or irreversible actions, routing/state precedence, mode behavior, numeric/display edge cases, provider/config validation, and external-service failures.

## 7. Fix/escalation loop

Have the implementer fix normal issues. Escalate if repeated failures or critical ambiguity occur.

Stop blind fix loops when:

- more than two fix cycles are needed
- the same category of issue reappears
- implementation drifts from spec
- QA finds safety/privacy/security violations
- the parent has to revert implementer edits before continuing

## 8. Closeout

For lightweight mode, close out in `notes.md` and `run.json` with concise evidence.

For full mode, record:

- final status
- files changed
- verification commands/evidence
- known gaps
- model ledger, including reasoning intensity when available
- implementation model evaluation, when a model or agent was explicitly chosen
- critic/QA findings
- legacy/exception evidence, when applicable
- fix cycles
- escalations
- recommendation for next run

Never invent evidence. Missing checks are known gaps or approved exceptions.

## Visibility banner

At major phase transitions, report compactly:

```text
Workflow: agentic-delivery-playbook v0.2
Phase: <n>/<total> — <name>
Spec: specs/YYYYMMDD-HHMM-<slug>/spec.md or spec.html
Run: specs/YYYYMMDD-HHMM-<slug>/run.json
Active role/model: <role/model or runtime-default>
Next gate: <gate>
```

If using `spec.html`, prefer a local `127.0.0.1` preview URL when available so the human approves the rendered spec.

## Delegation

If delegation tools are available, use them for independent critic, implementation, or QA phases. Keep one parent agent in control of the workflow and evidence.

If delegation is unavailable, perform critic and QA passes yourself and label them as self-review. In Full mode, delegation/model unavailability must also be recorded as an approved exception or a reason to narrow/split the task before implementation.
