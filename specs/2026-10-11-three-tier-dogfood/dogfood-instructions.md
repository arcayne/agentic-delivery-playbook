# Dogfood run instructions (Task 14, AC-9 and AC-10)

Prepared 2026-10-20. Paths are placeholders: `<playbook-checkout>` is the PR 1 worktree of this repository at commit 78356de or later; `<zf-worktree>` is a clean worktree of `zf-engineering-automation` on branch `dogfood/zf-help-and-ignore-labels` at base commit `5a4a3dd3e2aac47e53a19a0843135b5f653654c2`.

## Target task

Two real defects in the `zf` CLI, found by a read-only scan on 2026-10-20 and confirmed in the code:

1. `zf --help` and `zf -h` exit 2 with `unknown command: --help`. `parseArgs` in `src/zf/cli.ts` throws before the `--help` branch is reachable, because it requires a command word first. The existing help test passes only because the test helper prepends `me`. Expected behaviour: `zf --help` and `zf -h` print the USAGE text on stdout and exit 0; bare `zf` keeps exit 2 with the existing `missing command (try: zf me)` message; `zf me --help` keeps working.
2. `security.ignore_labels` is matched case-sensitively in `src/zf/core/security.ts` (`security.ignore_labels.includes(label)`), while the config layer in `src/zf/core/config.ts` treats labels as case-insensitive and GitHub label names are case-insensitive. Expected behaviour: an issue label matches an ignore entry regardless of case; the `ignored.labels` echo keeps the configured spelling.

Baseline in the worktree: `npm test` 503 tests, 499 pass, 0 fail, 4 skipped; `npm run typecheck` clean.

## Grill answers (for the inception step; let the skill ask, then answer)

- Outcome: `zf --help` works without a command word, and case-different ignore labels are honoured, each covered by a test, with the full suite and typecheck green.
- Who it serves: the TPM running `npm run zf` daily; wrong ignore matching misreports security issues on the board.
- How success is observed: `npx tsx --test test/zf-cli.test.ts` and `npx tsx --test test/zf-security.test.ts` pass with new cases; `npm run typecheck` exits 0; `npm run zf -- --help` prints usage and exits 0.
- What must not change: `src/zf/core/config.ts`, `queries.ts`, `render.ts`, `html.ts`, `test/zf-helpers.ts`, `config/`, `docs/`, `README.md`; the exit-2 behaviour for unknown commands and bare `zf`.
- Already tried: nothing; both defects are untouched.

## Contract inputs

- Risk line: `Risk: high` (so `pauseAfterPlan` is exercised).
- Lanes: `cli` owning `src/zf/cli.ts` and `test/zf-cli.test.ts`; `security` owning `src/zf/core/security.ts` and `test/zf-security.test.ts`.
- Non-goal files: `src/zf/core/config.ts`, `src/zf/core/queries.ts`, `src/zf/render.ts`, `src/zf/html.ts`, `test/zf-helpers.ts`, `config/**`, `docs/**`, `README.md`.
- Verification plan: the two test files above, `npm run typecheck`, `npm test`.
- Run directory in the target repo: `docs/delivery/zf-help-and-ignore-labels-run/` (the repo's current delivery convention), holding `brief.md`, `contract.md`, `workflow-result.json`, `workflow-result-2.json`, `run.json`, `notes.md`.

## Steps

1. Open a desktop Code-tab session in `<zf-worktree>`. The worktree's ignored `.claude/settings.local.json` sets `claude-fable-5-1` at effort `high`; confirm the model picker shows Fable 5.1.
2. Load the plugin at the PR 1 version. The GitHub marketplace serves `main`, which is still 0.3.0, so use the local checkout: `/plugin marketplace remove agentic-delivery-playbook`, then `/plugin marketplace add <playbook-checkout>`, then `/plugin install agentic-delivery-playbook@agentic-delivery-playbook`. Run `/agents` and confirm eight `agentic-delivery-playbook:` agents. If the desktop app cannot add a local marketplace, use the terminal instead: `cd <zf-worktree> && claude --plugin-dir <playbook-checkout>` (the CLI OAuth session was expired on 2026-10-11; run `/login` first), and record in `notes.md` that desktop install is unverified.
3. Run `/agentic-delivery-playbook:deliver Fix two zf CLI defects: zf --help without a command word should print usage on stdout and exit 0 (bare zf keeps exit 2), and security.ignore_labels matching must be case-insensitive. Add tests for both.` Answer the grill from the section above. Approve the contract with `Risk: high`. At the plan pause, read the task list and approve it. Let the second run finish through Goal-fit. Follow the closeout: diff hash first, then save the final result, then the verification re-run, then the probe with both `--requested` files.
4. Copy the evidence into this directory as `brief.md`, `contract.md`, `run.json`, `workflow-result.json`, `workflow-result-2.json`, `probe.json`, and extend `notes.md` with the lanes table, the comparison summary, the orchestrator turn count (distinct assistant `message.id` values in the main transcript), and any difference between real workflow metadata and `test/fixtures/claude-code/session-2`. Replace absolute paths with `<zf-worktree>` or `<playbook-checkout>`.
5. If the real metadata differs from the fixture (custom `agentType` recorded differently, or an `effort` field), update the fixture, the probe, and the profile's `Verified:` line and metadata statements.
6. AC-10, in a separate session on `<playbook-checkout>`: copy the spec appendix to `design-brief.md` here, then invoke the Agent tool with `agentic-delivery-playbook:adp-goal-reviewer`, giving it this brief, the PR 1 acceptance criteria in the spec as the contract stand-in, `git diff main...HEAD` as the diff, this directory as evidence, and `npm run check` plus read-only inspection as the allowed commands. Save the verdict as `goal-fit-plugin.md`.
7. Merge gate: both verdicts `fit`, comparison matched with only `unknownEffort` or recorded crash-resume orphans as gaps.
