# Agentic Delivery Playbook

A spec first workflow for coding agents: choose the right model per task, use strong reasoning early, split work into smaller tickets, reduce drift, retries, and spend.

<p align="center">
  <img src="assets/agentic-delivery-loop.svg" alt="Agentic Delivery Playbook workflow diagram" width="920">
</p>

The idea is simple: decide which model or agent should handle each phase. Spend stronger reasoning early on the spec, critique, edge cases, and acceptance criteria; then give implementation agents smaller, clearer tasks that are cheaper to run, easier to review, and less likely to drift.

Coding agents are powerful, but they are easiest to trust when intent, constraints, and verification are explicit before they edit code. This playbook turns agentic coding into an auditable delivery loop:

```text
intake -> spec -> critique -> approval -> implementation -> QA -> fix/escalate -> closeout
```

The goal is not to add ceremony to every change. The goal is to use the right amount of structure when agent drift, ambiguous requirements, security/privacy risk, or cross-system changes would be expensive.

## What this is

This repository is a portable engineering pattern for operating coding agents on real software work. It defines:

- role separation: spec author, critic, implementer, QA reviewer, human approver
- approval gates before implementation
- implementation against an accepted contract
- QA against evidence, not summaries
- explicit model or agent choice per task: spec, critique, implementation, QA, escalation
- run artifacts that record decisions, validation, model routing, and known gaps
- escalation rules when an agent drifts or repeated fix cycles appear

## Why not just prompt better?

Better prompts help. Delivery systems help more.

A prompt can ask an agent to be careful. A delivery workflow makes care inspectable: what was approved, what changed, what evidence exists, where the agent drifted, and when the loop should stop or escalate.

This playbook is for the gap between casual AI assisted editing and production like engineering discipline.

## When to use it

Use the playbook for work that is non-trivial, ambiguous, risky, cross-package, customer-facing, or likely to drift during implementation.

Skip it for tiny direct edits when all of these are true:

- the requested change is clear
- it likely touches one or two files
- validation is obvious
- there is no security, privacy, auth, data-loss, financial, or external-provider risk
- the user did not explicitly ask for a spec first workflow

## Model choice per task

This playbook does not assume one model should do everything.

Use stronger reasoning for high ambiguity work: intake, spec writing, critique, architecture tradeoffs, safety review, and escalation. Use faster or cheaper implementation agents after the spec is clear and the task has been split small enough. Use skeptical reviewers for QA.

Every run should record the intended and actual model or agent for each role. That makes cost, quality, and drift visible instead of hidden inside a chat transcript.

See [`docs/model-routing.md`](docs/model-routing.md) for the routing ledger and role guidance.

## Quick start

1. Create a run directory:

   ```text
   specs/YYYYMMDD-HHMM-feature-slug/
   ```

2. Copy the templates:

   ```text
   templates/spec.template.md  -> specs/.../spec.md
   templates/run.template.json -> specs/.../run.json
   templates/notes.template.md -> specs/.../notes.md
   ```

3. Fill the spec before implementation.
4. Critique and revise the spec.
5. Get human approval.
6. Choose the implementation model or agent for the focused task.
7. Give the implementer the approved spec and nothing vague.
8. QA the diff against the spec.
9. Close out with evidence, model routing, and known gaps.

See [`playbook.md`](playbook.md) for the full workflow.

## Repository layout

```text
README.md
playbook.md
SECURITY.md
assets/
  agentic-delivery-loop.svg
docs/
  philosophy.md
  gates.md
  model-routing.md
  failure-modes.md
  adapters.md
  publishing.md
templates/
  spec.template.md
  run.template.json
  notes.template.md
  qa-checklist.template.md
adapters/
  pi/
    SKILL.md
examples/
  lightweight-ticket/
    spec.md
    run.json
    notes.md
.github/
  ISSUE_TEMPLATE/
  pull_request_template.md
```

## Install as a Pi skill

If you use the Pi coding agent, install the adapter from:

```text
adapters/pi/SKILL.md
```

Project-local install example:

```bash
mkdir -p .pi/skills/agentic-delivery-playbook
cp /path/to/agentic-delivery-playbook/adapters/pi/SKILL.md \
  .pi/skills/agentic-delivery-playbook/SKILL.md
```

The adapter is intentionally generic. Configure your preferred models or agents in your own harness instead of relying on hard-coded model names.

## Core principle

Use strong reasoning for shared understanding, edge cases, acceptance criteria, and QA contracts. Use implementation agents only after the contract is clear. Evaluate the result against evidence.

## Publishing checklist

Recommended GitHub description:

```text
Spec first workflow for coding agents: choose the right model per task, use strong reasoning early, split work into smaller tickets, reduce drift, retries, and spend.
```

Recommended topics:

```text
ai-agents, coding-agents, agentic-workflow, spec-first,
software-engineering, ai-assisted-development, human-in-the-loop
```

See [`docs/publishing.md`](docs/publishing.md) for first-publish and release commands.

## Status

`v0.1.0` draft. The pattern is intentionally small and practical.

## License

MIT. See [`LICENSE`](LICENSE).
