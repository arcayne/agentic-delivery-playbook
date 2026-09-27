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

A Pi package install makes this skill available; it does not set model, effort, worker, or reviewer defaults. This repository's optional project profile in `.pi/settings.json` configures fresh trusted project sessions to start the parent/orchestrator at `openai-codex/gpt-6-sol` / medium, the implementation worker at `openai-codex/gpt-6-luna` / high, and the reviewer at `openai-codex/gpt-6-sol` / medium. The matching template is optional and is not applied by package installation. Project settings affect startup only: trust is required, existing sessions do not change, and CLI/SDK overrides or manual selection may override them.

For this profile, the Sol Medium parent owns planning, contract and task launch, sequencing, validation, synthesis, and continuation. The explicitly routed Luna High worker is the sole writer for every implementation edit, including small edits. A fresh-context Sol Medium reviewer is read-only and checks the actual diff and evidence; reviewer identity alone does not establish independence. Keep three facts distinct: **requested** route is the task instruction, **configured** route is settings intent, and **observed** route is the effective runtime route. Verify the effective Pi version, visible tools, model/effort, and role route independently; settings establish configuration capability, not route attestation.

Use only capabilities exposed in the current session. If a required route is unavailable or ineffective, stop that affected lane and ask for approval; do not silently substitute or claim delegation or independent review. Record unexposed route details as `unknown`/`runtime-default`. A missing project settings file alone is not a package failure, but does not meet this profile's requested startup configuration.

Pi goals are a durability wrapper, not a process mode. Create one only when the user explicitly asks for a persistent goal. Package installation does not apply the optional [`../../templates/pi-settings.template.json`](../../templates/pi-settings.template.json); review settings changes deliberately.

## Workspace safety

Inspect `git status` before editing. Do not clean, reset, overwrite, or include pre-existing user changes. When unrelated dirty work makes the target unclear, use an isolated worktree or ask before proceeding.
