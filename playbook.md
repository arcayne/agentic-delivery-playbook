# Agentic Delivery Playbook

This playbook is a spec-gated workflow for using coding agents on software delivery tasks.

It is designed for situations where a direct edit is too risky or too ambiguous, but a heavyweight process would slow the team down. It gives agents a clear contract, gives humans approval points, and preserves evidence for review.

## The delivery loop

```text
0. triage
1. intake
2. spec authoring
3. spec critique
4. approval gate
5. implementation
6. implementation QA
7. fix or escalate
8. closeout
```

## 0. Triage: process weight first

Classify the task before creating artifacts, choosing models, or delegating reviewers. Use the least intrusive mode that can safely produce evidence.

### Direct mode: small direct change

Implement directly when the change is clear, low-risk, narrow, and easy to validate.

Signals:

- one or two files
- no public contract change
- no sensitive data or external-provider behavior
- no security, auth, payment, financial, destructive, or irreversible action
- obvious validation command

Direct mode contract:

- no run directory
- no spec artifact unless the human asks for one
- edit, run the obvious validation, and report changed files plus evidence

### Lightweight mode: compact ticket

Use a compact spec/checklist when the change is bounded but still benefits from a written contract.

Signals:

- two to five files
- one package or one feature area
- clear acceptance criteria after at most one or two questions
- low or medium risk

Lightweight mode contract:

- minimal run directory with `spec.md` or `spec.html`, `run.json`, and `notes.md`
- compact spec/checklist instead of a full PRD
- notes-only evidence is acceptable when commands and outcomes are explicit
- parent self-review is acceptable when no serious risk appears
- no independent critic, broad-ticket planning gate, or high-risk QA checklist unless risk appears

### Full mode: broad or risky ticket

Use the full workflow when implementation drift would be costly.

Signals:

- more than five files
- cross-package or cross-service changes
- public contract, routing, state-machine, provider, auth, privacy, or data-flow changes
- subtle negative cases
- multiple operating modes
- vague initial implementation prompt

Full mode contract:

- broad-ticket planning before implementation when the spec is too large for one focused implementer pass
- recursive decomposition strategy before workers write when the spec spans multiple packages/services, explicit rollout slices, or independent feature lanes
- root planning stays coarse by default: launch tree, dependencies, caps, and first safe slice(s), not a full repo-wide file map
- no whole-PRD giant implementation worker unless an explicit exception records why recursive slicing is less safe or impossible and how context/drift risk will be mitigated
- explicit model/agent and reasoning ledger when routing controls are available
- critic/QA gate, preferably independent when available
- high-risk QA for sensitive, authority, provider, state, privacy, or cross-system changes
- dynamic workflow/fanout only after a plain-English launch note is approved
- workflow findings accepted only after synthesis plus independent verification, or clearly marked speculative
- required closeout fields for files changed, validation, findings, model ledger, known gaps, fix cycles, and next action

### Harness ladder: choose the smallest runtime

Use the smallest harness that safely fits the work:

```text
direct prompt -> skill -> subagent -> chain / agent team -> goal loop -> dynamic workflow
```

A goal loop is depth: it iterates against a completion condition. A dynamic workflow is width: many agents explore, verify, compare, or classify in parallel, then a synthesizer folds the work into one answer.

Dynamic workflows are a full-mode escalation for broad audits, migrations, root-cause hypothesis panels, evals, rule-adherence checks, or critical plans that need independent attempts and adversarial review. They are not for small edits, unclear scope, low-value knowledge work, or tightly sequential tasks.

Before launching a dynamic workflow or large parallel fanout, write a short launch note with scope, a concrete cap, a recursion/depth cap when nested planners are used, a stop rule, and the synthesis/verification plan. Do not create blank budget fields that people will not fill. Each planner may propose the subtree map for the slice it decomposes; the parent/orchestrator approves launch, recursion depth, and final synthesis. File ownership/conflict rules are required for siblings being launched now, not for every possible downstream file before the first slice starts.

See [`docs/dynamic-workflows.md`](docs/dynamic-workflows.md).

## 1. Intake

Clarify enough to write an implementation-ready spec.

Capture:

- objective
- non-goals
- user-visible behavior
- affected systems
- constraints
- acceptance criteria
- verification evidence
- safety, security, privacy, and rollback concerns
- open questions

If a question blocks safe implementation, ask it before writing code.

## 2. Spec authoring

Write the spec as a contract for implementation and QA.

A good spec is:

- concrete enough for an implementer to act on
- strict enough for QA to reject drift
- small enough to finish in one run or split into tickets
- explicit about non-goals
- explicit about validation evidence

Use [`templates/spec.template.md`](templates/spec.template.md) for simple runs.

Use [`templates/spec.template.html`](templates/spec.template.html) when visual hierarchy, diagrams, screenshots, state machines, or tables make the spec easier for the human approver to understand. Visual specs are not decoration; they are a way to prevent blindly accepting an agent plan.

See [`docs/visual-specs.md`](docs/visual-specs.md).

## 3. Spec critique

Review the spec before coding. Attack:

- vague requirements
- contradictions
- hidden assumptions
- missing states
- unsafe defaults
- privacy or security gaps
- impossible acceptance criteria
- missing tests
- implementation instructions that are too broad

Revise the spec until it is implementable or ask the human to decide.

For lightweight mode, a parent self-review is enough when no serious risk appears. For full mode, use a skeptical critic or independent reviewer when available.

## 4. Approval gate

Do not implement until the spec is approved, unless the human explicitly asked for an uninterrupted end-to-end run.

Approval can be informal, but it should be recorded in `run.json` or `notes.md`.

Examples:

- `approved`
- `go`
- `implement this spec`
- `continue end-to-end`

## 5. Implementation

Give the implementer the approved spec and a focused task.

Implementation rules:

- implement the smallest correct change
- do not broaden scope
- do not refactor unrelated code
- do not clean up, revert, delete, or tidy files outside the approved scope; report unrelated dirty files or artifacts instead
- do not make product decisions hidden inside code
- preserve existing behavior unless the spec changes it
- run relevant validation
- report changed files, validation, assumptions, and ambiguities

If your harness supports model or agent routing, route implementation explicitly and record it in the model ledger. If it does not, record `runtime-default` and avoid model-specific claims.

## 6. Implementation QA

QA against the approved spec, not against the implementer's summary.

Classify findings:

- blocker
- high
- medium
- low
- spec ambiguity
- implementation drift
- missing validation

A reviewer should be able to answer:

- Did the implementation satisfy every acceptance criterion?
- Did it avoid every non-goal?
- Did it preserve required safety/privacy/security constraints?
- Were tests or validation actually run?
- Are known gaps explicit?

For lightweight mode, QA can be a parent self-review recorded in `notes.md` when acceptance criteria are clear and risk is low or medium.

Use [`templates/qa-checklist.template.md`](templates/qa-checklist.template.md) when a separate QA artifact helps.

For broad tickets or sensitive changes, also use [`docs/high-risk-qa.md`](docs/high-risk-qa.md).

For dynamic workflows, QA must review the synthesis, rejected findings, verifier/refuter results, and any speculative findings. A workflow finding is not final just because a worker reported it.

## 7. Fix or escalate

A normal fix loop is fine. Repeated correction is a signal.

Escalate when:

- the same issue reappears
- more than two fix cycles are needed
- the implementer edits outside scope
- validation failures reveal spec ambiguity
- the change is safety/security/architecture critical
- the reviewer finds unapproved decisions
- the parent has to revert implementer edits before continuing

Escalation options:

- split the ticket
- tighten the spec
- use a stronger planner/reviewer
- switch implementer
- stop and ask the human

## 8. Closeout

Close the run with evidence.

For lightweight mode, notes-only evidence is acceptable if it clearly records changed files, validation commands, outcomes, known gaps, and next action.

For full mode, record all required closeout fields:

- final status
- changed files
- validation commands and outputs
- acceptance criteria result
- review findings
- fix cycles
- model/agent ledger, including reasoning intensity when available
- known gaps
- next recommended action

Use [`templates/notes.template.md`](templates/notes.template.md) and update `run.json`.

Before closing a serious run, use [`templates/closeout-governance.template.md`](templates/closeout-governance.template.md) to record project-specific checks, warnings, skipped validation, approved exceptions, and observability/ROI data when available.

Telemetry and ROI checks must be portable. Prefer environment/config inputs such as `PI_OBS_DB`; do not commit personal absolute paths into reusable scripts or templates.

## Evidence integrity and legacy runs

Do not invent evidence after the fact.

If a run predates the current workflow, used runtime default routing, skipped a gate, or cannot prove which model or agent did the work, mark it explicitly as a legacy gap or approved exception. Warnings are better than fake precision.

Record:

- what evidence is missing
- why it is missing
- whether the human accepted the gap
- what future runs should do differently

## Implementation model evaluation

When the implementation used an explicitly chosen model or agent, evaluate it after QA.

This is not a benchmark. It is an operational check:

- Did the implementer satisfy the approved spec?
- Did it keep scope tight?
- Did it avoid unapproved decisions?
- How many fix cycles were needed?
- Did the chosen model or agent seem appropriate for this task size?
- Was the process weight appropriate for the task, based on cost/tokens/turns when available?

Record the result in `run.json` and `notes.md` so future model routing decisions are based on evidence, not vibes.

## Artifact contract

Direct mode should not create artifacts unless the human asks.

Every non-direct run should produce:

```text
specs/YYYYMMDD-HHMM-feature-slug/
  spec.md or spec.html
  run.json
  notes.md
```

Optional artifacts:

```text
  qa.md
  closeout-governance.md
  validation.log
  workflow-status.md
  workflow-results.json
  screenshots/
  diffs/
```

## Design stance

This playbook is intentionally not a benchmark and not a model endorsement. It is an operational pattern: give agents clear contracts, route work deliberately when possible, verify against evidence, and stop when the loop shows drift.
