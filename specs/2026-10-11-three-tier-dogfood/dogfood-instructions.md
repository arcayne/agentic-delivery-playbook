# Dogfood run instructions (Task 14, AC-9 and AC-10)

Prepared 2026-10-20. Paths are placeholders: `<playbook-checkout>` is the PR 1 worktree of this repository at commit 044ae9b or later; `<zf-worktree>` is a clean worktree of `zf-engineering-automation` on branch `dogfood/zf-stats-slice-1`. The base commit is that branch's HEAD at contract time (the commit that adds the two brief documents below); the orchestrator records it with `git rev-parse HEAD`.

## Routes for this run

- Orchestrator: `claude-opus-5-5` at effort `high`, the profile's economy orchestrator route, set in the worktree's ignored `.claude/settings.local.json`.
- Worker ladder: `workerLadder: ["workerHigh", "workerHigh", "workerOpus"]`, so the first rung is Sonnet 5.5 at high. This is a route exception and is recorded in `run.json` under `route.exception`.
- Defect reviewer `adp-reviewer-high` (risk is high); goal-fit reviewer Fable 5.1 at high (the default).

## Target task

Implement the first slice of `zf stats` as specified in `docs/prd/zf-stats-slice-1.md` in the target repository, with the full spec in `docs/prd/zf-stats-v1.md` for detail. In short: a new `zf stats` command in the existing `zf` core and CLI that reads GitHub timestamps for Zebra PRs and reports the PR clock (`ready_at`, `first_review_at`, `approved_at`, `merged_at` and the four segments), an `author_group` of `internal`, `external` or `bot` from config, open PRs with stage and `waiting_on` (reusing the `zf me` code), weekly throughput by author group, the JSON envelope and human tables, the twelve named fixture tests plus the envelope snapshot and invariant tests, `docs/metrics.md`, and a 26-week baseline run as evidence. Out of scope: change classes, issue lead time, review-quality signals, dashboards, Slack, any write to GitHub.

Baseline in the worktree before the run: `npm test` 503 tests, 499 pass, 0 fail, 4 skipped; `npm run typecheck` clean.

## Grill answers (let the skill ask, then answer)

- Outcome: `zf stats --repo ZcashFoundation/zebra --weeks 26 --json` returns `ok` or `incomplete` with named gaps, the human tables read on their own, every named test exists and passes, `docs/metrics.md` explains each number, and the baseline output is saved as evidence.
- Who it serves: the TPM and the Zebra team deciding the review-process trial; they need a "before" picture of where PRs wait and whether external contributors wait longer.
- How success is observed: `npx tsx --test test/zf-stats*.test.ts`, `npm test`, `npm run typecheck`, and one real run `npm run zf -- stats --repo ZcashFoundation/zebra --weeks 26 --json` with a personal read-only token, whose output is saved under the run directory.
- What must not change: the behaviour of `zf me`, `zf team`, and `zf security sweep`; `src/zf/html.ts`; everything outside `src/zf/`, `config/zf.json`, `test/zf-*`, `test/fixtures/zf/`, `docs/metrics.md`, `README.md`, and `docs/zf-cheat-sheet.md`; no hard-coded repository, login, field, or bot name; no write scopes.
- Already tried: nothing; the brief and the full spec exist, no code.

## Contract inputs

- Risk line: `Risk: high`.
- Lanes: one lane `stats` owning `src/zf/**`, `config/zf.json`, `test/zf-*.test.ts`, `test/zf-github-mock.ts`, `test/zf-helpers.ts`, `test/fixtures/zf/**`, `docs/metrics.md`, `README.md`, `docs/zf-cheat-sheet.md`. The lead splits this into tasks with concrete, exclusive paths. Reuse of `waiting_on` means `src/zf/core/derive.ts` may gain an export but must keep its behaviour; the `zf me`, `zf team`, and security tests are the guard.
- Non-goal files: `src/zf/html.ts`, `src/zf/core/security.ts`, `src/zf/core/team.ts`, `config/roster.json`, `docs/prd/**`, `docs/process/**`, `docs/delivery/**` other than this run's directory, `.github/**`, everything outside the lane.
- Worker ladder: `workerLadder: ["workerHigh", "workerHigh", "workerOpus"]`, recorded as `route.exception`.
- Verification plan: `npx tsx --test test/zf-stats*.test.ts`; `npm test`; `npm run typecheck`; the baseline run above, performed by the orchestrator with the user's token and saved as `baseline-26w.json` and `baseline-26w.txt` in the run directory. Workflow agents never need the network except where the lead plans fixture recording.
- Run directory in the target repo: `docs/delivery/zf-stats-slice-1-run/`, holding `brief.md`, `contract.md`, `workflow-result.json`, `workflow-result-2.json`, `run.json`, `notes.md`, and the baseline files.

## Expectations and known risks for this run

- The lead will likely plan five to ten tasks. Each task costs three agent calls (validator, worker, validator), plus the plan, review and goal-fit phases, so expect 30 to 45 agent calls and a few hours of wall clock. The Workflow tool's default size guideline is advisory; the script runs one agent at a time.
- Fixtures are recorded GraphQL responses. Recording them needs `gh api graphql` (read-only, allowed by the repository's permission settings) and may prompt for permission in the desktop session. If recording is impractical, the lead should put it in `openQuestions` rather than invent fixtures; answer by deciding whether redacted hand-written fixtures in the recorded shape are acceptable for this run.
- The baseline run is network work with a personal token; it is an orchestrator step at closeout, not a workflow agent step, and the goal-fit reviewer reports it as "would need to run" rather than running it.
- A killed workflow resumes with `resumeFromRunId` and identical `args`; `/workflows` shows progress.

## Steps

1. Open a desktop Code-tab session in `<zf-worktree>`. The worktree's ignored `.claude/settings.local.json` sets `claude-opus-5-5` at effort `high`; confirm the model picker shows Opus 5.5.
2. Load the plugin at the PR 1 version. The GitHub marketplace serves `main`, which is still 0.3.0, so use the local checkout: `/plugin marketplace remove agentic-delivery-playbook`, then `/plugin marketplace add <playbook-checkout>`, then `/plugin install agentic-delivery-playbook@agentic-delivery-playbook`. Run `/agents` and confirm eight `agentic-delivery-playbook:` agents. If the desktop app cannot add a local marketplace, use the terminal instead: `cd <zf-worktree> && claude --plugin-dir <playbook-checkout>` (the CLI OAuth session was expired on 2026-10-11; run `/login` first), and record in `notes.md` that desktop install is unverified.
3. Run `/agentic-delivery-playbook:deliver Implement the first slice of zf stats as specified in docs/prd/zf-stats-slice-1.md (full spec: docs/prd/zf-stats-v1.md): the PR clock with its segments and edge rules, author_group internal/external/bot from config, open PRs with stage and waiting_on reusing the zf me code, weekly throughput by author group, JSON envelope and human tables, the twelve named fixture tests plus snapshot and invariant tests, docs/metrics.md, and a 26-week Zebra baseline run saved as evidence.` Answer the grill from the section above. Approve the contract with `Risk: high` and the lane, non-goal, and `workerLadder` inputs above. At the plan pause, read the task list; check every task has concrete paths, one check, and that fixture recording is either a task or an open question; approve or answer. Let the second run finish through Goal-fit. Follow the closeout: diff hash first, then save the final result, then the verification re-run including the baseline run, then the probe with both `--requested` files.
4. Copy the evidence into this directory as `brief.md`, `contract.md`, `run.json`, `workflow-result.json`, `workflow-result-2.json`, `probe.json`, the baseline files, and extend `notes.md` with the lanes table, the comparison summary, the orchestrator turn count (distinct assistant `message.id` values in the main transcript), the number of tasks the lead planned and how many attempts each took, and any difference between real workflow metadata and `test/fixtures/claude-code/session-2`. Replace absolute paths with `<zf-worktree>` or `<playbook-checkout>`; redact any token.
5. If the real metadata differs from the fixture (custom `agentType` recorded differently, or an `effort` field), update the fixture, the probe, and the profile's `Verified:` line and metadata statements.
6. AC-10, in a separate session on `<playbook-checkout>`: copy the spec appendix to `design-brief.md` here, then invoke the Agent tool with `agentic-delivery-playbook:adp-goal-reviewer`, giving it this brief, the PR 1 acceptance criteria in the spec as the contract stand-in, `git diff main...HEAD` as the diff, this directory as evidence, and `npm run check` plus read-only inspection as the allowed commands. Save the verdict as `goal-fit-plugin.md`.
7. Merge gate: both verdicts `fit`, comparison matched with only `unknownEffort` or recorded crash-resume orphans as gaps.
