# Agentic Delivery Playbook

A small delivery kernel for coding work: classify by risk, choose the minimum safe route, bound ownership, and close from evidence.

## Decide the process mode

Use **Direct** only when all are true:

- intent and acceptance are clear
- effects are low-consequence or readily reversible
- no material security, privacy, auth, payment, financial, destructive, public-contract, or external-authority concern exists
- one owner can make the change without unsafe coordination
- completion is objectively verifiable

Use **Controlled** when any condition above is false, or when broad delegated work needs ownership and synthesis controls. File count is context, not the deciding rule.

## Direct mode

1. State the intended change in one or two sentences.
2. Inspect the relevant code and local instructions.
3. Make the smallest correct edit.
4. Run the strongest relevant deterministic validation available.
5. Report changed files, validation results, assumptions, and known gaps.

Direct mode does not require a durable contract, run record, approval gate, independent reviewer, or explicit route record. A short checklist may be used without creating another mode.

Switch to Controlled mode if ambiguity, consequence, authority, coupling, or weak verification appears during execution.

## Controlled mode

1. Write a compact delivery contract using `templates/contract.md`.
2. Obtain approval for unresolved product choices, authority changes, or material boundaries.
3. Select the minimum safe route from the maintained profile and record exceptions.
4. Give every writer exclusive files or a coupled file cluster; cap delegation and define a synthesis owner.
5. Implement against the approved acceptance criteria.
6. Capture commands, exit status, and evidence for each acceptance criterion.
7. Review the approved contract, actual diff, and validation evidence in a fresh context.
8. Close as accepted, partially accepted, escalated, or blocked; never infer success from narration alone.

A durable contract and run record are required when Controlled work is broad, sensitive, long-running, delegated, handed off, or audit-relevant. Bounded Controlled work may keep the contract in the task.

When the user approved an end-to-end outcome, do not stop for repeated slice approvals. Stop only for new scope, an unresolved product decision, a new authority requirement, inability to satisfy the minimum safe route, or contradictory evidence after two focused fix cycles.

## Route separately from process

Record a route as:

```text
model tier + reasoning effort + topology
```

Process mode does not imply a model. Use `profiles/gpt-6.md` for the maintained mapping. A runtime preset such as Ultra is topology plus effort, not a fourth model tier or process mode.

Escalate only from evidence: the task stopped being mechanical, interpretation became material, a focused retry failed, hidden coupling appeared, or risk increased. Higher effort is not an unlimited retry loop.

## Delegation and review

- Prefer one capable agent for tightly coupled work.
- Delegate only genuinely independent lanes with explicit inputs, outputs, ownership, and a synthesis barrier.
- Use one orchestration plane. Do not add recursive fanout on top of native Ultra delegation by default.
- Default nesting depth is one.
- Changing model tiers alone does not create independent review. Fresh context, adversarial instructions, direct diff access, deterministic checks, and human authority provide stronger separation.

## Failure rules

- If the minimum safe route is unavailable, use the next safe configured route, narrow the task, add compensating deterministic checks, or ask the user. Do not silently run below a Controlled task's safety floor.
- Mark a timed-out or unusable lane failed and treat its edits as untrusted. Retry once with a narrower contract, replace the route, or record an explicit takeover.
- Stop conflicting parallel edits at the synthesis barrier, restore exclusive ownership, and rerun affected validation.
- Stop the affected lane when contract or product ambiguity appears; a worker cannot silently decide outside its contract.
- Missing or contradictory evidence prevents accepted closeout. Rerun the check or record an explicitly accepted gap.

## Evidence and closeout

Evidence records the command or check, exit status, output reference, acceptance criterion, and result. The final report distinguishes verified facts, assumptions, skipped checks, and known gaps.

Never claim a test ran, a route was observed, a reviewer was independent, or an outcome was accepted unless the corresponding evidence exists.
