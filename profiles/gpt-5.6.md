# GPT-5.6 routing profile

Status: maintained
Profile version: 1.0
Verified: 2026-07-10
Surfaces: Codex and ChatGPT Work
Recheck trigger: any GPT-5.6 or Codex routing/configuration change

This profile maps delivery capabilities to GPT-5.6. The kernel in `playbook.md` remains capability-based.

Sources: [GPT-5.6 release](https://openai.com/index/gpt-5-6/), [Codex models](https://developers.openai.com/codex/models), [Codex multi-agent](https://developers.openai.com/codex/multi-agent), and [Codex configuration](https://developers.openai.com/codex/config-reference).

## Default

Use `gpt-5.6-terra` with medium reasoning and a single agent for ordinary project work. The runtime default may be recorded as `runtime-default` when the exact observed route is unavailable; do not infer it.

## Route table

| Task shape | Minimum route | Topology |
| --- | --- | --- |
| Clear, repeatable, high-volume, objectively checked | `gpt-5.6-luna` low; use medium if interpretation appears | single |
| Repository exploration and ordinary bounded implementation | `gpt-5.6-terra` medium | single or one focused subagent |
| Bounded work needing stronger implementation judgment | `gpt-5.6-terra` high | single |
| Ambiguous, architecture-sensitive, risky, or high-value | `gpt-5.6-sol` high | single |
| Hardest tightly coupled problem | `gpt-5.6-sol` max | single |
| Broad work with genuinely independent lanes | `gpt-5.6-sol` max | Ultra proactive or explicitly capped subagents |
| High-risk review or repeated-failure escalation | `gpt-5.6-sol` high or max in fresh context | read-only reviewer |

Ultra means maximum reasoning plus `ultra-proactive` topology. Record the runtime label separately when available. Do not treat Ultra as another process mode or model tier.

## Escalation

- Luna to Terra: the task is no longer mechanical, validation needs interpretation, or one focused retry failed.
- Terra to Sol: architecture, security, public contracts, hidden coupling, difficult trade-offs, or repeated failure appears.
- Sol high to Sol max: a tightly coupled problem needs deeper analysis.
- Single to delegated: independent lanes can improve elapsed time or evidence quality and ownership is explicit.

After two fix cycles, reopen the contract, split the task, or ask for a decision. Do not keep increasing effort as a retry strategy.

## Route verification

A project-approved default needs no repeated user approval. Block Controlled implementation only when its minimum tier or effort cannot be confirmed or satisfied and task narrowing or deterministic validation cannot compensate. Otherwise record the observed route or `runtime-default` without unsupported claims.

## Review independence

Switching among Luna, Terra, and Sol does not create independence. Use a fresh context with adversarial instructions and give the reviewer the approved contract, actual diff, and captured validation. Prefer deterministic checks and human authority for consequential decisions.

## Delegation limits

- One orchestration plane.
- Default depth: one.
- Default concurrency cap: four.
- One writer per file or coupled file cluster.
- One named synthesis owner.
- No recursive fanout on top of native Ultra without an approved exception.
