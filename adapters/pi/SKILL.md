---
name: agentic-delivery-playbook
description: "Apply the maintained Agentic Delivery Playbook in Pi: classify work as Direct or Controlled, choose the minimum safe route, and close from evidence. Use for coding work when explicit scope, risk, route, or validation guidance will improve the next action."
---

# Agentic Delivery Playbook for Pi

## Canonical policy

- Read [`../../playbook.md`](../../playbook.md) for the Direct and Controlled process rules.
- Read [`../../profiles/gpt-6.md`](../../profiles/gpt-6.md) for task-fit routes and client limits.
- Use [`../../templates/contract.md`](../../templates/contract.md) and [`../../templates/run.json`](../../templates/run.json) when the task warrants durable evidence; do not add ceremony to clear, low-risk work.
- Keep Pi as an adapter to the same product. Do not introduce a separate Pi-only process mode such as Lightweight or Full.

## Pi-specific route verification

A Pi package install makes this skill available; it does not set model, effort, worker, or reviewer defaults. Verify the current Pi version, visible tools, effective model/effort, and any required agent route independently. User-global settings may supply defaults; a missing project `.pi/settings.json` alone is not a package or route failure.

Use only capabilities exposed in the current session. If a required worker/reviewer or model route is unavailable, record it as `unknown`/`runtime-default`; do not claim delegation or independent review. Choose another route only when it still meets the task's safety floor, otherwise narrow the task or ask the user to approve an exception.

Pi goals are a durability wrapper, not a process mode. Create one only when the user explicitly asks for a persistent goal. Package installation does not apply the optional [`../../templates/pi-settings.template.json`](../../templates/pi-settings.template.json); review settings changes deliberately.

## Workspace safety

Inspect `git status` before editing. Do not clean, reset, overwrite, or include pre-existing user changes. When unrelated dirty work makes the target unclear, use an isolated worktree or ask before proceeding.
