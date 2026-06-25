# Pi-native delivery workflow

Agentic Delivery Playbook is Pi-first. The skill should coordinate Pi primitives rather than reinventing them.

```text
agentic-delivery-playbook = triage, scope, approval, evidence policy
pi-goal-x                 = durable lifecycle for broad/long-running work
pi-subagents              = scoped implementation and review lanes
run artifacts             = evidence trail only when useful
```

## Mode matrix

| Mode | Pi goal | Subagents | Artifacts | Default owner |
| --- | --- | --- | --- | --- |
| Direct | No | No | No | parent implements |
| Lightweight | Usually no | Optional focused reviewer or worker | Compact checklist/spec only if useful | parent, or worker when separation helps |
| Full | Recommended, especially if long-running/broad | Yes by default: worker for implementation, reviewer for QA; planner/scout when useful | Yes | parent orchestrates, worker writes |
| User says “goal”, “work until done”, or asks for durable progress | Yes | As needed | Yes | goal lifecycle owns stop/complete |

## Recommended Full-mode shape

```text
1. Classify as Full and explain why.
2. If broad/long-running, create or recommend a Pi goal with a verification contract.
3. Draft the compact implementation contract.
4. Get approval unless the user explicitly requested end-to-end execution.
5. If broad, choose a recursive decomposition strategy: coarse launch tree, first slice(s), recursion/concurrency caps, and barrier plan.
6. Delegate implementation to one focused worker or several non-overlapping slice workers with bounded contracts and ownership/conflict rules for the active launch.
7. Run validation.
8. Run independent reviewer QA.
9. Fix or escalate findings.
10. Close with evidence; complete the goal only after the verification contract is satisfied.
```

The parent session owns scope, approval, launch decisions, synthesis, and final evidence. Subagents are lanes, not decision-makers. Root planning stays coarse by default; each planner may propose the subtree map for the slice it decomposes, but the parent/orchestrator approves recursion depth, concurrency, and barriers before nested fanout starts.

## Goal usage

Use a Pi goal when work needs durable progress, auto-continue, or independent completion auditing.

Good fits:

- broad implementation that may span multiple turns
- user says “goal”, “work until done”, or “continue until evidence says done”
- high-risk work where completion should survive an auditor
- work that should remain visible in `.pi/goals/`

Poor fits:

- direct edits
- quick bounded fixes
- tasks where the goal would only repeat the current prompt

When no goal-drafting flow is active, the agent cannot silently create a goal. It should recommend the goal objective and ask the user to start/confirm it, or proceed without a goal only if the user chooses that.

## Subagent usage

Use subagents when they create real separation of duties.

Default Full-mode lanes:

- `worker` — writer for its assigned file/cluster slice, receives the approved contract and acceptance criteria
- `reviewer` — independent QA against the contract and actual diff
- `planner` — when the spec or a child slice is too broad for one worker pass; returns a coarse launch tree or local task/subagent subtree map, not unapproved launches
- `scout` or `context-builder` — only when local context is unclear
- `oracle` — only for drift, repeated failure, or architectural/product judgment

Do not launch subagents merely to make the workflow look agentic. Do not let multiple writers touch the same file or tightly coupled cluster unless they are isolated in separate worktrees with an explicit merge barrier.

## Model routing

`agent-default` does not guarantee a different model from the parent session. If a project expects different model lanes, configure subagent overrides in `.pi/settings.json`.

See [`../templates/pi-settings.template.json`](../templates/pi-settings.template.json).

If a required route is unavailable, stop and ask whether to:

1. configure `.pi/settings.json`,
2. manually switch models,
3. use an explicit one-off model override, or
4. approve a recorded exception.

## Gate failure policy

A timed-out reviewer is not a review. A timed-out worker is not implementation evidence.

When a subagent gate fails:

1. record the failed gate,
2. retry with narrower scope or longer timeout when useful,
3. split the task if the prompt was too broad,
4. switch route with approval when needed,
5. ask the user before replacing an independent Full-mode gate with parent self-review.

Closeout must distinguish passed, failed, skipped, and approved-exception gates.

## PRD visibility

For broad PRD/spec implementation, keep two small progress artifacts current:

- **Status dashboard:** current phase/slice, accepted slices, blocked slices, in-flight lanes, known validation exceptions, and next gate.
- **PRD implementation ledger:** PRD area, requirement, slice, status, evidence, remaining gap, and owner/next gate.

Update both after each worker, review, parent fix, and acceptance decision. The parent should be able to answer "where are we in the PRD?" from the dashboard and ledger without rereading every subagent report.
