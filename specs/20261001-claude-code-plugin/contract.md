# Delivery contract: Claude Code plugin adapter (slice A)

Status: approved
Owner: orchestrator (main session, Claude Opus 5.5 / medium)
Approved evidence: user approval in session, 2026-10-01 ("ok agree")

## Objective

Ship an installable Claude Code plugin that applies the Direct/Controlled kernel in both the terminal CLI and the desktop app. It routes Controlled implementation to a Sonnet 5.5 / medium worker and review to a fresh-context Opus 5.5 / medium reviewer. The orchestrator route stays on the main session. Requested and observed routes must be provable from session transcripts.

## Non-goals

- No edits to files the in-flight PRD-restoration work changes: `README.md`, `playbook.md`, `docs/adapters.md`, `docs/getting-started.md`, `examples/README.md`, `package.json`, `profiles/gpt-6.md`, `templates/run.json`, `adapters/pi/`, `test/pi-adapter.test.js`. Positioning, the kernel's generalization to "the active profile", npm `files`, and `run.json` lane integration are deferred to slice B, after PRD restoration lands.
- No revival of `adapters/claude/`. It stays retired under `legacy/`.
- No Workflow-tool or agent-team orchestration, no hooks, and no parallel worktree workers in v1.
- No changes to user-global Claude settings. No installing the plugin into the user's config as part of validation.

## Acceptance criteria

- AC-1: `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` at the repo root define plugin `agentic-delivery-playbook`. Components are loaded from `adapters/claude-code/`, and the packaged `playbook.md`, `profiles/claude-5.md` and `templates/` are readable via `${CLAUDE_PLUGIN_ROOT}`.
- AC-2: The skill `adapters/claude-code/skills/deliver/SKILL.md` (name `deliver`, invoked as `/agentic-delivery-playbook:deliver`) is explicit-invoke only (`disable-model-invocation: true`) and translates the kernel: Direct (orchestrator may edit) and Controlled (contract, approval, Sonnet worker sole writer, fresh-context reviewer against the contract, the actual diff, and validation evidence). It also covers a mandatory Controlled preflight that compares the session model with the profile and stops on mismatch, one orchestration plane, depth 1, and serialized writers. It has no Lightweight/Full modes and stays at most 80 lines.
- AC-3: There are agents `adp-worker` (`claude-sonnet-5-5`, effort `medium`, edit tools), `adp-reviewer` (`claude-opus-5-5`, effort `medium`, no Edit/Write/NotebookEdit) and `adp-explorer` (`claude-sonnet-5-5`, effort `low`, read-only). All use full model IDs (spike F7).
- AC-4: `profiles/claude-5.md` holds the route table: orchestrator, worker, reviewer, explorer and escalation path. It also holds the delegation limits, the requested/configured/observed distinction, alias-drift guidance, and a note that `entrypoint` is not attestation (spike F5).
- AC-5: `templates/claude-settings.template.json` sets the orchestrator to `claude-opus-5-5` / `medium` for per-project opt-in. It is documented as a reviewed manual merge, never auto-applied.
- AC-6: `agentic-delivery-playbook probe claude <session.jsonl> [--agents-dir <dir>]` prints the requested route (from agent definitions, spike F12) and the observed route (`message.model`, `perTurnEffort`, `entrypoint`) for the main session and each subagent. It is read-only and has unit tests on fixture transcripts. The existing `show` command is unchanged.
- AC-7: `scripts/validate-active-policy.js` and the tests cover the new active files with the same retired-term checks. `adapters/claude` stays forbidden. `npm run check` passes.
- AC-8: Smoke test without installing: a headless `claude --plugin-dir <worktree>` session (or the closest documented equivalent) lists the skill and the three agents. Running `adp-worker` and `adp-reviewer` shows observed `claude-sonnet-5-5`/`medium` and `claude-opus-5-5`/`medium` in the probe output.
- AC-9: `adapters/claude-code/README.md` documents terminal and desktop install (`/plugin marketplace add arcayne/agentic-delivery-playbook`, `/plugin install`), the settings template, and the known gaps (F10/F11).

## Risk and authority constraints

- Risk: the change is additive and public, and reversible by reverting the PR. The main risk is a merge conflict or double work with PRD restoration, which the non-goals address.
- Authority: create, edit and run tests inside the `feat/claude-code-plugin` worktree only. Pushing, opening the PR and merging each need separate user approval.
- Stop condition: the plugin manifest can't load components from `adapters/claude-code/` (this would need a layout decision), a route doesn't match in AC-8, or anything requires touching a non-goal file.

## Ownership

| Lane | Exclusive files or system boundary | Output |
| --- | --- | --- |
| worker (Sonnet 5.5 / medium) | `.claude-plugin/`, `adapters/claude-code/`, `profiles/claude-5.md`, `templates/claude-settings.template.json`, `lib/claude-route-probe.js`, `bin/agentic-delivery-playbook.js`, `scripts/validate-active-policy.js`, `test/claude-code-*.test.js`, `test/fixtures/claude-code/` | Diff and validation output |
| reviewer (Opus 5.5 / medium, fresh context, read-only) | none (read-only) | Findings against the ACs |
| synthesis (orchestrator) | `specs/20261001-claude-code-plugin/` | Contract, smoke test (AC-8), route evidence, closeout |

Writers are serialized: one worker at a time. Before and after review, the orchestrator records `git status --porcelain` and a hash of `git diff` to show the reviewer changed nothing.

## Verification plan

| Criterion | Command or check | Required evidence |
| --- | --- | --- |
| AC-1, AC-8 | `claude plugin validate .` if available; headless `--plugin-dir` session with stream-json init | Exit status; init lists skill and agents |
| AC-2–AC-5, AC-9 | `npm test` (new adapter test) plus reviewer inspection | Test output; reviewer findings |
| AC-6 | `node --test test/claude-code-route-probe.test.js`; probe run on the AC-8 session | Exit 0; probe JSON |
| AC-7 | `npm run check` | 0 failures; `active policy validation passed` |
| Route of this run | `probe claude` on this orchestrator session | Worker/reviewer observed routes recorded in notes |

## Unresolved decisions

- D-1 Resolved: skill name `deliver` → `/agentic-delivery-playbook:deliver` (user, 2026-10-01).
- D-2 Resolved by default: plugin version `0.3.0`, bumped in slice B.

## Approval

- Contract approved by: user (session message)
- Approved at: 2026-10-01
