# Validation Plan

## Experiment E001 — README quick-value test

- Assumption tested: A003
- Method: Show revised README opening to busy senior/lead developers who already use coding agents; ask what they think the repo helps them do and whether they would try the quick prompt on their next agent run.
- Target segment: Senior/lead developers using Claude Code, Codex, Cursor, ChatGPT, or similar tools on real codebases.
- Sample size or target accounts: 5-10 qualified developers.
- Success threshold: At least 3 developers can repeat the core value as token/control/retry reduction and at least 2 say they would try the quick prompt on a real task.
- Failure threshold: Most describe it as generic workflow/process, or nobody identifies an immediate use.
- Decision rule: Continue with README positioning if success threshold is met; revise hook and proof section if failure threshold is met.
- Owner: dearkane
- Due date: unknown
- Result: pending

## Experiment E002 — Eval-backed token-control methodology

- Assumption tested: A001, A002
- Method: Use eval/run artifacts from `/Users/dearkane/Documents/dev/Farming` to document methodology: agreed goal/acceptance criteria, model/agent routing per phase, token/context use where available, retries/fix loops, QA defects, pass/fail criteria, and final evidence.
- Target segment: Busy agent-using developers evaluating whether the playbook is credible.
- Sample size or target accounts: Existing Farming eval lanes and spec-first runs, starting with `specs/20260601-1840-agent-model-matrix-providers/` and eval docs under `apps/server/src/*/evals/`.
- Success threshold: README can truthfully show methodology and at least one concrete result without claiming broad token savings beyond evidence.
- Failure threshold: Artifacts do not expose token/context usage or comparable baseline data clearly enough to support the claim.
- Decision rule: If success threshold is met, add an "Eval methodology" section; if failure threshold is met, say "designed to control token waste" and add instrumentation as next work.
- Owner: dearkane
- Due date: unknown
- Result: pending
