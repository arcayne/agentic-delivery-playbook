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
- Parallelize read-only context/review/validation. For code edits, keep one writer per file or tightly coupled cluster; parallel writers require explicit ownership/conflict rules or isolated worktrees.

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
- split broad work into implementer-sized tasks before writing code when that changes safety or speed
- when the spec spans multiple packages/services, explicit rollout slices, or multiple independent feature lanes, choose a recursive decomposition strategy before implementation workers write
- keep the root plan coarse by default: launch tree, dependencies, recursion/concurrency caps, and first safe slice(s), not a full repo-wide file map
- if the user approved the whole outcome or said they want it all, batch independent slices in parallel where safe instead of running one giant worker
- do not hand a whole PRD/spec to one giant implementation worker unless you record an explicit single-worker exception and why narrower recursive slices are unsafe or impossible
- delegate implementation to `worker` by default after approval
- before coding, run the routing enforcement gate; Full mode must not silently continue on `agent-default`/`runtime-default`
- run independent QA with `reviewer` by default after implementation
- use `planner`, `scout`, or `context-builder` only for a concrete need: decomposition, local context, or validation/risk mapping
- use high-risk QA checks for sensitive or cross-system work
- close with files changed, validation evidence, findings, routing ledger, known gaps, and next action

Full mode exception rules:

- If Full mode has no project `.pi/settings.json` model overrides and no explicit user-selected route, stop before coding and ask whether to add project overrides, switch manually, approve `runtime-default`/`agent-default` for this run, or narrow the task.
- If the parent implements directly or skips independent review in Full mode, record it as an explicit exception with reason and evidence. If the user expected different models/agents, ask before continuing under `runtime-default`.
- If a worker/reviewer times out after making partial edits, treat that role gate as failed. Parent recovery is allowed only as an explicit takeover exception; do not mark the worker/reviewer gate passed or partially passed.

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
- routing expectations: intended agent/model/source; for Full mode this must be a real target route, `pending-user-decision`, or an approved exception, not silent `runtime-default`

Ask a focused question only when a missing answer blocks safe implementation. Otherwise draft the contract and stop for approval when required.

## Pi routing and subagent policy

Pi may expose subagents, model overrides, and runtime defaults. Use them when they change safety, separation, speed, or reviewability.

### Routing principles

- Route by task shape first, not by price or habit.
- Prefer the current/runtime model for Direct work.
- For Full mode, use a delegated `worker` for implementation by default after approval.
- For Full mode, use a delegated `reviewer` for independent QA by default after implementation.
- Use `planner`, `scout`, `context-builder`, or `oracle` only for a concrete role: decomposition, context gathering, skeptical review, or drift/decision audit.
- Keep one writer per file or tightly coupled file cluster. Parallel implementation is allowed only when ownership/conflict rules are explicit; otherwise serialize writes.
- Parallelize read-only context/review/validation freely when useful.
- If the user expects different models, verify the actual route or use explicit model overrides. `agent-default` may still resolve to the current/default model.
- For Full mode, absence of project overrides is not evidence that `agent-default` is acceptable. It is a decision point that must be resolved before coding.

### Recursive decomposition strategy gate

Run this gate before implementation when Full-mode work has any broad implementation signal:

- multiple packages, apps, services, providers, or surfaces
- explicit rollout slices in the PRD/spec
- more than one independent acceptance-criteria cluster
- a first worker prompt that would need to include the whole PRD/spec plus several scout reports
- prior worker context overflow, timeout, or drift caused by broad scope

Gate rules:

- Choose a decomposition strategy before implementation workers write. The strategy can be: one narrow serialized slice, a coarse launch tree with parallel siblings, or a planner-owned subtree for a still-broad slice.
- Keep the first/root planner lightweight by default. It should identify coarse slices, dependencies, launch order, recursion cap, and the first safe worker handoffs. It should not inspect every surface deeply or produce a full repo-wide file ownership matrix unless those sibling workers are about to launch.
- The immediate parent of each worker must provide that worker a bounded slice contract: objective, allowed files, forbidden files, non-goals, dependencies, validation, route, and ownership/conflict rule.
- Create file ownership/conflict rules only for siblings being launched now. Shared schemas/contracts, env examples, lockfiles, routers, nav/i18n, central stores, and config get one owner, a serialized lane, or isolated worktrees with a merge barrier when they are in the active launch set.
- Treat foundation/shared contract work as a likely serialized first slice when other slices depend on it, but avoid pre-planning every downstream file before the foundation lands.
- Preserve the fractal shape: each planner that receives a still-broad slice returns the proposed subtree map for that slice. The parent/orchestrator approves the subtree, recursion cap, concurrency cap, and synthesis barrier before any nested fanout starts.
- Default to one decomposition level. Add another planner/subtree level only when a child slice is still too broad for one focused worker and the run records the reason and cap.
- If no safe parallel slices exist yet, record the no-parallel rationale and launch one narrow worker for the next serialized slice, not a whole-PRD worker.
- A single giant implementation worker is an exception. Record why recursive slicing would be less safe or impossible, the context-risk mitigation, and the review/validation compensating controls.

### Parallel slicing and fractal contracts

When Full-mode work is broad and the user has approved the whole outcome, assume parallel slicing is allowed **within the approved scope**. Do not ask for separate permission for every slice unless the launch plan changes scope, risk, budget, or authority.

Use parallel slicing when the work can be separated by file, package, feature lane, fixture set, migration, or acceptance-criteria cluster. Keep sequential work sequential when one slice depends on another.

Rules:

- First choose a launch tree: coarse slice ids, dependencies, recursion/concurrency caps, and which siblings are launching now.
- For siblings launching now, record bounded child-task contracts and ownership/conflict rules. Nav/i18n/router/schema/config/state files get one owner, a serialized lane, or isolated worktrees plus a merge barrier when they are in the active launch set.
- Each planner owns the proposed subtree map for the slice it is asked to decompose; the parent owns approval, launch, global synthesis, and final evidence.
- Each child slice must apply the same playbook rules at its own scale: clear objective, non-goals, route evidence/exception, validation evidence, drift check, and closeout.
- Keep one writer per file or tightly coupled file cluster. If parallel writers could touch the same file, either use isolated worktrees with a merge barrier or serialize those slices.
- Use a barrier after parallel implementation: synthesize changed files, conflicts, validation outcomes, known gaps, and child closeouts before QA.
- Do not let child agents make product/architecture decisions outside their slice. Escalate back to the parent when a child discovers hidden scope or risk.
- Treat child timeouts as failed gates. Partial edits from a timed-out child are untrusted until inspected and completed by an approved route or explicit takeover exception.
- Require both child-local validation and parent global validation; child tests alone are not enough.
- Do not over-parallelize sequential UX flows. Slice by independent surfaces/components/fixtures/acceptance clusters, not by every tiny file.
- The parent remains responsible for global invariants, final validation, independent review, and truthful routing ledger.

Record the plan in `run.json`/`notes.md` before launch. A compact launch note is enough when the user already approved end-to-end delivery:

```text
Parallel slice launch:
Approved scope: <parent spec/goal>
Launch tree: <coarse slice ids, dependencies, first slice(s) launching now>
Subtrees: <only nested planner maps approved for this launch>
Recursion cap: <default one level unless explicitly justified>
Concurrency cap: <n or one per independent package for this launch>
Conflict rule: <ownership/serialize shared files/worktree for this launch>
Barrier: synthesize child closeouts, run parent validation, then QA
Stop rule: child ambiguity, route failure, validation repeat failure, or scope drift
```

### Recommended project model overrides

When a project expects model separation, configure Pi subagent overrides in `.pi/settings.json` rather than relying on implicit defaults. The playbook must treat these overrides as an operational requirement, not a note: if the work is routed through a role with a configured override, the run must either use that route or stop for an explicit exception.

For Full mode, a missing `.pi/settings.json` is not a pass. Before implementation, ask the user whether to create project overrides, manually switch models, approve the current/default route as an exception, or narrow the task. Do not set a Full-mode implementation target to `agent-default` merely because no config exists.

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

This gate exists because simply recording `agent-default` or `runtime-default` misses the point when the project expected a stronger or separate implementation model, and because Full mode should make model/role separation an explicit decision rather than an accidental default.

Run this gate before implementation when any of these are true:

- Full mode is active.
- The user asks for a particular model, stronger model, worker, reviewer, or separation of roles.
- `.pi/settings.json` contains `subagents.agentOverrides` for the intended role.
- The spec/run artifact names `targetModel`, `implementationTargetModel`, or a project-configured worker/reviewer.

Gate steps:

1. Inspect project `.pi/settings.json` for role overrides.
2. If Full mode is active and no project overrides or explicit user-selected route exists, stop before coding and ask the user to choose one:
   - create/update `.pi/settings.json` role overrides,
   - switch manually in the Pi model picker and record the manual route,
   - approve `runtime-default`/`agent-default` as an exception for this run,
   - narrow/split the task so the current route is safe.
3. Decide the target route for each required role: agent, model, reasoning/thinking, and source. In Full mode, the target route must not be plain `agent-default` or `runtime-default` unless the exception was approved.
4. Verify the route is executable in Pi before coding: list available subagents, then call the intended worker/reviewer with an explicit `agent` and, when supported, explicit `model`/`thinking` values.
5. Record both target and observed route in `run.json` before implementation starts.
6. If Pi only reports `agent-default`/`runtime-default`, mark the route as unverified unless the agent invocation itself used the configured role, explicit model override, manual selection, or approved exception.
7. If the target route cannot be enforced or verified, stop and ask the user to choose one of the same options above.

Hard rules:

- Do not proceed with Full-mode implementation when no project override or explicit/manual route exists unless `implementationModelException.approved` is true and the user approved current/default routing.
- Do not set a Full-mode target model to `agent-default` just because no config exists; use `pending-user-decision`, create config, or record an approved exception.
- Do not proceed with a Full-mode implementation that has a required target model but only `runtime-default`/`agent-default` evidence, unless `implementationModelException.approved` is true and the user approved it.

Minimum enforcement record:

```json
{
  "routeEnforcement": {
    "required": true,
    "reason": "full-mode project worker override | full-mode missing route config requires user decision",
    "target": {
      "role": "implementer",
      "agent": "worker",
      "model": "openai-codex/gpt-5.3-codex-spark:xhigh",
      "reasoningIntensity": "extra-high",
      "source": "project-settings"
    },
    "verification": {
      "status": "verified | unverified | unavailable | config-missing | pending-user-decision | exception-approved",
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

If a project requires a specific implementation model or worker and Pi cannot enforce it, stop and ask the user to either switch manually, configure `.pi/settings.json`, approve an exception, or narrow the task to Direct/Lightweight work safe for the current route. If the user approves an exception, record it honestly. If the project does not require a specific model, record `runtime-default` and avoid model-specific claims. In Full mode, do not infer "project does not require a specific model" from missing config; ask or record an approved exception.

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
- Do not clean up, revert, delete, or tidy files outside the allowed scope, including pre-existing dirty files or run artifacts; report them to the parent instead.
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

A timed-out or failed subagent is a failed gate, not a completed review or implementation pass.

If `planner`, `worker`, or `reviewer` times out or returns unusable output:

1. record the failed gate in `run.json`/`notes.md`
2. decide explicitly whether to retry with narrower scope, increase timeout, switch route, split the task, or ask the user
3. do not silently replace independent review with parent self-review in Full mode
4. if parent self-review or parent implementation takeover is used anyway, mark it as an approved exception and explain why it is sufficient
5. if the timed-out worker left partial file edits, inspect them as untrusted partial work; the worker gate remains failed unless the same worker or an approved replacement completes and reports usable evidence

Do not close Full mode as reviewed when the only independent reviewer timed out. Do not close Full mode as worker-implemented when the worker timed out and the parent finished the work; record `workerImplementation: failed` plus an explicit parent-takeover exception.

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
