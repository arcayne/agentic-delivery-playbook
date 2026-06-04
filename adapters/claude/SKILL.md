---
name: agentic-delivery-playbook
description: Spec-gated delivery workflow for non-trivial Claude coding-agent work. Use when a feature, refactor, integration, workflow, or bug fix needs an approved spec before implementation, especially when ambiguity, safety, privacy, security, cross-package changes, or agent drift risk is meaningful. Do not use for clear small direct edits unless the user asks.
---

# Agentic Delivery Playbook for Claude

Use this skill to turn ambiguous implementation work into an approved, AI-ready contract before coding.

Core thesis: spend strong reasoning on shared understanding, architecture, edge cases, acceptance criteria, and QA contracts; then implement narrowly against the approved spec with explicit evidence.

This skill is self-contained for Claude/Claude Code. It does not require Pi, subagents, or slash commands. If the surrounding harness exposes model routing, subagents, reasoning controls, or review tools, record how they were used; otherwise record `runtime-default` and do not make model-specific claims.

## Scope triage: choose process weight first

Before creating artifacts, choosing models, or delegating reviewers, classify the request by process weight. Use the least intrusive mode that can safely produce evidence.

### Direct mode: skip the playbook and implement directly

Use direct mode when all are true:

- the requested change is clear and low ambiguity
- likely touches one or two files
- no security, privacy, auth, payment, financial, destructive, external-provider, or irreversible-action risk
- no cross-package or public contract change
- validation is obvious and narrow
- the user did not explicitly ask for a spec-first run

Direct mode rules:

- do not create a run directory
- do not write spec artifacts unless the user asks
- edit the code, run the obvious validation, and report changed files plus validation evidence

### Lightweight mode: compact contract, low ceremony

Use lightweight mode for bounded work when:

- likely touches two to five files or one package
- acceptance criteria are mostly clear after at most one or two questions
- risk is low or medium
- a compact spec/checklist is enough

Lightweight mode rules:

- create only the minimal run artifacts: `spec.md` or `spec.html`, `run.json`, and `notes.md`
- keep the spec/checklist compact
- notes-only evidence is acceptable when commands and outcomes are clearly recorded
- parent self-review is acceptable when no serious risk signal appears
- do not add an independent critic, broad-ticket planning gate, or high-risk QA checklist unless risk appears

### Full mode: broad or risky delivery workflow

Use full mode when any are true:

- product or architecture ambiguity is meaningful
- safety, security, privacy, auth, external-provider, or destructive behavior is involved
- the change affects routing, state machines, provider wiring, config, public contracts, or command semantics
- likely touches more than five files
- failure would be costly or hard to detect
- the user asks for end-to-end spec-gated delivery

Full mode rules:

- create the run directory and maintain explicit artifacts
- use broad-ticket planning before implementation when the spec is too large for one implementer pass
- record explicit model/agent routing and reasoning intensity when available
- use a critic/QA gate, preferably independent when available
- apply high-risk QA checks for sensitive or cross-system work
- use dynamic workflow/fanout only after a plain-English launch note is approved
- accept workflow findings only after synthesis plus independent verification, or mark them speculative
- complete required closeout fields: files changed, validation, findings, model ledger, known gaps, fix cycles, and next action

When unsure, tell the user the classification and ask whether they want direct implementation, lightweight mode, or full mode.

## Required run artifacts

Direct mode creates no run directory. For lightweight or full runs, create one run directory:

```text
specs/YYYYMMDD-HHMM-<feature-slug>/
```

Minimum files:

```text
spec.md or spec.html
run.json
notes.md
```

Use `spec.html` when diagrams, screenshots, state machines, tables, or stronger visual hierarchy help the human reviewer understand the contract before approval.

`run.json` should include:

- workflow name/version
- phase
- status
- task fit: `lightweight-ticket` or `broad-ticket`
- spec path
- active role/agent/model
- review gates
- model ledger with source: `explicit`, `agent-default`, `runtime-default`, or `manual`
- implementation model exception, when routing differs from policy and the user approved it
- changed files
- validation evidence
- findings
- known gaps
- next action

## Workflow phases

### 0. Triage

Apply the anti-overuse gate before writing artifacts. Record `taskFit` as one of:

```text
small-direct | lightweight-ticket | broad-ticket
```

For `small-direct`, do not create artifacts unless the user explicitly asks.

### 1. Intake

Interview until the objective, non-goals, constraints, acceptance criteria, risks, and required evidence are clear.

For lightweight runs, ask at most one focused clarification question before drafting; if the task is already clear, move directly to a compact spec/checklist.

### 2. Spec author

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

For lightweight runs, keep the spec compact.

### 3. Spec critic

Review the spec before coding. Attack:

- vague requirements
- contradictions
- missing states
- hidden assumptions
- impossible acceptance criteria
- security/privacy gaps
- under-specified verification

Revise `spec.md` or `spec.html`, or ask the user to decide unresolved questions.

For lightweight runs, a parent self-review is acceptable if there is no serious risk; do not add an independent critic unless a risk signal appears. For full runs, use an independent critic when available.

### 4. Approval gate

Do not implement until the spec is approved, unless the user explicitly requested an uninterrupted end-to-end run.

Approval can be informal (`go`, `approved`, `implement it`) but record it in `run.json` or `notes.md`.

### 5. Implementation

Implement only against the approved spec. If the spec is ambiguous, stop and ask or reopen the spec phase.

Implementation prompt contract:

- implement one approved spec task or tightly grouped task set at a time
- make the smallest correct change
- do not broaden scope or refactor unrelated code
- do not edit run artifacts unless the task explicitly asks for artifact updates
- run relevant tests and fix failures
- report changed files, validation commands, assumptions, and any spec ambiguity

### Broad-ticket planning gate

If `taskFit` is `broad-ticket`, split the approved spec into implementer-sized tickets before implementation.

For broad tickets:

1. use a strong planner/reviewer to split implementation tasks and list high-risk QA checks
2. give the implementer one ticket or tightly grouped ticket set at a time
3. review after the first implementation pass
4. record the gate in `run.json` and the model ledger

Do not add this gate for small direct or ordinary lightweight work unless a risk signal appears.

### Evidence integrity and legacy runs

For older, interrupted, or incomplete runs, preserve truth and keep evidence explicit:

- mark missing routing, missing gate, or skipped validation evidence as a warning or approved exception
- do not fabricate model routing claims after the fact
- do not claim a model-specific result unless that model or agent was actually routed and recorded
- record what future runs should do differently

### 6. Implementation QA

QA against the approved `spec.md` or `spec.html`, not against the implementer's summary. In lightweight mode, this can be a parent self-review recorded in `notes.md`; in full mode, use an explicit critic/QA gate.

Categorize findings:

- blocker
- high
- medium
- low
- spec ambiguity
- implementation drift
- missing validation/test

For broad tickets or sensitive changes, include high-risk QA checks for privacy/redaction, authority or irreversible actions, routing/state precedence, mode behavior, numeric/display edge cases, provider/config validation, and external-service failures.

### 7. Fix/escalation loop

Have the implementer fix normal issues. Escalate if repeated failures or critical ambiguity occur.

Repeated correction is data. Stop blind fix loops when:

- more than two fix cycles are needed
- the same category of issue reappears
- implementation drifts from spec
- QA finds explicit safety/privacy/security violations
- the parent has to revert implementer edits before continuing

### 8. Closeout

For lightweight mode, close out in `notes.md` and `run.json` with concise evidence. Notes-only evidence is acceptable if it names the changed files, validation commands, outcomes, known gaps, and next action.

For full mode, required closeout fields are:

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

Never invent evidence. Missing checks should be known gaps or approved exceptions, not hidden.

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

If using `spec.html`, prefer a local `127.0.0.1` preview URL when the harness supports it so the human approves the rendered spec instead of raw source.

## Delegation

If delegation tools are available, use them for independent critic, implementation, or QA phases. Keep one parent agent in control of the workflow and evidence.

If delegation is unavailable, perform the critic and QA passes yourself, explicitly labeling them as self-review.

Do not claim a model-specific result unless that model was explicitly routed and recorded.
