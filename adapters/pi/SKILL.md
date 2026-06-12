---
name: agentic-delivery-playbook
description: "Coding Agent Preflight for non-trivial coding work in Pi: classify direct/lightweight/full, lock goal/non-goals/risks/evidence, require approval when needed, and record actual routing. Use when ambiguity, risk, scope, or reviewability justifies a delivery contract; skip clear small direct edits unless asked."
---

# Agentic Delivery Playbook for Pi

Use this skill to make coding-agent work smaller, safer, and easier to review.

This is a **value gate**, not ceremony. If applying the playbook will not change the next action, skip it and implement directly.

## The value test

Use the playbook only when it will do at least one of these things:

- narrow a vague request into a concrete goal and non-goals
- stop risky work before implementation for human approval
- define acceptance criteria and validation evidence before coding
- prevent model/agent routing claims that are not actually true
- split broad work into bounded implementation tasks
- create reviewable closeout evidence for a PR or future agent run

If none of those apply, say `Mode: Direct`, make the smallest safe edit, validate, and report evidence.

## What this skill is not

- Not a mandatory spec-first workflow for every task.
- Not a requirement to create run artifacts for small edits.
- Not a hard-coded model benchmark or vendor policy.
- Not permission to launch a subagent swarm.
- Not evidence that a model was used unless Pi actually routed that model and the run recorded it.

## Delivery modes

### Direct

Use Direct mode when all are true:

- the requested change is clear and low ambiguity
- it likely touches one or two files
- validation is obvious and narrow
- no public contract, cross-package, state-machine, provider, auth, privacy, payment, trading, destructive, or irreversible-action risk
- the user did not explicitly ask for a playbook run

Direct rules:

- do not create a run directory
- do not draft a spec unless asked
- do not delegate only because this skill exists
- edit narrowly, validate, and close with changed files plus evidence

Direct response shape:

```text
Mode: Direct
Reason: <why the playbook would not add extra value>
Changed files:
Validation:
Known gaps:
```

### Lightweight

Use Lightweight mode for bounded work where a compact contract prevents drift.

Signals:

- roughly two to five files or one feature area
- acceptance criteria are mostly clear
- risk is low or medium
- a short checklist/spec would help implementation or review

Lightweight rules:

- create minimal artifacts only when the run is active: `spec.md` or `spec.html`, `run.json`, `notes.md`
- keep the spec short: objective, non-goals, acceptance criteria, risks, validation, implementation checklist
- parent self-review is acceptable when risk is low and evidence is objective
- do not add broad-ticket planning, high-risk QA, or independent critics unless a risk signal appears

### Full

Use Full mode when implementation drift would be costly or hard to catch.

Signals:

- meaningful product or architecture ambiguity
- more than five files or multiple packages/services
- public contract, routing, state-machine, provider, auth, privacy, data-flow, money/trading, or irreversible-action behavior
- subtle negative cases or regression risk
- the first implementation prompt would be too broad for one focused worker

Full rules:

- create explicit run artifacts
- critique the spec before implementation
- get approval before coding unless the user requested an end-to-end run
- split broad work into implementer-sized tasks before writing code
- use independent review/QA when available and useful
- use high-risk QA checks for sensitive or cross-system work
- close with files changed, validation evidence, findings, routing ledger, known gaps, and next action

## Preflight contract

For Lightweight and Full modes, write a compact implementation contract before code changes.

Required fields:

- objective
- non-goals
- affected files/systems if known
- acceptance criteria
- risks and safety constraints
- validation commands or manual evidence
- implementation checklist
- open questions, if any

Ask a focused question only when a missing answer blocks safe implementation. Otherwise draft the contract and stop for approval when required.

## Pi routing and subagent policy

Pi may expose subagents, model overrides, and runtime defaults. Use them only when they add value.

### Routing principles

- Route by task shape first, not by price or habit.
- Prefer the current/runtime model for Direct work.
- Use a delegated `worker` only when there is an approved implementation contract, a project convention requiring a worker, or a clear benefit to separating implementation from parent review.
- Use `planner`, `reviewer`, `scout`, or `oracle` only for a concrete role: context gathering, skeptical review, decomposition, or drift/decision audit.
- Keep one writer thread. Parallelize read-only context/review/validation, not normal writes.

### Recording actual routing

Do not claim a specific model handled a role unless Pi actually routed it or the user manually selected it and the run records that fact.

Use these source values:

```text
explicit          run requested the model/agent directly
agent-default     an agent profile supplied the route, exact model may be hidden
runtime-default   Pi/current session chose implicitly
manual            human selected the route outside the run config
exception-approved user approved a route different from the intended policy
unknown-legacy    older/interrupted run cannot prove routing
```

If a project requires a specific implementation model or worker and Pi cannot enforce it, stop and ask the user to either switch manually or approve an exception. If the user approves an exception, record it honestly. If the project does not require a specific model, record `runtime-default` and avoid model-specific claims.

Example `run.json` ledger entry:

```json
{
  "role": "implementation-writer",
  "agent": "worker",
  "intendedModel": "project-configured-worker",
  "actualModel": "agent-default",
  "reasoningIntensity": "unknown",
  "source": "agent-default",
  "notes": "Worker was delegated with the approved contract; Pi did not expose the resolved model label."
}
```

## Implementation handoff contract

When delegating to a worker, pass a narrow task:

```text
Implement only this approved task:
<task>

Contract:
<spec path or relevant excerpt>

Scope:
- Allowed files:
- Non-goals:

Rules:
- Make the smallest correct change.
- Do not broaden scope or refactor unrelated code.
- Do not make unapproved product/architecture decisions.
- Do not edit run artifacts unless explicitly asked.
- Run the specified validation or report why it cannot run.
- Stop and report ambiguity instead of guessing.

Return:
- changed files
- summary
- validation commands and exact outcomes
- assumptions
- unresolved risks
```

For subagent runs that implement a spec, prefer Pi's structured `acceptance` field when available: put definition of done in `criteria`, proof in `evidence`/`verify`, hard constraints in `stopRules`, and cap repair loops with `maxFinalizationTurns`.

## QA and fix loop

QA the diff against the approved contract, not the implementer's summary.

Check:

- every acceptance criterion
- every non-goal
- safety/privacy/security/provider/state constraints
- actual validation output
- scope drift and unrelated refactors
- known gaps and skipped checks

Escalate instead of blindly retrying when:

- the same failure category repeats
- more than two fix cycles are needed
- implementation drifts from the contract
- hidden product/architecture decisions appear
- validation failures reveal unclear requirements
- the parent has to revert worker edits

Escalation result must be one of:

```text
continue with narrower instructions
revise the contract
split the task
switch reviewer/implementer route with approval
stop and ask the human
```

## Closeout

Close every task with evidence.

Direct closeout:

```text
Mode: Direct
Changed files:
Validation:
Known gaps:
Next action:
```

Lightweight/Full closeout:

```text
Mode: Lightweight | Full
Spec:
Approval:
Implementation route:
Review route:
Changed files:
Validation:
Findings/fix cycles:
Known gaps:
Next action:
```

## Compact banner

At meaningful phase changes, keep visibility short:

```text
Workflow: agentic-delivery-playbook
Mode: Direct | Lightweight | Full
Phase: triage | spec | approval | implementation | QA | closeout
Active route: <parent/runtime-default | worker/agent-default | explicit model>
Next gate: <none | approval | validation | review | human decision>
```

## Operating rule

The playbook adds value only when it changes behavior: clearer scope, safer approval, better routing truth, or stronger evidence. If it starts creating artifacts, model ceremony, or delegation without changing behavior, stop and use Direct mode.
