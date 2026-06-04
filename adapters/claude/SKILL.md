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

If model routing, subagents, reasoning controls, or review tools are unavailable, record `runtime-default` and continue without model-specific claims.
