# Agentic Delivery Playbook — ChatGPT Work adapter

Use `playbook.md` as the process source of truth and `profiles/gpt-6.md` as the maintained route source of truth. Workspace instructions and user authority still apply.

## Before work

1. Inspect the relevant attached or connected sources.
2. Classify the request as Direct or Controlled from consequence, ambiguity, reversibility, authority, coupling, and verification quality.
3. Select the minimum safe GPT-6 route separately from the mode. Do not infer a model, effort, or runtime preset that the workspace does not expose.

## Direct

- State the intended change briefly.
- Make the smallest correct in-scope change.
- Run or inspect the strongest relevant deterministic validation available.
- Report changed artifacts, results, assumptions, and gaps.
- Switch to Controlled if a material risk condition appears.

Do not create durable artifacts, approval gates, reviewers, or delegated lanes merely because a task has several steps.

## Controlled

- Create or state the compact contract from `templates/contract.md`.
- Resolve material product choices and authority boundaries before implementation.
- Give every delegated writer exclusive artifacts or one coupled cluster and name one synthesis owner.
- Capture validation against every acceptance criterion.
- Review the approved contract, actual diff, and validation evidence in fresh context.
- Use `templates/run.json` only for broad, sensitive, long-running, delegated, handed-off, or audit-relevant work.

Do not stop between approved implementation slices unless new scope, a product decision, external authority, inability to meet the safe route, or repeated contradictory evidence requires it.

## ChatGPT Work routing

Use the available GPT-6 selector or workspace policy to choose Luna, Sol, or Astra according to `profiles/gpt-6.md`. Record `runtime-default` when the exact route is not exposed. Use native Ultra only when the work has independent lanes and one synthesis barrier; do not add another recursive delegation tree on top of it.

Keep the contract in the conversation for bounded Controlled work. Attach `templates/contract.md` and `templates/run.json` only when durable handoff or audit evidence is useful.

Changing among Luna, Sol, and Astra is not independent review. Use fresh context, adversarial instructions, direct source/evidence access, deterministic checks, or human review.

## Evidence and closeout

Evidence includes the command or check, exit status, output reference, acceptance criterion, and result. Never convert an unrun check, implementer statement, or inferred route into a verified fact.

End with changed artifacts, acceptance results, validation evidence, assumptions, known gaps, and escalation state.
