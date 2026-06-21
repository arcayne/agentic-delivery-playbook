---
name: agentic-delivery-playbook
description: Use for non-trivial coding work that benefits from a spec-gated delivery workflow: features, refactors, integrations, workflow changes, bug fixes with ambiguity, safety/privacy/security risk, cross-package changes, public contract changes, or agent drift risk. Do not use for clear small direct edits unless the user asks.
---

# Agentic Delivery Playbook

Classify the task before editing:

- **Direct**: clear, low-risk, one or two files, obvious validation. Do not create run artifacts; edit narrowly, validate, and report evidence.
- **Lightweight**: bounded low/medium-risk work that needs a compact contract. Create minimal run artifacts and stop for approval before implementation unless the user asked for end-to-end work.
- **Full**: broad, ambiguous, sensitive, provider/config/state/API/routing/public-contract, cross-package, or drift-prone work. Use the full spec, critique, approval, implementation, QA, fix/escalation, and closeout workflow.

For lightweight or full mode, read `workflow.md` in this skill folder and follow it as the operating procedure.

Always:

1. Use the least intrusive process that can safely produce evidence.
2. Do not implement non-direct work before spec approval unless the user explicitly asks for an uninterrupted end-to-end run.
3. Implement only against the approved spec.
4. QA the diff against the spec, not against the implementer summary.
5. Close out with changed files, validation commands/results, known gaps, and next action.
6. Do not invent evidence or claim model-specific routing unless it was actually controlled and recorded.
7. For Full mode, do not silently continue on default model routing. If no project route config or explicit user-selected route exists, stop before coding and ask the user to create route overrides, switch/select a model manually, approve a default-route exception, or narrow/split the task.
8. For broad Full-mode work, choose a recursive decomposition strategy before implementation: root planning stays coarse, launched workers get bounded slice contracts, and deeper planners own local subtree maps. Do not use one giant whole-PRD worker except as a recorded exception.

If model routing, subagents, reasoning controls, or review tools are unavailable, record `runtime-default` and avoid model-specific claims. For Full mode, unavailable routing is a blocker until the user approves a default-route exception or the task is narrowed.

Full-mode route rules:

- Missing model config is not approval to target `agent-default` or `runtime-default`.
- Record Full-mode missing config as `pending-user-decision` until resolved.
- If the user approves defaults, record `exception-approved` with reason and evidence.
- If a worker/reviewer times out or returns unusable output, mark that gate failed. Parent takeover is allowed only as an explicit exception; do not mark the timed-out gate as passed.
