# GPT-6 routing profile

Status: maintained
Profile version: 1.0
Verified: 2026-09-24
Surfaces: Codex and ChatGPT Work
Recheck trigger: any GPT-6 or Codex routing/configuration change

This profile maps delivery capabilities to GPT-6. The kernel in `playbook.md` remains capability-based; model and reasoning effort are separate choices.

Sources: [Codex models](https://developers.openai.com/codex/models) and [Codex configuration](https://developers.openai.com/codex/config-reference), checked 2026-09-24.

## Default and route table

Choose the model for task shape, then choose an effort available for that exact model and client. Use the listed starting effort; increase effort only when interpretation, coupling, risk, or a failed focused attempt warrants it.

| Task shape | Model | Starting reasoning effort | Topology |
| --- | --- | --- | --- |
| Quick mechanical, objectively checked work | `gpt-6-luna` | low | single |
| Normal focused implementation work | `gpt-6-luna` | high | single |
| Difficult tasks that warrant more depth | `gpt-6-luna` | xhigh (Codex, where supported) | single |
| Complex coding or agentic workflow | `gpt-6-sol` | medium | single or one focused worker |
| Broad code/research/computer-use work | `gpt-6-astra` | low (Light) | single or bounded lanes |
| High-risk review or repeated-failure escalation | `gpt-6-sol` | high | fresh-context read-only reviewer |

For ordinary project work, start with the task-fit model rather than using maximum effort by default. The implementation route approved for this repository migration is GPT-6 Luna High; the fresh-context review route is GPT-6 Sol High.

## Effort and route verification

Model IDs and reasoning effort are independent: for example, `gpt-6-luna` is the model and `high` is its effort setting. The official Codex model catalog and configuration reference advertise effort values by model; Luna supports up to Max, and Sol Max is available for the hardest problems. Luna xhigh is optional and conditional: use it for difficult tasks in Codex when configured and available, and use Sol max when maximum depth is needed on the Sol route. These upper effort levels are model- and client-specific: do not infer that ChatGPT Work, Pi, or another client exposes the same level. Keep Luna High as the normal focused starting route.

Record the requested route separately from observed runtime details. Use `runtime-default` or `unknown` when the exact model or effort is not exposed; do not infer it. A runtime preset such as Ultra is topology plus effort, not another model or process mode.

## Escalation and fallback

- Luna to Sol: work becomes complex, architecture-sensitive, risky, or interpretation-heavy.
- Increase Luna from low to high for normal focused work, then to xhigh in Codex only when difficulty warrants it and the effort is available.
- Sol medium to high or max: evidence shows stronger judgment or depth is needed; max is for hardest problems where supported.
- Single to delegated: only when lanes are genuinely independent and ownership and synthesis are explicit.
- GPT-5.6 may be used as an explicitly named fallback only when GPT-6 is unavailable and the task remains safe at that route. Record the fallback and do not present it as the active default.

Do not claim model performance, cost, runtime support, or route observability without evidence. A different GPT-6 model is not independent review by itself: use fresh context, adversarial instructions, direct diff/evidence access, deterministic checks, or human authority.

## Delegation limits

- One orchestration plane.
- Default depth: one.
- Default concurrency cap: four.
- One writer per file or coupled file cluster.
- One named synthesis owner.
- No recursive fanout on top of native Ultra without an approved exception.
