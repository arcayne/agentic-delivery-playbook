# Agentic Delivery Playbook

Agentic Delivery Playbook is a small, evidence-first delivery kernel for Codex and ChatGPT Work: classify the work by consequence, choose the minimum safe GPT-6 route, and close from recorded evidence.

## Choose the delivery mode

Direct and Controlled are process modes, not model choices. Use the decision conditions from [playbook.md](playbook.md) exactly:

| Mode | Decision condition | Delivery shape |
| --- | --- | --- |
| Direct | Use only when all are true: intent and acceptance are clear; effects are low-consequence or readily reversible; no material security, privacy, auth, payment, financial, destructive, public-contract, or external-authority concern exists; one owner can make the change without unsafe coordination; and completion is objectively verifiable. | State the change, make the smallest correct edit, run deterministic validation, and report evidence. |
| Controlled | Use when any Direct condition is false, or when broad delegated work needs ownership and synthesis controls. | State a compact contract, preserve acceptance evidence, and review the contract, actual diff, and evidence in fresh context. |

## Route separately from the mode

GPT-6 Luna, Sol, and Astra are selected for task shape, independently of the delivery mode.

| Route | Use for | Topology |
| --- | --- | --- |
| Luna | Focused, repeatable work; start with High reasoning. | Single agent; increase effort only when needed and supported. |
| Sol | Complex coding, architecture-sensitive judgment, risk, escalation, and fresh-context review; start with Medium, use High selectively. | Single agent by default. |
| Astra | Broad code, research, or computer-use work; start with Light/low effort. | Single agent or bounded independent lanes. |
| Ultra | Broad work with genuinely independent lanes. | Maximum reasoning with one synthesis barrier; it is not another process mode. |

## Set up Codex in five minutes

1. Read [adapters/codex/AGENTS.md](adapters/codex/AGENTS.md) and merge it into the target repository's existing AGENTS.md.
2. Optionally review [profiles/codex/](profiles/codex/), then copy the selected project settings into the target repository's .codex directory without overwriting local choices.
3. Start Codex in that repository and give it the task.

## Set up ChatGPT Work

1. Paste [adapters/chatgpt/instructions.md](adapters/chatgpt/instructions.md) into ChatGPT Work project instructions.
2. Optionally attach [profiles/gpt-6.md](profiles/gpt-6.md), [templates/contract.md](templates/contract.md), and [templates/run.json](templates/run.json) for controlled work and handoffs.
3. Provide only the sources and authority needed for the current task.

## Print maintained artifacts

    npx agentic-delivery-playbook show codex
    npx agentic-delivery-playbook show chatgpt
    npx agentic-delivery-playbook show profile

The CLI only prints maintained artifacts; it does not install or overwrite local or global configuration.

## Read the kernel

- [Delivery modes](playbook.md)
- [GPT-6 routing profile](profiles/gpt-6.md)
- [Compact contract template](templates/contract.md)
- [Durable run-record template](templates/run.json)
- [Evaluation protocol](docs/evaluation.md)
- [End-to-end walkthrough](docs/getting-started.md)
- [Maintained adapters](docs/adapters.md)
- [Active controlled example](examples/README.md)

## Status and migration

Only the GPT-6 profile is maintained. Prior material is unsupported under [legacy/](legacy/README.md) and excluded from the npm package.

For 0.2 users, the mutating install pi and install claude commands were removed. Existing installations are not updated automatically; review and merge the maintained Codex or ChatGPT Work artifacts yourself.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md).
