---
name: deliver
description: Apply the Agentic Delivery Playbook in Claude Code. Grill the goal, classify work as Direct or Controlled, run Controlled work through the shipped workflow (Opus lead, Sonnet workers, Opus defect review, Fable goal-fit review), and close from evidence.
disable-model-invocation: true
---

# Agentic Delivery Playbook for Claude Code

Invoked explicitly as `/agentic-delivery-playbook:deliver <task>`.

## Canonical policy

- `${CLAUDE_PLUGIN_ROOT}/playbook.md` is authoritative for process, stop, and failure rules.
- `${CLAUDE_PLUGIN_ROOT}/profiles/claude-5.md` is the route table here; Ultra and Codex topology do not apply.
- Contract template: `${CLAUDE_PLUGIN_ROOT}/templates/contract.md`. Reference (args, fingerprint, diff hash, run-record mapping): `${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/README.md`.
- Two process modes only: Direct and Controlled.

## 1. Inception grill

Ask one question at a time until you can state: the outcome, who it serves, how success is observed, what must not change, and what was already tried. Write the answers under those five headings as `specs/<run>/brief.md`, at most 20 lines. If the user says to skip, write `inception: skipped, risk accepted by user` in the brief instead. Direct work may skip the grill silently.

## 2. Classify

Inspect `git status`, repository instructions, and the relevant code. Choose Direct or Controlled from consequence, ambiguity, reversibility, authority, coupling, and verification quality. Switch to Controlled if a material risk appears.

## 3. Direct

You may edit directly. State the change, make the smallest correct edit, run relevant deterministic validation, and report changed files, results, assumptions, and gaps.

## 4. Controlled: preflight and contract

Preflight: your model ID (system prompt) must be `claude-fable-5-1` or `claude-opus-5-5`; otherwise stop and offer the settings template as a reviewed manual merge. You cannot verify your effort; check it as configured, confirm it as observed at closeout, else record `unknown`. Write `specs/<run>/contract.md` from the template: objective and acceptance criteria from the brief, lanes with exclusive file ownership (paths or `*`/`**` patterns), non-goal files, a verification plan, a `Risk: normal|high` line, and the rule that nobody commits during the run. Get approval for unresolved product choices, authority, or material boundaries. Record the base commit (`git rev-parse HEAD`).

## 5. Controlled: run the workflow

Call the Workflow tool with `scriptPath` = `${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/workflows/deliver-controlled.js` and the `args` from the README reference. Set `pauseAfterPlan` true when the grill was skipped or risk is high. This instruction is the opt-in; no keyword is needed. One orchestration plane, depth one: the workflow schedules the agents; you spawn nothing else from the plugin during the run. Writers are serialized: `adp-worker` is the sole writer for each task, the lead and both reviewers are read-only by instruction; Bash is available for diff and checks; the validator's fingerprints enforce it.

- `plan-ready`: show the task list, get approval, then start a second run with `resumePlan` = the approved plan and `pauseAfterPlan` false.
- `blocked` with `openQuestions`: ask the user, append the answers to the brief under "Answers", start a new run. Other plan failures: fix the cause, retry once, then stop and ask.
- `escalated`: report the `reason` and the records; do not retry inside the same contract without the user.
- Save every return verbatim as `specs/<run>/workflow-result.json` (then `-2`, `-3`).

## 6. Controlled: closeout

Compute the diff hash (README) before anything else, then re-run every command in the contract's verification plan yourself and record command, exit status, and result; the validator's records gate tasks inside the run, your own re-run is the closeout evidence. Fill `run.json` with the README mapping and write `notes.md` with the lanes table, the comparison summary, and the gaps. Run `node "${CLAUDE_PLUGIN_ROOT}/bin/agentic-delivery-playbook.js" probe claude <session.jsonl> --requested <workflow-result.json>...` where the transcript is `~/.claude/projects/<cwd with / replaced by ->/<session-id>.jsonl`; `comparison.matched` must be true, with `unknownEffort` entries recorded as gaps. Close by the README table: accepted needs defect review `accept`, goal-fit `fit`, a passing re-run, and a matched comparison. Report changed files, acceptance results, validation evidence, the actual diff hash, assumptions, known gaps, and escalation state. Never claim a check ran, a route was observed, or a reviewer was independent without evidence.

## 7. Manual fallback

If the Workflow tool is unavailable (`claude -p`, SDK), run the same phases by hand with the same agents and limits: validator, `adp-lead`, validator; apply the plan rules yourself; per task validator, `adp-worker` (ladder: `adp-worker`, `adp-worker-high`, `adp-worker` with model `claude-opus-5-5` effort high), validator with the task check; review and goal-fit each between two validator fingerprints. Build `requestedRoutes` by hand and record `workflow.mode: manual`.

## Stop and failure rules

With an approved end-to-end outcome, do not stop for repeated slice approvals. Stop only for new scope, an unresolved product decision, new authority, an unmet safe route, or contradictory evidence after two focused fix cycles. A timed-out or unusable lane is failed and its edits untrusted. If a required route is unavailable, stop that lane and ask; a different model tier is not independent review.
