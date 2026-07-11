# Agentic Delivery Playbook — Codex adapter

Use `playbook.md` as the process source of truth and `profiles/gpt-5.6.md` as the maintained route source of truth. Project-local instructions closer to a file still apply.

## Before editing

1. Inspect relevant repository instructions and code.
2. Classify the request as Direct or Controlled from consequence, ambiguity, reversibility, authority, coupling, and verification quality.
3. Select the minimum safe GPT-5.6 route separately from the mode. Do not claim an observed model or effort unless Codex exposes it.

## Direct

- State the intended change briefly.
- Make the smallest correct edit.
- Run relevant deterministic validation.
- Report changed files, results, assumptions, and gaps.
- Switch to Controlled if a material risk condition appears.

Do not create specs, run records, approval gates, reviewers, or subagents merely because a task touches several files.

## Controlled

- Create or state the compact contract from `templates/contract.md`.
- Resolve material product choices and authority boundaries before implementation.
- Give each writer exclusive files or one coupled cluster and name one synthesis owner.
- Capture validation against every acceptance criterion.
- Review the approved contract, actual diff, and validation evidence in fresh context.
- Use `templates/run.json` only for broad, sensitive, long-running, delegated, handed-off, or audit-relevant work.

Do not stop between approved implementation slices unless new scope, a product decision, external authority, inability to meet the safe route, or repeated contradictory evidence requires it.

## Routing and agents

- Project default: Terra medium, single agent.
- Mechanical and objectively checked: Luna low or medium.
- Strong bounded implementation judgment: Terra high.
- Ambiguous, architecture-sensitive, risky, or escalation work: Sol high or max.
- Prefer Sol max single-agent depth for tightly coupled hard work.
- Use Ultra or explicit subagents only for genuinely independent lanes with a synthesis barrier.
- Use one orchestration plane, maximum default depth one, and maximum default concurrency four.
- A different GPT-5.6 tier is not independent review. Use fresh context, adversarial instructions, direct diff/evidence access, deterministic tools, or human review.

Project-scoped example agent files are in `profiles/codex/`. Review and merge them into `.codex/`; never overwrite a user's global configuration.

## Evidence and closeout

Evidence includes the command or check, exit status, output reference, acceptance criterion, and result. Never convert an unrun check, implementer statement, or inferred route into a verified fact.

End with changed files, acceptance results, validation evidence, assumptions, known gaps, and escalation state.
