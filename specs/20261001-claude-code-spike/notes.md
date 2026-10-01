# Spike: Claude Code adapter route capabilities

Status: mostly complete — only interactive desktop session with project agents (F11) and plugin smoke test (F10) remain
Date: 2026-10-01
Claude Code: 2.1.285
Target route: orchestrator Opus 5.5 / medium (main session), worker Sonnet 5.5 / medium (sole Controlled writer), reviewer Opus 5.5 / medium (fresh-context, read-only). Direct mode: orchestrator may edit.

## Decisions recorded (user, 2026-10-01)

- Reviewer: Opus 5.5 medium, fresh context, read-only; escalate to high for risky/security work.
- Direct mode: Opus orchestrator edits directly; Sonnet worker is sole writer in Controlled mode.
- Distribution: Claude Code plugin via marketplace, plus per-repo settings template for the orchestrator route.
- Sequencing: implement after PRD-delivery-loop restoration lands; Phase 0 and this spike may run now.
- Assumed defaults (not yet objected to): skill is explicit-invoke only (`disable-model-invocation: true`); repo becomes model-neutral with `profiles/gpt-6.md` and `profiles/claude-5.md`.

## Phase 0 (repo hygiene)

- Uncommitted pre-0.3 edits + `docs/prd-delivery-loop-restoration-prd.md` preserved on local branch `wip/pre-0.3-parent-loop` (commit `dbd9a09`, not pushed).
- Local `main` had diverged (2 local design/plan commits). Both are on `wip/pre-0.3-parent-loop` and `origin/codex/gpt-5-6-simplification`; `origin/main` contains the identical design doc and a newer plan revision. `main` reset to `origin/main` (`9f73411`).
- `npm run check` on `main`: tests pass, `active policy validation passed`.

## Findings

| # | Question | Result | Evidence |
| --- | --- | --- | --- |
| F1 | Is the observed model attestable for the main session and subagents? | **Yes.** Every assistant transcript line carries `message.model`. | `route-probe-desktop.json` |
| F2 | Is observed effort attestable? | **Yes for Opus/Sonnet** via `perTurnEffort`; `null` for Haiku 4.5. | main `medium`; Sonnet subagent `medium`; Haiku `unknown` |
| F3 | Is the requested route recorded separately? | **Yes.** `subagents/agent-*.meta.json` has `agentType`, `spawnDepth`, and `model` when passed. | meta: `"model":"sonnet"` |
| F4 | Does the `sonnet` alias resolve to Sonnet 5.5 today? | **Yes** (`claude-sonnet-5-5`). Alias drift on future releases remains a risk. | probe agent `a945a32d00095e246` |
| F5 | Can the surface (desktop vs terminal) be distinguished? | **Only weakly.** `entrypoint` comes from the `CLAUDE_CODE_ENTRYPOINT` env var: a `claude -p` child of the desktop app inherits `claude-desktop`; with it unset, `sdk-cli`. Record it, but do not treat it as attestation. | `route-probe-cli-desktop-env.json` vs `route-probe-cli.json` |
| F6 | Does project `.claude/settings.json` set the orchestrator route? | **Yes.** User settings are `model: sonnet`, `effortLevel: high`; spike project settings `model: opus`, `effortLevel: medium` → main ran `claude-opus-5-5` / `medium`. Project beats user settings. | `route-probe-cli.json` |
| F7 | Does subagent `model: claude-sonnet-5-5` (full ID) work? | **Yes.** Ran as `claude-sonnet-5-5`. Alias `sonnet` resolves to the same model today. Prefer full IDs to avoid alias drift. | `route-probe-cli.json` |
| F8 | Is subagent frontmatter `effort` honored? | **Yes.** Both agents set `effort: low` ran at `low` while the parent ran `medium`. | `route-probe-cli.json` |
| F9 | Terminal CLI parity (project agents, settings, effort). | **Yes** for headless CLI (`sdk-cli`), identical routes to the desktop-env run. Interactive `claude` in a real terminal not separately run; same binary and config. | `route-probe-cli.json` |
| F10 | Plugin install + plugin agents in desktop app. | **Not yet tested** (needs plugin skeleton; after PRD restoration). | pending |
| F11 | Interactive desktop Code-tab session loading project agents in a non-playbook repo. | **Not yet tested.** Desktop main-session route and runtime subagent routing verified (F1–F4). | pending |
| F12 | Does `meta.json` record the requested model when it comes from frontmatter? | **No.** `model` is present only when passed per invocation. The requested route must be read from the agent definition file. | `route-probe-cli.json` (`requestedModel: unknown`) |
Note: the docs-research subagent ran on Haiku 4.5 (F1), and its claim that `model` accepts only aliases is disproven by F7.

## Implications for the adapter

- Route attestation does not need hooks: a read-only probe over the session transcript can fill `run.json` `lanes[].requested` (meta) and `lanes[].observed` (message.model, perTurnEffort, entrypoint). Ship a hardened `route-probe` as a CLI subcommand later.
- The orchestrator self-check can compare its system-prompt model ID with the profile, and closeout can confirm it from the transcript.

## Remaining steps

1. F11: open a desktop Code-tab session in the spike repo and run the same prompt; probe with `node route-probe.js <session jsonl>`.
2. F10: plugin smoke test once a minimal plugin skeleton exists (after PRD restoration).
3. Before plugin implementation: harden `route-probe.js` into a CLI subcommand that reads requested routes from agent definitions (F12) and writes `run.json` lane `requested`/`observed` fields.
