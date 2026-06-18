---
name: agentic-delivery-playbook
description: "Coding Agent Preflight for non-trivial coding work in Pi: classify direct/lightweight/full, lock goal/non-goals/risks/evidence, require approval when needed, and coordinate Pi goals/subagents with truthful routing. Use when ambiguity, risk, scope, or reviewability justifies a delivery contract; skip clear small direct edits unless asked."
---

# Agentic Delivery Playbook for Pi

Use this skill to make coding-agent work smaller, safer, and easier to review.

This skill is the **policy layer** for Pi delivery. It should coordinate Pi primitives instead of replacing them:

```text
agentic-delivery-playbook = triage, scope, approval, evidence policy
pi-goal-x                 = durable lifecycle for broad/long-running work
pi-subagents              = scoped implementation and review lanes
run artifacts             = evidence trail only when useful
```

This is a **value gate**, not ceremony. If applying the playbook will not change the next action, skip it and implement directly.

## The value test

Use the playbook only when it will do at least one of these things:

- narrow a vague request into a concrete goal and non-goals
- stop risky work before implementation for human approval
- define acceptance criteria and validation evidence before coding
- prevent model/agent routing claims that are not actually true
- split broad work into bounded implementation tasks
- create reviewable closeout evidence for a PR or future agent run
- coordinate a Pi goal, worker, reviewer, or planner without losing parent ownership

If none of those apply, say `Mode: Direct`, make the smallest safe edit, validate, and report evidence.

## What this skill is not

- Not a mandatory spec-first workflow for every task.
- Not a requirement to create run artifacts for small edits.
- Not a hard-coded model benchmark or vendor policy.
- Not permission to launch a subagent swarm.
- Not a replacement for Pi goal lifecycle or subagent orchestration.
- Not evidence that a model was used unless Pi actually routed that model and the run recorded it.

## Native Pi delivery shape

Use the smallest combination of Pi primitives that makes the work safer:

| Mode | Pi goal | Subagents | Artifacts | Default owner |
| --- | --- | --- | --- | --- |
| Direct | No | No | No | parent implements |
| Lightweight | Usually no | Optional focused reviewer or worker | Compact checklist/spec only if useful | parent, or worker when separation helps |
| Full | Recommended, especially if long-running/broad | Yes by default: worker for implementation, reviewer for QA; planner/scout when useful | Yes | parent orchestrates, worker writes |
| User says “goal”, “work until done”, or asks for durable progress | Yes | As needed | Yes | goal lifecycle owns stop/complete |

Important boundaries:

- The parent session owns scope, approval, synthesis, and final evidence.
- A worker may write code, but it does not own product or architecture decisions.
- Reviewers inspect and report; they do not decide merge/complete by themselves.
- Parallelize read-only context/review/validation. Keep normal code edits to one writer thread.

## Goal policy

Use Pi goals when the work needs durable lifecycle, auto-continue, or independent completion auditing.

Create or recommend a goal when:

- the task is Full and likely spans multiple turns or files
- the user says `/goals`, `/sisyphus`, “goal”, “work until done”, or “continue until evidence says done”
- completion needs an objective and verification contract that should survive context churn
- the user wants progress tracked beyond the current turn

Do **not** create/recommend a goal when:

- Direct mode is enough
- the task is a quick bounded edit with obvious validation
- it would only add ceremony

Operational rules:

- If a focused goal already exists, call `get_goal` before changing scope or claiming completion.
- If the user is in `/goals` or `/sisyphus` drafting, use `propose_goal_draft` once the objective is concrete.
- If no goal-drafting flow is active but Full/long-running work would benefit from one, ask the user whether to start a goal and provide the suggested objective/verification contract. Do not pretend a goal was created.
- Before completing a goal, compare every explicit requirement with concrete evidence from the workspace/session.

Suggested goal verification contract for implementation work:

```text
Verification contract:
- Changed files match the approved scope and non-goals.
- Required validation commands were run, with exact outcomes recorded.
- Every acceptance criterion is satisfied or explicitly listed as a known gap.
- Independent review findings are resolved or explicitly accepted/deferred by the user.
```

## Delivery modes

### Direct

Use Direct mode when all are true:

- the requested change is clear and low ambiguity
- it likely touches one or two files
- validation is obvious and narrow
- no public contract, cross-package, state-machine, provider, auth, privacy, payment, trading, destructive, or irreversible-action risk
- the user did not explicitly ask for a playbook run or goal

Direct rules:

- do not create a run directory
- do not draft a spec unless asked
- do not delegate only because this skill exists
- do not create a goal
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
- use a focused `worker` when implementation separation or project model policy matters
- use a focused `reviewer` when the change has meaningful regression or contract risk
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
- recommend or use a Pi goal when work is long-running, broad, or user asked to continue until done
- critique the spec before implementation
- get approval before coding unless the user requested an end-to-end run
- split broad work into implementer-sized tasks before writing code
- delegate implementation to `worker` by default after approval
- before coding, run the routing enforcement gate if the contract names a target worker/model or project `.pi/settings.json` defines overrides
- run independent QA with `reviewer` by default after implementation
- use `planner`, `scout`, or `context-builder` only for a concrete need: decomposition, local context, or validation/risk mapping
- use high-risk QA checks for sensitive or cross-system work
- close with files changed, validation evidence, findings, routing ledger, known gaps, and next action

Full mode exception rule:

If the parent implements directly or skips independent review in Full mode, record it as an explicit exception with reason and evidence. If the user expected different models/agents, ask before continuing under `runtime-default`.

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
- planned Pi primitives: goal, worker, reviewer, planner/scout, artifacts
- routing expectations: intended agent/model/source or `runtime-default`

Ask a focused question only when a missing answer blocks safe implementation. Otherwise draft the contract and stop for approval when required.

## Pi routing and subagent policy

Pi may expose subagents, model overrides, and runtime defaults. Use them when they change safety, separation, speed, or reviewability.

### Routing principles

- Route by task shape first, not by price or habit.
- Prefer the current/runtime model for Direct work.
- For Full mode, use a delegated `worker` for implementation by default after approval.
- For Full mode, use a delegated `reviewer` for independent QA by default after implementation.
- Use `planner`, `scout`, `context-builder`, or `oracle` only for a concrete role: decomposition, context gathering, skeptical review, or drift/decision audit.
- Keep one writer thread. Parallelize read-only context/review/validation, not normal writes.
- If the user expects different models, verify the actual route or use explicit model overrides. `agent-default` may still resolve to the current/default model.

### Recommended project model overrides

When a project expects model separation, configure Pi subagent overrides in `.pi/settings.json` rather than relying on implicit defaults. The playbook must treat these overrides as an operational requirement, not a note: if the work is routed through a role with a configured override, the run must either use that route or stop for an explicit exception.

Example:

```json
{
  "subagents": {
    "agentOverrides": {
      "worker": { "model": "openai-codex/gpt-5.3-codex-spark:xhigh" },
      "reviewer": { "model": "openai-codex/gpt-5.4:xhigh" },
      "planner": { "model": "openai-codex/gpt-5.4:xhigh" }
    }
  }
}
```

Use project-appropriate model names. If these models are unavailable, use equivalent lanes and record the actual route.

### Routing enforcement gate

This gate exists because simply recording `agent-default` or `runtime-default` misses the point when the project expected a stronger or separate implementation model.

Run this gate before implementation when any of these are true:

- Full mode is active.
- The user asks for a particular model, stronger model, worker, reviewer, or separation of roles.
- `.pi/settings.json` contains `subagents.agentOverrides` for the intended role.
- The spec/run artifact names `targetModel`, `implementationTargetModel`, or a project-configured worker/reviewer.

Gate steps:

1. Inspect project `.pi/settings.json` for role overrides.
2. Decide the target route for each required role: agent, model, reasoning/thinking, and source.
3. Verify the route is executable in Pi before coding: list available subagents, then call the intended worker/reviewer with an explicit `agent` and, when supported, explicit `model`/`thinking` values.
4. Record both target and observed route in `run.json` before implementation starts.
5. If Pi only reports `agent-default`/`runtime-default`, mark the route as unverified unless the agent invocation itself used the configured role or explicit model override.
6. If the target route cannot be enforced or verified, stop and ask the user to choose one:
   - switch manually in the Pi model picker,
   - update `.pi/settings.json`,
   - continue with `runtime-default` as an approved exception,
   - split the task so only safe parts use the available route.

Hard rule: do not proceed with a Full-mode implementation that has a required target model but only `runtime-default`/`agent-default` evidence, unless `implementationModelException.approved` is true and the user approved it.

Minimum enforcement record:

```json
{
  "routeEnforcement": {
    "required": true,
    "reason": "full-mode project worker override",
    "target": {
      "role": "implementer",
      "agent": "worker",
      "model": "openai-codex/gpt-5.3-codex-spark:xhigh",
      "reasoningIntensity": "extra-high",
      "source": "project-settings"
    },
    "verification": {
      "status": "verified | unverified | unavailable | exception-approved",
      "evidence": "subagent worker invoked with explicit model override"
    }
  }
}
```

### Recording actual routing

Do not claim a specific model handled a role unless Pi actually routed it or the user manually selected it and the run records that fact.

Use these source values:

```text
explicit           run requested the model/agent directly
agent-default      an agent profile supplied the route; exact model may be hidden
runtime-default    Pi/current session chose implicitly
manual             human selected the route outside the run config
exception-approved user approved a route different from intended policy
unknown-legacy     older/interrupted run cannot prove routing
```

If a project requires a specific implementation model or worker and Pi cannot enforce it, stop and ask the user to either switch manually, configure `.pi/settings.json`, approve an exception, or narrow the task to Direct/Lightweight work safe for the current route. If the user approves an exception, record it honestly. If the project does not require a specific model, record `runtime-default` and avoid model-specific claims.

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

## Gate failure policy

A timed-out or failed subagent is a failed gate, not a completed review.

If `planner`, `worker`, or `reviewer` times out or returns unusable output:

1. record the failed gate in `run.json`/`notes.md`
2. decide explicitly whether to retry with narrower scope, increase timeout, switch route, split the task, or ask the user
3. do not silently replace independent review with parent self-review in Full mode
4. if parent self-review is used anyway, mark it as an approved exception and explain why it is sufficient

Do not close Full mode as reviewed when the only independent reviewer timed out.

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
Goal: <none | focused goal id/path | recommended but not created>
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

For Full mode, the closeout must say whether the route enforcement, worker, and reviewer gates passed, failed, or were explicitly bypassed. If goal lifecycle was used, complete the goal only after evidence satisfies the verification contract.

## Compact banner

At meaningful phase changes, keep visibility short:

```text
Workflow: agentic-delivery-playbook
Mode: Direct | Lightweight | Full
Phase: triage | goal | spec | approval | implementation | QA | closeout
Goal: <none | focused | recommended>
Active route: <parent/runtime-default | worker/agent-default | explicit model>
Next gate: <none | goal confirmation | approval | worker | validation | reviewer | human decision>
```

## Operating rule

The playbook adds value only when it changes behavior: clearer scope, safer approval, better routing truth, stronger evidence, durable goal lifecycle, or meaningful separation between writer and reviewer. If it starts creating artifacts, model ceremony, or delegation without changing behavior, stop and use Direct mode.
