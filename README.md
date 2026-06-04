# Coding Agent Playbook

*Repo/package today: `agentic-delivery-playbook`*

[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e.svg)](LICENSE)
[![Status: v0.2.0 draft](https://img.shields.io/badge/status-v0.2.0_draft-2563eb.svg)](CHANGELOG.md)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-339933.svg)](package.json)

**Keep coding agents scoped, testable, and honest.**

> Before a coding agent edits your repo, give it a small delivery contract.

<p align="center">
  <img src="assets/agent-preflight-hero.png" alt="Agent preflight checklist: mode, goal, non-goals, risks, approval, and evidence before the agent touches the repo" width="920">
</p>

A practical safety harness for agent coding: classify the task, lock the scope, stop risky work before implementation, and close out with evidence.

**Start here:** [Getting started](docs/getting-started.md) · [Templates](templates/) · [Example run](examples/lightweight-ticket/) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

## Try it in 60 seconds

Paste this into Claude Code, Codex, ChatGPT, Claude, Cursor, Pi, or another coding assistant:

```text
Use the Coding Agent Playbook.

First classify this task:
- direct: clear, low-risk, narrow edit; no spec or run directory
- lightweight: bounded work that needs a compact checklist/spec
- full: broad, ambiguous, security/privacy/provider/state/API, or drift-prone work

Use the smallest safe process.

If direct:
- make the smallest correct change
- run the obvious validation
- report changed files and evidence

If lightweight or full:
- draft a compact spec before coding
- include objective, non-goals, acceptance criteria, risks, and verification
- stop for my approval before implementation unless I say continue end-to-end
- after implementation, QA the diff against the spec, not your own summary
- do not claim tests passed unless you have actual output

Task:
<describe the task>
```

That is the fastest way to get value from this repo. Everything else here helps you make that behavior repeatable.

## Why this exists

Coding agents are useful, but they drift:

- vague prompts turn into broad diffs
- non-goals get silently included
- validation gets summarized instead of proven
- retries pile up because the target keeps moving
- review gets harder because the agent narrates confidence instead of showing evidence

This playbook gives the agent a small delivery contract before it edits.

## What this gives you

| Agent problem | Playbook guardrail |
| --- | --- |
| Agent changes too much | Pick direct/lightweight/full before editing |
| Agent solves the wrong problem | Write goal and non-goals before implementation |
| Agent claims tests passed | Require commands, output, and known gaps |
| Agent keeps retrying blindly | Use fix/escalation rules |
| PR is hard to review | QA against acceptance criteria, not summaries |
| Risky task starts coding too early | Add an approval gate |
| Expensive model is used for everything | Route stronger reasoning to spec/QA work |

## Agent Preflight

Before implementation, define:

- **Mode** — direct, lightweight, or full
- **Goal** — the thing that should become true
- **Non-goals** — what must not be touched
- **Risks** — security, money, auth, data loss, provider behavior, hidden coupling
- **Approval** — whether the agent must stop before implementation
- **Evidence** — what proof is required at closeout

That checklist is the core artifact. The playbook exists to make it easy to use consistently.

## Demo: turn a vague request into a delivery contract

Bad:

```text
Fix the webhook bug.
```

Better:

```text
Use the Coding Agent Playbook.

Classify the task first.

Goal:
Fix duplicate webhook processing.

Non-goals:
- Do not change billing plans.
- Do not refactor unrelated handlers.
- Do not change DB schema unless required and explained.

Risks:
payment state, provider retries, idempotency

Approval:
Stop before implementation.

Evidence:
Show changed files, tests run, output, and known gaps.
```

That is the move: make the agent operate against a concrete contract, not an abstract intention.

## The three modes

Choose process weight before creating artifacts.

| Mode | Use when | What happens |
| --- | --- | --- |
| **Direct** | Small, obvious, low-risk change | Edit, validate, report evidence |
| **Lightweight** | Bounded feature or fix that needs a checklist | Compact spec, approval, implementation, QA |
| **Full** | Risky, ambiguous, cross-system, security/privacy/API/state/provider work | Critique, approval gate, QA evidence, escalation rules |
| **Full + bounded workflow** | Broad audit, migration, or adversarial review | Parallel or dynamic work only with scope, caps, stop rules, and synthesis |

Do not create heavy artifacts for obvious one-file fixes. Do not let risky work skip approval and evidence.

## Use it with your tool

Start with [`docs/getting-started.md`](docs/getting-started.md). It includes:

- universal prompt-only usage for any assistant
- Claude and ChatGPT prompts for spec review and QA
- Claude Code project-memory and slash-command setup
- Codex `AGENTS.md` setup
- adapter notes for Pi

Repo adapters:

- [`adapters/claude/`](adapters/claude/)
- [`adapters/chatgpt/`](adapters/chatgpt/)
- [`adapters/codex/`](adapters/codex/)
- [`adapters/pi/`](adapters/pi/)

If you want model-routing guidance or bounded fanout patterns, see [`docs/model-routing.md`](docs/model-routing.md) and [`docs/dynamic-workflows.md`](docs/dynamic-workflows.md).

## When to add templates and run artifacts

If the task is **direct**, skip this section.

If the task is **lightweight** or **full**:

1. create a run directory like `specs/YYYYMMDD-HHMM-feature-slug/`
2. copy the needed files from [`templates/`](templates/)
3. write the spec before coding
4. get approval when the task is risky enough to require it
5. implement against the approved spec
6. QA the diff against the spec
7. close out with evidence, known gaps, and next action

See [`playbook.md`](playbook.md) for the full workflow and [`examples/lightweight-ticket/`](examples/lightweight-ticket/) for a completed small-run example.

## What is in this repo

- [`playbook.md`](playbook.md) — full workflow
- [`docs/getting-started.md`](docs/getting-started.md) — fastest setup path
- [`docs/gates.md`](docs/gates.md) — approval and escalation rules
- [`docs/failure-modes.md`](docs/failure-modes.md) — common agent failure patterns
- [`docs/high-risk-qa.md`](docs/high-risk-qa.md) — QA for sensitive changes
- [`docs/visual-specs.md`](docs/visual-specs.md) — when visuals help spec review
- [`templates/`](templates/) — reusable spec, run, notes, and QA templates
- [`examples/`](examples/) — copyable examples of finished artifacts
- [`docs/adapters.md`](docs/adapters.md) — tool-specific integration notes

## Install adapters

### Claude skill adapter

```bash
# User skill, available across projects
npx agentic-delivery-playbook install claude

# Or project skill, available in one repo
npx agentic-delivery-playbook install claude --project
```

Until the package is published to npm, install from GitHub:

```bash
npx github:arcayne/agentic-delivery-playbook install claude
```

### ChatGPT adapter

Use [`adapters/chatgpt/instructions.md`](adapters/chatgpt/instructions.md) as project instructions, custom GPT instructions, or a pasted session instruction.

### Codex adapter

Copy [`adapters/codex/AGENTS.md`](adapters/codex/AGENTS.md) into the target repository root, or merge it into an existing `AGENTS.md`.

### Pi adapter

Project-local Pi install example:

```bash
mkdir -p .pi/skills/agentic-delivery-playbook
cp /path/to/agentic-delivery-playbook/adapters/pi/SKILL.md \
  .pi/skills/agentic-delivery-playbook/SKILL.md
```

## What this is not

This is not a new agent runtime, orchestrator, queue, dashboard, or multi-agent platform.

It is a lightweight delivery convention you can use as:

- one pasted prompt
- a repo-level instructions file
- a Claude skill
- a Codex `AGENTS.md`
- a review checklist for ChatGPT, Claude, or Pi

## Status

`v0.2.0` draft. Current focus: keep the playbook concrete, lightweight, and easy to adopt before adding more process.

## License

MIT. See [`LICENSE`](LICENSE).
